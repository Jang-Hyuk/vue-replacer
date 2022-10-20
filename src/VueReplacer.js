import { sep } from 'path';

import _ from 'lodash';

import FileReader from './FileReader.js';
import FileWriter from './FileWriter.js';
import VueParser from './VueParser.js';
import BaseUtil from './BaseUtil.js';

import './type.d.js';

class VueReplacer {
	/**
	 * @param {replacerConfig} config Replacer 생성자 옵션
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
		this.vuefile = '';
		this.isEucKr = isEucKr;
		this.adminFolder = adminFolder;

		this.vueParser = new VueParser(config);
		this.fileReader = new FileReader(config);
		this.fileWriter = new FileWriter(config);

		this.observers = [];
	}

	async init() {
		const vueFile = await this.fileReader.getFile(this.vueFilePath);
		this.vuefile = vueFile;

		this.NEW_LINE = vueFile.indexOf(this.NEW_LINE) >= 0 ? this.NEW_LINE : '\n';

		if (!vueFile.length) {
			return false;
		}
		// vue file 정보 읽어들임
		this.vueParser.NEW_LINE = this.NEW_LINE;
		this.vueParser.parseVueFile(vueFile);

		this.isEucKr = !this.vueParser.isUseUtf8Chartset();

		this.fileReader.isEucKr = this.isEucKr;
		this.fileWriter.isEucKr = this.isEucKr;
	}

	static delay(ms) {
		return new Promise(resolve => {
			setTimeout(() => {
				resolve();
			}, ms);
		});
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

	/**
	 * vue path 사용하는 부분 분석
	 * @param {replaceTargetFileInfo} config
	 * @param {string} [targetFile]
	 */
	async parseDelimiterFile(config, targetFile = '') {
		const { filePath, positionId } = config;

		// 덮어쓸 html 파일을 읽음
		if (targetFile.length === 0) {
			if (filePath.length === 0) {
				return {};
			}

			targetFile = await this.fileReader.getFile(filePath);
		}

		if (!targetFile || !targetFile.length) {
			throw new Error(`${filePath}이 존재하지 않음`);
		}
		// Vue Deleimiter Range 에 해당하는 부분을 추출
		const delimiterFileInfo = BaseUtil.sliceString(
			targetFile,
			`${this.vueStartDelimiter} ${positionId}`,
			`${this.vueEndDelimiter} ${positionId}`
		);

		const { sDelimiterIndex, eDelimiterIndex } = delimiterFileInfo;

		// Vue Delimiter에 해당하는 부분이 없다면 종료
		if (_.includes([sDelimiterIndex, eDelimiterIndex], -1)) {
			throw new Error(
				`${filePath}: vue delimiter가 이상함 ${sDelimiterIndex}, ${eDelimiterIndex}`
			);
		}

		return {
			targetFile,
			delimiterFileInfo
		};
	}

	attachObserver(observer) {
		this.observers.push(observer);
	}

	dettachObserver(observer) {
		this.observers = this.observers.filter(ob => ob !== observer);
	}

	notifyCompleteEncode() {
		this.observers.forEach(ob => {
			typeof ob.onCompleteEncode === 'function' && ob.onCompleteEncode(this);
		});
	}

	notifyCompleteDecode() {
		this.observers.forEach(ob => {
			typeof ob.onCompleteDecode === 'function' && ob.onCompleteDecode(this);
		});
	}
}

export default VueReplacer;
