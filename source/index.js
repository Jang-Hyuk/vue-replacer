import _ from 'lodash';
import dotenv from 'dotenv';
import path, { sep } from 'path';

import BaseUtil from '../src/BaseUtil.js';

import FileReader from './FileReader.js';
import FileWriter from './FileWriter.js';
import ProcedureToJsdoc from './ProcedureToJsdoc.js';
import convertTs from './convertTs.js';

dotenv.config();

const { ROOT_FOLDER = '', GLOBAL_FOLDER = 'build', ADMIN_FOLDER = '' } = process.env;

const docPath = path.join(process.cwd(), ROOT_FOLDER, GLOBAL_FOLDER, 'procedure', 'work');
const jsdocPath = path.join(process.cwd(), ROOT_FOLDER, GLOBAL_FOLDER, 'procedure');

/**
 * 실제파일 생성
 * @param {procedureChunk[]} chunkList
 * @param {{dbName: string, fileName?: string, isCurrentPath?: boolean}} option
 */
function writeFile(chunkList, option) {
	const { dbName, fileName = dbName, isCurrentPath = false } = option;
	const fileFullName = `${fileName}.d.ts`;
	return new Promise((resolve, reject) => {
		const realPath = isCurrentPath
			? path.join(process.cwd(), 'out', fileFullName)
			: path.join(jsdocPath, fileFullName);

		const dbCompiled = _.template(`namespace <%= dbName %> {
<%= pBody %>
}`);
		const jsdoc = chunkList.map(convertTs.printJsdocUnit).join('');
		const tsDeclare = dbCompiled({
			dbName,
			pBody: jsdoc
		});
		FileWriter.writeFile(realPath, tsDeclare)
			// .then(FileWriter.fixEslint)
			.then(res => {
				console.log(`✅ complete - ${realPath}`);

				return resolve(res);
			})
			.catch(reject);
	});
}

/**
 * 프로시저 청크 생성
 */
async function createProcedureChunk() {
	const docFilePaths = BaseUtil.getFiles(docPath);

	const results = await docFilePaths.reduce((task, filePath) => {
		return task.then(async chunks => {
			const realFilePath = path.join(docPath, filePath.replace(/\//g, sep));
			const procedureToJsdoc = new ProcedureToJsdoc(realFilePath, chunks);
			await procedureToJsdoc.init();

			const replacedFileName = _.chain(filePath)
				.replace(/ /g, '-')
				.replace(/&/g, '_')
				.replace(/\(/g, '[')
				.replace(/\)/g, ']')
				.split('.')
				.initial()
				.join('.')
				.value();

			writeFile(
				_.filter(procedureToJsdoc.procedureChunkList, chunk =>
					chunk.workNumbers.includes(procedureToJsdoc.workNumber)
				),
				{
					dbName: `WN_${procedureToJsdoc.workNumber.toString()}`,
					fileName: replacedFileName,
					isCurrentPath: true
				}
			);

			return procedureToJsdoc.procedureChunkList;
		});
	}, Promise.resolve([]));

	return results;
}

/**
 * jsdoc 파일 생성
 */
function writeJsdocFile() {
	createProcedureChunk().then(list => {
		const gChunkStorage = ProcedureToJsdoc.groupByDb(list);
		_.forEach(gChunkStorage, (nestedList, db) => {
			writeFile(nestedList, {
				dbName: db
			});
		});
	});
}

/**
 * 유틸 옮기긴 후 jsdoc 문서로 찍어내는 함수
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

writeJsdocFile();
createUtilDocs();

process.on('uncaughtException', err => {
	console.error('uncaughtException', err);
});

process.on('unhandledRejection', err => {
	console.error('unhandledRejection', err);
});
