/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
import fs from 'fs';
import { exec } from 'child_process';

import { ESLint } from 'eslint';
import iconv from 'iconv-lite';
import _ from 'lodash';

function execute(command, callback) {
	exec(command, (error, stdout, stderr) => {
		typeof callback === 'function' && callback(error, stdout, stderr);
	});
}

class VueParent {
	/**
	 * @param {Object} config Replacer 생성자 옵션
	 * @param {string} config.filePath file full path (d:/temp/conts/js/*.vue)
	 * @param {boolean} [config.isEuckr = true] iconv 로 최종 내보낼 파일 인코딩 형식
	 * @param {string} [config.fileSep = sep] window vs linux file 구분자에 따른 값
	 * @param {string} [config.isIeMode = false] IE 모드일 경우 output file에 eslint 를 적용하여 저장. 속도가 느린 단점이 있음
	 */
	constructor(config) {
		const { isIeMode = false } = config;
		this.isIeMode = isIeMode;

		this.NEW_LINE = '\r\n';
		this.TAB = '\t';
		// ↓↓↓ set constant
		this.vueStartDelimiter = '### Vue';
		this.vueEndDelimiter = '### !Vue';

		// Create an instance with the `fix` option.
		this.eslint = new ESLint({ fix: true });
	}

	/**
	 * euc-kr 형식의 파일을 utf8 형식으로 변환하여 반환
	 * @param {string} filePath
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
	 * euc-kr 형식의 파일을 utf8 형식으로 변환하여 반환
	 * @param {string} filePath
	 */
	static readUtfFile(filePath) {
		return new Promise(resolve => {
			try {
				fs.createReadStream(filePath)
					.pipe(iconv.decodeStream('utf-8'))
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
	 * IE용. File을 저장한 후 ESLint 과정을 추가 수행. CLI eslint 과정에 시간 소요가 큼(2초 이상)
	 * @param {string} filePath
	 * @param {string} contents utf-8
	 */
	writeTempJsFile(filePath, contents = '') {
		// 1. IE + js 파일일 경우 UTF-8로 임시 파일 저장.
		const tempFilePath = _.chain(filePath)
			.split('.')
			.initial()
			.push('bak', 'js')
			.join('.')
			.value();

		fs.writeFile(tempFilePath, contents, err => {
			if (err) {
				console.error(err);
			}
			// 2. 해당 파일 eslint 적용
			execute(`eslint --fix ${tempFilePath}`, (error, result, stderr) => {
				if (stderr) {
					console.log('🚀 ~ file: VueParent.js ~ line 126 ~ execute eslint', stderr);
					return false;
				}

				// 3. 해당 파일 다시 읽어 들여 파일씀
				VueParent.readUtfFile(tempFilePath).then(fileText => {
					fs.rm(tempFilePath, rmErr => {
						if (rmErr) {
							console.log('🚀 ~ file: VueParent.js ~ line 137 ~ rmErr', rmErr);
						}
					});
					this.writeFile(filePath, fileText);
				});
			});
		});
	}

	/**
	 * 해당 경로에 파일을 덮어씀
	 * @param {string} filePath 경로
	 * @param {string} contents 덮어쓸 file text
	 * @param {boolean} [isEnabledEncoding=false] (Js 파일만 가능) 인코딩 추가로 처리할 수 있는지 여부
	 */
	writeFile(filePath, contents = '', isEnabledEncoding = false) {
		if (this.isIeMode && isEnabledEncoding) {
			return this.writeTempJsFile(filePath, contents);
		}

		if (this.isEuckr) {
			fs.writeFile(
				filePath,
				iconv.encode(contents, 'euc-kr'),
				{
					encoding: 'binary'
				},
				err => {
					if (err) {
						console.error(err);
					}
					// // FIXME (인코딩이 안맞음) IE용. File을 저장한 후 ESLint 과정을 추가로 할지 여부. 시간 소요가 큼(2초 이상)
					// if (this.isIeMode && isEnabledEncoding) {
					// 	console.log('fix');
					// 	execute(`eslint --fix ${filePath}`);
					// }
				}
			);
		} else {
			// FIXME utf-8 구현
		}
	}
}

export default VueParent;
