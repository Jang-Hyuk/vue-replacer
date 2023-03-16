import _ from 'lodash';
import dotenv from 'dotenv';
import path, { sep } from 'path';

import FileReader from '../FileReader.js';
import FileWriter from '../FileWriter.js';
import BaseUtil from '../../src/BaseUtil.js';

dotenv.config();

const { ROOT_FOLDER = '', GLOBAL_FOLDER = 'build', ADMIN_FOLDER = '' } = process.env;

/**
 *
 */
async function createUtilDocs() {
	const utilSavePath = path.join(process.cwd(), 'build');

	const globalFolderPath = path.join(process.cwd(), ROOT_FOLDER, GLOBAL_FOLDER, 'js');
	const globalUtilPaths = ['utils.js', 'util.device.js', 'util.qs.js', 'util.str.js'];
	const globalPaths = globalUtilPaths.map(filePath =>
		path.join(globalFolderPath, filePath)
	);

	const adminFolderPath = path.join(process.cwd(), ROOT_FOLDER, ADMIN_FOLDER, 'js');
	const adminUtilPaths = ['admin.utils.js', 'admin.util.str.js'];
	const adminPaths = adminUtilPaths.map(filePath => path.join(adminFolderPath, filePath));

	const list = globalPaths.concat(adminPaths).map(filePath => {
		return FileReader.readEucKrFile(filePath).then(contents => {
			return FileWriter.writeFile(
				path.join(utilSavePath, _.last(filePath.split(sep))),
				contents,
				true
			);
		});
	});

	const globalJsdocPath = path.join(globalFolderPath, 'jsdoc');

	BaseUtil.getFiles(globalJsdocPath, ['js']).forEach(file => {
		return FileReader.readUtfFile(path.join(globalJsdocPath, file)).then(contents => {
			return FileWriter.writeFile(path.join(utilSavePath, file), contents, true);
		});
	});

	await Promise.all(list);
	const modulePath = path.join(process.cwd(), 'node_modules/.bin/jsdoc');
	const configPath = path.join(process.cwd(), 'jsdoc.json');
	FileWriter.execute(`${modulePath} -c ${configPath}`);
}

createUtilDocs();
