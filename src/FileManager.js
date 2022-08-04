import _ from 'lodash';
import dotenv from 'dotenv';
import path, { resolve, join } from 'path';

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
	init(dirPath = this.rootPath) {
		// ignore folder check
		const dynamicDirPath = resolve(this.rootPath, dirPath);
		// 디렉토리 목록 추출 (테스트 폴더 제외)
		const directoryList = BaseUtil.getDirectories(dynamicDirPath);
		// .filter(
		// 	dPath => dPath.includes('test') === false
		// );
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
			return this.init(path.resolve(dirPath, dirName));
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
	 * Description
	 * @param {string} filePath
	 */
	onUpdateOtherFile(filePath) {
		console.log('🚀 ~ file: FileManager.js ~ line 107 ~ filePath', filePath);
		const vueCommanderList = _.filter(this.manageStorage, vueCommander => {
			console.log(
				'🚀 ~ file: FileManager.js ~ line 110 ~ vueCommander.replationFiles',
				vueCommander.replationFiles
			);
			return vueCommander.replationFiles.includes(filePath);
		});

		vueCommanderList.forEach(vueCommander => {
			vueCommander.updateOtherFile();
		});

		console.log(
			'🚀 ~ file: FileManager.js ~ line 110 ~ vueCommanderList',
			vueCommanderList
		);
	}

	didMonitoringFile() {}
}

export default FileManager;
