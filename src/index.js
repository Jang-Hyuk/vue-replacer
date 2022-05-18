import watch from 'node-watch';
import VueReplacer from './VueReplacer.js';

const rootPath = '../';

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
			console.log(`🐟 filename provided: ${filename}`);
			const vueReplacer = new VueReplacer(filename);
			vueReplacer.convertVueFile();
		} else {
			console.log('😈 filename not provided');
		}
	}
);

console.info('✅ start VueReplacer watcher !!!');

process.on('uncaughtException', err => {
	console.error('uncaughtException', err);
});

process.on('unhandledRejection', err => {
	console.error('unhandledRejection', err);
});
