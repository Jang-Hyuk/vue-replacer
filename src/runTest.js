import VueReplacer from './VueReplacer.js';
// import vueConverter from './vueConverter.js';
const targetPath = 'D:/infodev/company/vue-converter/tests/js/cTest.vue';
const vueReplacer = new VueReplacer(targetPath, true, '/');
// console.log('targetPath: ', targetPath);
vueReplacer.convertVueFile();
