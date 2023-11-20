import _ from 'lodash';

const convertJsDoc = {
	/**
	 * 프로시저 출력
	 * @param {procedureChunk} procedureChunk
	 */
	printJsdocUnit(procedureChunk) {
		// LINK printJsdocUnit
		// 프로시저 랩핑
		const wrapping = convertJsDoc.createJsdocSection(procedureChunk);
		// Param 절
		const jsdocParam = convertJsDoc.createJsdocTypeDef(procedureChunk);
		// Row 절
		const chunkLength = procedureChunk.rows.length;
		const jsdocReturns = procedureChunk.rows
			.map((rowDataPacketsChunks, chunkIndex) => {
				let returns = rowDataPacketsChunks
					.map((option, index) =>
						convertJsDoc.createJsdocTypeDef(
							procedureChunk,
							index,
							chunkIndex,
							chunkLength
						)
					)
					.join('\n');

				if (chunkLength === 1) {
					const returnStr = rowDataPacketsChunks
						.map((v, index) => `Row${index}[]`)
						.join(', ');
					const compiledType = _.template(
						'/** @typedef {<%= rows %>} <%= procedureName %>.Rows */'
					);
					returns = returns.concat(
						compiledType({ rows: returnStr, procedureName: procedureChunk.procedureName })
					);
				}
				return returns;
			})
			.join('\n');

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
		let procedureOptions = procedureChunk.params;

		let descriptionName = 'Param';
		if (typeof rowIndex === 'number') {
			const rowChunkDesciptions = procedureChunk.rowChunkDesciptions[chunkIndex] ?? [];

			let rowChunkDescription = rowChunkDesciptions.join(' ').trim();
			rowChunkDescription = rowChunkDescription
				? ` ${rowChunkDescription}`
				: rowChunkDescription;
			descriptionName =
				chunkLength > 1
					? `Row${rowIndex}_${chunkIndex}${rowChunkDescription}`
					: `Row${rowIndex}${rowChunkDescription}`;
			procedureOptions = procedureChunk.rows[chunkIndex][rowIndex];
		}

		const compiled = _.template(
			`/**
 * LINK <%= descriptionName %>-<%= comments %>
 * @typedef {object} <%= procedureName %>.<%= descriptionName %>
 <%= body.join('\\n ') %>
 */`
		);
		const compiledProperty = _.template(
			`* @property {<%= propertyType %>} <%= key %> <%= comment %> <%= dataType %>`
		);
		const body = procedureOptions.map(option => {
			const propertyType = Array.isArray(option.type)
				? option.type.map(v => (typeof v === 'number' ? v : `'${v}'`)).join('|')
				: option.type;
			return compiledProperty({
				propertyType,
				...option
			});
		});
		return compiled({
			body,
			descriptionName,
			...procedureChunk
		});
	}
};

export default convertJsDoc;
