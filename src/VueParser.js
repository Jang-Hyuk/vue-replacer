import path, { sep } from 'path';

import _ from 'lodash';

import FileReader from './FileReader.js';
import BaseUtil from './BaseUtil.js';

import './type.d.js';

/** *.vue 파일을 구문 분석하여 Vue Replace 하기위한 정보를 추출 */
class VueParser {
	/**
	 * @param {object} config Replacer 생성자 옵션
	 * @param {string} config.filePath file full path (d:/temp/conts/js/*.vue)
	 * @param {string} [config.fileSep = sep] window vs linux file 구분자에 따른 값
	 */
	constructor(config) {
		const { filePath, fileSep = sep } = config;

		this.NEW_LINE = '\r\n';
		this.TAB = '\t';

		this.filePath = filePath;
		this.fileSep = fileSep;
		// ↓↓↓ set constructor params
		this.vueFileFolder = _(filePath).split(fileSep).initial().join(fileSep);

		// ↓↓↓ set dynamic instance value
		/** @type {replaceTargetFileInfo} vue template 영역을 변환하여 저장할  */
		this.tplFileInfo = {
			filePath: '',
			isExistFile: false,
			isTemplate: false,
			isSync: false,
			contents: '',
			positionId: '',
			indentDepth: 0,
			task: undefined
		};

		/** @type {replaceTargetFileInfo}  */
		this.scriptFileInfo = {
			filePath: '',
			isExistFile: false,
			/** Template일 경우 Vue.component 아닐 경우 new Vue 를 delimiter 검색 조건으로 함 */
			isTemplate: false,
			isSync: false,
			contents: {},
			positionId: '',
			indentDepth: 0,
			/** vue script 영역을 변환하여 저장할 파일 */
			task: undefined
		};

		/** @type {replaceTargetFileInfo} vue script 영역을 변환하여 저장할 파일 */
		this.styleFileInfo = {
			filePath: '',
			isExistFile: false,
			/** style tag wrapping 여부 */
			isTemplate: false,
			isSync: false,
			contents: '',
			indentDepth: 0,
			positionId: '',
			task: undefined
		};
	}

	/**
	 * vue 파일 내용 구문 분석
	 * @param {string} vueFileContents
	 * @param {string} vueFilePath
	 */
	parseVueFile(vueFileContents, vueFilePath = this.filePath) {
		this.vueFileFolder = _(vueFilePath).split(this.fileSep).initial().join(this.fileSep);

		if (!vueFileContents.length) {
			return '';
		}

		// ANCHOR Converter
		this.tplFileInfo.contents = this.extractTemplate(vueFileContents);
		this.scriptFileInfo.contents = this.extractScript(vueFileContents);
		this.styleFileInfo.contents = this.extractStyle(vueFileContents);
	}

	/**
	 * Extract *.Vue Template
	 * @alias Template Converter
	 * @param {string} vueFile
	 * @returns {string}
	 */
	extractTemplate(vueFile) {
		const endDelimiter = '<script';
		const chunkStartDelimiter = '<template';
		const chunkEndDelimiter = '</template>';

		const vueOriginalTpl = _.chain(vueFile.slice(0, vueFile.indexOf(endDelimiter)))
			.thru(tSrc => tSrc.slice(0, tSrc.lastIndexOf(chunkEndDelimiter)))
			.thru(tSrc => tSrc.slice(tSrc.indexOf(chunkStartDelimiter)))
			.value();

		const realTplStartIndex = vueOriginalTpl.indexOf('>');

		// template(tpl) 시작 tag 닫는 위치부터 template 종료 tag 범위 짜름
		const tplHeader = vueOriginalTpl.slice(0, realTplStartIndex);
		const tplHeaderInfo = BaseUtil.toDictionary(tplHeader, ' ', '=', this.NEW_LINE);
		const tplBody = vueOriginalTpl.slice(realTplStartIndex + 1);

		const isSync = tplHeaderInfo.isSync === '1';
		this.tplFileInfo.isSync = isSync;

		const tplBodyArr = _.chain(tplBody)
			.split(this.NEW_LINE)
			.dropWhile(v => v === '')
			.dropRightWhile(v => v === '')
			.value();

		if (tplHeaderInfo.isTemplate === '1') {
			tplBodyArr.unshift(`<template v-cloak id="${tplHeaderInfo.id}">`);
			tplBodyArr.push('</template>');
			this.tplFileInfo.isTemplate = true;
		}

		// 파일 경로가 있다면 경로 수정
		if (tplHeaderInfo.fileSrc) {
			this.tplFileInfo.filePath = path.join(this.vueFileFolder, tplHeaderInfo.fileSrc);
			this.tplFileInfo.isExistFile = FileReader.isExistFilePath(
				this.tplFileInfo.filePath
			);
		}

		this.tplFileInfo.indentDepth = tplHeaderInfo.depth
			? parseInt(tplHeaderInfo.depth, 10)
			: 0;
		this.tplFileInfo.positionId = tplHeaderInfo.id ?? '';
		return tplBodyArr.join(this.NEW_LINE);
	}

	/**
	 * Extract *.Vue Script
	 * @alias Js Converter
	 * @param {string} vueFile
	 * @returns {string}
	 */
	extractScript(vueFile) {
		const endDelimiter = '</template>';
		const chunkStartDelimiter = '<script';
		const chunkEndDelimiter = '</script>';

		// template가 없다면 0을. 아니라면 indexOf 값 정의
		const startIndex =
			vueFile.indexOf(endDelimiter) === -1 ? 0 : vueFile.indexOf(endDelimiter);
		const vueOriginalScript = _.chain(vueFile.slice(startIndex))
			.thru(tSrc => tSrc.slice(0, tSrc.lastIndexOf(chunkEndDelimiter)))
			.thru(tSrc => tSrc.slice(tSrc.indexOf(chunkStartDelimiter)))
			.value();

		const realScriptStartIndex = vueOriginalScript.indexOf('>');

		// template 시작 tag 닫는 위치부터 template 종료 tag 범위 짜름
		const srcHeader = vueOriginalScript.slice(0, realScriptStartIndex);
		const srcHeaderInfo = BaseUtil.toDictionary(srcHeader, ' ', '=', this.NEW_LINE);
		const srcBody = vueOriginalScript.slice(realScriptStartIndex + 1);

		const isSync = srcHeaderInfo.isSync === '1';
		this.scriptFileInfo.isSync = isSync;

		this.scriptFileInfo.isTemplate = srcHeaderInfo.isTemplate === '1';

		// 파일 경로가 있다면 경로 수정
		if (srcHeaderInfo.fileSrc) {
			this.scriptFileInfo.filePath = path.join(this.vueFileFolder, srcHeaderInfo.fileSrc);
			this.scriptFileInfo.isExistFile = FileReader.isExistFilePath(
				this.scriptFileInfo.filePath
			);
		}

		this.scriptFileInfo.indentDepth = srcHeaderInfo.depth
			? parseInt(srcHeaderInfo.depth, 10)
			: 0;
		this.scriptFileInfo.positionId = srcHeaderInfo.id ?? '';

		const srcDelimiter = 'export default';
		const scriptConfigIndex = srcBody.indexOf(srcDelimiter);
		let scriptOuter = srcBody.slice(0, scriptConfigIndex);

		let componentList = [];

		// import 사용시 끝나는 지점 추출
		if (/(?=import)(.*?)(?=from)/g.test(scriptOuter)) {
			componentList = BaseUtil.extractBetweenStrings(scriptOuter, 'import', 'from', {
				shouldTrim: true
			}).filter(str => /^[a-zA-Z0-9]*$/g.test(str));
			const tempIndex = scriptOuter.indexOf(';', scriptOuter.lastIndexOf(" from '"));
			scriptOuter = scriptOuter.slice(scriptOuter.indexOf(this.NEW_LINE, tempIndex + 1));
		}
		let vueOption = _.chain(srcBody.slice(scriptConfigIndex))
			.replace(srcDelimiter, '')
			.trim()
			.thru(str => str.slice(0, str.length - 1))
			.value();

		// 컴포넌트를 사용하고 있다면 해당 컴포넌트 위에서 추출한 componentList와 비교하여 제거
		const componentDelimiter = 'components: {';
		const componentIndex = vueOption.indexOf(componentDelimiter);
		if (componentIndex !== -1) {
			const componentsPrevContents = vueOption.slice(0, componentIndex);
			const componentsNextIndex = vueOption.indexOf('},', componentIndex);
			const componentStr = vueOption.slice(
				componentIndex + componentDelimiter.length,
				componentsNextIndex
			);
			const realComponents = componentStr
				.split(',')
				.map(_.trim)
				.filter(comp => !componentList.includes(comp))
				.join(',');
			// 컴포넌트가 존재한다면 삽입
			if (realComponents) {
				vueOption = componentsPrevContents.concat(
					`${componentDelimiter} ${realComponents} },`,
					vueOption.slice(vueOption.indexOf(this.NEW_LINE, componentsNextIndex))
				);
			} else {
				vueOption = componentsPrevContents.concat(
					vueOption.slice(vueOption.indexOf(this.NEW_LINE, componentsNextIndex))
				);
			}
		}

		return {
			scriptOuter,
			vueOption
		};
	}

	/**
	 * Extract *.Vue Style
	 * @param {string} vueFile
	 * @returns {string}
	 */
	extractStyle(vueFile) {
		const chunkStartDelimiter = '<style';
		const chunkEndDelimiter = '</style>';

		const startRangeIndex = vueFile.lastIndexOf(chunkStartDelimiter);
		const endRangeIndex = vueFile.lastIndexOf(chunkEndDelimiter);

		const vueOriginalStyle = vueFile.slice(startRangeIndex, endRangeIndex);
		const realStyleStartIndex = vueOriginalStyle.indexOf('>');

		// template(tpl) 시작 tag 닫는 위치부터 template 종료 tag 범위 짜름
		const styleHeader = vueOriginalStyle.slice(0, realStyleStartIndex);
		const styleHeaderInfo = BaseUtil.toDictionary(styleHeader, ' ', '=', this.NEW_LINE);
		let styleBody = vueOriginalStyle
			.slice(realStyleStartIndex + 1)
			.split(this.NEW_LINE)
			.join(this.NEW_LINE + this.TAB);

		styleBody = _(styleBody.split(this.NEW_LINE)).initial().join(this.NEW_LINE);

		const styleBodyArr = _.chain(styleBody)
			.split(this.NEW_LINE)
			.dropWhile(v => v === '')
			.dropRightWhile(v => v === '')
			.value();

		const isSync = styleHeaderInfo.isSync === '1';
		this.styleFileInfo.isSync = isSync;

		// let realContents = styleBody;
		if (styleHeaderInfo.isTemplate === '1') {
			styleBodyArr.unshift(`<style>`);
			styleBodyArr.push('</style>');
			this.styleFileInfo.isTemplate = true;
		}

		// 파일 경로가 있다면 경로 수정
		if (styleHeaderInfo.fileSrc) {
			this.styleFileInfo.filePath = path.join(
				this.vueFileFolder,
				styleHeaderInfo.fileSrc
			);
			this.styleFileInfo.isExistFile = FileReader.isExistFilePath(
				this.styleFileInfo.filePath
			);
		}

		// this.htmlFileInfo.filePath = path.join(this.vueFileFolder, tplHeaderInfo.fileSrc);
		this.styleFileInfo.indentDepth = styleHeaderInfo.depth
			? parseInt(styleHeaderInfo.depth, 10)
			: 0;
		this.styleFileInfo.positionId = styleHeaderInfo.id ?? '';
		return styleBodyArr.join(this.NEW_LINE);
	}
}

export default VueParser;
