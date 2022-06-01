import fs from 'fs';
import path, { sep } from 'path';

import _ from 'lodash';
import iconv from 'iconv-lite';

class VueParent {
	NEW_LINE = '\r\n';
	TAB = '\t';
	// ↓↓↓ set constant
	vueStartDelimiter = '### Vue';
	vueEndDelimiter = '### !Vue';

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

	/**
	 * Description
	 * @param {string} filePath
	 * @param {string} contents
	 */
	writeFile(filePath, contents = '') {
		if (this.isEuckr) {
			fs.writeFile(filePath, iconv.encode(contents, 'euc-kr'), {
				encoding: 'binary'
			}, (err, result) => {
				if(err) {
					console.error(err);
				}
				console.log('wtf')
			});
		} else {
			// FIXME utf-8 구현
		}
	}
}

export default VueParent;
