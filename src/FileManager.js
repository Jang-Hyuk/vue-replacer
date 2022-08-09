import _ from 'lodash';
import dotenv from 'dotenv';
import path, { join } from 'path';

import BaseUtil from './BaseUtil.js';
import VueCommander from './VueCommander.js';

import './type.d.js';

dotenv.config();

class FileManager {
	/**
	 * Vue 파일 관리
	 * @param {string} rootPath
	 * @param {replacerConfig} config Replacer 생성자 옵션
	 */
	constructor(rootPath, config) {
		this.rootPath = rootPath || '';
		this.config = config;

		this.ignoredFolders = [
			'.idea',
			'.vscode',
			'node_modules',
			'types',
			'@types',
			'.nuxt',
			'.git'
		];

		/** @type {Record<string, VueCommander>}  */
		this.manageStorage = {};
	}

	/**
	 * 지정 폴더를 기준으로 app.use 처리. 단 index는 '/'
	 * @param {string} dirPath dirPath
	 */
	init(dirPath = '') {
		// ignore folder check
		const dynamicDirPath = join(this.rootPath, dirPath);
		// 디렉토리 목록 추출 (테스트 폴더 제외)
		const directoryList = BaseUtil.getDirectories(dynamicDirPath);

		// 파일 명 추출
		const fileList = BaseUtil.getFiles(dynamicDirPath, ['vue']);

		// 파일 명 순회
		fileList.forEach(file => {
			// 파일 경로
			const filePath = join(this.rootPath, dirPath, file);
			const newConfig = _.chain(this.config).clone().set('filePath', filePath).value();

			this.manageStorage[filePath] = new VueCommander(newConfig);
		});
		// 하부 폴더 목록을 기준으로 재귀
		directoryList.forEach(dirName => {
			if (this.ignoredFolders.includes(dirName.toLowerCase())) {
				return;
			}
			return this.init(path.join(dirPath, dirName));
		});
	}

	/**
	 * @param {string} vueFilePath
	 */
	setVueCommander(vueFilePath) {
		this.manageStorage[vueFilePath] = new VueCommander(
			_.chain(this.config).clone().set('filePath', vueFilePath).value()
		);
		return this.manageStorage[vueFilePath];
	}

	/**
	 * @param {string} filePath
	 */
	getVueCommander(filePath = '') {
		const vueCommander = this.manageStorage[filePath];
		return vueCommander;
	}

	/**
	 * vue file 변경을 File Watcher가 감지하였을 경우 호출
	 * @param {string} filePath
	 */
	async onUpdateVueFile(filePath) {
		try {
			let vueCommander = this.getVueCommander(filePath);
			if (vueCommander === undefined) {
				vueCommander = this.setVueCommander(filePath);
			}
			await vueCommander.updateVueFile();
		} catch (error) {
			console.error(error);
		}
	}

	/**
	 * vue 제외 파일 업데이트 시
	 * @param {string} filePath
	 */
	onUpdateOtherFile(filePath) {
		const vueCommanderList = _.filter(this.manageStorage, vueCommander => {
			return vueCommander.relationFiles.includes(filePath);
		});

		vueCommanderList.forEach(vueCommander => {
			vueCommander.updateOtherFile();
		});
	}
}

export default FileManager;
