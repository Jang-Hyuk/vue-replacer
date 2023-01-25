import { inspect } from 'util';
import _ from 'lodash';
import BaseUtil from '../src/BaseUtil.js';
import FileReader from './FileReader.js';

/**
 * @typedef {object} tempStorageOption 프로시저 별 파싱 결과를 임시로 저장할 저장소
 * @property {number} level 프로시저를 파싱하는 단계
 * @property {string} procedureName 프로시저명
 * @property {string} dataType DB 데이터 타입
 * @property {string[]} comments 프로시저 설명
 * @property {string[]} nextComment 다음 프로시저 설명. 현 프로시저와 다음 프로시저 CALL 이 수행되기 전까지의 설명을 임시로 담고 있음
 * @property {procedureOption[]} params 프로시저 파라메터 절
 * @property {number} returnIndex (default 0)프로시저 결과 row index.
 * @property {procedureOption[]} returns 프로시저 결과 Rows
 */

/**
 * @typedef {object} procedureOption
 * @property {string} type param 절일 경우 (ENUM, number, string), row 절일 경우 (ENUM, string)
 * @property {string} key column or row key
 * @property {string} comment 설명
 * @property {string} dataType DB 데이터 타입
 */

class ProcedureToJsdoc {
	constructor(filePath = '') {
		this.filePath = filePath;
		this.procedureFile = '';
		this.fileReader = new FileReader(filePath);

		this.NEW_LINE = '\r\n';
		this.TAB = '\t';

		this.LEVEL = {
			WAIT: 0,
			PARAM: 1,
			PARAM_END: 2,
			ROW: 3,
			ROW_END: 4
		};

		const dataTypeOption = {
			string: [
				'CHAR',
				'VARCHAR',
				'TINYTEXT',
				'TEXT',
				'MEDIUMTEXT',
				'LONGTEXT',
				'JSON',
				'ENUM',
				// 바이너리
				'BINARY',
				'VARBINARY',
				'TINYBLOB',
				'BLOB',
				'MEDIUMBLOB',
				'LONGBLOB'
			],
			number: [
				'TINYINT',
				'SMALLINT',
				'MEDIUMINT',
				'INT',
				'BIGINT',
				'BIT',
				'FLOAT',
				'DOUBLE',
				'DECIMAL'
			],
			date: ['DATE', 'TIME', 'YEAR', 'DATETIME', 'TIMESTAMP'],
			buffer: ['BINARY', 'VARBINARY', 'TINYBLOB', 'BLOB', 'MEDIUMBLOB', 'LONGBLOB']
		};

		this.DATA_TYPE = {
			string: dataTypeOption.string.concat(dataTypeOption.buffer),
			number: dataTypeOption.number,
			date: dataTypeOption.date,
			enum: ['CHAR(1)', 'ENUM', 'TINYINT', 'INT'],
			all: []
		};
		this.DATA_TYPE.all = _.chain(this.DATA_TYPE).values().flatten().value();

		/** @type {tempStorageOption}  */
		this.tempStorage = {
			level: 0,
			procedureName: '',
			comments: [],
			nextComment: [],
			params: [],
			returnIndex: 0,
			returns: []
		};

		this.procedureChunkList = [];
	}

	async init() {
		const procedureFile = await this.fileReader.getFile(this.filePath);
		// console.log('🚀 ~ file: ProcedureToJsdoc.js:15 ~ procedureFile', procedureFile);
		this.procedureFile = procedureFile;

		this.NEW_LINE = procedureFile.indexOf(this.NEW_LINE) >= 0 ? this.NEW_LINE : '\n';

		if (!procedureFile.length) {
			return false;
		}
		// file 정보 읽어들임
		this.splitChunkProcedure(procedureFile);
	}

	/**
	 * 코멘트절 생성
	 * @param {string} text
	 * @returns {string}
	 */
	static checkComment(text = '') {
		const index = text.search(/[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9|]/);
		return index !== -1 ? text.slice(index).replaceAll('##', '#') : '';
	}

	// TODO 데이터 정제. 스페이스 제거
	static isComment(rowText = '') {
		return rowText.trim().indexOf('#') === 0;
	}

	isCommonComment(rowText = '') {
		return this.DATA_TYPE.all.every(type => !rowText.toUpperCase().includes(type));
	}

	isDataComment(rowText = '') {
		return this.DATA_TYPE.all.some(type => rowText.toUpperCase().includes(type));
	}

	initTempStorage() {
		this.tempStorage = {
			level: this.LEVEL.WAIT,
			procedureName: '',
			comments: [],
			nextComment: [],
			fileName: '',
			params: [],
			returnIndex: 0,
			returns: []
		};
	}

	splitChunkProcedure(file = '') {
		file.split(this.NEW_LINE).forEach(rowText => {
			const isValid = this.isValidRow(rowText);
			if (!isValid) {
				return false;
			}
			// ANCHOR rowText
			if (rowText.toUpperCase().includes('RETURN')) {
				return false;
			}
			const shouldComments = ProcedureToJsdoc.isComment(rowText);
			if (shouldComments) {
				this.createComments(rowText);
			}

			// 프로시저절이 존재하는지 확인
			const shouldProcedureName = this.checkProcedureCall(rowText);
			if (shouldProcedureName) {
				return this.createProcedureName(rowText);
			}

			// 프로시저 파람절이 끝나고 반환 절이 시작되는지 체크
			const shouldParams = this.checkParams(rowText);
			if (shouldParams) {
				return this.createParams(rowText);
			}

			const shouldReturns = this.checkReturns(rowText);
			if (shouldReturns) {
				return this.createReturns(rowText);
			}
		});

		if (this.tempStorage.procedureName) {
			// 파일끝에 왔으므로 남아있는 데이터 입력
			this.saveChunkProcedure();
		}

		// ANCHOR 최종 결과
		// console.log('🚀 ~ 최종 168 ~', inspect(this.procedureChunkList, false, 5));
		console.log('🚀 ~ 종종 .js:206 ~ this.procedureChunkList', this.procedureChunkList);
	}

	static createProcedureName(rowText = '') {
		// console.log('🚀 ~ file: ProcedureToJsdoc.js:105 ~ rowText', rowText);
		return rowText.toLowerCase().slice(4).split('(')[0].trim().replace(/\\`/, '');
	}

	createComments(rowText = '') {
		// 코멘트 입력 단계
		const comment = ProcedureToJsdoc.checkComment(rowText);
		switch (this.tempStorage.level) {
			case this.LEVEL.WAIT:
				comment
					? this.tempStorage.comments.push(comment)
					: _.set(this.tempStorage, 'comments', []);
				break;
			default:
				comment
					? this.tempStorage.nextComment.push(comment)
					: _.set(this.tempStorage, 'nextComment', []);
				break;
		}
	}

	/**
	 * ENUM 데이터 타입에 코멘트가 ':'를 통해 데이터 정의가 있다면 ENUM으로 함
	 * @param {string | string[]} dataType
	 * @param {string | string[]} comment
	 */
	static getEnumType(dataType, comment = '') {
		const curried = _.curry(BaseUtil.extractBetweenStrings);
		const dataTypes = Array.isArray(dataType) ? _.compact(dataType) : [dataType];
		const comments = Array.isArray(comment) ? _.compact(comment) : [comment];

		const tempCurry = curried(comments.join(' '));
		let enumStr = tempCurry('\\[', '\\]');
		enumStr = enumStr.length ? enumStr : tempCurry('\\(', '\\)');

		if (enumStr.length) {
			return _.chain(enumStr)
				.join()
				.replace(/'/g, '')
				.thru(str => BaseUtil.toDictionary(str, ',', ':'))
				.omitBy(_.isUndefined)
				.keys()
				.map(_.trim)
				.reject(str => /[^a-z|A-Z|0-9|\\-]/.test(str))
				.value();
		}
		if (dataTypes.some(type => type.includes('ENUM'))) {
			return BaseUtil.extractBetweenStrings(dataTypes.join(' '), '\\(', '\\)')
				.join('')
				.replace(/'/g, '')
				.split(',')
				.map(str => str.trim());
		}
		return [];
	}

	/**
	 * 데이터 타입
	 * @param {string | string[]} dataType
	 */
	getDataType(dataType) {
		const dataTypes = Array.isArray(dataType) ? _.compact(dataType) : [dataType];

		const realType = _.chain(dataTypes).compact().head().split('(').head().value();
		if (!realType) {
			return undefined;
		}
		if (this.DATA_TYPE.string.some(str => str.includes(realType))) {
			return 'string';
		}
		if (this.DATA_TYPE.number.some(str => str.includes(realType))) {
			return 'number';
		}
		if (this.DATA_TYPE.date.some(str => str.includes(realType))) {
			return 'string';
		}
	}

	/** @param {string} rowText 프로시저절이 존재하는지 확인 */
	checkProcedureCall(rowText = '') {
		return rowText.trim().replace(this.TAB, '').toUpperCase().indexOf('CALL') === 0;
	}

	/** @param {string} rowText 파람절을 생성해도 되는지 */
	checkParams(rowText = '') {
		const hasEndParam = rowText.trim().charAt(0) === ')';
		if (this.tempStorage.level === this.LEVEL.PARAM && hasEndParam) {
			this.tempStorage.level = this.LEVEL.PARAM_END;
			return false;
		}
		if (this.tempStorage.level === this.LEVEL.PARAM) {
			return true;
		}
	}

	/** @param {string} rowText 리턴절을 생성해도 되는지 */
	checkReturns(rowText = '') {
		// 데이터 리턴 index가 변경되었는지 판별
		if (rowText.trim().indexOf('[') === 0) {
			const returnNums = BaseUtil.extractBetweenStrings(rowText, '\\[', '\\]');
			this.tempStorage.returnIndex = parseInt(_.head(returnNums), 10);
			this.tempStorage.level = this.LEVEL.ROW;
			return false;
		}

		if (this.tempStorage.level === this.LEVEL.ROW) {
			// Row가 입력되어있는 와중에 의미없는 절이 시작될 경우 종료되었다고 가정
			const hasDataComment = this.isDataComment(rowText);
			if (!hasDataComment) {
				this.tempStorage.level = this.LEVEL.ROW_END;
				return false;
			}
			return true;
		}
	}

	/** @param {string} rowText row parser 가 동작해도 괜찮은지 여부 */
	isValidRow(rowText = '') {
		let isValid = true;

		// 시작 text가 프로시저 예약어일 경우 리셋
		const keywords = [
			'DELIMITER',
			'USE',
			'DROP',
			'CREATE',
			'SELECT',
			'INSERT',
			'UPDATE',
			'DELETE'
		];

		const upperRowText = rowText.toUpperCase().trim().split(' ')[0].trim();
		const hasKeyword = keywords.some(keyword => keyword.indexOf(upperRowText) === 0);

		if (this.tempStorage.level > this.LEVEL.WAIT) {
			// if (!upperRowText) {
			// 	this.saveChunkProcedure();
			// 	return false;
			// }
			if (upperRowText && hasKeyword) {
				console.log('🚀 ~ file: ProcedureToJsdoc.js:360 ~ hasKeyword', hasKeyword);
				this.saveChunkProcedure();
				return false;
			}
		}

		switch (this.tempStorage.level) {
			case this.LEVEL.PARAM_END:
				isValid = this.validRowParamEnd(rowText);
				break;
			default:
				break;
		}
		return isValid;
	}

	/**
	 * 파람절이 유효하게 끝났는지 체크
	 * @param {string} rowText
	 */
	validRowParamEnd(rowText) {
		// 파람절이 끝나고 Return이 등장하면 Row절이 시작됨을 알림
		if (rowText.toUpperCase().includes('RETURN')) {
			this.tempStorage.level = this.LEVEL.ROW;
			return false;
		}
		return true;
	}

	/** @param {string} [rowText=''] 프로시저명 생성 */
	createProcedureName(rowText = '') {
		// 프로시저절이 나오면 완전한 한개의 청크가 완료되었다고 판단. WAIT는 처음에만 존재
		if (this.tempStorage.level !== this.LEVEL.WAIT) {
			this.saveChunkProcedure();
		}

		this.tempStorage.level = this.LEVEL.PARAM;
		this.tempStorage.procedureName = ProcedureToJsdoc.createProcedureName(rowText);
		this.tempStorage.params = [];
		this.tempStorage.returns = [];
	}

	/** @param {string} [rowText=''] 파라메터 절 생성 */
	createParams(rowText = '') {
		const splitDelimiter = rowText.indexOf('--') > 0 ? '--' : '#';
		/** @type {string[]}  */
		const [dataChunk, ...commentChunk] = rowText
			.replace(',', '')
			.trim()
			.replaceAll(this.TAB, ' ')
			.split(splitDelimiter);

		const [keyName, ...dataType] = dataChunk.split(' ');
		const enumTypes = ProcedureToJsdoc.getEnumType(dataType, commentChunk);
		this.tempStorage.params.push({
			type: enumTypes.length ? enumTypes : this.getDataType(dataType, commentChunk),
			key: keyName,
			dataType: _.compact(dataType).join(' '),
			comment: commentChunk.join(' ').trim()
		});
		// ANCHOR Param
		// console.table(this.tempStorage.params);
	}

	/** @param {string} [rowText = ''] 리턴 절 생성 */
	createReturns(rowText = '') {
		const index = this.tempStorage.returnIndex;
		if (!Array.isArray(this.tempStorage.returns[index])) {
			this.tempStorage.returns[index] = [];
		}

		const splitDelimiter = rowText.indexOf('--') > 0 ? '--' : '#';
		/** @type {string[]}  */
		const [dataChunk, ...commentChunk] = rowText
			.trim()
			.replaceAll(this.TAB, ' ')
			.trim()
			.split(splitDelimiter);

		const [keyName, ...dataType] = dataChunk.split(' ');
		const type = this.getDataType(dataType, commentChunk);
		if (!keyName || !type) {
			return false;
		}

		const enumTypes = ProcedureToJsdoc.getEnumType(dataType, commentChunk);
		this.tempStorage.returns[index].push({
			type: enumTypes.length ? enumTypes : 'string',
			key: keyName,
			dataType: _.compact(dataType).join(' '),
			comment: commentChunk.join(' ').trim()
		});

		// ANCHOR Returns
		// this.tempStorage.returns.forEach(v => console.table(v));
	}

	/** 프로시저 1개가 끝날때마다 결과를 저장 */
	saveChunkProcedure() {
		this.procedureChunkList.push({
			procedureName: this.tempStorage.procedureName,
			comments: this.tempStorage.comments,
			fileName: '',
			params: this.tempStorage.params,
			returns: this.tempStorage.returns
		});

		this.tempStorage = {
			level: this.LEVEL.WAIT,
			procedureName: '',
			comments: this.tempStorage.nextComment,
			nextComment: [],
			fileName: '',
			params: [],
			returnIndex: 0,
			returns: []
		};
	}
}

export default ProcedureToJsdoc;
