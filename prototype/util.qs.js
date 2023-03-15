/**
 * querystring 관리.
 * @memberof cu
 * @namespace qs
 * @see {@link https://www.npmjs.com/package/simple-query-string} reference simple-query-string v1.3.2 - MIT license require('simple-query-string')
 */
cu.qs = {
	/**
	 * encodeURIComponent를 통해서 만들어진 문자열을 이스케이핑을 이용하여 디코드
	 * @param {string} v
	 */
	decode(v) {
		if (v === undefined) {
			return null;
		}

		if (v) {
			return decodeURIComponent(v);
		}

		return v;
	},

	/**
	 * 문자열로의 유형 변환을 사용한 uri 문자열 인코딩
	 * @param {string} v
	 */
	encode(v) {
		switch (typeof v) {
			case 'string':
				return encodeURIComponent(v);

			case 'boolean':
				return v ? 'true' : 'false';

			case 'number':
				return isFinite(v) ? v : '';

			case 'object':
				if (v === undefined || v === null) {
					return '';
				}

				if (JSON && JSON.stringify) {
					return encodeURIComponent(JSON.stringify(v));
				}

				return '';

			default:
				return '';
		}
	},

	/**
	 * 쿼리문자열을 분석하여 값 또는 객체로 반환
	 * @param {string} [key] - querysting key
	 * @param {any} [defaultValue] key값에 해당하는 값이 없을 경우 설정할 초기 값.
	 * @returns {string | object}
	 * @example
	 * === url: https://devm-wkdgur1380.club5678.com/?arr=1&arr=2&sSex=f
	 * get(): {arr: ['1', '2'], sSex: 'f'}
	 * get('sSex'): 'f'
	 * get('nothing'): undefined
	 * get('nothing', 'hi'): 'hi'
	 */
	get(key, defaultValue) {
		if (key) {
			const qsValue = cu.qs.parse()[key];
			return qsValue === undefined ? defaultValue : qsValue;
		}

		return cu.qs.parse();
	},

	/**
	 * 프로토타입 속성을 무시하고 모든 개체 속성을 열거
	 * v8에서 최적화 문제를 피하기 위해 열거 키를 캡슐화
	 * @param   {object} obj - input object
	 */
	getKeys(obj) {
		const { hasOwnProperty } = Object.prototype;
		const list = [];
		let key;
		// eslint-disable-next-line no-restricted-syntax
		for (key in obj) {
			if (hasOwnProperty.call(obj, key)) {
				list.push(key);
			}
		}

		return list;
	},

	/**
	 * 쿼리문자열을 분석하여 객체로 반환
	 * @param {string} [str] 구문 분석할 쿼리 문자열이 포함된 문자열
	 * @param {string} [delimiter = &] - 정의되지 않은 경우(값 없음) 기본 앰퍼샌드 '&'는 쌍 구분자
	 * @param {string} [eq = \=] - key/pair separator.
	 * @returns {object} parsed object (use as a dictionary)
	 * @example
	 * === url: https://devm-wkdgur1380.club5678.com/?arr=1&arr=2&sSex=f
	 * parse(): {arr: ['1', '2'], sSex: 'f'}
	 */
	parse(str, delimiter, eq) {
		let i;
		str = str || location.search;
		delimiter = delimiter || '&';
		eq = eq || '='; // create an object with no prototype

		const dic = Object.create(null); // step 0: sanity checks

		if (typeof str !== 'string') {
			return dic;
		} // detect if we have or not a query string

		i = str.indexOf('?');

		if (i < 0 && str.indexOf(eq) < 0) {
			return dic;
		} // step 1: prepare query string
		// split by '?'

		if (i >= 0) {
			str = str.substr(i + 1);
		} // trim space (see MDN polyfill), ?, # and & (allow passing location.search or location.hash as parameter)

		str = str.replace(/^[\s\uFEFF\xA0\?#&]+|[\s\uFEFF\xA0&]+$/g, ''); // remove anchor [ "#" fragment ]

		i = str.lastIndexOf('#');

		if (i > 0) {
			str = str.substr(0, i);
		} // step 2: split by key/value pair

		const parts = str.split(delimiter);

		for (i = 0; i < parts.length; ++i) {
			// step 3: split key/value pair
			const s = parts[i].replace(/\+/g, ' ');
			const p = s.indexOf(eq);
			var key;
			var val; // key must exist

			if (p === 0 || s.length === 0) {
				continue;
			} // split

			if (p < 0) {
				key = cu.qs.decode(s);
				val = null; // missing `=` should be `null`:
			} else {
				key = cu.qs.decode(s.substr(0, p));
				val = cu.qs.decode(s.substr(p + 1));
			} // check existing dic and add

			const e = dic[key]; // step 4: add to dictionary

			if (e === undefined) {
				dic[key] = val;
			} else if (Array.isArray(e)) {
				e.push(val);
			} else {
				dic[key] = [e, val];
			}
		}

		return dic;
	},

	/**
	 * 객체 또는 사전 자료형을 string으로 변환
	 * @param {object} obj 속성을 키/값 문자열로 구문 분석할 개체
	 * @param {string} [delimiter = &] 정의되지 않은 경우(값 없음) 기본 앰퍼샌드 '&'는 쌍 구분자
	 * @param {string} [eq = \=] 정의되지 않은 경우(값 없음) 기본 앰퍼샌드 '='는 쌍 구분자
	 * @returns {string} query string
	 * @example
	 * === obj: {arr: ['1', '2'], sSex: 'f'}
	 * stringify(obj): 'arr=1&arr=2&sSex=f'
	 * stringify(obj, '|', '='): 'arr=1|arr=2|sSex=f'
	 */
	stringify(obj, delimiter, eq) {
		delimiter = delimiter || '&';
		eq = eq || '='; // sanity check

		if ((typeof obj !== 'object' && typeof obj !== 'function') || obj === null) {
			return '';
		} // get obj keys

		const keys = cu.qs.getKeys(obj); // sanity check

		if (!keys || !keys.length) {
			return '';
		}

		const list = [];
		let i = 0;
		let j;
		let k;
		let v; // enumerate key/values

		for (; i < keys.length; i++) {
			k = cu.qs.encode(keys[i]);
			v = obj[k]; // check value type (ignore undefined and function)

			if (v !== undefined && typeof v !== 'function') {
				if (Array.isArray(v)) {
					for (j = 0; j < v.length; ++j) {
						list.push(k + eq + (v[j] ? cu.qs.encode(v[j]) : ''));
					}
				} else {
					// try to encode
					if (v !== null) {
						v = cu.qs.encode(v);
					} // check final v value and add to list

					list.push(v === null || v === undefined ? k : k + eq + v);
				}
			}
		} // concatenate final string

		return list.join(delimiter);
	},
	/**
	 * @see {@link cu.qs.stringify} use
	 * 객체 또는 사전 자료형을 location.search 형태로 반환
	 * @param {object} obj 속성을 키/값 문자열로 구문 분석할 개체
	 * @param {string} [delimiter = &] 정의되지 않은 경우(값 없음) 기본 앰퍼샌드 '&'는 쌍 구분자
	 * @param {string} [eq = \=] 정의되지 않은 경우(값 없음) 기본 앰퍼샌드 '='는 쌍 구분자
	 * @returns {string} location search 형태
	 * @example
	 * === obj: {arr: ['1', '2'], sSex: 'f'}
	 * stringify(obj): 'arr=1&arr=2&sSex=f'
	 * stringify(obj, '|', '='): 'arr=1|arr=2|sSex=f'
	 */
	createLocationSearch(obj, delimiter, eq) {
		return `/?${cu.qs.stringify(obj, delimiter, eq)}`;
	}
};
