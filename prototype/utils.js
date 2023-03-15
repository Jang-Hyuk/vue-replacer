/**
 * 2개의 Semantic Version 비교. sorting 활용 가능
 * @param {number|string} leftVer (좌항) 비교 할려는 버젼
 * @param {number|string} rightVer (우항 ) 비교 당하는 버젼
 * @param {boolean} [shouldMinLength = false] 버젼 비교 자릿수 Math.min vs Math.max 여부
 * @returns {number} LessThan: -1, EqualTo: 0, GreaterThan: 1
 * @example
 * compare -> compareVersion('1.5', '2.1'): -1
 * compare -> compareVersion('1.5', '1.5.7'): -1
 * compare -> compareVersion('1.5', '1.5.7', true): 0
 * sorting -> ['1.1', '2', '1.0'].sort(compareVersion): ['1.0', '1.1', '2']
 */
function compareVersion(leftVer, rightVer, shouldMinLength) {
	const VersionIs = {
		LessThan: -1,
		EqualTo: 0,
		GreaterThan: 1
	};
	const cp = String(leftVer).split('.');
	const op = String(rightVer).split('.');
	const len = shouldMinLength
		? Math.min(cp.length, op.length)
		: Math.max(cp.length, op.length);

	for (let depth = 0; depth < len; depth++) {
		const cn = Number(cp[depth]);
		const on = Number(op[depth]);
		if (cn > on) return VersionIs.GreaterThan;
		if (on > cn) return VersionIs.LessThan;
		if (!isNaN(cn) && isNaN(on)) return VersionIs.GreaterThan;
		if (isNaN(cn) && !isNaN(on)) return VersionIs.LessThan;
	}

	return VersionIs.EqualTo;
}

/** @namespace cu */
const cu = {};

/**
 * 기본 함수. 순수함수를 지향하며 다른 cu* 유틸에서도 사용될만한 함수 모음
 * @memberof cu
 * @namespace base
 */
cu.base = {
	/**
	 * 2개의 Semantic Version 비교. sorting 활용 가능
	 * @param {number|string} leftVer (좌항) 비교 할려는 버젼
	 * @param {number|string} rightVer (우항 ) 비교 당하는 버젼
	 * @param {boolean} [shouldMinLength = false] 버젼 비교 자릿수 Math.min vs Math.max 여부
	 * @returns {number} LessThan: -1, EqualTo: 0, GreaterThan: 1
	 * @example
	 * compare -> compareVersion('1.5', '2.1'): -1
	 * compare -> compareVersion('1.5', '1.5.7'): -1
	 * compare -> compareVersion('1.5', '1.5.7', true): 0
	 * sorting -> ['1.1', '2', '1.0'].sort(compareVersion): ['1.0', '1.1', '2']
	 */
	compareVersion(leftVer, rightVer, shouldMinLength) {
		const VersionIs = {
			LessThan: -1,
			EqualTo: 0,
			GreaterThan: 1
		};
		const cp = String(leftVer).split('.');
		const op = String(rightVer).split('.');
		const len = shouldMinLength
			? Math.min(cp.length, op.length)
			: Math.max(cp.length, op.length);

		for (let depth = 0; depth < len; depth++) {
			const cn = Number(cp[depth]);
			const on = Number(op[depth]);
			if (cn > on) return VersionIs.GreaterThan;
			if (on > cn) return VersionIs.LessThan;
			if (!isNaN(cn) && isNaN(on)) return VersionIs.GreaterThan;
			if (isNaN(cn) && !isNaN(on)) return VersionIs.LessThan;
		}

		return VersionIs.EqualTo;
	},

	/**
	 * 컬렉션의 데이터를 가져오되 defaultType과 형태가 다를경우 defaultValue로 초기화
	 * lodash _.get에 defaultType이 추가된 형태. 기본 문법은 lodash 참고
	 * @param {object} collection
	 * @param {Array | string} path
	 * @param {any} [defaultValue]
	 * @param {'array' | 'string' | 'number' | 'boolean' | 'object'} [defaultType = any]
	 * @example
	 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
	 * 	get(object, ['a', '0', 'b', 'c']) => 3
	 * 	get(object, 'a.b.c', 'default') => 'default'
	 * var array = [[1, 2, 3], 'a', null];
	 * 	get(array, 0) => [1, 2, 3]
	 * 	get(array, [0, 1]) => 2
	 * 	get(array, 2) => null
	 * 	get(array, 2, []) => null
	 * 	get(array, 2, [], 'array') => []
	 */
	get(collection, path, defaultValue, defaultType) {
		let results = _.get(collection, path, defaultValue);
		let tempValue;

		defaultType = defaultType || 'any';

		switch (defaultType) {
			case 'array':
				results = Array.isArray(results) ? results : defaultValue;
				break;
			case 'boolean':
			case 'string':
			case 'object':
				// eslint-disable-next-line valid-typeof
				results = typeof results === defaultType ? results : defaultValue;
				break;
			case 'number':
				tempValue = cu.base.parseNumber(results);
				results = typeof tempValue === 'number' ? tempValue : defaultValue;
				break;
			default:
				break;
		}

		return results;
	},

	/**
	 * JSON.parse 성공 유무 반환
	 * @param {any} item
	 * @example
	 * isJsonParse(123): true
	 * isJsonParse('[1,2]'): true
	 */
	isJsonParse(item) {
		try {
			JSON.parse(item);
			return true;
		} catch (e) {
			return false;
		}
	},

	/**
	 * JSON.parse 결과 값이 object 타입인지 체크
	 * @param {any} item
	 * @example
	 * isJsonParse(123): false
	 * isJsonParse('[1,2]'): true
	 * isJsonParse('{"a": 1}'): true
	 */
	isJsonParseObject(item) {
		let jsonItem;

		try {
			/** @type {string}  */
			const strItem = typeof item !== 'string' ? item.toString() : item;
			jsonItem = JSON.parse(strItem);
		} catch (e) {
			return false;
		}

		return typeof jsonItem === 'object' && jsonItem !== null;
	},

	/**
	 * 현재 값이 숫자형으로 변환 가능한지 여부
	 * @param {*} n 체크할려는 값
	 * @example
	 * isNumberic('123'): true
	 * isNumberic('1.23'): true
	 * isNumberic('1.2.3'): false
	 */
	isNumberic(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	},

	/**
	 * 숫자형으로 바꿀수 있다면 바꿈. 안된다면 null 반환
	 * @param {any} n
	 * @param {boolean} [isInt = true] parseInt or parseFloat
	 * @param {number} [decimal = 10] 10진수 기본
	 */
	parseNumber(n, isInt, decimal) {
		isInt = typeof isInt === 'boolean' ? isInt : true;
		decimal = decimal || 10;
		if (cu.base.isNumberic(n)) {
			return isInt ? parseInt(n, decimal) : parseFloat(n);
		}
		return null;
	},

	/**
	 * type에 따라서 default 값으로 반환. 초기값을 넣고자 할 경우 사용.
	 * @param {*} value
	 * @example
	 * data = {num: 1, str: 'hi', arr: [1,2,3]} 설정되어있을 경우
	 * data = _.mapValues(data, reset);
	 */
	reset(value) {
		switch (typeof value) {
			case 'string':
				return '';
			case 'boolean':
				return false;
			case 'number':
				return 0;
			// Symbol 자료형 무시
			case 'function':
				return function () {};
			case 'undefined':
				return undefined;
			default:
				break;
		}

		// 1차 필터링이 안된 타입
		if (value === null) {
			return null;
		}
		if (Array.isArray(value)) {
			return [];
		}
		// Map, Set은 사용하지 않음. 활성화 하고자 할 경우 value instanceof Map 이런식으로 상단에서 처리
		if (typeof value === 'object') {
			return {};
		}
		// 그 외의 모든 조건은 undefined로 반환
		return undefined;
	},

	/**
	 * type에 따라서 default 값으로 반환. 초기값을 넣고자 할 경우 사용.
	 * @param {Array | object} target
	 * @example
	 * target: {str: '123', num: 11, info: {a: 1}, list: [1, 'hi']}
	 * resetStorage(target): {str: '', num: 0, info: {a: 0}, list: []}
	 * resetStorage(target, true): {str: '', num: 0, info: {a: 0}, list: [0, '']}
	 */
	resetStorage(target, shouldDeepReset) {
		if (_.isArray(target)) {
			if (shouldDeepReset) {
				return target.map(function (value) {
					return cu.base.resetStorage(value, shouldDeepReset);
				});
			}
			return [];
		}
		if (_.isObject(target)) {
			return _.mapValues(target, function (value) {
				return cu.base.resetStorage(value, shouldDeepReset);
			});
		}
		return cu.base.reset(target);
	},

	/**
	 * (포맷 변경) pairs -> Dictionary
	 * @see {@link cu.base.toPairs} opposite
	 * @param {string} pairs (string) ex) 'NO=21540000|ID=wkd123'
	 * @param {string} [outerSep="|"] 프로퍼티 구분자
	 * @param {string} [innerSeq="="] key value 구분자
	 * @returns Dictionary 자료형 ex) \{NO:21540000, ID: wkd123\}
	 * @example
	 * toDictionary('NO=21540000|ID=wkd123'): {NO:'21540000', ID: 'wkd123'}
	 */
	toDictionary(pairs, outerSep, innerSeq) {
		pairs = pairs || '';
		outerSep = outerSep || '|';
		innerSeq = innerSeq || '=';
		return _(pairs)
			.split(outerSep)
			.compact()
			.invokeMap('split', innerSeq)
			.fromPairs()
			.mapKeys(function (value, key) {
				return _.trim(key);
			})
			.value();
	},

	/**
	 * 숫자로 바꾸어줌. Array의 경우에는 wrapping 영역만 수행.
	 * 프로시저 결과가 전부 string이기때문에 주로 사용. predicate가 없다면 숫자로 변환 가능한 데이터만 변환처리
	 * @param {string|number|object|object[]} target
	 * @param {string[]} [predicate=[]] target이 object|Array<object> 일 경우 특정 property만 처리하고자 할 경우
	 * @example
	 * toNumber('123.456') -> 123.456
	 * toNumber(['1.4', '1.5', 'abc']) -> [1.4, 1.5, 'abc']
	 * toNumber({a: '1', b: '2', c: '2023-02-01'}) -> {a: 1, b: 2, c: '2023-02-01'}
	 * toNumber({a: '1', b: '2', c: '2023-02-01'}, ['b']) -> {a: '1', b: 2, c: '2023-02-01'}
	 * toNumber([{a: '1', b: '2'}, {a: '3', b: '4'}], ['b']) -> [{a: '1', b: 2}, {a: '3', b: 4}]
	 */
	toNumber(target, predicate) {
		if (typeof target === 'string') {
			if (predicate) {
				return parseFloat(target);
			}
			return cu.base.isNumberic(target) ? parseFloat(target) : target;
		}
		if (Array.isArray(target)) {
			return target.map(function (v) {
				return cu.base.toNumber(v, predicate);
			});
		}

		if (typeof target === 'object') {
			return _.mapValues(target, function (v, k) {
				if (Array.isArray(v)) {
					return v;
				}
				if (predicate) {
					return _.includes(predicate, k) ? cu.base.toNumber(v, predicate) : v;
				}
				return cu.base.toNumber(v);
			});
		}
		return target;
	},

	/**
	 * 천단위 숫자 추가 후 반환(콤마 구분)
	 * @param {string | number} value
	 * @param {'0' | '1'} [nanFlag = '0'] NaN 일 경우 반환 처리 여부
	 * @example
	 * nanFlag '0' -> 'NaN'
	 * nanFlag '1' -> ''
	 */
	toNumberFormat(value, nanFlag) {
		value = typeof value === 'string' ? parseInt(value, 10) : value;
		nanFlag = nanFlag || '0';

		if (nanFlag === '1' && isNaN(value)) {
			return '';
		}

		return new Intl.NumberFormat().format(value);
	},

	/**
	 * (포맷 변경) Dictionary -> pairs
	 * @see {@link cu.base.toDictionary} opposite
	 * @param {object} dict (object) {NO: 21540000, ID: 'wkd123'}
	 * @param {string} [outerSep="|"] 프로퍼티 구분자
	 * @param {string} [innerSeq="="] key value 구분자
	 * @returns {string} value 값은 항상 string 형식이라는  ex) NO=21540000|ID=wkd123
	 * @example
	 * toPairs({NO: 21540000, ID: 'wkd123'}): 'NO=21540000|ID=wkd123'
	 */
	toPairs(dict, outerSep, innerSeq) {
		dict = dict || {};
		outerSep = outerSep || '|';
		innerSeq = innerSeq || '=';
		return _(dict).toPairs().invokeMap('join', innerSeq).join(outerSep);
	}
};
/**
 * dayjs 기반 Date 제어 객체.
 * @memberof cu
 * @namespace date
 * @example
 * dayjs().format('a') -> '오전 or 오후'
 * dayjs().format('ddd') -> '월화수목금토일' 중 하나
 */
cu.date = {
	/**
	 * (좌항 - 우항) 두 날짜간의 시간 간격 반환
	 * @param {number|string|Date|dayjs.Dayjs} activeDate (좌항) 비교할려는 날짜
	 * @param {number|string|Date|dayjs.Dayjs} [passiveDate = new Date()] (우항) 비교당하는 날짜
	 * @param {dayjs.UnitTypeLong} [unit = 'day'] 비교 날짜 단위
	 * @example
	 * diff('2022-06-09'): (number)
	 * diff('2022-06-09', '2022-06-08'): 1
	 * diff('2022-06-09', '2022-06-08', 'second'): 86400
	 * diff('2022-06-09 12:00:00', '2022-06-08', 'hours'): 36
	 * diff('2022-06-09', '2022-06-08 12:00:00', 'hours'): 12
	 */
	diff(activeDate, passiveDate, unit) {
		unit = unit || 'day';
		const activeDayjs = cu.date.toDayjs(activeDate);
		const passiveDayjs = cu.date.toDayjs(passiveDate);

		return dayjs(activeDayjs).diff(passiveDayjs, unit);
	},

	/**
	 * (좌항 - 우항) 두 날짜간의 시간 간격에 해당하는 값을 추출하여 반환
	 * @param {number|string|Date|dayjs.Dayjs} activeDate (좌항) 비교할려는 날짜
	 * @param {number|string|Date|dayjs.Dayjs} [passiveDate = new Date()] (우항) 비교당하는 날짜
	 * @example
	 * diffDay('2022-06-09 12:00:00', '2022-06-08'): {diffDay: 1, diffHour: 12, diffMin: 0, diffSec: 0}
	 */
	diffDate(activeDate, passiveDate) {
		const activeDayjs = cu.date.toDayjs(activeDate);
		const passiveDayjs = cu.date.toDayjs(passiveDate);

		let remainMs = cu.date.diff(activeDayjs, passiveDayjs, 'millisecond');

		const diffDay = Math.floor(remainMs / (1000 * 60 * 60 * 24));
		remainMs -= diffDay * (1000 * 60 * 60 * 24);
		const diffHour = Math.floor(remainMs / (1000 * 60 * 60));
		remainMs -= diffHour * (1000 * 60 * 60);
		const diffMin = Math.floor(remainMs / (1000 * 60));
		remainMs -= diffMin * (1000 * 60);
		const diffSec = Math.floor(remainMs / 1000);

		return {
			diffDay,
			diffHour,
			diffMin,
			diffSec
		};
	},

	/**
	 * 데이터 반환형태를 가져옴
	 * @param {dayjs.UnitTypeLong} [unit = 'day'] 보여주고자 하는 범위
	 * @param {dayjs.UnitTypeLong} [sliceUnit] 앞에서부터 절삭 범위
	 * @example
	 * getFormat(): 'YYYY-MM-DD'
	 * getFormat('second'): 'YYYY-MM-DD HH:mm:ss'
	 * getFormat('second', 'month'): 'HH:mm:ss'
	 */
	getFormat(unit, sliceUnit) {
		switch (unit) {
			case 'year':
				return 'YYYY';
			case 'month':
				switch (sliceUnit) {
					case 'year':
						return 'MM';
					default:
						return 'YYYY-MM';
				}
			case 'date':
			case 'day':
				switch (sliceUnit) {
					case 'year':
						return 'MM-DD';
					case 'month':
						return 'DD';
					default:
						return 'YYYY-MM-DD';
				}
			case 'hour':
				switch (sliceUnit) {
					case 'year':
						return 'MM-DD HH';
					case 'month':
						return 'DD HH';
					case 'date':
					case 'day':
						return 'HH';
					default:
						return 'YYYY-MM-DD HH';
				}
			case 'minute':
				switch (sliceUnit) {
					case 'year':
						return 'MM-DD HH:mm';
					case 'month':
						return 'DD HH:mm';
					case 'date':
					case 'day':
						return 'HH:mm';
					case 'hour':
						return 'mm';
					default:
						return 'YYYY-MM-DD HH:mm';
				}
			case 'second':
				switch (sliceUnit) {
					case 'year':
						return 'MM-DD HH:mm:ss';
					case 'month':
						return 'DD HH:mm:ss';
					case 'date':
					case 'day':
						return 'HH:mm:ss';
					case 'hour':
						return 'mm:ss';
					case 'minute':
						return 'ss';
					default:
						return 'YYYY-MM-DD HH:mm:ss';
				}
			default:
				return 'YYYY-MM-DD';
		}
	},

	/**
	 * (좌항 > 우항) 이미 대상 날짜를 지났는가?
	 * @param {number|string|Date|dayjs.Dayjs} activeDate (좌항) 비교할려는 날짜
	 * @param {number|string|Date|dayjs.Dayjs} [passiveDate = new Date()] (우항) 비교당하는 날짜
	 * @param {dayjs.UnitTypeLong} [unit = 'day'] 비교 날짜 단위
	 * @example
	 * isAfterDate('20220501'): false
	 * isAfterDate('20220801', '20220713'): true
	 * isAfterDate('20220801', '20220713', 'year'): false
	 * isAfterDate('20220801', '20220713', 'month'): true
	 * isAfterDate('20220801', '20220713', 'day'): true
	 */
	isAfterDate(activeDate, passiveDate, unit) {
		const activeDayjs = cu.date.toDayjs(activeDate);
		const passiveDayjs = cu.date.toDayjs(passiveDate);
		unit = unit || 'day';
		return activeDayjs.isAfter(passiveDayjs, unit);
	},

	/**
	 * (좌항 < 우항) 아직 대상 날짜보다 이전인가?
	 * @param {number|string|Date|dayjs.Dayjs} activeDate (좌항) 비교할려는 날짜
	 * @param {number|string|Date|dayjs.Dayjs} [passiveDate = new Date()] (우항) 비교당하는 날짜
	 * @param {dayjs.UnitTypeLong} [unit = 'day'] 비교 날짜 단위
	 * @example
	 * isBeforeDate('20220517'): true
	 * isBeforeDate('20220617', '20220713'): true
	 * isBeforeDate('20220617', '20220713', 'year'): false
	 * isBeforeDate('20220617', '20220713', 'month'): true
	 * isBeforeDate('20220617', '20220713', 'day'): true
	 */
	isBeforeDate(activeDate, passiveDate, unit) {
		unit = unit || 'day';
		const activeDayjs = cu.date.toDayjs(activeDate);
		const passiveDayjs = cu.date.toDayjs(passiveDate);
		return activeDayjs.isBefore(passiveDayjs, unit);
	},

	/**
	 * dayjs 객체로 변환
	 * @param {number|string|Date|dayjs.Dayjs} [dateValue]
	 * @returns {dayjs.Dayjs}
	 * @example
	 * (unix number) toDayjs(1655426662);
	 * (timestamp number) toDayjs(1655426662075);
	 * toDayjs('20220616235959');
	 * toDayjs('2022-06-09 16:47:23');
	 * toDayjs('2022.06.09 16:47:23');
	 * toDayjs(new Date())
	 * toDayjs(dayjs())
	 */
	toDayjs(dateValue) {
		let dayjsResult = dateValue || dayjs();

		if (typeof dayjsResult === 'number') {
			const numberLength = dayjsResult.toString().length;
			dayjsResult = numberLength === 10 ? dayjs.unix(dayjsResult) : dayjs(dayjsResult);
		} else if (typeof dayjsResult === 'string') {
			dayjsResult = dayjs(dayjsResult.replace(/\./g, '-'));
		} else if (dayjs.isDayjs(dayjsResult) === false) {
			dayjsResult = dayjs(dayjsResult);
		}

		if (dayjsResult.isValid()) {
			return dayjsResult;
		}

		throw new Error(`not valid dayjs:${dateValue}`);
	},
	/**
	 * string 형태로 변환하여 반환. unit에 따라 변환
	 * @see {@link cu.date.getFormat}
	 * @param {number|string|Date|dayjs.Dayjs} dateValue 날짜
	 * @param {dayjs.UnitTypeLong} [unit = 'day'] 보여주고자 하는 범위
	 * @param {dayjs.UnitTypeLong} [sliceUnit] 앞에서부터 절삭 범위
	 * @example
	 * 현재 시각: '2022-09-27 15:33:19' 일 경우
	 * toFormat('2022-09-27'): '2022-09-27' unit 기본값 day
	 * toFormat(new Date(), 'second'): '2022-09-27 15:33:19'
	 * toFormat(dayjs().valueOf(), 'second'): '2022-09-27 15:33:19' timestamp 처리. unix 처리 가능
	 * toFormat(dayjs(), 'second', 'month'): '15:33:19' second 까지 보여주나 앞에서부터 month까지 절삭
	 */
	toFormat(dateValue, unit, sliceUnit) {
		const strFormat = cu.date.getFormat(unit, sliceUnit);
		const date = cu.date.toDayjs(dateValue);

		return date.format(strFormat);
	},
	/**
	 * 날짜를 초기화할경우 검색 범위 반환
	 * @param {number|string|Date|dayjs.Dayjs|number[]|string[]|Date[]|dayjs.Dayjs[]} dateValue
	 * @param {'day' | 'month' | 'year' | 'range'} [resetOf = 'day'] 해당 단위이하 초기화. range는 day로 계산
	 * @param {dayjs.UnitTypeLong} [formatUnit = 'day'] 반환하고자 하는 범위 단위
	 * @param {boolean} [hasEndDate = false] 마지막 날짜를 포함할지 여부
	 * @returns {string[]} [시작날짜, 종료날짜]
	 * @example
	 * 현재 시각: '2022-09-27 15:33:19' 일 경우
	 * toRange(): ['2022-09-27', '2022-09-27']
	 * toRange(new Date(), 'day', 'second'): ['2022-09-27 00:00:00', '2022-09-27 23:59:59']
	 * toRange(new Date(), 'hour', 'minute'): ['2022-09-27 15:00', '2022-09-27 15:59']
	 * toRange(new Date(), 'hour', 'minute', true): ['2022-09-27 15:00', '2022-09-27 15:59']
	 * toRange(new Date(), 'day', 'day', true): ['2022-09-27', '2022-09-28']
	 * toRange(new Date(), 'hour', 'second', true): ['2022-09-27 15:00:00', '2022-09-27 16:00:00']
	 */
	toRange(dateValue, resetOf, formatUnit, hasEndDate) {
		const allowUnits = [
			'millisecond',
			'second',
			'minute',
			'hour',
			'day',
			'month',
			'year',
			'date'
		];
		resetOf = _.includes(allowUnits, resetOf) ? resetOf : 'day';
		formatUnit = _.includes(allowUnits, formatUnit) ? formatUnit : 'day';
		// 시작 날짜와 종료 날짜를 추출. 배열일 경우 첫인자와 끝인자로 정의
		const startDateValue = Array.isArray(dateValue) ? _.head(dateValue) : dateValue;
		const endDateValue = Array.isArray(dateValue) ? _.last(dateValue) : dateValue;

		// 초기화 할려는 날짜 단위에 따라 각 날짜 초기화
		const startDayjs = cu.date.toDayjs(startDateValue).startOf(resetOf);
		const endDayjs = hasEndDate
			? cu.date.toDayjs(endDateValue).startOf(resetOf).add(1, resetOf)
			: cu.date.toDayjs(endDateValue).endOf(resetOf);

		return [
			cu.date.toFormat(startDayjs, formatUnit),
			cu.date.toFormat(endDayjs, formatUnit)
		];
	},
	/**
	 * 한국 timezone으로 변경하여 반환 dayjs.tz overriding 느낌.
	 * @param {number|string|Date|dayjs.Dayjs} [dateValue]
	 * @param {boolean} [isTimestamp = false] timestamp 반환 여부
	 */
	tz(dateValue, isTimestamp) {
		const valueDayjs = cu.date.toDayjs(dateValue).add(9, 'hour');

		return isTimestamp ? valueDayjs.valueOf() : valueDayjs;
	}
};

/**
 * @typedef {object} domEventConfig 실행할 돔 이벤트 설정 정보
 * @property {string} el Element Selector
 * @property {'click'} [event='click'] dispatchEvent type (MouseEvent)
 * @property {number} [delay] (ms) 이벤트 실행까지 지연시간
 * @property {EventInit} [options] bubbles, cancelable, composed
 * @tutorial
 * options.bubbles (Optional) 이벤트의 버블링 여부를 나타내는 불리언 값입니다. 기본 값은 false입니다.
 * options.cancelable (Optional) 이벤트를 취소할 수 있는지 나타내는 불리언 값입니다. 기본 값은 false입니다.
 * options.composed (Optional) 이벤트가 섀도 루트(shadow root) 바깥의 이벤트 수신기로도 전달될지 나타내는 불리언 값입니다. Event.composed (en-US)에서 자세한 정보를 확인하세요. 기본 값은 false입니다.
 */

/**
 * 스토리지(로컬, 세션) 관리 함수
 * @memberof cu
 * @namespace storage
 * @requires cu.base, cu.date, cu.dom
 * */
cu.storage = {
	/**
	 * storage 파람값이 flag(string) 일 경우 대응하는 스토리지로 변환하여 반환
	 * @param {'l' | 's' | Storage} storage localStorage or sessionStorage. 'l': localStorage, 's': sessionStorage
	 * @returns {Storage}
	 * @example
	 * get('l'): localStorage
	 * get('s'): sessionStorage
	 * get(localStorage): localStorage
	 */
	_get(storage) {
		if (typeof storage === 'string') {
			storage = storage === 'l' ? localStorage : sessionStorage;
		}

		return storage;
	},

	/**
	 * 스토리지 키에 해당하는 값을 dayjs로 변환 ('.' 연산자를 통해서 deep value 추출 지원)
	 * @param {'l' | 's' | Storage} storage localStorage or sessionStorage. 'l': localStorage, 's': sessionStorage
	 * @param {string} key 'key' or 'key.subKey'
	 * @param {boolean} [isNumeric = false] 해당 문자열 값이 timestamp or unix일 경우 true로 입력
	 * @example
	 * sessionStorage => 'layer_date': '{"pause":"20220617000000","expire":"20901231"}'
	 * getDate('s', 'layer_date.pause'): dayjs.Dayjs
	 * getDate('s', 'layer_date.expire'): dayjs.Dayjs
	 */
	getDate(storage, key, isNumeric) {
		storage = cu.storage._get(storage);
		key = key || '';
		isNumeric = typeof isNumeric === 'boolean' ? isNumeric : false;
		let storageValue = cu.storage.getValue(storage, key);

		if (isNumeric) {
			storageValue = cu.base.isNumberic(storageValue) ? parseInt(storageValue, 10) : '';
		}

		return cu.date.toDayjs(storageValue);
	},

	/**
	 * 스토리지에 설정된 값 로드 ('.' 연산자를 통해서 deep value 추출 지원)
	 * @param {'l' | 's' | Storage} storage 'l': localStorage, 's': sessionStorage
	 * @param {string} key 'key' or 'key.subKey'
	 * @param {any} defaultValue 값이 없을 경우 설정할 초기 값. 'key' 일 경우 null, 'key.subKey'일 경우 undefined를 defaultValue로 대체
	 * @returns {string|number|object|null} 키가 없을 경우 null
	 * @example
	 * sessionStorage => 'user': '{"age":25,"name":"tester"}'
	 * getValue('s', 'user'): {age: 25, name:'tester'}
	 * getValue('s', 'user.age'): 25
	 * getValue('s', 'user.hi', '123'): '123'
	 */
	getValue(storage, key, defaultValue) {
		storage = cu.storage._get(storage);
		key = key || '';
		const keys = key.split('.');
		let storageValue = storage.getItem(_.head(keys));
		storageValue = cu.base.isJsonParse(storageValue)
			? JSON.parse(storageValue)
			: storageValue;
		// key => 'key.subKey'일 경우 undefined를 defaultValue로 대체
		if (keys.length > 1) {
			return _.get(storageValue, _.tail(keys).join('.'), defaultValue);
		}
		// key => 'key' 일 경우 null을 defaultValue로 대체
		return storageValue === null ? defaultValue : storageValue;
	},

	/**
	 * 초기화 중 수행할 명령
	 * 1. 'domEvents' 저장소가 존재하는지 여부에 따라 해당 이벤트가 실행되고 해당 스토리지를 삭제
	 */
	init() {
		const self = this; // 1번 수행

		const domEventStorageName = 'domEvents';
		[localStorage, sessionStorage].forEach(function (storage) {
			/** @type {domEventConfig | domEventConfig[]}  */
			const events = self.getValue(storage, domEventStorageName);

			if (!events || typeof events !== 'object') {
				return false;
			}

			cu.dom.runEvents(events);
			storage.removeItem(domEventStorageName);
		});
	},

	/**
	 * 스토리지 remove & deep Remove
	 * @param {'l' | 's' | Storage} storage 'l': localStorage, 's': sessionStorage
	 * @param {string} key storage key
	 * @param {string | string[] | number | number[]} propertyNameInValue storage value안의 property name
	 * @example
	 * localStorage.joinInfo -> {"x":{"ex":1},"y":{"ex":2}}
	 * removeValue('l', 'joinInfo') -> joinInfo :: deleted
	 * removeValue('l', 'joinInfo', 'x') -> joinInfo :: {"y": {"ex":2}}
	 * removeValue('l', 'joinInfo', ['x', 'y']) -> joinInfo :: removed
	 */
	removeValue(storage, key, propertyNameInValue) {
		storage = cu.storage._get(storage);
		let value = cu.storage.getValue(storage, key);

		// 스토리지 또는 해당 데이터가 존재하지 않거나 deepKey가 존재하지 않을경우 저장소 삭제
		if (_.isEmpty(value) || !propertyNameInValue) {
			return storage.removeItem(key);
		}

		value = _.isArray(propertyNameInValue)
			? _.omit(value, propertyNameInValue)
			: _.omit(value, [propertyNameInValue]);

		if (_.isEmpty(value)) {
			return storage.removeItem(key);
		}

		cu.storage.setValue(storage, key, value);
	},

	/**
	 * 스토리지에 값 설정. 저장값의 형태가 object 라면 변환처리하여 저장
	 * @param {'l' | 's' | Storage} storage 'l': localStorage, 's': sessionStorage
	 * @param {string} key storage key
	 * @param {any} value storage value
	 * @example
	 * setValue('s', 'user', 25): '25'
	 * setValue('s', 'user', {age: 25, name: 'tester'}): '{"age":25,"name":"tester"}'
	 */
	setValue(storage, key, value) {
		storage = cu.storage._get(storage);
		value = typeof value === 'object' ? JSON.stringify(value) : value;
		storage.setItem(key, value);
	},

	/**
	 * 스토리지에 값 설정. setValue와 유사하나 동일 키 값으로 다중 id를 관리할 때 사용
	 * @param {'l' | 's' | Storage} storage 'l': localStorage, 's': sessionStorage
	 * @param {string} key storage key
	 * @param {string | number} valueId storage value id
	 * @param {any} value storage value
	 * @example
	 * setDeepValue('s', 'user', 12345, 25) -> 'user' :: {"12345": 25}
	 * setDeepValue('s', 'user', 12345, {age: 25}) -> 'user' :: {"12345": {"age": 25}}
	 */
	setDeepValue(storage, key, valueId, value) {
		storage = cu.storage._get(storage);
		let storageValue = cu.storage.getValue(storage, key);
		// 값이 존재하지않거나 object 형태가 아니라면 초기화 시켜버림
		storageValue =
			_.isEmpty(storageValue) || !_.isObject(storageValue) ? {} : storageValue;
		// 값 설정. 기존 값이 존재 시 덮어씀
		const realValue = _.set(storageValue, valueId, value);

		storage.setItem(key, JSON.stringify(realValue));
	},

	/**
	 * 설정된 이벤트 실행
	 * @param {'l' | 's' | Storage} storage 'l': localStorage, 's': sessionStorage
	 * @param {domEventConfig | domEventConfig[]} eventConfig
	 * @example
	 * setEvents('s', { el: '.btn_connect', event: 'click', delay: 2000 })
	 *  -> Execute when moving to the next page
	 */
	setEvents(storage, eventConfig) {
		storage = cu.storage._get(storage);
		cu.storage.setValue(storage, 'domEvents', eventConfig);
	}
};

/**
 * Dom 조작 관련 함수
 * @namespace cu.dom  */
cu.dom = {
	/**
	 * (IE X) 엘리먼트에 클래스 추가. 배열 or string 둘다 가능
	 * @see {@link cu.dom.removeClass} removeClass
	 * @param {Element} element
	 * @example
	 * addClass(element, 'on', 'text-center', ...)
	 * addClass(element, ['on', 'hover'], 'text-center', ...)
	 */
	addClass(element /* , classes... */) {
		const { classList } = element;
		element.classList.add.apply(
			classList,
			_.flatten(Array.prototype.slice.call(arguments, 1))
		);
	},

	/**
	 * (IE X) 엘리먼트에 클래스 제거. 배열 or string 둘다 가능
	 * @see {@link cu.dom.removeClass} addClass
	 * @param {Element} element
	 * @example
	 * removeClass(element, 'on', 'text-center', ...)
	 * removeClass(element, ['on', 'hover'], 'text-center', ...)
	 */
	removeClass(element /* , classes... */) {
		const { classList } = element;
		element.classList.remove.apply(
			classList,
			_.flatten(Array.prototype.slice.call(arguments, 1))
		);
	},

	/**
	 * dispatchEvent 이벤트 실행
	 * @see {@link cu.dom.runEvents}
	 * @param {domEventConfig} eventConfig
	 */
	dispatchEvent(eventConfig) {
		try {
			const elementSelector = eventConfig.el;
			const eventName = eventConfig.event || 'click';
			const { options } = eventConfig;
			const element = document.querySelector(elementSelector);

			if (_.isElement(element) === false) {
				return false;
			}

			switch (eventName) {
				case 'click':
					element.dispatchEvent(new MouseEvent('click', options));
					break;
				default:
					break;
			}
		} catch (error) {
			console.error(error);
		}
	},

	/**
	 * 마우스 이벤트에서 마우스 위치 가져오기
	 * relatveElement 매개변수가 제공된 경우 요소를 기반으로 상대 위치를 반환
	 * @param {MouseEvent|number[]} position 마우스 위치 개체
	 * @param {HTMLElement} [relativeElement] 상대 위치를 계산하는 HTML 요소
	 * @returns {number[]} mouse position [x, y]
	 */
	getMousePosition(position, relativeElement) {
		const isPositionArray = Array.isArray(position);
		const clientX = isPositionArray ? position[0] : position.clientX;
		const clientY = isPositionArray ? position[1] : position.clientY;
		let rect;

		if (!relativeElement) {
			return [clientX, clientY];
		}

		rect = relativeElement.getBoundingClientRect();

		return [
			clientX - rect.left - relativeElement.clientLeft,
			clientY - rect.top - relativeElement.clientTop
		];
	},

	/**
	 * 포커스 위치 변경 (Start or End)
	 * @param {HTMLElement} element
	 * @param {boolean} [isStart=false] 기본값은 뒤
	 */
	focusElementEdge(element, isStart) {
		try {
			if (element.innerText.length === 0) {
				element.focus();
				return false;
			}

			const selection = window.getSelection();
			const newRange = document.createRange();
			newRange.selectNodeContents(element);
			newRange.collapse(isStart);
			selection.removeAllRanges();
			selection.addRange(newRange);
		} catch (error) {
			console.error(error);
		}
	},

	/**
	 * 현재 커서의 위치에 HTML Element 객체를 삽입
	 * @param {{tagName: string, id: string?}} elementOption 생성할 Element 옵션
	 * @param {string} textNode Element 안에 넣을 text
	 */
	insertHTML(elementOption, textNode) {
		let sel;
		let range;
		if (window.getSelection) {
			sel = window.getSelection();
			if (!sel.rangeCount) {
				return false;
			}
			range = sel.getRangeAt(0);
			range.collapse(true);
			const element = document.createElement(elementOption.tagName);
			if (elementOption.id) {
				element.id = elementOption.id;
			}
			if (textNode) {
				element.appendChild(document.createTextNode(textNode));
			}
			range.insertNode(element);

			// Move the caret immediately after the inserted element
			range.setStartAfter(element);
			range.collapse(true);
			sel.removeAllRanges();
			sel.addRange(range);
		}
	},

	/**
	 * 페이지네이션을 생성하기 위한 변수 값 계산
	 * @param {number} totalItems 페이지네이션을 구성하는 총 행 수
	 * @param {number} [currentPage=1] 현재 보고 있는 페이지 번호
	 * @param {number} [pageSize=20] 페이지에 표시할 행 수
	 * @param {number} [maxPages=10] 페이지네이션 ◀ [1] ~ [10] ▶ 작성 시 사용
	 * @param {boolean} [isFocusCenter=false] 현재 페이지가 페이지네이션 중심으로 표현하게 구성할지 여부
	 */
	paginate(totalItems, currentPage, pageSize, maxPages, isFocusCenter) {
		currentPage = currentPage || 1;
		pageSize = pageSize || 20;
		maxPages = maxPages || 10; // calculate total pages
		isFocusCenter = typeof isFocusCenter === 'boolean' ? isFocusCenter : false;

		const totalPages = Math.ceil(totalItems / pageSize); // ensure current page isn't out of range

		if (currentPage < 1) {
			currentPage = 1;
		} else if (currentPage > totalPages) {
			currentPage = totalPages;
		}

		let startPage = 0;
		let endPage = 0;

		if (isFocusCenter) {
			if (totalPages <= maxPages) {
				// total pages less than max so show all pages
				startPage = 1;
				endPage = totalPages;
			} else {
				// total pages more than max so calculate start and end pages
				const maxPagesBeforeCurrentPage = Math.floor(maxPages / 2);
				const maxPagesAfterCurrentPage = Math.ceil(maxPages / 2) - 1;

				if (currentPage <= maxPagesBeforeCurrentPage) {
					// current page near the start
					startPage = 1;
					endPage = maxPages;
				} else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
					// current page near the end
					startPage = totalPages - maxPages + 1;
					endPage = totalPages;
				} else {
					// current page somewhere in the middle
					startPage = currentPage - maxPagesBeforeCurrentPage;
					endPage = currentPage + maxPagesAfterCurrentPage;
				}
			} // calculate start and end item indexes
		} else {
			startPage = parseInt((currentPage - 1) / maxPages) * maxPages + 1;
			endPage = startPage + maxPages - 1;
			endPage = endPage > totalPages ? totalPages : endPage;
		}

		const startIndex = (currentPage - 1) * pageSize;
		const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1); // create an array of pages to ng-repeat in the pager control

		const pages = _.range(startPage, endPage + 1); // return object with all pager properties required by the view

		return {
			totalItems,
			currentPage,
			pageSize,
			totalPages,
			startPage,
			endPage,
			startIndex,
			endIndex,
			pages,
			isLastPage: currentPage === endPage
		};
	},

	/**
	 * 템플릿 리터럴 대체용으로 console.log 결과를 copy & paste
	 * @param {string} template dom layout
	 * @param {number} [removeTabCount = 0] 삭제할 탭 갯수
	 * @param {string} [name = 'html'] 만들어질 변수 명
	 * @example
	 * name: 'exTemplate', template: layout 입력 할 경우
	 * var exTemplate =  '';
	 * exTemplate +=  '<div class="my_msg ">';
	 * exTemplate +=  '	<div class="my_talkbubble ">';
	 * exTemplate +=  '<div">';
	 */
	printEs5Template(template, removeTabCount, name) {
		removeTabCount = typeof removeTabCount === 'number' ? removeTabCount : 0;
		name = name || 'html';

		const textTemplate = _(template)
			.split('\n')
			.map(function (str, index) {
				const varName = index ? `${name} += ` : `var ${name} = `;
				return `${varName}'${str.slice(removeTabCount)}';`;
			})
			.join('\n');

		console.log(textTemplate);
	},

	/**
	 * dispatchEvent 이벤트 실행 로직 실행
	 * @see {@link cu.storage.setEvents}
	 * @param {domEventConfig | domEventConfig[]} eventConfig
	 */
	runEvents(eventConfig) {
		const realEvents = Array.isArray(eventConfig) ? eventConfig : [eventConfig];
		realEvents.forEach(function (eventInfo) {
			const delay = _.get(eventInfo, 'delay', 0);

			setTimeout(function () {
				cu.dom.dispatchEvent(eventInfo);
			}, delay);
		});
	},

	/**
	 * 모바일에서 브라우저 주소창을 고려한 css height 설정
	 * @summary Mobile Web
	 * @see {@link https://css-tricks.com/the-trick-to-viewport-units-on-mobile}
	 * @example
	 * css 변경 및 setViewportUnitsOnMobile 호출
	 * .my-element {
	 *   height: 100vh;
	 *   height: calc(var(--vh, 1vh) * 100);
	 * }
	 */
	setViewportUnitsOnMobile() {
		const vh = window.innerHeight * 0.01;
		document.documentElement.style.setProperty('--vh', `${vh}px`);
	}
};

/**
 * @typedef {object} mathOption cu.math 옵션. 'f', 'r' 접두사는 filter, reject boolean값으로 true를 기본 내장. 값이 true 이거나 유효한 값일 경우만 수행
 * @property {boolean} [fNumber = true] filter _.isNumber
 * @property {boolean} [rNaN = true] reject _.isNaN
 */

/**
 *  Math 조작 관련 함수
 * @memberof cu
 * @namespace math */
cu.math = {
	/**
	 * 추출 조건에 해당하는 리스트를 추출하고 option에 해당하는 추가 필터링을 적용한 후 lodash wrapped 된 객체 반환
	 * @param {Array<{}>} list ex) [{ n: 4 }, { n: '2' }]
	 * @param {Function | object | Array | string} condition function | `_.matches` | `_.matchesProperty` | `_.property`
	 * @param {mathOption} option 추출 옵션
	 * @example
	 * getCollectionChain([{ n: 4 }, { n: '2' }], 'n'): _.CollectionChain<number> -> [4, 2]
	 * getCollectionChain([{ n: {v: '4'} }, { n: {v: '2'} }], 'n.v'): _.CollectionChain<number> -> [4, 2]
	 * getCollectionChain([{ n: 4 }, { n: '2' }], function(obj){ return obj.n }): _.CollectionChain<number> -> [4, 2]
	 * getCollectionChain([{ n: 4 }, { n: '2' }, {}], 'n'): _.CollectionChain<number> -> [4, 2]
	 * getCollectionChain([{ n: 4 }, { n: '2' }, {}], 'n', {rNaN: false}): _.CollectionChain<number> -> [4, 2, NaN]
	 */
	getCollectionChain(list, condition, option) {
		/** @type {mathOption} */
		const baseOption = {
			fNumber: true,
			rNaN: true
		};
		const filterOpt = _.defaults(option, baseOption);
		let collectionChain = _.chain(list).map(condition).map(_.toNumber);

		// filter isNumber
		filterOpt.fNumber && (collectionChain = collectionChain.filter(_.isNumber));
		// reject isNaN
		filterOpt.rNaN && (collectionChain = collectionChain.reject(_.isNaN));

		return collectionChain;
	},

	/**
	 * lodash _.meanBy 문자를 숫자로 바꾸는 과정 추가
	 * @see {@link cu.math.getCollectionChain} 전처리
	 * @param {Array<{}>} list ex) [{ n: 4 }, { n: '2' }]
	 * @param {Function | object | Array | string} condition function | `_.matches` | `_.matchesProperty` | `_.property`
	 * @param {mathOption} [option] 추출 옵션
	 */
	meanBy(list, condition, option) {
		return cu.math.getCollectionChain(list, condition, option).mean().value();
	},

	/**
	 * lodash _.sumBy 문자를 숫자로 바꾸는 과정 추가
	 * @see {@link cu.math.getCollectionChain} 전처리
	 * @param {Array<{}>} list ex) [{ n: 4 }, { n: '2' }]
	 * @param {Function | object | Array | string} condition function | `_.matches` | `_.matchesProperty` | `_.property`
	 * @param {mathOption} [option] 추출 옵션
	 */
	sumBy(list, condition, option) {
		return cu.math.getCollectionChain(list, condition, option).sum().value();
	}
};

/**
 * PHP 함수 기능을 js로 변경
 * @memberof cu
 * @namespace php
 */
cu.php = {
	/**
	 * 특수 문자 -> HTML Entity
	 * @param {string} text
	 */
	htmlspecialchars(text) {
		const map = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#039;'
		};
		return text.replace(/[&<>"']/g, function (m) {
			return map[m];
		});
	},

	/**
	 * 백슬래쉬 제거
	 * @param {string} str
	 */
	stripslashes(str) {
		return `${str}`.replace(/\\(.?)/g, function (s, n1) {
			switch (n1) {
				case '\\':
					return '\\';
				case '0':
					return '\u0000';
				case '':
					return '';
				default:
					return n1;
			}
		});
	}
};

/**
 * 생성자 함수를 이용하여 객체를 생성하여 사용
 * @memberof cu
 * @namespace class
 */
cu.class = {
	/**
	 * setTimeout을 사용하는 형식과 비슷하나, 요청 callback 수행까지의 남은 시간 반환, 일시 정지, 동작 상태 지원
	 * @param {Function} callback 남은 시간 종료 후 실행할 콜백함수
	 * @param {number} delayMs millisecond
	 * @param {boolean} [shouldAutoStart = true] (default: true) 자동 시작 여부
	 */
	Timer(callback, delayMs, shouldAutoStart) {
		let id;
		let started;
		let remainMs = delayMs || 0;
		let isRunning = false;
		let isComplete = false;
		shouldAutoStart = typeof shouldAutoStart === 'boolean' ? shouldAutoStart : true;

		/** setTimeout 재개 (setTimeout 처리함) */
		this.start = function () {
			if (isRunning !== true) {
				started = new Date();
				isRunning = true;
				if (remainMs > 0) {
					id = setTimeout(function () {
						isComplete = true;
						callback();
					}, remainMs);
				} else {
					id = clearTimeout(id);
				}
			}
		};

		/** setTimeout 정지 (clearTimeout 처리함) */
		this.pause = function () {
			if (isRunning) {
				isRunning = false;
				clearTimeout(id);
				remainMs -= new Date() - started;
			}
		};

		/**
		 * 남아있는 시간을 갱신하고자 할때. 기본값은 생성자 함수 호출 param delay
		 * @param {number} [newDelayMs] 재실행 millisecond. 지정안할 경우 생성자 함수에 사용된 시간 사용
		 * @param {boolean} [shouldStart = true]
		 */
		this.restart = function (newDelayMs, shouldStart) {
			shouldStart = typeof shouldStart === 'boolean' ? shouldStart : true;

			this.pause();
			isComplete = false;
			remainMs = newDelayMs || delayMs;
			shouldStart && this.start();
		};

		/**
		 * 요청 명령 실행까지의 남은 시간 반환
		 * @returns {number} Remained Millisecond
		 */
		this.getTimeLeft = function () {
			if (isRunning) {
				this.pause();
				this.start();
			}
			return remainMs;
		};

		/** Timer의 동작 유무 확인 true: Running, false: Pause */
		this.getStateRunning = function () {
			return isRunning;
		};

		/** 완료 여부 */
		this.isComplete = function () {
			return isComplete;
		};

		shouldAutoStart && this.start();
	},
	/**
	 * setInterval을 사용한 반복기. ES6 Iterator와 관련은 없다.
	 * @param {object} iteratorOption
	 * @param {Function} iteratorOption.repeatCallback 반복 실행할 콜백함수
	 * @param {Function} [iteratorOption.cancelCallback] 취소 콜백
	 * @param {Function} [iteratorOption.completeCallback] 완료 콜백
	 * @param {boolean} [iteratorOption.autoStart = true] (default true) 자동 시작 여부
	 * @param {boolean} [iteratorOption.immediately = true] (default true) 첫 실행시 interval 없이 실행 여부
	 * @param {number} [iteratorOption.repeatCount = Infinity] (default Infinity) 반복수
	 * @param {number} [iteratorOption.delayMs = 1000] (default 0) 지연 시간 millisecond
	 */
	Iterator(iteratorOption) {
		const { repeatCallback } = iteratorOption;
		const { cancelCallback } = iteratorOption;
		const { completeCallback } = iteratorOption;

		let { autoStart } = iteratorOption;
		let { immediately } = iteratorOption;
		let { delayMs } = iteratorOption;
		let { repeatCount } = iteratorOption;

		// 데이터 정제
		autoStart = typeof autoStart === 'boolean' ? autoStart : true;
		immediately = typeof immediately === 'boolean' ? immediately : true;
		delayMs = typeof delayMs === 'number' ? delayMs : 1000;
		repeatCount = typeof repeatCount === 'number' ? repeatCount : Infinity;

		let intervalId;
		let remainCount = repeatCount;
		let runCount = 0;
		let isRunning = false;
		let isComplete = false;
		/** 설정한 로직 수행 */
		function runWork() {
			remainCount -= 1;
			runCount += 1;
			if (remainCount >= 0) {
				repeatCallback();
			}
			if (remainCount === 0) {
				isRunning = false;
				isComplete = true;
				clearInterval(intervalId);
				typeof completeCallback === 'function' && completeCallback();
			}
		}

		/** setInterval 재개 */
		this.start = function () {
			if (isRunning !== true) {
				if (remainCount > 0) {
					isRunning = true;
					isComplete = false;
					// 즉시 실행 옵션이 있다면 바로 실행
					immediately && runWork();

					intervalId = setInterval(function () {
						runWork();
					}, delayMs);
				} else {
					clearInterval(intervalId);
				}
			}
		};

		/** setInterval 정지. 취소 콜백이 존재한다면 실행 */
		this.pause = function () {
			if (isRunning) {
				isRunning = false;
				typeof cancelCallback === 'function' && cancelCallback();
				clearInterval(intervalId);
			}
		};

		/**
		 * 재시작 하고 싶을때
		 * @param {number} [newRepeatCount] 재실행 횟수. 지정안할 경우 생성자 함수에 사용된 재사용 횟수
		 * @param {number} [newDelayMs] 재실행 millisecond. 지정안할 경우 생성자 함수에 사용된 시간 사용
		 */
		this.restart = function (newRepeatCount, newDelayMs) {
			if (isRunning) {
				isRunning = false;
				clearInterval(intervalId);
			}
			isComplete = false;
			runCount = 0;
			remainCount = newRepeatCount || repeatCount;
			delayMs = typeof newDelayMs === 'number' ? newDelayMs : delayMs;
			this.start();
		};

		/** 남은 실행 횟수 */
		this.getRemainCount = function () {
			return remainCount;
		};

		/** 실행 횟수 */
		this.getRunCount = function () {
			return runCount;
		};

		/**
		  Timer의 동작 유무 확인 true: Running, false: Pause
		 */
		this.getStateRunning = function () {
			return isRunning;
		};

		/** 완료 여부 */
		this.isComplete = function () {
			return isComplete;
		};

		autoStart && this.start();
	}
};

/**
 * 윈도우
 * @memberof cu
 * @namespace window
 */
cu.window = {
	/**
	 * 현재 페이지가 어떻게 불리었는지 확인
	 * @returns {'navigate'|'reload'|'back_forward'|'prerender'}
	 */
	getPerformanceNaviType() {
		return performance.getEntriesByType('navigation')[0].type;
	}
};
