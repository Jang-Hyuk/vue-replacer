import path, { sep } from 'path';

import VueReplacer from './VueReplacer.js';

const argvValue = process.argv.slice(2)[0];
const filePath = 'tests/vue/cTest.vue';

const config = {
	filePath: path.join(process.cwd(), filePath.replace(/\//g, sep)),
	isEucKr: true,
	fileSep: sep,
	isIeMode: argvValue === 'ie'
};

const vueReplacer = new VueReplacer(config);

vueReplacer.convertVueFile();
