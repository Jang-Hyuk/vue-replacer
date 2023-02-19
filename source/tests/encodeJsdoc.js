import _ from 'lodash';
import dotenv from 'dotenv';
import path, { sep } from 'path';

import FileWriter from '../FileWriter.js';
import ProcedureToJsdoc from '../ProcedureToJsdoc.js';
import convertJsdoc from '../convertJsdoc.js';
import convertTs from '../convertTs.js';

dotenv.config();
const docPath = path.join(process.cwd(), 'build');
const jsdocPath = path.join(process.cwd(), 'out');
// const argvValue = process.argv.slice(2)[0];

/** @type {c_conts.p_realtalk_proc.Row1_5}  */

const filePaths = [
	'#0001 talk.txt'
	// '#0002 talk.txt',
	// '#8556 어드민] 빠른만남 무료이용권 내역표기.txt',
	// '#8670 (어드민) 푸시 변경 및 현황추가.txt',
	// '#6666 sample3.txt'
	// 'sample3 copy.txt'
	// '#6866 20211201_클럽5678_다중채팅_스타샷_설명.txt'
];

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
	const docFilePaths = filePaths;

	const results = await docFilePaths.reduce((task, filePath) => {
		return task.then(async chunks => {
			const realFilePath = path.join(docPath, filePath.replace(/\//g, sep));
			const procedureToJsdoc = new ProcedureToJsdoc(realFilePath, chunks);
			await procedureToJsdoc.init();
			// 개별 파일 생성은 하지 않음
			// const replacedFileName = _.chain(filePath)
			// 	.replace(/ /g, '-')
			// 	.replace(/&/g, '_')
			// 	.replace(/\(/g, '[')
			// 	.replace(/\)/g, ']')
			// 	.split('.')
			// 	.initial()
			// 	.join('.')
			// 	.value();

			// writeFile(
			// 	_.filter(procedureToJsdoc.procedureChunkList, chunk =>
			// 		chunk.workNumbers.includes(procedureToJsdoc.workNumber)
			// 	),
			// 	{
			// 		dbName: procedureToJsdoc.workNumber.toString(),
			// 		fileName: replacedFileName,
			// 		isCurrentPath: true
			// 	}
			// );

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

writeJsdocFile();

process.on('uncaughtException', err => {
	console.error('uncaughtException', err);
});

process.on('unhandledRejection', err => {
	console.error('unhandledRejection', err);
});
