import path, { sep } from 'path';

import VueDecoder from '../VueDecoder.js';

// const filePath = process.argv.slice(2)[0];
const filePath = 'tests/vue/cTest.vue';
// const filePath = 'tests/vue/sub/CompTemp.vue';

const config = {
	filePath: path.resolve(process.cwd(), filePath.replace(/\//g, sep)),
	isEucKr: true,
	fileSep: sep,
	isIeMode: false
};

const vueReplacer = new VueDecoder(config);
vueReplacer.init().then(() => {
	vueReplacer.decodeVueFile();
});
