import fs from 'fs';
import { exec } from 'child_process';

import _ from 'lodash';
import iconv from 'iconv-lite';

import FileReader from './FileReader.js';

class FileWriter {
	constructor(config) {
		const { isEucKr = true, adminFolder, isIeMode = false } = config;

		this.isIeMode = isIeMode;
		this.isEucKr = isEucKr;
		this.adminFolder = adminFolder;

		this.fileReader = new FileReader(config);
	}

	/**
	 * stdout
	 */
	static execute(command, callback) {
		exec(command, (error, stdout, stderr) => {
			typeof callback === 'function' && callback(error, stdout, stderr);
		});
	}

	/**
	 * file 교체 pipe로 연결해서 처리
	 * @param {replaceTargetFileInfo[]} fileConfigList
	 * @param {VueEncoder} caller
	 */
	async replaceEachFiles(fileConfigList, caller) {
		await fileConfigList.reduce((prevTask, currTask, index) => {
			if (index + 1 === fileConfigList.length) {
				return prevTask
					.then(results => currTask.task.call(caller, currTask.contents, results))
					.then(fileTxt => this.writeFile(currTask.filePath, fileTxt))
					.catch(err => {
						console.log('🚀 ~ file: fileWriter.js ~ line 41 ~ err', err);
					});
			}
			return prevTask.then(results =>
				currTask.task.call(caller, currTask.contents, results)
			);
		}, Promise.resolve());
	}

	/**
	 * 조건에 따라 파일 교체
	 * @param {string} filePath
	 * @param {string} contents
	 */
	writeFile(filePath, contents = '') {
		const ext = filePath.split('.').pop().toLowerCase();
		const isNeedEslintFix = ['js', 'vue'].includes(ext);
		// IE 모드이면 bak 파일에 인코딩 과정을 거친 후 저장
		if (isNeedEslintFix) {
			const isAdminIeMode = this.isIeMode && filePath.includes(this.adminFolder);
			// admin ie로 페이지를 수정할 경우 es5 문법에 의한 오류가 생기므로 하지 않음
			if (isAdminIeMode === false) {
				this.writePureFile(filePath, contents);
			}
			// euc-kr일 경우 eslint --fix 하면 파일 변환이 깨지므로 utf-8로 임시 저장 후 --fix 처리하고 다시 저장
			if (this.isEucKr) {
				return this.writeEslintFixFile(filePath, contents, ext);
			}

			FileWriter.execute(`eslint --fix ${filePath}`);

			return Promise.resolve();
		}

		// 그냥 저장
		return this.writePureFile(filePath, contents);
	}

	/**
	 * Euc-Kr일 경우 eslint가 깨지므로 temp파일에 임시 저장 후 처리
	 * IE용. File을 저장한 후 ESLint 과정을 추가 수행. CLI eslint 과정에 시간 소요가 큼(2초 이상)
	 * @param {string} filePath
	 * @param {string} contents utf-8
	 */
	writeEslintFixFile(filePath, contents = '', ext = 'js') {
		// 1. IE + js 파일일 경우 UTF-8로 임시 파일 저장.
		const tempFilePath = _.chain(filePath)
			.split('.')
			.initial()
			.push('temp', ext)
			.join('.')
			.value();

		return new Promise((resolve, reject) => {
			fs.writeFile(tempFilePath, contents, err => {
				if (err) {
					return reject(err);
				}
				// 2. 해당 파일 eslint 적용
				FileWriter.execute(`eslint --fix ${tempFilePath}`, (error, result, stderr) => {
					if (stderr) {
						return reject(stderr);
					}

					// 3. 해당 파일 다시 읽어 들여 파일씀
					FileReader.readUtfFile(tempFilePath).then(fileText => {
						fs.rm(tempFilePath, rmErr => {
							if (rmErr) {
								return reject(rmErr);
							}
						});
						return this.writePureFile(filePath, fileText);
					});
				});
			});
		});
	}

	/**
	 * 해당 경로에 파일을 덮어씀
	 * @param {string} filePath 경로
	 * @param {string} contents 덮어쓸 file text
	 */
	async writePureFile(filePath, contents = '') {
		// 어떠한 이유에서든지 컨텐츠가 없다면 무시. 에러코드가 들어가는 경우도 있어서 무시처리
		if (contents.length === 0 || contents.slice(0, 5) === 'Error') {
			throw new Error(`❌ no file content. \n ${filePath}`);
		}
		const isExistFile = await fs.existsSync(filePath);

		// 덮어쓸 파일이 없다면 무시
		if (isExistFile === false) {
			throw new Error(`❓ file does not exist. \n ${filePath}`);
		}

		if (this.isEucKr) {
			return new Promise((resolve, reject) => {
				fs.writeFile(
					filePath,
					iconv.encode(contents, 'euc-kr'),
					{
						encoding: 'binary'
					},
					err => (err ? reject(err) : resolve(true))
				);
			});
		}

		// utf-8
		return new Promise((resolve, reject) => {
			fs.writeFile(filePath, contents, err => (err ? reject(err) : resolve(true)));
		});
	}
}

export default FileWriter;
