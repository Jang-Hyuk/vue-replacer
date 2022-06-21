/* eslint-disable no-param-reassign */
import _ from 'lodash';

import VueReplacer from './VueReplacer.js';
import BaseUtil from './BaseUtil.js';

class VueEncoder extends VueReplacer {
	/**
	 * Vue 파일 변경될 경우 변환 작업 처리
	 * @param {string} path fileFullPath
	 */
	async encodeVueFile() {
		this.vueParser.tplFileInfo.task = this.replaceVueTemplate;
		this.vueParser.scriptFileInfo.task = this.replaceVueScript;
		this.vueParser.styleFileInfo.task = this.replaceVueStyle;

		const fileConfigs = [
			this.vueParser.tplFileInfo,
			this.vueParser.scriptFileInfo,
			this.vueParser.styleFileInfo
		];

		_.chain(fileConfigs)
			.filter(config => config.isSync && config.filePath.length)
			.groupBy('filePath')
			.forEach(configList => this.fileWriter.replaceEachFiles(configList, this))
			.value();
	}

	/**
	 * Vue script 안의 내용을 동일 {fileName}.js 영역 교체 수행
	 * @alias Js Converter
	 * @param {{scriptOuter: string, vueOption: string}} vueScriptInfo
	 * @param {string} [targetFile]
	 */
	async replaceVueScript(vueScriptInfo, targetFile = '') {
		if (_.isEmpty(vueScriptInfo)) {
			throw new Error('vueScript가 비어있음');
		}

		const { scriptOuter, vueOption } = vueScriptInfo;

		const { filePath, positionId, indentDepth } = this.vueParser.scriptFileInfo;

		// 덮어쓸 js 파일을 읽음
		if (targetFile.length === 0) {
			if (filePath.length === 0) {
				return false;
			}

			targetFile = await this.fileReader.getFile(filePath);
		}

		if (!targetFile.length) {
			throw new Error('js file이 존재하지 않음');
		}
		// Vue Deleimiter Range 에 해당하는 부분을 추출
		const { sDelimiterIndex, eDelimiterIndex } = BaseUtil.sliceString(
			targetFile,
			`${this.vueStartDelimiter} ${positionId}`,
			`${this.vueEndDelimiter} ${positionId}`
		);
		// Vue Delimiter에 해당하는 부분이 없다면 종료
		if (_.includes([sDelimiterIndex, eDelimiterIndex], -1)) {
			throw new Error(
				`js script delimiter가 이상함 ${sDelimiterIndex}, ${eDelimiterIndex}`
			);
		}
		// js파일에 덮어쓸 최초 시작 포인트 index를 읽어옴 => (new Vue({), Vue.component('any', {)) 이런식으로 { 가 시작점
		const vueOptDelimiter = this.vueParser.scriptFileInfo.isTemplate
			? 'Vue.component'
			: 'new Vue';

		const vueOptDelimiterIndex = targetFile.indexOf(vueOptDelimiter);
		if (vueOptDelimiterIndex === -1) {
			throw new Error('유효한 vue delemiter가 존재하지 않습니다.');
		}

		const savedLine = _.chain(targetFile.split(this.NEW_LINE))
			.find(str => str.indexOf(vueOptDelimiter) !== -1)
			.thru(str => str.slice(0, str.lastIndexOf('{')))
			.value();

		const scriptContents = `${
			this.addTabSpace(scriptOuter, indentDepth) +
			savedLine +
			this.addTabSpace(vueOption, indentDepth, true)
		}`;

		const headerLastPositionIndex = targetFile.indexOf(this.NEW_LINE, sDelimiterIndex);
		// Header + Vue Script + Footer 조합
		const overwrittenJs = targetFile
			.slice(0, headerLastPositionIndex)
			.concat(
				scriptContents,
				targetFile.slice(targetFile.slice(0, eDelimiterIndex).lastIndexOf('}') + 1)
			);

		return overwrittenJs;
	}

	/**
	 * Vue template 안의 내용을 지정된 {fileName}.html 영역 교체 수행
	 * @param {string} vueTemplate
	 * @param {string} [targetFiles]
	 */
	async replaceVueTemplate(vueTemplate, targetFile = '') {
		if (_.isEmpty(vueTemplate)) {
			throw new Error('vueTemplate이 비어있음');
		}

		const { filePath, indentDepth, positionId } = this.vueParser.tplFileInfo;
		// 덮어쓸 html 파일을 읽음
		if (targetFile.length === 0) {
			if (filePath.length === 0) {
				return false;
			}

			// eslint-disable-next-line no-param-reassign
			targetFile = await this.fileReader.getFile(filePath);
		}

		// return;
		if (!targetFile.length) {
			throw new Error('html file이 존재하지 않음');
		}
		// Vue Deleimiter Range 에 해당하는 부분을 추출
		const { sDelimiterIndex, eDelimiterIndex } = BaseUtil.sliceString(
			targetFile,
			`${this.vueStartDelimiter} ${positionId} `,
			`${this.vueEndDelimiter} ${positionId} `
		);

		// Vue Delimiter에 해당하는 부분이 없다면 종료
		if (_.includes([sDelimiterIndex, eDelimiterIndex], -1)) {
			throw new Error(
				`vue template delimiter가 이상함 ${sDelimiterIndex}, ${eDelimiterIndex}`
			);
		}

		// html파일에 덮어쓸 최초 시작 포인트 index를 읽어옴(개행)
		const headerLastPositionIndex = targetFile.indexOf(this.NEW_LINE, sDelimiterIndex);

		// html indent depth 에 따라 tab 간격 조절
		const splittedVueTemplate = vueTemplate.split(this.NEW_LINE);
		let realVueTemplate = _(splittedVueTemplate).initial().join(this.NEW_LINE);
		// 템플릿 모드 일 경우
		if (this.vueParser.tplFileInfo.isTemplate) {
			realVueTemplate = this.addTabSpace(realVueTemplate, indentDepth);
		} else if (indentDepth === 0) {
			const regExp = new RegExp(this.NEW_LINE + this.TAB, 'g');
			realVueTemplate = realVueTemplate.replace(regExp, this.NEW_LINE);
		} else if (indentDepth > 1) {
			realVueTemplate = this.addTabSpace(realVueTemplate, indentDepth - 1);
		}

		realVueTemplate = realVueTemplate.concat(_.last(splittedVueTemplate));

		// Header + Vue Script + Footer 조합
		const overwrittenHtml = targetFile
			.slice(0, headerLastPositionIndex)
			.concat(
				realVueTemplate,
				targetFile.slice(targetFile.slice(0, eDelimiterIndex).lastIndexOf(this.NEW_LINE))
			);

		return overwrittenHtml;
	}

	/**
	 * Vue template 안의 내용을 지정된 {fileName}.html 영역 교체 수행
	 * @param {string} vueStyle
	 * @param {string} [targetFile]
	 * @returns {any}
	 */
	async replaceVueStyle(vueStyle, targetFile = '') {
		if (_.isEmpty(vueStyle)) {
			throw new Error('vue style이 비어있음');
		}
		const { filePath, indentDepth, positionId } = this.vueParser.styleFileInfo;

		if (targetFile.length === 0) {
			if (filePath.length === 0) {
				return false;
			}

			// eslint-disable-next-line no-param-reassign
			targetFile = await this.fileReader.getFile(filePath);
		}
		// 덮어쓸 html 파일을 읽음
		// return;
		if (!targetFile.length) {
			throw new Error('html file이 존재하지 않음');
		}
		// Vue Deleimiter Range 에 해당하는 부분을 추출
		const { sDelimiterIndex, eDelimiterIndex } = BaseUtil.sliceString(
			targetFile,
			`${this.vueStartDelimiter} ${positionId} `,
			`${this.vueEndDelimiter} ${positionId} `
		);

		// Vue Delimiter에 해당하는 부분이 없다면 종료
		if (_.includes([sDelimiterIndex, eDelimiterIndex], -1)) {
			throw new Error(
				`vue style delimiter가 이상함 ${sDelimiterIndex}, ${eDelimiterIndex}`
			);
		}

		// html파일에 덮어쓸 최초 시작 포인트 index를 읽어옴(개행)
		const headerLastPositionIndex = targetFile.indexOf(this.NEW_LINE, sDelimiterIndex);

		let realVueStyle = vueStyle;
		// 템플릿 모드 일 경우
		// html indent depth 에 따라 tab 간격 조절
		if (this.vueParser.styleFileInfo.isTemplate) {
			realVueStyle = this.addTabSpace(realVueStyle, indentDepth);
		} else if (indentDepth === 0) {
			const regExp = new RegExp(this.NEW_LINE + this.TAB, 'g');
			realVueStyle = realVueStyle.replace(regExp, this.NEW_LINE);
		} else if (indentDepth > 1) {
			realVueStyle = this.addTabSpace(realVueStyle, indentDepth - 1);
		}

		// Header + Vue Script + Footer 조합
		const overwrittenHtml = targetFile
			.slice(0, headerLastPositionIndex)
			.concat(
				realVueStyle,
				targetFile.slice(targetFile.slice(0, eDelimiterIndex).lastIndexOf(this.NEW_LINE))
			);

		return overwrittenHtml;
	}
}

export default VueEncoder;
