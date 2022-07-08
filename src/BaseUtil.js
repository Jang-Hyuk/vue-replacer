import fs from 'fs';
import path from 'path';

import _ from 'lodash';

class BaseUtil {
	/**
	 * 특정 문자열 사이의 문자열 추출
	 * @param {string} str 추출할 대상이 되는 문자열
	 * @param {string} sDelimiter 특정 문자열 시작 구분자
	 * @param {string} eDelimiter 특정 문자열 종료 구분자
	 * @param {{shouldTrim: boolean, shouldLowerCase: boolean, shouldUppercase: boolean}} [option] 추가적인 정제처리 여부.
	 * @returns {string[]} 추출한 문자열 목록
	 * @example
	 * extractBetweenStrings('01234567', '23', '56'): ['45']
	 * extractBetweenStrings('hi #a# 여긴 무시  # b# end', '#', '#'): ['a', 'b']
	 */
	static extractBetweenStrings(str, sDelimiter, eDelimiter, option = {}) {
		const startRegex = new RegExp(`(${sDelimiter}).*?(${eDelimiter})`, 'g');

		let results = str
			.match(startRegex)
			.map(s => s.replace(sDelimiter, '').replace(eDelimiter, ''));

		const commnadList = [];

		option.shouldTrim && commnadList.push(_.trim);
		option.shouldLowerCase && commnadList.push(_.toLower);
		option.shouldUppercase && commnadList.push(_.toUpper);

		if (commnadList.length) {
			const flowCommand = _.flow(commnadList);
			results = results.map(flowCommand);
		}
		return results;
	}

	/**
	 * @param {string} dirName Folder 경로
	 * @returns {string[]} 폴더 이름
	 */
	static getDirectories(dirName) {
		return fs
			.readdirSync(dirName)
			.filter(file => fs.lstatSync(path.join(dirName, file)).isDirectory());
	}

	/**
	 * 지정된 경로안에 존재하는 파일 목록 추출
	 * @param {string} dirPath Folder 경로
	 * @param {string[]=} extList 가져올 확장자 목록
	 * @returns {string[]} 폴더 이름
	 */
	static getFiles(dirPath, extList = []) {
		return fs
			.readdirSync(dirPath)
			.filter(file => fs.lstatSync(path.join(dirPath, file)).isFile())
			.filter(fileName => {
				return extList.length ? extList.includes(fileName.split('.').pop()) : true;
			});
	}

	/**
	 * 지정 폴더를 기준으로 app.use 처리. 단 index는 '/'
	 * @param {string} rootPath 실 디렉토리 앞에 붙을 경로
	 * @param {string[]} dirPath 실 디렉토리
	 * @param {number} [omitDepth = 1] 제외하고자 하는 dirPath 깊이
	 */
	static requireFolder(rootPath, dirPath, omitDepth = 1) {
		const dynamicDirPath = path.resolve(rootPath, ...dirPath);
		// 디렉토리 목록 추출 (테스트 폴더 제외)
		const directoryList = BaseUtil.getDirectories(dynamicDirPath).filter(
			dPath => dPath.includes('test') === false
		);
		// 파일 명 추출
		const fileList = BaseUtil.getFiles(dynamicDirPath, ['js']);

		// 파일 명 순회
		fileList.forEach(file => {
			// 파일 이름
			const fileName = file.slice(0, file.lastIndexOf('.'));
			// 파일 경로
			const filePath = path.join(rootPath, ...dirPath, fileName);

			// 동적 라우팅
			require(filePath);
		});
		// 하부 폴더 목록을 기준으로 재귀
		directoryList.forEach(dirName => {
			return BaseUtil.requireFolder(rootPath, dirPath.concat(dirName), omitDepth);
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
	 * string을 객체로 변환
	 * @param {string} pairs=''
	 * @param {string} [outerSep='']
	 * @param {string} [innerSeq='=']
	 */
	static toDictionary(pairs, outerSep = ' ', innerSeq = '=', newLine = '\r\n') {
		return _.chain(pairs)
			.split(newLine)
			.map(str => str.replace(/\t|"/g, ''))
			.join(' ')
			.split(outerSep)
			.compact()
			.invokeMap('split', innerSeq)
			.fromPairs()
			.value();
	}
}

export default BaseUtil;
