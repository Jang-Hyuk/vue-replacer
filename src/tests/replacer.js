import watch from 'node-watch';
import path, { sep } from 'path';
import { config as dotConfig } from 'dotenv';
import _ from 'lodash';

import FileManager from '../FileManager.js';

dotConfig();

const rootPath = path.join(process.cwd());
const argvValue = process.argv.slice(2)[0];

const config = {
	isEucKr: true,
	fileSep: sep,
	isIeMode: argvValue === 'ie',
	adminFolder: process.env.ADMIN_FOLDER
};

const fileManager = new FileManager(rootPath, config);

fileManager.init();

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

			return /\.vue$|\.js$|\.css|\.html|\.php/.test(f);
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

console.info(
	`✅ start VueReplacer watcher !!! ${config.isIeMode ? '👹👹👹 IE Mode 💩💩💩' : ''}`
);

process.on('uncaughtException', err => {
	console.error('uncaughtException', err);
});

process.on('unhandledRejection', err => {
	console.error('unhandledRejection', err);
});
