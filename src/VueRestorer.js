import fs from 'fs';
import path, { sep } from 'path';

import _ from 'lodash';
import iconv from 'iconv-lite';

import VueParent from './VueParent.js';

class VueRestorer extends VueParent {
	/**
	 * @param {string} filePath file full path (d:/temp/conts/js/*.vue)
	 * @param {boolean} [isEuckr = true]
	 * @param {string} [fileSep = sep]
	 */
	constructor(filePath, isEuckr = true, fileSep = sep) {
		super();
		// ↓↓↓ set constructor params
		this.vueFileFolder = _(filePath).split(fileSep).initial().join(fileSep);
		this.vueFilePath = filePath;
		this.isEuckr = isEuckr;

		// ↓↓↓ set dynamic instance value
		const fileName = filePath.slice(0, filePath.lastIndexOf('.'));

		/** vue template 영역을 변환하여 저장할  */
		this.htmlFileInfo = {
			filePath: '',
			indentDepth: 0,
			isTemplate: false,
			positionId: ''
		};

		this.jsFileInfo = {
			/** vue script 영역을 변환하여 저장할 파일 */
			filePath: `${fileName}.js`
		};
	}

	/**
	 * Vue 파일 변경될 경우 변환 작업 처리
	 * @param {string} path fileFullPath
	 */
	async convertVueFile() {
		const vueFile = await this.getFile(this.vueFilePath);

		this.NEW_LINE = vueFile.indexOf(this.NEW_LINE) >= 0 ? this.NEW_LINE : '\n';

		if (!vueFile.length) {
			return false;
		}

		// vue 파일을 기반으로 js 영역 교체
		this.replaceVueScript(this.extractScript(vueFile));
		// // vue 파일을 기반으로 html 영역 교체
		this.replaceVueTemplate(this.extractTemplate(vueFile));
	}

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
		const jsFile = await this.getFile(this.jsFileInfo.filePath);

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

export default VueRestorer;
