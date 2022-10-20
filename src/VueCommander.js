import VueEncoder from './VueEncoder.js';
import VueDecoder from './VueDecoder.js';

import './type.d.js';

const OPER_STATUS = {
	isDecoded: -1,
	isWait: 0,
	isEncoded: 1
};

class VueCommander {
	/**
	 * @param {replacerConfig} config Replacer 생성자 옵션
	 */
	constructor(config) {
		this.config = config;

		this.relationFiles = [];

		/** @type {VueEncoder[]}  */
		this.encodingList = [];
		/** @type {VueDecoder[]}  */
		this.decodingList = [];

		this.isReplaceFlag = OPER_STATUS.isWait;
	}

	get operationStatus() {
		const isDecoding = !!this.decodingList.length;
		const isEncoding = !!this.encodingList.length;
		return {
			isWait: !isDecoding && !isEncoding,
			isDecoding,
			isEncoding
		};
	}

	/**
	 * Vue Encoder를 생성하고 관련 파일 경로를 업데이트
	 */
	async createVueEncoder() {
		const vueEncoder = new VueEncoder(this.config);
		await vueEncoder.init();

		this.config.isEucKr = vueEncoder.isEucKr;

		this.relationFiles = [
			vueEncoder.vueParser.tplFileInfo.filePath,
			vueEncoder.vueParser.scriptFileInfo.filePath,
			vueEncoder.vueParser.styleFileInfo.filePath
		].filter(str => str);

		return vueEncoder;
	}

	/**
	 * @param {replacerConfig} config Replacer 생성자 옵션
	 */
	updateConfig(config) {
		this.encoder = new VueEncoder(config);
		this.decoder = new VueDecoder(config);
	}

	/** Vue File 정보가 갱신되었을 경우 1. 연결 파일 정보 업데이트 2. 인코딩 진행 */
	async updateVueFile() {
		if (this.operationStatus.isDecoding) {
			return false;
		}
		try {
			const vueEncoder = await this.createVueEncoder();
			// 인코딩 완료를 받을 수 있도록 등록
			vueEncoder.attachObserver(this);
			this.encodingList.push(vueEncoder);

			await vueEncoder.encodeVueFile();
		} catch (error) {
			console.error(error);
		}
	}

	/** Vue File과 관련된 파일 정보가 갱신되었을 경우  */
	async updateOtherFile() {
		if (this.operationStatus.isEncoding) {
			return false;
		}
		try {
			const vueDecoder = new VueDecoder(this.config);
			await vueDecoder.init();
			// 디코딩 완료를 받을 수 있도록 등록
			vueDecoder.attachObserver(this);
			this.decodingList.push(vueDecoder);

			await vueDecoder.decodeVueFile();
		} catch (error) {
			console.error(error);
		}
	}

	/**
	 * VueEncoder에서 인코딩이 끝났다는 이벤트를 받을 리스너
	 * @param {VueEncoder} vueEncoder
	 */
	onCompleteEncode(vueEncoder) {
		// 인코딩 옵저버 제거
		vueEncoder.dettachObserver(this);
		this.encodingList = this.encodingList.filter(encoder => encoder !== vueEncoder);
	}

	/**
	 * VueDecoder에서 디코딩이 끝났다는 이벤트를 받을 리스너
	 * @param {VueDecoder} vueDecoder
	 */
	onCompleteDecode(vueDecoder) {
		// 디코딩 옵저버 제거
		vueDecoder.dettachObserver(this);
		this.decodingList = this.decodingList.filter(decoder => decoder !== vueDecoder);
	}
}

export default VueCommander;
