/* eslint-disable no-param-reassign */
import _ from 'lodash';

import VueReplacer from './VueReplacer.js';

import './type.d.js';

class VueEncoder extends VueReplacer {
	/** Vue 파일 변경될 경우 변환 작업 처리 */
	async encodeVueFile() {
		this.vueParser.tplFileInfo.task = this.replaceVueTemplate;
		this.vueParser.scriptFileInfo.task = this.replaceVueScript;
		this.vueParser.styleFileInfo.task = this.replaceVueStyle;

		const fileConfigs = [
			this.vueParser.tplFileInfo,
			this.vueParser.scriptFileInfo,
			this.vueParser.styleFileInfo
		];

		const promiseList = _.chain(fileConfigs)
			.filter(config => config.isSync && config.filePath.length)
			.groupBy('filePath')
			.map(configList => this.fileWriter.replaceEachFiles(configList, this))
			.value();

		await Promise.all(promiseList);
		console.log('🟩 encode complete', this.vueFilePath);
		// node-watch 인식하는데 시간이 걸리니 딜래이를 둠
		await VueReplacer.delay(1000);
		// 옵저버가 부착되어있다면 공지
		this.notifyCompleteEncode();
	}

	/**
	 * Vue script 안의 내용을 동일 {fileName}.js 영역 교체 수행
	 * @alias Js Converter
	 * @param {{scriptOuter: string, vueOption: string}} vueScriptInfo
	 * @param {string} [file]
	 */
	async replaceVueScript(vueScriptInfo, file = '') {
		if (_.isEmpty(vueScriptInfo)) {
			throw new Error('vueScript가 비어있음');
		}

		const { scriptOuter, vueOption } = vueScriptInfo;

		const { targetFile = '', delimiterFileInfo } = await this.parseDelimiterFile(
			this.vueParser.scriptFileInfo,
			file
		);
		if (!targetFile.length) {
			return false;
		}

		const { sDelimiterIndex, eDelimiterIndex } = delimiterFileInfo;

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

		const { indentDepth } = this.vueParser.scriptFileInfo;
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
	 * @param {string} [file]
	 */
	async replaceVueTemplate(vueTemplate, file = '') {
		if (_.isEmpty(vueTemplate)) {
			throw new Error('vueTemplate이 비어있음');
		}

		const { targetFile = '', delimiterFileInfo } = await this.parseDelimiterFile(
			this.vueParser.tplFileInfo,
			file
		);

		if (!targetFile.length) {
			return false;
		}

		const { sDelimiterIndex, eDelimiterIndex } = delimiterFileInfo;

		// html파일에 덮어쓸 최초 시작 포인트 index를 읽어옴(개행)
		const headerLastPositionIndex = targetFile.indexOf(this.NEW_LINE, sDelimiterIndex);

		const { indentDepth } = this.vueParser.tplFileInfo;
		// html indent depth 에 따라 tab 간격 조절
		let realVueTemplate = '';
		// 템플릿 모드 일 경우
		if (this.vueParser.tplFileInfo.isTemplate) {
			realVueTemplate = this.addTabSpace(vueTemplate, indentDepth);
		} else if (indentDepth === 0) {
			realVueTemplate = vueTemplate
				.split(this.NEW_LINE)
				.map(str => str.replace(this.TAB, ''))
				.join(this.NEW_LINE);
		} else {
			realVueTemplate = this.addTabSpace(vueTemplate, indentDepth - 1);
		}

		// Header + Vue Script + Footer 조합
		const overwrittenHtml = targetFile
			.slice(0, headerLastPositionIndex)
			.concat(
				`${this.NEW_LINE}${realVueTemplate}`,
				targetFile.slice(targetFile.slice(0, eDelimiterIndex).lastIndexOf(this.NEW_LINE))
			);

		return overwrittenHtml;
	}

	/**
	 * Vue template 안의 내용을 지정된 {fileName}.html 영역 교체 수행
	 * @param {string} vueStyle
	 * @param {string} [file]
	 * @returns {any}
	 */
	async replaceVueStyle(vueStyle, file = '') {
		if (_.isEmpty(vueStyle)) {
			throw new Error('vue style이 비어있음');
		}

		const { targetFile = '', delimiterFileInfo } = await this.parseDelimiterFile(
			this.vueParser.styleFileInfo,
			file
		);

		if (!targetFile.length) {
			return false;
		}

		const { sDelimiterIndex, eDelimiterIndex } = delimiterFileInfo;

		// html파일에 덮어쓸 최초 시작 포인트 index를 읽어옴(개행)
		const headerLastPositionIndex = targetFile.indexOf(this.NEW_LINE, sDelimiterIndex);

		const { indentDepth } = this.vueParser.styleFileInfo;
		let realVueStyle = '';
		// 템플릿 모드 일 경우 html indent depth 에 따라 tab 간격 조절
		if (this.vueParser.styleFileInfo.isTemplate) {
			realVueStyle = this.addTabSpace(vueStyle, indentDepth);
		} else if (indentDepth === 0) {
			realVueStyle = vueStyle
				.split(this.NEW_LINE)
				.map(str => str.replace(this.TAB, ''))
				.join(this.NEW_LINE);
		} else {
			realVueStyle = this.addTabSpace(vueStyle, indentDepth - 1);
		}

		// Header + Vue Script + Footer 조합
		const overwrittenHtml = targetFile
			.slice(0, headerLastPositionIndex)
			.concat(
				`${this.NEW_LINE}${realVueStyle}`,
				targetFile.slice(targetFile.slice(0, eDelimiterIndex).lastIndexOf(this.NEW_LINE))
			);

		return overwrittenHtml;
	}
}

export default VueEncoder;
