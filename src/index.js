import watch from 'node-watch';
import path, { sep } from 'path';
import _ from 'lodash';
import VueReplacer from './VueReplacer.js';

const rootPath = '../';

const argvValue = process.argv.slice(2)[0];
const filePath = 'tests/vue/cTest.vue';

const config = {
	filePath: path.join(process.cwd(), filePath.replace(/\//g, sep)),
	isEucKr: true,
	fileSep: sep,
	isIeMode: argvValue === 'ie'
};

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
			// only watch for js files
			return /\.vue$/.test(f);
		}
	},
	(event, filename) => {
		// console.log(`event is: ${event}`);
		if (filename) {
			// if (filename.indexOf('ftp-kr')) return false;
			console.log(`🐟 filename provided: ${filename}`);
			const vueReplacer = new VueReplacer(
				_.chain(config).clone().set('filePath', filename).value()
			);
			vueReplacer.convertVueFile();
		} else {
			console.log('😈 filename not provided');
		}
	}
);

console.info(
	`✅ start VueReplacer watcher !!! ${config.isIeMode ? '=== IE Mode ===' : ''}}`
);

process.on('uncaughtException', err => {
	console.error('uncaughtException', err);
});

process.on('unhandledRejection', err => {
	console.error('unhandledRejection', err);
});
