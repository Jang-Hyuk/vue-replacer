import path, { sep } from 'path';

import VueEncoder from '../VueEncoder.js';

const argvValue = process.argv.slice(2)[0];
// const filePath = 'tests/vue/cTest.vue';
const filePath = 'tests/vue/sub/CompTemp.vue';

const config = {
	filePath: path.join(process.cwd(), filePath.replace(/\//g, sep)),
	isEucKr: true,
	fileSep: sep,
	isIeMode: argvValue === 'ie'
};

const vueReplacer = new VueEncoder(config);
vueReplacer.init().then(() => {
	vueReplacer.encodeVueFile();
});
