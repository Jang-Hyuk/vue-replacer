/* eslint-disable no-param-reassign */
import path, { sep } from 'path';

import _ from 'lodash';

import VueParent from './VueParent.js';

/**
 * @typedef {object} replaceTargetFileInfo
 * @property {string} filePath
 * @property {boolean} [isTemplate=false] wrapping 여부
 * @property {boolean} [isSync=false] 덮어쓰기 여부
 * @property {string|object} contents wrapping 여부
 * @property {string} positionId 교체 대상 Id
 * @property {number} indentDepth 들여쓰기 Tab 수
 * @property {Function} task 덮어쓸 로직을 가지고 있는 비동기 함수 명
 */

class VueReplacer extends VueParent {
	/**
	 * @param {Object} config Replacer 생성자 옵션
	 * @param {string} config.filePath file full path (d:/temp/conts/js/*.vue)
	 * @param {boolean} [config.isEuckr = true] iconv 로 최종 내보낼 파일 인코딩 형식
	 * @param {string} [config.fileSep = sep] window vs linux file 구분자에 따른 값
	 * @param {string} [config.isIeMode = false] IE 모드일 경우 output file에 eslint 를 적용하여 저장. 속도가 느린 단점이 있음
	 * @param {string} config.adminFolder admin 폴더명. IE 모드 동작시 해당 폴더 아래에 존재하는 js만 유효한 걸로 판단
	 */
	constructor(config) {
		super(config);

		const { filePath, fileSep = sep, isEuckr = true, adminFolder } = config;

		// ↓↓↓ set constructor params
		this.vueFileFolder = _(filePath).split(fileSep).initial().join(fileSep);
		this.vueFilePath = filePath;
		this.isEuckr = isEuckr;
		this.adminFolder = adminFolder;

		// ↓↓↓ set dynamic instance value
		const fileName = filePath.slice(0, filePath.lastIndexOf('.'));

		/** @type {replaceTargetFileInfo} vue template 영역을 변환하여 저장할  */
		this.tplFileInfo = {
			filePath: `${fileName}.html`,
			isTemplate: false,
			isSync: false,
			contents: '',
			positionId: '',
			indentDepth: 0,
			task: this.replaceVueTemplate
		};

		/** @type {replaceTargetFileInfo}  */
		this.scriptFileInfo = {
			filePath: `${fileName}.js`,
			/** Template일 경우 Vue.component 아닐 경우 new Vue 를 delimiter 검색 조건으로 함 */
			isTemplate: false,
			isSync: false,
			contents: {},
			positionId: '',
			indentDepth: 0,
			/** vue script 영역을 변환하여 저장할 파일 */
			task: this.replaceVueScript
		};

		/** @type {replaceTargetFileInfo} vue script 영역을 변환하여 저장할 파일 */
		this.styleFileInfo = {
			filePath: '',
			/** style tag wrapping 여부 */
			isTemplate: false,
			isSync: false,
			contents: '',
			indentDepth: 0,
			positionId: '',
			task: this.replaceVueStyle
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

		const isSync = srcHeaderInfo.isSync === '1';
		this.scriptFileInfo.isSync = isSync;

		if (!isSync) {
			return false;
		}

		this.scriptFileInfo.isTemplate = srcHeaderInfo.isTemplate === '1';

		// 파일 경로가 있다면 경로 수정
		if (srcHeaderInfo.fileSrc) {
			this.scriptFileInfo.filePath = path.join(this.vueFileFolder, srcHeaderInfo.fileSrc);
		}

		this.scriptFileInfo.indentDepth = srcHeaderInfo.depth
			? parseInt(srcHeaderInfo.depth, 10)
			: 0;
		this.scriptFileInfo.positionId = srcHeaderInfo.id ?? '';

		const srcDelimiter = 'export default';
		const scriptConfigIndex = srcBody.indexOf(srcDelimiter);
		let scriptOuter = srcBody.slice(0, scriptConfigIndex);
		// import 사용시 끝나는 지점 추출
		if (scriptOuter.indexOf(" from '") !== -1) {
			const tempIndex = scriptOuter.indexOf(';', scriptOuter.lastIndexOf(" from '"));
			scriptOuter = scriptOuter.slice(scriptOuter.indexOf(this.NEW_LINE, tempIndex + 1));
		}

		let vueOption = _.chain(srcBody.slice(scriptConfigIndex))
			.replace(srcDelimiter, '')
			.trim()
			.thru(str => str.slice(0, str.length - 1))
			.value();

		// 컴포넌트를 사용하고 있다면 해당 구간을 삭제
		const componentIndex = vueOption.indexOf('components: {');
		if (componentIndex !== -1) {
			const componentsPrevContents = vueOption.slice(0, componentIndex);
			const componentsNextIndex = vueOption.indexOf('},', componentIndex);

			vueOption = componentsPrevContents.concat(
				vueOption.slice(vueOption.indexOf(this.NEW_LINE, componentsNextIndex))
			);
		}

		return {
			scriptOuter,
			vueOption
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

		const isSync = tplHeaderInfo.isSync === '1';
		this.tplFileInfo.isSync = isSync;

		if (!isSync) {
			return false;
		}

		let realContents = tplBody;
		if (tplHeaderInfo.isTemplate === '1') {
			realContents = `${this.NEW_LINE}<template v-cloak id="${tplHeaderInfo.id}">${tplBody}${this.NEW_LINE}</template>`;
			this.tplFileInfo.isTemplate = true;
		}

		// 파일 경로가 있다면 경로 수정
		if (tplHeaderInfo.fileSrc) {
			this.tplFileInfo.filePath = path.join(this.vueFileFolder, tplHeaderInfo.fileSrc);
		}

		// this.htmlFileInfo.filePath = path.join(this.vueFileFolder, tplHeaderInfo.fileSrc);
		this.tplFileInfo.indentDepth = tplHeaderInfo.depth
			? parseInt(tplHeaderInfo.depth, 10)
			: 0;
		this.tplFileInfo.positionId = tplHeaderInfo.id ?? '';
		return realContents;
	}

	/**
	 * Extract *.Vue Template
	 * @alias Template Converter
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
		const styleHeaderInfo = this.toDictionary(styleHeader);
		let styleBody = vueOriginalStyle
			.slice(realStyleStartIndex + 1)
			.split(this.NEW_LINE)
			.join(this.NEW_LINE + this.TAB);

		styleBody = _(styleBody.split(this.NEW_LINE)).initial().join(this.NEW_LINE);

		const isSync = styleHeaderInfo.isSync === '1';
		this.styleFileInfo.isSync = isSync;

		if (!isSync) {
			return false;
		}

		let realContents = styleBody;
		if (styleHeaderInfo.isTemplate === '1') {
			realContents = `${this.NEW_LINE}<style>${styleBody}${this.NEW_LINE}</style>`;
			this.styleFileInfo.isTemplate = true;
		}

		// 파일 경로가 있다면 경로 수정
		if (styleHeaderInfo.fileSrc) {
			this.styleFileInfo.filePath = path.join(
				this.vueFileFolder,
				styleHeaderInfo.fileSrc
			);
		}

		// this.htmlFileInfo.filePath = path.join(this.vueFileFolder, tplHeaderInfo.fileSrc);
		this.styleFileInfo.indentDepth = styleHeaderInfo.depth
			? parseInt(styleHeaderInfo.depth, 10)
			: 0;
		this.styleFileInfo.positionId = styleHeaderInfo.id ?? '';
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

		// ANCHOR Converter
		this.tplFileInfo.contents = this.extractTemplate(vueFile);
		this.scriptFileInfo.contents = this.extractScript(vueFile);
		this.styleFileInfo.contents = this.extractStyle(vueFile);

		const fileConfigs = [this.tplFileInfo, this.scriptFileInfo, this.styleFileInfo];

		_.chain(fileConfigs)
			.filter(config => config.isSync && config.filePath.length)
			.groupBy('filePath')
			.forEach(configList => this.replaceEachFiles(configList))
			.value();
	}

	/**
	 * file 교체 pipe로 연결해서 처리
	 * @param {replaceTargetFileInfo[]} fileConfigList
	 */
	async replaceEachFiles(fileConfigList = []) {
		await fileConfigList.reduce((prevTask, currTask, index) => {
			if (index + 1 === fileConfigList.length) {
				return prevTask
					.then(results => currTask.task.call(this, currTask.contents, results))
					.then(fileTxt => this.writeFile(currTask.filePath, fileTxt));
			}
			return prevTask.then(results =>
				currTask.task.call(this, currTask.contents, results)
			);
		}, Promise.resolve());
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

		const { filePath, positionId, indentDepth } = this.scriptFileInfo;

		// 덮어쓸 js 파일을 읽음
		if (targetFile.length === 0) {
			if (filePath.length === 0) {
				return false;
			}

			targetFile = await this.getFile(filePath);
		}

		if (!targetFile.length) {
			throw new Error('js file이 존재하지 않음');
		}
		// Vue Deleimiter Range 에 해당하는 부분을 추출
		const { sDelimiterIndex, eDelimiterIndex } = VueParent.sliceString(
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
		const vueOptDelimiter = this.scriptFileInfo.isTemplate ? 'Vue.component' : 'new Vue';

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

		const { filePath, indentDepth, positionId } = this.tplFileInfo;
		// 덮어쓸 html 파일을 읽음
		if (targetFile.length === 0) {
			if (filePath.length === 0) {
				return false;
			}

			// eslint-disable-next-line no-param-reassign
			targetFile = await this.getFile(filePath);
		}

		// return;
		if (!targetFile.length) {
			throw new Error('html file이 존재하지 않음');
		}
		// Vue Deleimiter Range 에 해당하는 부분을 추출
		const { sDelimiterIndex, eDelimiterIndex } = VueParent.sliceString(
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
		if (this.tplFileInfo.isTemplate) {
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
		const { filePath, indentDepth, positionId } = this.styleFileInfo;

		if (targetFile.length === 0) {
			if (filePath.length === 0) {
				return false;
			}

			// eslint-disable-next-line no-param-reassign
			targetFile = await this.getFile(filePath);
		}
		// 덮어쓸 html 파일을 읽음
		// return;
		if (!targetFile.length) {
			throw new Error('html file이 존재하지 않음');
		}
		// Vue Deleimiter Range 에 해당하는 부분을 추출
		const { sDelimiterIndex, eDelimiterIndex } = VueParent.sliceString(
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
		if (this.styleFileInfo.isTemplate) {
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

export default VueReplacer;
