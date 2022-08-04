import { config as dotConfig } from 'dotenv';
import path, { sep } from 'path';

import FileManager from '../FileManager.js';

dotConfig();

const rootPath = './';

const argvValue = process.argv.slice(2)[0];
const filePath = 'tests/vue/cTest.vue';

const config = {
	filePath: path.join(process.cwd(), filePath.replace(/\//g, sep)),
	isEucKr: true,
	fileSep: sep,
	isIeMode: argvValue === 'ie',
	adminFolder: process.env.ADMIN_FOLDER
};

const fileManager = new FileManager(rootPath, config);

fileManager.init();
console.log(fileManager.manageStorage);

const vuePath = 'D:\\infodev\\company\\vue-converter\\tests\\vue\\sub\\CompTemp.vue';
// const vuePath = 'D:\\infodev\\company\\vue-converter\\tests\\vue\\cTest.vue';
// const tplPath = 'D:\\infodev\\company\\vue-converter\\tests\\html\\cTest.html';
// const jsPath = 'D:\\infodev\\company\\vue-converter\\tests\\js\\cTest.js';

// setTimeout(() => {
// 	fileManager.onUpdateOtherFile(tplPath);
// }, 100);

fileManager.onUpdateVueFile(vuePath);

// setTimeout(() => {
// 	fileManager.onUpdateVueFile(vuePath);
// }, 1000);

// const cTestCommander = fileManager.getVueCommander(vuePath);

// console.log('🚀 ~ file: fileManage.js ~ line 27 ~ cTestCommander', cTestCommander);

// const cTestCommander = fileManager.getVueCommander(
// 	'D:\\infodev\\company\\vue-converter\\tests\\vue\\cTest.vue'
// );
