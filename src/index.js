import watch from 'node-watch';
import path, { sep } from 'path';
import { config as dotConfig } from 'dotenv';
import _ from 'lodash';

import FileManager from './FileManager.js';

dotConfig();

const rootPath = path.join(process.cwd(), process.env.ROOT_FOLDER ?? '..');
const argValue = process.argv.slice(2)[0] ?? '';
const argList = argValue.split('-');

const config = {
	isEucKr: true,
	fileSep: sep,
	isIeMode: argList.includes('ie'),
	adminFolder: process.env.ADMIN_FOLDER
};

const fileManager = new FileManager(rootPath, config);

console.time('fileManager ready-to-run time');

/**
 * Vue Replacer 구동
 */
async function operationWatch() {
	fileManager.init();
	console.timeEnd('fileManager ready-to-run time');

	await Promise.all(fileManager.vueCommanderPendingList);

	// 디코딩 모든 파일
	if (argList.includes('dec')) {
		await fileManager.decodeAllFile();
	}

	// 인코딩 모든 파일
	if (argList.includes('enc')) {
		await fileManager.encodeAllFile();
	}

	console.info(
		`✅ start VueReplacer watcher !!! ${config.isIeMode ? '👹👹👹 IE Mode 💩💩💩' : ''}`
	);

	// 워치 동작
	watch(
		rootPath,
		{
			recursive: true,
			filter(f, skip) {
				// skip node_modules
				if (/\/node_modules/.test(f)) return skip;
				// skip .git folder
				if (/\.git/.test(f)) return skip;
				// skip temp file
				const ignoreDelimiter = _(f.split('.')).nth(-2);
				if (_.toLower(ignoreDelimiter) === 'temp') return skip;

				return /\.vue$|\.js$|\.css|\.html|\.php|\.twig/.test(f);
			}
		},
		(event, filename) => {
			const fileExt = filename.split('.').pop().toLocaleLowerCase();
			console.log(`🐟 filename provided: ${filename}`);

			if (!filename) {
				console.log('😈 filename not provided');
				return false;
			}

			if (fileExt === 'vue') {
				fileManager.onUpdateVueFile(filename);
			} else {
				fileManager.onUpdateOtherFile(filename);
			}
		}
	);
}

operationWatch();

process.on('uncaughtException', err => {
	console.error('uncaughtException', err);
});

process.on('unhandledRejection', err => {
	console.error('unhandledRejection', err);
});
