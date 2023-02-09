import _ from 'lodash';
import dotenv from 'dotenv';
import path, { sep } from 'path';

import BaseUtil from '../../src/BaseUtil.js';

import FileWriter from '../FileWriter.js';
import ProcedureToJsdoc from '../ProcedureToJsdoc.js';

dotenv.config();
const docPath = path.join(process.cwd(), process.env.JSDOC_DOC_FOLTER ?? 'build');
const jsdocPath = path.join(process.cwd(), process.env.JSDOC_OUT_FOLTER ?? 'out');
// const argvValue = process.argv.slice(2)[0];

// const filePath = 'build/#0001 talk.txt';
// const filePath = 'build/#0002 talk.txt';
// const filePath = 'build/#9213 20221115_클럽_용_쿠폰_설명.txt';
// const filePath = 'build/#8670 20220714_클럽5678_임_무제한정지자 data삭제 관련_설명.txt';
// const filePath = 'build/#6666 sample3.txt';
// const filePath = 'build/#6866 20211201_클럽5678_다중채팅_스타샷_설명.txt';

const filePaths = [
  // 'build/#0001 talk.txt',
  'build/#0002 talk.txt',
	// 'build/#9213 20221115_클럽_용_쿠폰_설명.txt',
	// 'build/#8670 20220714_클럽5678_임_무제한정지자 data삭제 관련_설명.txt',
	// '#6666 sample3.txt',
	// 'sample3 copy.txt'
	// 'build/#6866 20211201_클럽5678_다중채팅_스타샷_설명.txt'
];
const realFilePath = path.join(process.cwd(), filePaths[0].replace(/\//g, sep));
console.log('🚀 ~ file: index.js:9 ~ realFilePath', realFilePath);

const procedureToJsdoc = new ProcedureToJsdoc(realFilePath);

await procedureToJsdoc.init();


process.on('uncaughtException', err => {
	console.error('uncaughtException', err);
});

process.on('unhandledRejection', err => {
	console.error('unhandledRejection', err);
});
