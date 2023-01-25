import path, { sep } from 'path';

import ProcedureToJsdoc from './ProcedureToJsdoc.js';

const argvValue = process.argv.slice(2)[0];

const filePath = 'build/20221115_클럽_용_쿠폰_설명.txt';
// const filePath = 'build/20220714_클럽5678_임_무제한정지자 data삭제 관련_설명.txt';
// const filePath = 'build/sample3.txt';
const realFilePath = path.join(process.cwd(), filePath.replace(/\//g, sep));
console.log('🚀 ~ file: index.js:9 ~ realFilePath', realFilePath);

const procedureToJsdoc = new ProcedureToJsdoc(realFilePath);

await procedureToJsdoc.init();
