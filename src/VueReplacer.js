import fs from 'fs';
import path from 'path';

import _ from 'lodash';
import iconv from 'iconv-lite';

const NEW_LINE = '\n';
const TAB = '\t';
class VueReplacer {
	/**
	 * @param {string} filePath file full path (d:/temp/conts/js/*.vue)
	 * @param {boolean} [isEuckr=true]
	 */
	constructor(filePath, isEuckr = true) {
		const sep = '/';
		// console.log('filePath: ', filePath, sep);
		// ↓↓↓ set constructor params
		this.vueFileFolder = _(filePath).split(sep).initial().join(sep);
		console.log('this.vueFileFolder: ', this.vueFileFolder);
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
			positionId: ''
		};
		this.htmlFilePath = '';
		/** vue script 영역을 변환하여 저장할 파일 */
		this.jsFilePath = `${fileName}.js`;

		/** 변환할 원본 vue 파일  */
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
			.split('\n')
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
	static extractScript(vueFile) {
		return _.chain(vueFile)
			.thru(str =>
				str.slice(vueFile.indexOf('export default'), vueFile.lastIndexOf('</script>'))
			)
			.replace('export default', '')
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
		// template 시작 tag 닫는 위치부터 template 종료 tag 범위 짜름
		const { contents, sDelimiterIndex } = VueReplacer.sliceString(
			vueFile,
			'>',
			'</template>'
		);
		const vueHeader = vueFile.slice(0, sDelimiterIndex);
		const vueHeaderInfo = VueReplacer.toDictionary(vueHeader);

		// 덮어쓸 html 파일의 정보 추출
		this.htmlFileInfo.filePath = path.resolve(this.vueFileFolder, vueHeaderInfo.compile);
		this.htmlFileInfo.indentDepth = vueHeaderInfo.depth
			? parseInt(vueHeaderInfo.depth, 10)
			: 0;
		this.htmlFileInfo.positionId = vueHeaderInfo.id ?? '';

		return contents;
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
			return '';
		}

		// vue 파일을 기반으로 js 영역 교체
		this.replaceVueScript(VueReplacer.extractScript(vueFile));
		// vue 파일을 기반으로 html 영역 교체
		this.replaceVueTemplate(this.extractTemplate(vueFile));
	}

	/**
	 * Vue script 안의 내용을 동일 {fileName}.js 영역 교체 수행
	 * @alias Js Converter
	 * @param {string} vueScript
	 */
	async replaceVueScript(vueScript) {
		// 덮어쓸 js 파일을 읽음
		const jsFile = await this.getFile(this.jsFilePath);

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
		const overwrittenJs = jsFile
			.slice(0, headerLastPositionIndex)
			.concat(
				vueScript,
				jsFile.slice(jsFile.slice(0, eDelimiterIndex).lastIndexOf('}') + 1)
			);

		this.writeFile(this.jsFilePath, overwrittenJs);
	}

	/**
	 * Vue template 안의 내용을 지정된 {fileName}.html 영역 교체 수행
	 * @param {string} vueTemplate
	 * @returns {any}
	 */
	async replaceVueTemplate(vueTemplate) {
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
		if (indentDepth === 0) {
			const regExp = new RegExp(NEW_LINE + TAB, 'g');
			realVueTemplate = realVueTemplate.replace(regExp, NEW_LINE);
		} else if (indentDepth > 1) {
			const regExp = new RegExp(NEW_LINE, 'g');
			realVueTemplate = realVueTemplate.replace(
				regExp,
				`${NEW_LINE}${_.repeat(TAB, indentDepth - 1)}`
			);
		}
		realVueTemplate = realVueTemplate.concat(_.last(splittedVueTemplate), NEW_LINE);

		// Header + Vue Script + Footer 조합
		const overwrittenHtml = htmlFile
			.slice(0, headerLastPositionIndex)
			.concat(
				realVueTemplate,
				htmlFile.slice(htmlFile.slice(0, eDelimiterIndex).lastIndexOf(NEW_LINE) + 1)
			);

		this.writeFile(filePath, overwrittenHtml);
	}
}

export default VueReplacer;
