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
		// this.encoder = new VueEncoder(config);
		// this.decoder = new VueDecoder(config);

		this.replationFiles = [];
		// this.replationFiles = {
		// 	template: '',
		// 	script: '',
		// 	style: ''
		// };

		/** @type {VueEncoder[]}  */
		this.encodingList = [];
		/** @type {VueDecoder[]}  */
		this.decodingList = [];

		this.isReplaceFlag = OPER_STATUS.isWait;
		// 그냥 여기서 비동기 처리함(귀찮...) 정상적으로는 비동기 함수 만들고 호출자에서 promise.all 처리해야함..
		this.createVueEncoder();
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

		this.replationFiles = [
			vueEncoder.vueParser.tplFileInfo.filePath,
			vueEncoder.vueParser.scriptFileInfo.filePath,
			vueEncoder.vueParser.styleFileInfo.filePath
		].filter(str => str);

		// this.replationFiles.template = vueEncoder.vueParser.tplFileInfo.filePath;
		// this.replationFiles.script = vueEncoder.vueParser.scriptFileInfo.filePath;
		// this.replationFiles.style = vueEncoder.vueParser.styleFileInfo.filePath;
		console.log(
			'🚀 ~ file: VueCommander.js ~ line 56 ~ this.filePath',
			this.replationFiles
		);
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
		console.log('🚀 ~ file: VueCommander.js ~ line 47 ~ updateVueFile');
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
		console.log('🚀 ~ file: VueCommander.js ~ line 58 ~ updateOtherFile');
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
		console.log('🚀 ~ file: VueCommander.js ~ line 77 ~ onCompleteEncode');
		// 인코딩 옵저버 제거
		vueEncoder.dettachObserver(this);
		this.encodingList = this.encodingList.filter(encoder => encoder !== vueEncoder);
		console.log(
			'🚀 ~ file: VueCommander.js ~ line 87 ~ this.encodingList',
			this.encodingList.length
		);
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
