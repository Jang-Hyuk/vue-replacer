import _ from 'lodash';

import VueReplacer from './VueReplacer.js';

import './type.d.js';

class VueDecoder extends VueReplacer {
	/**
	 * Vue 파일 변경될 경우 변환 작업 처리
	 * @param {string} path fileFullPath
	 */
	async decodeVueFile() {
		try {
			this.vueParser.tplFileInfo.task = this.parseOtherFile;
			this.vueParser.scriptFileInfo.task = this.parseScriptFile;
			this.vueParser.styleFileInfo.task = this.parseOtherFile;

			const fileConfigs = [
				this.vueParser.tplFileInfo,
				this.vueParser.scriptFileInfo,
				this.vueParser.styleFileInfo
			].filter(config => config.isExistFile);

			const promiseList = _.chain(fileConfigs)
				// .filter(config => config.isSync)
				.groupBy('filePath')
				.map((configList, filePath) => {
					return new Promise(resolve => {
						this.fileReader
							.getFile(filePath)
							.then(fileConts => {
								configList.forEach(config => {
									config.task
										.call(this, config, fileConts)
										.then(contents => {
											config.contents = contents;
											// 중복해서 resolve가 발생하지만 로직상 문제는 없으므로 그냥 둠
											resolve(true);
										})
										.catch(error => {
											console.error(error);
											resolve(true);
										});
								});
							})
							.catch(err => {
								console.error(err);
								resolve(true);
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
			const results = restoreVueFile.call(this, this.vuefile);
			await this.fileWriter.writeFile(this.vueFilePath, results);
			console.log('💦 decode complete', this.vueFilePath);
			// node-watch 인식하는데 시간이 걸리니 딜래이를 둠
			await VueReplacer.delay(1000);
			// 옵저버가 부착되어있다면 공지
			this.notifyCompleteDecode();
		} catch (error) {
			console.error(error);
		}
	}

	/**
	 * Script 영역 분석
	 * @param {replaceTargetFileInfo} config
	 * @param {string} fileConts 파일 내용
	 */
	async parseScriptFile(config, fileConts) {
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
	}

	/**
	 * Template, Style 분석
	 * @param {replaceTargetFileInfo} config
	 * @param {string} fileConts 파일 내용
	 */
	async parseOtherFile(config, fileConts) {
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
	}

	/**
	 * 파일 복원 계산
	 * @param {string} vueFile vue 파일
	 * @param {string} source 바꿔치기할 내용
	 * @param {object} config
	 * @param {string} [config.endDelimiter] 영역이 끝나는 지점 구분자
	 * @param {string} config.chunkStartDelimiter 잘라낼 청크 시작 구분자
	 * @param {string} config.chunkEndDelimiter 잘라낼 청크 끝 구분자
	 */
	restore(vueFile, source, config) {
		if (typeof source !== 'string') {
			return vueFile;
		}
		const { chunkEndDelimiter, chunkStartDelimiter, endDelimiter = '' } = config;

		let nextChunkIndex = vueFile.lastIndexOf(endDelimiter);
		nextChunkIndex = nextChunkIndex === -1 ? vueFile.length - 1 : nextChunkIndex;

		const rangeStartIndex = _.chain(vueFile.indexOf(chunkStartDelimiter))
			.thru(index => vueFile.indexOf('>', index))
			.value();
		const rangeEndIndex = _.chain(vueFile.slice(0, nextChunkIndex))
			.thru(tSrc => tSrc.lastIndexOf(chunkEndDelimiter))
			.value();

		const header = vueFile.slice(0, rangeStartIndex + 1);
		const footer = vueFile.slice(rangeEndIndex);

		return `${header}${this.NEW_LINE}${source}${this.NEW_LINE}${footer}`;
	}

	/**
	 * Vue Template 안의 내용을 동일 영역 교체 수행
	 * @param {string} vueFile
	 */
	restoreTemplate(vueFile) {
		if (!this.vueParser.tplFileInfo.isExistFile) {
			return vueFile;
		}
		const chunkStartDelimiter = '<template';
		const chunkEndDelimiter = '</template>';
		const endDelimiter = '<script';

		return this.restore(vueFile, this.vueParser.tplFileInfo.contents, {
			chunkStartDelimiter,
			chunkEndDelimiter,
			endDelimiter
		});
	}

	/**
	 * Vue script 안의 내용을 동일 영역 교체 수행
	 * @param {string} vueFile
	 */
	restoreScript(vueFile) {
		if (!this.vueParser.scriptFileInfo.isExistFile) {
			return vueFile;
		}
		const chunkStartDelimiter = '<script';
		const chunkEndDelimiter = '</script>';
		const endDelimiter = '<style';

		return this.restore(vueFile, this.vueParser.scriptFileInfo.contents, {
			chunkStartDelimiter,
			chunkEndDelimiter,
			endDelimiter
		});
	}

	/**
	 * Vue style 안의 내용을 동일 영역 교체 수행
	 * @param {string} vueFile
	 */
	restoreStyle(vueFile) {
		if (!this.vueParser.styleFileInfo.isExistFile) {
			return vueFile;
		}
		const chunkStartDelimiter = '<style';
		const chunkEndDelimiter = '</style>';

		return this.restore(vueFile, this.vueParser.styleFileInfo.contents, {
			chunkStartDelimiter,
			chunkEndDelimiter
		});
	}
}

export default VueDecoder;
