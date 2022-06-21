import fs from 'fs';
import iconv from 'iconv-lite';

class FileReader {
	constructor(config) {
		const { isEuckr = true, adminFolder, isIeMode = false } = config;

		this.isIeMode = isIeMode;
		this.isEuckr = isEuckr;
		this.adminFolder = adminFolder;
	}

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

	async getFile(filePath) {
		let file = '';
		if (this.isEuckr) {
			file = await FileReader.readEuckrFile(filePath);
		} else {
			// FIXME utf-8 구현
		}

		return file;
	}
}

export default FileReader;
