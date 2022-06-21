import { sep } from 'path';

import { ESLint } from 'eslint';
import _ from 'lodash';

import FileReader from './FileReader.js';
import FileWriter from './FileWriter.js';
import VueParser from './VueParser.js';

class VueReplacer {
	/**
	 * @param {object} config Replacer 생성자 옵션
	 * @param {string} config.filePath file full path (d:/temp/conts/js/*.vue)
	 * @param {boolean} [config.isEucKr = true] iconv 로 최종 내보낼 파일 인코딩 형식
	 * @param {string} [config.fileSep = sep] window vs linux file 구분자에 따른 값
	 * @param {string} [config.isIeMode = false] IE 모드일 경우 output file에 eslint 를 적용하여 저장. 속도가 느린 단점이 있음
	 * @param {string} config.adminFolder admin 폴더명. IE 모드 동작시 해당 폴더 아래에 존재하는 js만 유효한 걸로 판단
	 */
	constructor(config) {
		const {
			filePath,
			fileSep = sep,
			isEucKr = true,
			adminFolder,
			isIeMode = false
		} = config;

		this.isIeMode = isIeMode;

		this.NEW_LINE = '\r\n';
		this.TAB = '\t';
		// ↓↓↓ set constant
		this.vueStartDelimiter = '### Vue';
		this.vueEndDelimiter = '### !Vue';

		// ↓↓↓ set constructor params
		this.vueFileFolder = _(filePath).split(fileSep).initial().join(fileSep);
		this.vueFilePath = filePath;
		this.isEucKr = isEucKr;
		this.adminFolder = adminFolder;

		this.vueParser = new VueParser(config);
		this.fileReader = new FileReader(config);
		this.fileWriter = new FileWriter(config);

		// Create an instance with the `fix` option.
		// this.eslint = new ESLint({ fix: true });
	}

	async init() {
		const vueFile = await this.fileReader.getFile(this.vueFilePath);

		this.NEW_LINE = vueFile.indexOf(this.NEW_LINE) >= 0 ? this.NEW_LINE : '\n';

		if (!vueFile.length) {
			return false;
		}
		// vue file 정보 읽어들임
		this.vueParser.NEW_LINE = this.NEW_LINE;
		this.vueParser.parseVueFile(vueFile);
	}

	/**
	 * 소스에 탭을 삽입하여 반환
	 * @param {string} source
	 * @param {number} [tabCount=1]
	 * @param {boolean} [isTail=false] 첫번재 녀석 제외 여부
	 * @param {boolean} [isInitial=false] 마지막 녀석 제외 여부
	 */
	addTabSpace(source = '', tabCount = 1, isTail = false, isInitial = false) {
		const tabValue = _.repeat(this.TAB, tabCount);

		const result = _(source)
			.split(this.NEW_LINE)
			.map((v, index, arr) => {
				if (isTail && index === 0) {
					return v;
				}

				if (isInitial && index === arr.length - 1) {
					return v;
				}

				return v.length ? tabValue + v : v;
			})
			.join(this.NEW_LINE);

		return result;
	}
}

export default VueReplacer;
