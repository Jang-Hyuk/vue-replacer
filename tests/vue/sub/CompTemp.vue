<template>
	<div></div>
</template>

<script>
console.log('hi');
/**
 * @typedef {Object} tableSchema
 * @property {string} [id=''] column id
 */

var defaultLabels = {
	first: 'First',
	last: 'Last',
	previous: 'Previous',
	next: 'Next'
};

export default {
	props: {
		info: {
			type: Object,
			default() {
				return {};
			}
		},
		num: {
			type: Number,
			default: 0
		}
	},
	data() {
		return {
			isShow: 13
		};
	},
	created() {
		var vm = this;
		vm.on();
		vm.job();
	},

	template: '#c-talk-conts'
};
</script>
