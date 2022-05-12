import _ from 'lodash';
import fs from 'fs';
import iconv from 'iconv-lite';

const vueStartDelimiterWord = '### Vue';
const vueEndDelimiterWord = '### !Vue';

/**
 * euc-kr 형식의 파일을 utf8 형식으로 변환하여 반환
 * @param {string} filePath
 * @returns {string}
 */
function getEuckrFile(filePath) {
	return new Promise(resolve => {
		try {
			fs.createReadStream(filePath)
				.pipe(iconv.decodeStream('euc-kr'))
				.collect((err, decodedBody) => {
					if (err) {
						resolve('');
					}
					resolve(decodedBody);
				});
		} catch (error) {
			resolve('');
		}
	});
}

/**
 * Vue Script 안의 내용을 인코딩 처리 후 가져옴
 * @alias Js Converter
 * @param {string} fileFullPath
 * @returns {string}
 */
async function getVueScript(fileFullPath = '') {
	const filePath = `${fileFullPath.slice(0, fileFullPath.lastIndexOf('.'))}.vue`;
	const file = await getEuckrFile(filePath);
	// console.log('file: ', file);

	if (!file.length) {
		return '';
	}

	return _.chain(file)
		.thru(str => str.slice(file.indexOf('export default'), file.lastIndexOf('</script>')))
		.replace('export default', '')
		.trim()
		.thru(str => str.slice(0, str.length - 1))
		.value();
}

/**
 * Vue script 안의 내용을 동일 {fileName}.js 에 쓰기 수행
 * @alias Js Converter
 * @param {string} vueBody
 * @param {string} fileFullPath=''
 * @returns {void}
 */
async function replaceVueScript(vueBody, fileFullPath = '') {
	// console.log('vueBody: ', vueBody);
	const filePath = `${fileFullPath.slice(0, fileFullPath.lastIndexOf('.'))}.js`;
	// console.log('filePath: ', filePath);
	const file = await getEuckrFile(filePath);
	// console.log('file: ', file);

	if (!file.length) {
		return false;
	}

	const startDelimiterIndex = file.indexOf(vueStartDelimiterWord);
	const endDelimiterIndex = file.lastIndexOf(vueEndDelimiterWord);

	// if (_.some([startDelimiterIndex, endDelimiterIndex], idx => idx === -1)) {
	if (_.includes([startDelimiterIndex, endDelimiterIndex], -1)) {
		console.log('delemiter 존재하지 않음', filePath);
		return false;
	}

	const jsFileStartIndex = file.indexOf('{', startDelimiterIndex);
	const jsFileEndIndex = file.lastIndexOf(vueEndDelimiterWord);

	if (jsFileStartIndex === -1 || jsFileEndIndex === -1) {
		return false;
	}

	const realJs = file
		.slice(0, jsFileStartIndex)
		.concat(vueBody, file.slice(file.slice(0, jsFileEndIndex).lastIndexOf('}') + 1));

	// console.log('realJs: ', realJs);

	// fs.writeFile(filePath, iconv.encode(realJs, 'euc-kr'), err => {
	// 	console.error(err);
	// });
	// return false;

	fs.writeFileSync(filePath, iconv.encode(realJs, 'euc-kr'), {
		encoding: 'binary'
	});
}

function fileCreator(fileFullPath = '') {
	const filePath = fileFullPath.slice(0, fileFullPath.lastIndexOf('.'));
	console.log('filePath: ', filePath);

	const jsFile = fs.readFileSync(`${filePath}.js`).toString();

	const jsFileStartIndex = jsFile.indexOf(vueStartDelimiterWord);
	const jsFileEndIndex = jsFile.lastIndexOf(vueEndDelimiterWord);

	const jsHeader = jsFile.slice(0, jsFileStartIndex);
	console.log(
		'jsHeader: ',
		_.chain(jsFile)
			.thru(str => str.slice(0, jsFileStartIndex + vueStartDelimiterWord.length))
			// .split('\r\n')
			// .initial()
			// .join('')
			.value()
	);
	const jsBody = jsFile.slice(jsFileStartIndex, jsFileEndIndex);
	console.log('jsBody: ', jsBody);
	const jsFooter = jsFile.slice(jsFileEndIndex);
	console.log(
		'jsFooter: ',
		_.chain(jsFile)
			.thru(str => str.slice(jsFileEndIndex))
			// .split('\r\n')
			// .tail()
			// .join('')
			.value()
	);

	// jsHeader.concat()

	// console.log('jsFooter: ', jsFooter);

	// jsFile.slice()

	vueFile.replace('<script>', '').replace('</script>', '');

	// console.log('fileContents: ', fileContents.toString());
}

async function convertVueFile(path) {
	// console.log('convertVueFile: ', path);
	const vueScript = await getVueScript(path);
	// console.log('vueScript: ', vueScript);
	// console.log('vueScript: ', vueScript);
	replaceVueScript(vueScript, path);
}

export default convertVueFile;
