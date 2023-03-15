import _ from 'lodash';
import dotenv from 'dotenv';
import path, { sep } from 'path';
import fs from 'fs';

import FileReader from '../FileReader.js';
import FileWriter from '../FileWriter.js';
import ProcedureToJsdoc from '../ProcedureToJsdoc.js';

// const fileName = '../../prototype/utils.js';
dotenv.config();

const docPath = path.join(process.cwd(), 'prototype');
const jsdocPath = path.join(process.cwd(), 'out');

const globalFolderPath = path.join(process.cwd(), process.env.GLOBAL_FOLDER, 'js');
const globalUtilPaths = [
	'utils.js',
	'util.device.js',
	'util.qs.js',
	'util.str.js',
	'util.hardware.js'
];
const globalPaths = globalUtilPaths.map(filePath =>
	path.join(globalFolderPath, filePath)
);

const adminFolderPath = path.join(process.cwd(), process.env.ADMIN_FOLDER, 'js');
const adminUtilPaths = ['admin.util.js'];
const adminPaths = adminUtilPaths.map(filePath => path.join(adminFolderPath, filePath));
/**
 *
 */
async function createUtil() {
	const list = globalPaths.concat(adminPaths).map(filePath => {
		console.log('🚀 ~ file: convertUtil.js:36 ~ filePath:', filePath);
		return FileReader.readEucKrFile(filePath).then(contents => {
			return FileWriter.writeFile(
				path.join(jsdocPath, _.last(filePath.split(sep))),
				contents,
				true
			);
		});
	});

	await Promise.all(list);
	const modulePath = path.join(process.cwd(), 'node_modules/.bin/jsdoc');
	const configPath = path.join(process.cwd(), 'jsdoc.json');
	FileWriter.execute(`${modulePath} -c ${configPath}`);
}

createUtil();
