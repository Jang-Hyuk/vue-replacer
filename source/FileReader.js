import fs from 'fs';
import iconv from 'iconv-lite';

class FileReader {
	static isExistFilePath(filePath) {
		return fs.existsSync(filePath);
	}

	static readEucKrFile(filePath) {
		const isExist = FileReader.isExistFilePath(filePath);
		if (!isExist) {
			throw new Error(`There is no file in that location.: ${filePath}}`);
		}
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
		const isExist = FileReader.isExistFilePath(filePath);
		if (!isExist) {
			throw new Error(`There is no file in that location.: ${filePath}}`);
		}
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

	async getFile(filePath = '') {
		try {
			const file = await FileReader.readUtfFile(filePath);

			return file;
		} catch (error) {
			console.log('🚀 ~ file: FileReader.js ~ line 65 ~ error', error.message);
		}
	}
}

export default FileReader;
