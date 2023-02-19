import _ from 'lodash';

const convertJsDoc = {
	/**
	 * 프로시저 출력
	 * @param {procedureChunk} procedureChunk
	 */
	printJsdocUnit(procedureChunk) {
		const workNumbers = procedureChunk.workNumbers.map(number => `#${number}`).join(', ');
		const procedureCompiled = _.template(
			`\n  /** 
   * <%= comments %>
   * @summary <%= workNumbers %>
   */
  export namespace <%= procedure %> {
<%= typeBody %>
  }`
		);

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
		let procedureOptions = procedureChunk.params;

		let descriptionName = 'Param';
		let chunkDescription = '';
		if (typeof rowIndex === 'number') {
			const rowChunkDesciptions = _.get(
				procedureChunk.rowChunkDesciptions,
				[chunkIndex, rowIndex],
				[]
			);

			let rowChunkDescription = _.compact(rowChunkDesciptions).join(' ').trim();
			if (rowChunkDescription) {
				chunkDescription = `    /** ${rowChunkDesciptions.join(', ')} */\n`;
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
				? option.type.map(v => (typeof v === 'number' ? v : `'${v}'`)).join(' | ')
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
