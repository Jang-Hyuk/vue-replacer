import fs from 'fs';
import path, { sep } from 'path';

import _ from 'lodash';
import iconv from 'iconv-lite';

// import VueParent from './VueParent.js';

const NEW_LINE = '\r\n';
const TAB = '\t';

// NOTE return false 로 되어있는 부분들 예외처리가 필요시 구현해야함

class VueReplacer {
	/**
	 * @param {string} filePath file full path (d:/temp/conts/js/*.vue)
	 * @param {boolean} [isEuckr = true]
	 * @param {string} [fileSep = sep]
	 */
	constructor(filePath, isEuckr = true, fileSep = sep) {
		// ↓↓↓ set constructor params
		this.vueFileFolder = _(filePath).split(fileSep).initial().join(fileSep);
		this.vueFilePath = filePath;
		this.isEuckr = isEuckr;

		// ↓↓↓ set constant
		this.vueStartDelimiter = '### Vue';
		this.vueEndDelimiter = '### !Vue';

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
	 * euc-kr 형식의 파일을 utf8 형식으로 변환하여 반환
	 * @param {string} filePath
	 * @returns {string}
	 */
	static readEuckrFile(filePath) {
		return new Promise(resolve => {
			try {
				fs.createReadStream(filePath)
					.pipe(iconv.decodeStream('euc-kr'))
					.collect((err, decodedBody) => {
						if (err) {
							resolve('');
						}
						resolve(decodedBody);
					});
			} catch (error) {
				resolve('');
			}
		});
	}

	/**
	 * string을 객체로 변환
	 * @param {string} pairs=''
	 * @param {string} [outerSep='']
	 * @param {string} [innerSeq='=']
	 */
	static toDictionary(pairs, outerSep = ' ', innerSeq = '=') {
		return _.chain(pairs)
			.split(NEW_LINE)
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
		const srcHeaderInfo = VueReplacer.toDictionary(srcHeader);
		const srcBody = vueOriginalScript.slice(realScriptStartIndex + 1);

		if (srcHeaderInfo.isSync !== '1') {
			return false;
		}

		if (srcHeaderInfo.fileSrc) {
			this.jsFileInfo.filePath = path.join(this.vueFileFolder, srcHeaderInfo.fileSrc);
		}

		const srcDelimiter = 'export default';

		return _.chain(srcBody.slice(srcBody.indexOf(srcDelimiter)))
			.replace(srcDelimiter, '')
			.trim()
			.thru(str => str.slice(0, str.length - 1))
			.value();
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
		const tplHeaderInfo = VueReplacer.toDictionary(tplHeader);
		const tplBody = vueOriginalTpl.slice(realTplStartIndex + 1);

		if (tplHeaderInfo.isSync !== '1') {
			return false;
		}

		if (tplHeaderInfo.fileSrc === undefined) {
			return false;
		}

		let realContents = tplBody;
		if (tplHeaderInfo.isTemplate === '1') {
			realContents = `${NEW_LINE}<template id="${tplHeaderInfo.id}">${tplBody}${NEW_LINE}</template>`;
			this.htmlFileInfo.isTemplate = true;
		}

		// 덮어쓸 html 파일의 정보 추출
		this.htmlFileInfo.filePath = path.join(this.vueFileFolder, tplHeaderInfo.fileSrc);
		this.htmlFileInfo.indentDepth = tplHeaderInfo.depth
			? parseInt(tplHeaderInfo.depth, 10)
			: 0;
		this.htmlFileInfo.positionId = tplHeaderInfo.id ?? '';
		return realContents;
	}

	/**
	 * 스트링 범위로 짜르기
	 * @param {string} source
	 * @param {string} sDelimiter
	 * @param {string} eDelimiter
	 */
	static sliceString(source, sDelimiter, eDelimiter) {
		const resultValue = {
			sDelimiterIndex: source.indexOf(sDelimiter),
			eDelimiterIndex: source.lastIndexOf(eDelimiter),
			contents: ''
		};

		resultValue.contents = source.slice(
			resultValue.sDelimiterIndex + sDelimiter.length,
			resultValue.eDelimiterIndex
		);

		return resultValue;
	}

	async getFile(filePath) {
		let file = '';
		if (this.isEuckr) {
			file = await VueReplacer.readEuckrFile(filePath);
		} else {
			// FIXME utf-8 구현
		}

		return file;
	}

	/**
	 * Description
	 * @param {string} filePath
	 * @param {string} contents
	 */
	writeFile(filePath, contents = '') {
		if (this.isEuckr) {
			fs.writeFileSync(filePath, iconv.encode(contents, 'euc-kr'), {
				encoding: 'binary'
			});
		} else {
			// FIXME utf-8 구현
		}
	}

	/**
	 * Vue 파일 변경될 경우 변환 작업 처리
	 * @param {string} path fileFullPath
	 */
	async convertVueFile() {
		const vueFile = await this.getFile(this.vueFilePath);

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
		const regExp = new RegExp(NEW_LINE, 'g');
		const overwrittenJs = jsFile
			.slice(0, headerLastPositionIndex)
			.concat(
				vueScript.replace(regExp, `${NEW_LINE}${TAB}`),
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
			return false;
		}
		const { filePath, indentDepth, positionId } = this.htmlFileInfo;
		// 덮어쓸 html 파일을 읽음
		const htmlFile = await this.getFile(filePath);
		if (!htmlFile.length) {
			return false;
		}
		// Vue Deleimiter Range 에 해당하는 부분을 추출
		const { sDelimiterIndex, eDelimiterIndex } = VueReplacer.sliceString(
			htmlFile,
			`${this.vueStartDelimiter} ${positionId}`,
			`${this.vueEndDelimiter} ${positionId}`
		);

		// Vue Delimiter에 해당하는 부분이 없다면 종료
		if (_.includes([sDelimiterIndex, eDelimiterIndex], -1)) {
			return false;
		}

		// html파일에 덮어쓸 최초 시작 포인트 index를 읽어옴(개행)
		const headerLastPositionIndex = htmlFile.indexOf(NEW_LINE, sDelimiterIndex);

		// html indent depth 에 따라 tab 간격 조절
		const splittedVueTemplate = vueTemplate.split(NEW_LINE);
		let realVueTemplate = _(splittedVueTemplate).initial().join(NEW_LINE);
		// 템플릿 모드 일 경우
		if (this.htmlFileInfo.isTemplate) {
			if (indentDepth >= 1) {
				const regExp = new RegExp(NEW_LINE, 'g');
				realVueTemplate = realVueTemplate.replace(
					regExp,
					`${NEW_LINE}${_.repeat(TAB, indentDepth)}`
				);
			}
		} else if (indentDepth === 0) {
			const regExp = new RegExp(NEW_LINE + TAB, 'g');
			realVueTemplate = realVueTemplate.replace(regExp, NEW_LINE);
		} else if (indentDepth > 1) {
			const regExp = new RegExp(NEW_LINE, 'g');
			realVueTemplate = realVueTemplate.replace(
				regExp,
				`${NEW_LINE}${_.repeat(TAB, indentDepth - 1)}`
			);
		}

		realVueTemplate = realVueTemplate.concat(_.last(splittedVueTemplate));

		// Header + Vue Script + Footer 조합
		const overwrittenHtml = htmlFile
			.slice(0, headerLastPositionIndex)
			.concat(
				realVueTemplate,
				htmlFile.slice(htmlFile.slice(0, eDelimiterIndex).lastIndexOf(NEW_LINE))
			);

		this.writeFile(filePath, overwrittenHtml);
	}
}

export default VueReplacer;
