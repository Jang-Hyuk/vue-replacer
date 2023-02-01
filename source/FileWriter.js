import fs from 'fs';
import { exec } from 'child_process';

class FileWriter {
	/**
	 * stdout
	 */
	static execute(command, callback) {
		exec(command, (error, stdout, stderr) => {
			typeof callback === 'function' && callback(error, stdout, stderr);
		});
	}

	/**
	 * 조건에 따라 파일 교체
	 * @param {string} filePath
	 * @param {string} contents
	 */
	static writeFile(filePath, contents = '') {
		// 어떠한 이유에서든지 컨텐츠가 없다면 무시. 에러코드가 들어가는 경우도 있어서 무시처리
		if (contents.length === 0 || contents.slice(0, 5) === 'Error') {
			throw new Error(`❌ no file content. \n ${filePath}`);
		}

		return new Promise((resolve, reject) => {
			fs.writeFile(filePath, contents, err => (err ? reject(err) : resolve(filePath)));
		});
	}

	static fixEslint(filePath) {
		console.log('🚀 FileWriter', filePath);
		try {
			return new Promise((resolve, reject) => {
				FileWriter.execute(`eslint --fix ${filePath}`, (error, result, stderr) => {
					if (stderr) {
						return reject(stderr);
					}
					return resolve();
				});
			});
		} catch (error) {
			console.error(error);
		}
	}
}

export default FileWriter;
