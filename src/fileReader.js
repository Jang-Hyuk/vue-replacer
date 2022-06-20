import fs from 'fs';
import iconv from 'iconv-lite';

export default {
	readEuckrFile(filePath) {
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
	},
	readUtfFile(filePath) {
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
};
