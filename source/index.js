import _ from 'lodash';
import dotenv from 'dotenv';
import path, { sep } from 'path';

import BaseUtil from '../src/BaseUtil.js';

import FileWriter from './FileWriter.js';
import ProcedureToJsdoc from './ProcedureToJsdoc.js';

dotenv.config();
const docPath = path.join(process.cwd(), process.env.JSDOC_DOC_FOLTER ?? 'build');
const jsdocPath = path.join(process.cwd(), process.env.JSDOC_OUT_FOLTER ?? 'out');

/**
 *
 */
function writeFile(chunkList, fileName, isCurrentPath = false) {
	return new Promise((resolve, reject) => {
		const realPath = isCurrentPath
			? path.join(process.cwd(), 'out', fileName)
			: path.join(jsdocPath, fileName);
		const jsdoc = chunkList.map(ProcedureToJsdoc.printJsdocUnit).join('');
		FileWriter.writeFile(realPath, jsdoc)
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

			const replacedFileName = filePath
				.replace(/ /g, '-')
				.replace(/&/g, '_')
				.replace(/\(/g, '[')
				.replace(/\)/g, ']');

			writeFile(
				_.filter(procedureToJsdoc.procedureChunkList, chunk =>
					chunk.workNumbers.includes(procedureToJsdoc.workNumber)
				),
				`${replacedFileName}.js`,
				true
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
			writeFile(nestedList, `${db}.d.js`);
		});
	});
}

writeJsdocFile();

process.on('uncaughtException', err => {
	console.error('uncaughtException', err);
});

process.on('unhandledRejection', err => {
	console.error('unhandledRejection', err);
});
