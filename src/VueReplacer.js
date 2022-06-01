import path, { sep } from 'path';

import _ from 'lodash';

import VueParent from './VueParent.js';

class VueReplacer extends VueParent {
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
			filePath: `${fileName}.html`,
			indentDepth: 0,
			isTemplate: false,
			positionId: ''
		};

		this.jsFileInfo = {
			/** Template일 경우 Vue.component 아닐 경우 new Vue 를 delimiter 검색 조건으로 함 */
			isTemplate: false,
			/** vue script 영역을 변환하여 저장할 파일 */
			filePath: `${fileName}.js`
		};
	}

	/**
	 * string을 객체로 변환
	 * @param {string} pairs=''
	 * @param {string} [outerSep='']
	 * @param {string} [innerSeq='=']
	 */
	toDictionary(pairs, outerSep = ' ', innerSeq = '=') {
		return _.chain(pairs)
			.split(this.NEW_LINE)
			.map(str => str.replace(/\t|"/g, ''))
			.join(' ')
			.split(outerSep)
			.compact()
			.invokeMap('split', innerSeq)
			.fromPairs()
			.value();
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
		const srcHeaderInfo = this.toDictionary(srcHeader);
		const srcBody = vueOriginalScript.slice(realScriptStartIndex + 1);

		if (srcHeaderInfo.isSync !== '1') {
			return false;
		}

		this.jsFileInfo.isTemplate = srcHeaderInfo.isTemplate === '1';

		// 파일 경로가 있다면 경로 수정
		if (srcHeaderInfo.fileSrc) {
			this.jsFileInfo.filePath = path.join(this.vueFileFolder, srcHeaderInfo.fileSrc);
		}

		const srcDelimiter = 'export default';
		const scriptConfigIndex = srcBody.indexOf(srcDelimiter);
		const scriptOuter = srcBody.slice(0, scriptConfigIndex);

		return {
			scriptOuter,
			vueOption: _.chain(srcBody.slice(scriptConfigIndex))
				.replace(srcDelimiter, '')
				.trim()
				.thru(str => str.slice(0, str.length - 1))
				.value()
		};
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
		const tplHeaderInfo = this.toDictionary(tplHeader);
		const tplBody = vueOriginalTpl.slice(realTplStartIndex + 1);

		if (tplHeaderInfo.isSync !== '1') {
			return false;
		}

		let realContents = tplBody;
		if (tplHeaderInfo.isTemplate === '1') {
			realContents = `${this.NEW_LINE}<template v-cloak id="${tplHeaderInfo.id}">${tplBody}${this.NEW_LINE}</template>`;
			this.htmlFileInfo.isTemplate = true;
		}

		// 파일 경로가 있다면 경로 수정
		if (tplHeaderInfo.fileSrc) {
			this.htmlFileInfo.filePath = path.join(this.vueFileFolder, tplHeaderInfo.fileSrc);
		}

		// this.htmlFileInfo.filePath = path.join(this.vueFileFolder, tplHeaderInfo.fileSrc);
		this.htmlFileInfo.indentDepth = tplHeaderInfo.depth
			? parseInt(tplHeaderInfo.depth, 10)
			: 0;
		this.htmlFileInfo.positionId = tplHeaderInfo.id ?? '';
		return realContents;
	}

	async getFile(filePath) {
		let file = '';
		if (this.isEuckr) {
			file = await VueParent.readEuckrFile(filePath);
		} else {
			// FIXME utf-8 구현
		}

		return file;
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

		// NOTE replaceVueScript vue 파일을 기반으로 js 영역 교체
		this.replaceVueScript(this.extractScript(vueFile));
		// NOTE replaceVueTemplate vue 파일을 기반으로 html 영역 교체
		this.replaceVueTemplate(this.extractTemplate(vueFile));
	}

	/**
	 * Vue script 안의 내용을 동일 {fileName}.js 영역 교체 수행
	 * @alias Js Converter
	 * @param {{scriptOuter: string, vueOption: string}} vueScriptInfo
	 */
	async replaceVueScript(vueScriptInfo) {
		if (_.isEmpty(vueScriptInfo)) {
			throw new Error('vueScript가 비어있음');
		}

		const { scriptOuter, vueOption } = vueScriptInfo;

		// 덮어쓸 js 파일을 읽음
		const jsFile = await this.getFile(this.jsFileInfo.filePath);

		if (!jsFile.length) {
			throw new Error('js file이 존재하지 않음');
		}
		// Vue Deleimiter Range 에 해당하는 부분을 추출
		const { sDelimiterIndex, eDelimiterIndex } = VueParent.sliceString(
			jsFile,
			this.vueStartDelimiter,
			this.vueEndDelimiter
		);
		// Vue Delimiter에 해당하는 부분이 없다면 종료
		if (_.includes([sDelimiterIndex, eDelimiterIndex], -1)) {
			throw new Error(
				`js script delimiter가 이상함 ${sDelimiterIndex}, ${eDelimiterIndex}`
			);
		}
		// js파일에 덮어쓸 최초 시작 포인트 index를 읽어옴 => (new Vue({), Vue.component('any', {)) 이런식으로 { 가 시작점
		const vueOptDelimiter = this.jsFileInfo.isTemplate ? 'Vue.component' : 'new Vue';

		const vueOptDelimiterIndex = jsFile.indexOf(vueOptDelimiter);
		if (vueOptDelimiterIndex === -1) {
			throw new Error('유효한 vue delemiter가 존재하지 않습니다.');
		}
		const headerLastPositionIndex = jsFile.indexOf('{', sDelimiterIndex);
		// Header + Vue Script + Footer 조합
		const regExp = new RegExp(this.NEW_LINE, 'g');
		const overwrittenJs = jsFile
			.slice(0, headerLastPositionIndex)
			.concat(
				vueOption.replace(regExp, `${this.NEW_LINE}${this.TAB}`),
				jsFile.slice(jsFile.slice(0, eDelimiterIndex).lastIndexOf('}') + 1)
			);

		this.writeFile(this.jsFileInfo.filePath, overwrittenJs);
	}

	/**
	 * Vue template 안의 내용을 지정된 {fileName}.html 영역 교체 수행
	 * @param {string} vueTemplate
	 * @returns {any}
	 */
	async replaceVueTemplate(vueTemplate) {
		if (_.isEmpty(vueTemplate)) {
			throw new Error('vueTemplate이 비어있음');
		}
		const { filePath, indentDepth, positionId } = this.htmlFileInfo;
		// 덮어쓸 html 파일을 읽음
		const htmlFile = await this.getFile(filePath);
		if (!htmlFile.length) {
			throw new Error('html file이 존재하지 않음');
		}
		// Vue Deleimiter Range 에 해당하는 부분을 추출
		const { sDelimiterIndex, eDelimiterIndex } = VueParent.sliceString(
			htmlFile,
			`${this.vueStartDelimiter} ${positionId}`,
			`${this.vueEndDelimiter} ${positionId}`
		);

		// Vue Delimiter에 해당하는 부분이 없다면 종료
		if (_.includes([sDelimiterIndex, eDelimiterIndex], -1)) {
			throw new Error(
				`vue template delimiter가 이상함 ${sDelimiterIndex}, ${eDelimiterIndex}`
			);
		}

		// html파일에 덮어쓸 최초 시작 포인트 index를 읽어옴(개행)
		const headerLastPositionIndex = htmlFile.indexOf(this.NEW_LINE, sDelimiterIndex);

		// html indent depth 에 따라 tab 간격 조절
		const splittedVueTemplate = vueTemplate.split(this.NEW_LINE);
		let realVueTemplate = _(splittedVueTemplate).initial().join(this.NEW_LINE);
		// 템플릿 모드 일 경우
		if (this.htmlFileInfo.isTemplate) {
			if (indentDepth >= 1) {
				const regExp = new RegExp(this.NEW_LINE, 'g');
				realVueTemplate = realVueTemplate.replace(
					regExp,
					`${this.NEW_LINE}${_.repeat(this.TAB, indentDepth)}`
				);
			}
		} else if (indentDepth === 0) {
			const regExp = new RegExp(this.NEW_LINE + this.TAB, 'g');
			realVueTemplate = realVueTemplate.replace(regExp, this.NEW_LINE);
		} else if (indentDepth > 1) {
			const regExp = new RegExp(this.NEW_LINE, 'g');
			realVueTemplate = realVueTemplate.replace(
				regExp,
				`${this.NEW_LINE}${_.repeat(this.TAB, indentDepth - 1)}`
			);
		}

		realVueTemplate = realVueTemplate.concat(_.last(splittedVueTemplate));

		// Header + Vue Script + Footer 조합
		const overwrittenHtml = htmlFile
			.slice(0, headerLastPositionIndex)
			.concat(
				realVueTemplate,
				htmlFile.slice(htmlFile.slice(0, eDelimiterIndex).lastIndexOf(this.NEW_LINE))
			);

		this.writeFile(filePath, overwrittenHtml);
	}
}

export default VueReplacer;
