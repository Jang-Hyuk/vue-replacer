import fs from 'fs';
import { exec } from 'child_process';

import _ from 'lodash';
import iconv from 'iconv-lite';

import FileReader from './FileReader.js';

class FileWriter {
	constructor(config) {
		const { isEuckr = true, adminFolder, isIeMode = false } = config;

		this.isIeMode = isIeMode;
		this.isEuckr = isEuckr;
		this.adminFolder = adminFolder;

		this.fileReader = new FileReader(config);
	}

	/**
	 *
	 */
	static execute(command, callback) {
		exec(command, (error, stdout, stderr) => {
			if (typeof callback === 'function') {
				callback(error, stdout, stderr);
			}
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
					.then(fileTxt => this.writeFile(currTask.filePath, fileTxt));
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
		const ext = filePath.split('.').pop().toLocaleLowerCase();
		const isNeedEslintFix = ['js', 'vue'].includes(ext);
		// IE 모드이면 bak 파일에 인코딩 과정을 거친 후 저장
		if (isNeedEslintFix) {
			const isAdminIeMode = this.isIeMode && filePath.includes(this.adminFolder);
			if (!isAdminIeMode) {
				this.writePureFile(filePath, contents);
			}
			// 파일에 저장 후 해당 파일을 인코딩 과정을 거친 후 저장
			return this.writeEslintFixFile(filePath, contents, ext);
		}

		// 그냥 저장
		return this.writePureFile(filePath, contents);
	}

	/**
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
					reject(err);
				}
				// 2. 해당 파일 eslint 적용
				FileWriter.execute(`eslint --fix ${tempFilePath}`, (error, result, stderr) => {
					if (stderr) {
						reject(stderr);
					}

					// 3. 해당 파일 다시 읽어 들여 파일씀
					FileReader.readUtfFile(tempFilePath).then(fileText => {
						fs.rm(tempFilePath, rmErr => {
							if (rmErr) {
								reject(rmErr);
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
	writePureFile(filePath, contents = '') {
		if (this.isEuckr) {
			return new Promise((resolve, reject) => {
				fs.writeFile(
					filePath,
					iconv.encode(contents, 'euc-kr'),
					{
						encoding: 'binary'
					},
					err => {
						if (err) {
							reject(err);
						}

						resolve(true);
					}
				);
			});
		}
		// FIXME utf-8 구현
	}
}

export default FileWriter;
