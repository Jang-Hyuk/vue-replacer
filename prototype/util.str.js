/**
 * String 변환 관련 함수
 * 접두사는 replace <-> unreplace, encode <-> decode 권장
 * @memberof cu
 * @namespace str
 */
cu.str = {
	/**
	 * base64 -> utf-8
	 * @see {@link cu.str.utoa} opposite
	 * @param {string} str
	 * @example
	 * 5Lq6 -> 人
	 */
	atou(str) {
		return decodeURIComponent(escape(window.atob(str)));
	},

	/**
	 * [Html Entity Number, Html Entity Name] -> Html Character
	 * @param {string} encodedString
	 */
	decode(encodedString) {
		const tmpElement = document.createElement('span');
		tmpElement.innerHTML = encodedString;
		return tmpElement.innerHTML;
	},

	/**
	 * Html Entity -> Html Character
	 * @see {@link cu.str.encodeHTMLEntity} opposite
	 * @param {string} htmlEntity - HTML Entity type string
	 * @returns {string} Plain string
	 * @example
	 * var htmlEntityString = "A &#39;quote&#39; is &lt;b&gt;bold&lt;/b&gt;"
	 * var result = decodeHTMLEntity(htmlEntityString); //"A 'quote' is <b>bold</b>"
	 */
	decodeHTMLEntity(htmlEntity) {
		const entities = {
			'&quot;': '"',
			'&amp;': '&',
			'&lt;': '<',
			'&gt;': '>',
			'&#39;': "'",
			'&nbsp;': ' '
		};
		return htmlEntity.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&nbsp;/g, function (m0) {
			return entities[m0] ? entities[m0] : m0;
		});
	},

	/**
	 * Html Character -> Html Entity
	 * @see {@link cu.str.decodeHTMLEntity} opposite
	 * @param {string} html - String for encoding
	 * @returns {string} HTML Entity
	 * @example
	 * var htmlEntityString = "<script> alert('test');</script><a href='test'>";
	 * var result = encodeHTMLEntity(htmlEntityString);
	 */
	encodeHTMLEntity(html) {
		const entities = {
			'"': 'quot',
			'&': 'amp',
			'<': 'lt',
			'>': 'gt',
			"'": '#39'
		};
		return html.replace(/[<>&"']/g, function (m0) {
			return entities[m0] ? `&${entities[m0]};` : m0;
		});
	},

	/**
	 * 특정 문자열 사이의 문자열 추출
	 * @param {string} str 추출할 대상이 되는 문자열
	 * @param {string} sDelimiter 특정 문자열 시작 구분자
	 * @param {string} eDelimiter 특정 문자열 종료 구분자
	 * @param {{shouldTrim: boolean, shouldLowerCase: boolean, shouldUppercase: boolean}} [option] 추가적인 정제처리 여부.
	 * @returns {string[]} 추출한 문자열 목록
	 * @example
	 * extractBetweenStrings('01234567', '23', '56'): ['45']
	 * extractBetweenStrings('hi #a# 여긴 무시  # b# end', '#', '#'): ['a', ' b']
	 */
	extractBetweenStrings(str, sDelimiter, eDelimiter, option) {
		option = option || {};
		const startRegex = new RegExp(`(${sDelimiter}).*?(${eDelimiter})`, 'g');
		const startReplacer = new RegExp(sDelimiter);
		const endReplacer = new RegExp(eDelimiter);

		const shouldTrim = _.get(option, 'shouldTrim', true);
		const shouldLowerCase = _.get(option, 'shouldLowerCase', false);
		const shouldUppercase = _.get(option, 'shouldUppercase', false);

		let results = str.match(startRegex);
		results =
			results === null
				? []
				: results.map(function (s) {
						return s.replace(startReplacer, '').replace(endReplacer, '');
				  });

		const commnadList = [];

		shouldTrim && commnadList.push(_.trim);
		shouldLowerCase && commnadList.push(_.toLower);
		shouldUppercase && commnadList.push(_.toUpper);

		if (commnadList.length) {
			const flowCommand = _.flow(commnadList);
			results = results.map(flowCommand);
		}

		return results;
	},

	/**
	 * (개행) newlines -> \<br /> 태그
	 * @see {@link cu.str.unreplaceBrTag} opposite
	 * @param {string} text
	 */
	replaceBrTag(text) {
		if (typeof text !== 'string') {
			return '';
		}

		return text.replace(/(?:\r\n|\r|\n)/gi, '<br />');
	},

	/**
	 * \<br /> 태그 -> (개행) newlines
	 * @see {@link cu.str.replaceBrTag} opposite
	 * @param {string} text
	 */
	unreplaceBrTag(text) {
		if (typeof text !== 'string') {
			return '';
		}

		return text.replace(/<br\s*[\/]?>/gi, '\n');
	},
	/**
	 * space to on-breaking Space with the &nbsp
	 * @see {@link cu.str.unreplaceOnBreakingSpace} opposite
	 * @param {string} text '12 4' -> encodeURIComponent 스페이스가 %20
	 */
	replaceOnBreakingSpace(text) {
		return text.replace(/ /g, /\u00A0/);
	},
	/**
	 * on-breaking Space with the &nbsp to space
	 * @see {@link cu.str.replaceOnBreakingSpace} opposite
	 * @param {string} text '12 4' -> encodeURIComponent 스페이스가 %C0A0
	 */
	unreplaceOnBreakingSpace(text) {
		return text.replace(/\u00A0/g, ' ');
	},
	/**
	 * space to &nbsp;
	 * @see {@link cu.str.unreplaceNbsp} opposite
	 * @param {string} text '12 4'
	 */
	replaceNbsp(text) {
		return text.replace(/ /g, '&nbsp;');
	},
	/**
	 * space to &nbsp;
	 * @see {@link cu.str.replaceNbsp} opposite
	 * @param {string} text '12 4'
	 */
	unreplaceNbsp(text) {
		return text.replace(/&nbsp;/g, ' ');
	},

	/**
	 * utf-8 -> base64
	 * @see {@link cu.str.atou} opposite
	 * @param {string} str
	 * @example
	 * 人 -> 5Lq6
	 */
	utoa(str) {
		return window.btoa(unescape(encodeURIComponent(str)));
	}
};
