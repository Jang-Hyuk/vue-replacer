import _ from 'lodash';

const convertJsDoc = {
	/**
	 * 프로시저 출력
	 * @param {procedureChunk} procedureChunk
	 */
	printJsdocUnit(procedureChunk) {
		// console.log('🚀 ~ file: convertTs.js:9 ~ procedureChunk', procedureChunk);
		// LINK printJsdocUnit
		// 		// 프로시저 랩핑
		// 		const dbCompiled = _.template(`export namespace <%= db %>> {
		//       <%= pBody %>
		// }
		// `);

		const workNumbers = procedureChunk.workNumbers.map(number => `#${number}`).join(', ');
		const procedureCompiled = _.template(
			`  /** 
   * <%= comments %>
   * @summary <%= workNumbers %>
   */
  export namespace <%= procedure %> {
<%= typeBody %>
  }`
		);

		// const wrapping = convertJsDoc.createJsdocSection(procedureChunk);
		// Param 절
		const jsdocParam = convertJsDoc.createJsdocTypeDef(procedureChunk);
		// Row 절
		const chunkLength = procedureChunk.rows.length;
		const jsdocReturns = procedureChunk.rows
			.map((rowDataPacketsChunks, chunkIndex) => {
				return rowDataPacketsChunks
					.map((option, index) =>
						convertJsDoc.createJsdocTypeDef(
							procedureChunk,
							index,
							chunkIndex,
							chunkLength
						)
					)
					.join('\n');
			})
			.join('\n');

		return procedureCompiled({
			comments: procedureChunk.comments,
			workNumbers,
			procedure: procedureChunk.procedure,
			typeBody: `${jsdocParam}\n${jsdocReturns}`
		});

		return `${wrapping.start}\n${jsdocParam}\n${jsdocReturns}\n${wrapping.end}\n`;
	},

	/**
	 * 프로시저 Section Wrapping
	 * @summary Jsdoc
	 * @param {procedureChunk} procedureChunk
	 */
	createJsdocSection(procedureChunk) {
		const description = procedureChunk.procedure || '';
		const workNumbers = procedureChunk.workNumbers.map(number => `#${number}`).join(', ');
		const compiled = _.template(
			'/* <%= endTag %>SECTION <%= title %> <%= workNumbers  %> */'
		);
		const procedureCompiled = _.template(`
    <%= comments %> <%= workNumbers  %>
    export namespace <%= procedure %> {
      <%= typeBody %>
  }
`);
		return {
			start: compiled({ title: description, endTag: '', workNumbers }),
			end: compiled({ title: description, endTag: '!', workNumbers })
		};
	},

	/**
	 * 프로시저 Section Wrapping
	 * @summary Jsdoc
	 * @param {procedureChunk} procedureChunk
	 * @param {number} [rowIndex] 없으면 파람. 있으면 Row
	 * @param {number} [chunkIndex] 있으면 RowDataPacket[] Chunk index
	 * @param {number} [chunkLength] RowDataPacket[] Chunk length
	 */
	createJsdocTypeDef(procedureChunk, rowIndex, chunkIndex, chunkLength = 0) {
		// console.log('🚀 ~ file: convertTs.js:90 ~ chunkLength', chunkLength);
		let procedureOptions = procedureChunk.params;

		let descriptionName = 'Param';
		let chunkDescription = '';
		if (typeof rowIndex === 'number') {
			const rowChunkDesciptions = procedureChunk.rowChunkDesciptions[chunkIndex] ?? [];

			let rowChunkDescription = _.compact(rowChunkDesciptions).join(' ').trim();
			if (rowChunkDescription) {
				chunkDescription = `    /** ${rowChunkDesciptions} */\n`;
			}
			rowChunkDescription = rowChunkDescription
				? ` ${rowChunkDescription}`
				: rowChunkDescription;
			descriptionName =
				chunkLength > 1 ? `Row${rowIndex}_${chunkIndex}` : `Row${rowIndex}`;
			procedureOptions = procedureChunk.rows[chunkIndex][rowIndex];
		}

		const compiledType = _.template(
			`<%= chunkDescription %>    export type <%= descriptionName %> = {
<%= body.join('\\n') %>
    }`
		);
		const compiledTypeComment = _.template(
			'      /** <%= comment %> <%= dataType %> */\n'
		);
		const compiledTypeDesciption = _.template('      <%= key %>: <%= propertyType %>;');

		const body = procedureOptions.map(option => {
			const propertyType = Array.isArray(option.type)
				? option.type.map(v => (typeof v === 'number' ? v : `'${v}'`)).join('|')
				: option.type;

			const data = {
				propertyType,
				...option
			};

			const results = compiledTypeComment(data).concat(compiledTypeDesciption(data));

			return results;
		});
		return compiledType({
			chunkDescription,
			body,
			descriptionName,
			...procedureChunk
		});
	}
};

export default convertJsDoc;
