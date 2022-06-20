import _ from 'lodash';
import dotenv from 'dotenv';
import path, { resolve, join } from 'path';

import BaseUtil from './BaseUtil.js';

dotenv.config();

/**
 * @typedef {object} manageInfo
 * @property {boolean} isChangeChild vue 파일과 관련된 파일이 외부에 의해 변경될 경우
 * @property {string} [tplPath] template path
 * @property {string} [srcPath] source path
 * @property {string} [cssPath] style path
 */

class FileManager {
	constructor(rootPath = '') {
		this.rootPath = rootPath;
		this.ignoreFolders = ['.idea', '.vscode', 'node_modules', 'types', '@types'];

		/** @type {Record<string, manageInfo>}  */
		this.manageStorage = {};
	}

	/**
	 * 지정 폴더를 기준으로 app.use 처리. 단 index는 '/'
	 * @param {string} dirPath dirPath
	 */
	init(dirPath) {
		// ignore folder check
		const dynamicDirPath = resolve(this.rootPath, dirPath);
		// 디렉토리 목록 추출 (테스트 폴더 제외)
		const directoryList = BaseUtil.getDirectories(dynamicDirPath).filter(
			dPath => dPath.includes('test') === false
		);
		// 파일 명 추출
		const fileList = BaseUtil.getFiles(dynamicDirPath, ['vue']);

		// 파일 명 순회
		fileList.forEach(file => {
			// 파일 경로
			const filePath = join(this.rootPath, dirPath, file);
			// TODO: Restore
			console.log('filePath: ', filePath);
		});
		// 하부 폴더 목록을 기준으로 재귀
		directoryList.forEach(dirName => {
			if (this.ignoreFolders.includes(_.lowerCase(dirName))) {
				return;
			}
			return this.init(path.resolve(dirPath, dirName));
		});
	}
}

// export default FileManager;

const fileManager = new FileManager('./');

_(process.env.MANAGER_FOLDER)
	.split(',')
	.map(_.trim)
	.forEach(dirName => fileManager.init(dirName));
