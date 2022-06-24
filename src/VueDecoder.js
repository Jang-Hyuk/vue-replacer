import _ from 'lodash';

import VueReplacer from './VueReplacer.js';

import './type.d.js';

class VueDecoder extends VueReplacer {
	/**
	 * Vue 파일 변경될 경우 변환 작업 처리
	 * @param {string} path fileFullPath
	 */
	async decodeVueFile() {
		this.vueParser.tplFileInfo.task = this.parseOtherFile;
		this.vueParser.scriptFileInfo.task = this.parseScriptFile;
		this.vueParser.styleFileInfo.task = this.parseOtherFile;

		const fileConfigs = [
			this.vueParser.tplFileInfo,
			this.vueParser.scriptFileInfo,
			this.vueParser.styleFileInfo
		];

		const promiseList = _.chain(fileConfigs)
			.filter(config => config.filePath.length)
			.groupBy('filePath')
			.map((configList, filePath) => {
				return new Promise(resolve => {
					this.fileReader.getFile(filePath).then(fileConts => {
						configList.forEach(config => {
							config.task.call(this, config, fileConts).then(contents => {
								config.contents = contents;
								// 중복해서 resolve가 발생하지만 로직상 문제는 없으므로 그냥 둠
								resolve(true);
							});
						});
					});
				});
			})
			.value();

		await Promise.all(promiseList);

		const restoreVueFile = _.flow(
			this.restoreTemplate,
			this.restoreScript,
			this.restoreStyle
		);
		console.log('vue file 쓰기 필요');

		await this.fileWriter.writeFile(this.vueFilePath, restoreVueFile(this.vuefile));

		console.log('decode complete');
	}

	/**
	 * Script 영역 분석
	 * @param {replaceTargetFileInfo} config
	 * @param {string} fileConts 파일 내용
	 */
	async parseScriptFile(config, fileConts) {
		try {
			const { targetFile, delimiterFileInfo } = await this.parseDelimiterFile(
				config,
				fileConts
			);

			if (!targetFile.length) {
				return '';
			}
			const { contents = '' } = delimiterFileInfo;

			const vueOptDelimiter = this.vueParser.scriptFileInfo.isTemplate
				? 'Vue.component'
				: 'new Vue';

			const vueOptDelimiterIndex = targetFile.indexOf(vueOptDelimiter);
			if (vueOptDelimiterIndex === -1) {
				throw new Error('유효한 vue delemiter가 존재하지 않습니다.');
			}

			return _.chain(contents.slice(0, contents.lastIndexOf(')')))
				.split(this.NEW_LINE)
				.tail()
				.map(str => {
					if (str.indexOf(vueOptDelimiter) !== -1) {
						return 'export default {';
					}
					return str;
				})
				.join(this.NEW_LINE)
				.value();
		} catch (error) {
			console.error(error);
			return '';
		}
	}

	/**
	 * Template, Style 분석
	 * @param {replaceTargetFileInfo} config
	 * @param {string} fileConts 파일 내용
	 */
	async parseOtherFile(config, fileConts) {
		try {
			const { targetFile, delimiterFileInfo } = await this.parseDelimiterFile(
				config,
				fileConts
			);

			if (!targetFile.length) {
				return '';
			}
			const { contents = '' } = delimiterFileInfo;

			return _(contents)
				.split(this.NEW_LINE)
				.initial()
				.tail()
				.thru(contsArr => {
					// script or template 태그 제거
					if (config.isTemplate) {
						return _(contsArr).initial().tail().value();
					}
					return contsArr;
				})
				.join(this.NEW_LINE);
		} catch (error) {
			console.error(error);
			return '';
		}
	}

	/**
	 *
	 * @param {replaceTargetFileInfo} config
	 */
	getRestoreRangeIndex(config) {
		const {} = config;
	}

	/**
	 * Vue script 안의 내용을 동일 {fileName}.js 영역 교체 수행
	 * @param {string} vueFile
	 */
	restoreTemplate(vueFile) {
		return vueFile;
	}

	/**
	 * Vue script 안의 내용을 동일 {fileName}.js 영역 교체 수행
	 * @param {string} vueFile
	 */
	restoreScript(vueFile) {
		return vueFile;
	}

	/**
	 * Vue script 안의 내용을 동일 {fileName}.js 영역 교체 수행
	 * @param {string} vueFile
	 */
	restoreStyle(vueFile) {
		return vueFile;
	}
}

export default VueDecoder;
