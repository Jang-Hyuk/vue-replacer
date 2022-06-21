import _ from 'lodash';

import VueReplacer from './VueReplacer.js';
import BaseUtil from './BaseUtil.js';

import './type.d.js';

class VueDecoder extends VueReplacer {
	/**
	 * Vue 파일 변경될 경우 변환 작업 처리
	 * @param {string} path fileFullPath
	 */
	async decodeVueFile() {
		this.vueParser.tplFileInfo.task = this.parseOtherFile;
		this.vueParser.scriptFileInfo.task = this.parseJavascriptFile;
		this.vueParser.styleFileInfo.task = this.parseOtherFile;

		const fileConfigs = [
			this.vueParser.tplFileInfo,
			this.vueParser.scriptFileInfo,
			this.vueParser.styleFileInfo
		];

		// console.log('🚀 ~ file: VueDecoder.js ~ line 17 ~ fileConfigs', fileConfigs);

		// _.chain(fileConfigs)
		// 	.filter(config => config.filePath.length)
		// 	.groupBy('filePath')
		// 	.forEach(configList => this.replaceEachFiles(configList))
		// 	.value();
	}

	async parseFile(fileConfigList) {}

	async parseJavascriptFile(filePath) {}

	/**
	 *
	 * @param {string} contents 파일 내용
	 * @param {replaceTargetFileInfo} config
	 */
	async parseOtherFile(contents, config) {}

	/**
	 * Vue script 안의 내용을 동일 {fileName}.js 영역 교체 수행
	 * @alias Js Converter
	 * @param {string} vueScript
	 */
	async replaceVueScript(vueScript) {
		if (_.isEmpty(vueScript)) {
			return false;
		}
		// 덮어쓸 js 파일을 읽음
		const jsFile = await this.fileReader.getFile(this.jsFileInfo.filePath);

		if (!jsFile.length) {
			return false;
		}
		// Vue Deleimiter Range 에 해당하는 부분을 추출
		const { sDelimiterIndex, eDelimiterIndex } = VueReplacer.sliceString(
			jsFile,
			this.vueStartDelimiter,
			this.vueEndDelimiter
		);
		// Vue Delimiter에 해당하는 부분이 없다면 종료
		if (_.includes([sDelimiterIndex, eDelimiterIndex], -1)) {
			return false;
		}
		// js파일에 덮어쓸 최초 시작 포인트 index를 읽어옴 => (new Vue({), Vue.component('any', {)) 이런식으로 { 가 시작점
		const headerLastPositionIndex = jsFile.indexOf('{', sDelimiterIndex);
		// Header + Vue Script + Footer 조합
		const regExp = new RegExp(this.NEW_LINE, 'g');
		const overwrittenJs = jsFile
			.slice(0, headerLastPositionIndex)
			.concat(
				vueScript.replace(regExp, `${this.NEW_LINE}${this.TAB}`),
				jsFile.slice(jsFile.slice(0, eDelimiterIndex).lastIndexOf('}') + 1)
			);

		this.writeFile(this.jsFileInfo.filePath, overwrittenJs);
	}
}

export default VueDecoder;
