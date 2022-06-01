import path from 'path';

import VueReplacer from './VueReplacer.js';
import VueRestorer from './VueRestorer.js';
// import vueConverter from './vueConverter.js';
const targetPath = path.join(process.cwd(), 'tests/js/cTest.vue');
const vueReplacer = new VueReplacer(targetPath, true, '\\');
const vueRestorer = new VueRestorer(targetPath, true, '\\');
console.log('targetPath: ', targetPath);
vueReplacer.convertVueFile();
// vueRestorer.convertVueFile();
