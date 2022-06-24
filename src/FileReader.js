import fs from 'fs';
import iconv from 'iconv-lite';

class FileReader {
	constructor(config) {
		const { isEucKr = true, adminFolder, isIeMode = false } = config;

		this.isIeMode = isIeMode;
		this.isEucKr = isEucKr;
		this.adminFolder = adminFolder;
	}

	static readEucKrFile(filePath) {
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
				fs.readFile(filePath, (err, data) => {
					if (err) {
						resolve(err);
					}

					resolve(data.toString());
				});
			} catch (error) {
				resolve(error);
			}
		});
	}

	async getFile(filePath) {
		let file = '';
		if (this.isEucKr) {
			file = await FileReader.readEucKrFile(filePath);
		} else {
			file = await FileReader.readUtfFile(filePath);
		}

		return file;
	}
}

export default FileReader;
