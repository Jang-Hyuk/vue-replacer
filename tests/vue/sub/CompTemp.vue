<template
	id="tplCompTemp"
	isTemplate="1"
	isSync="1"
	depth="2"
	fileSrc="../../html/cTest.html"
>
	<div>hello CompTemp!</div>
</template>

<script
	id="jsCompTemp"
	fileSrc="../../html/cTest.html"
	isSync="1"
	isTemplate="1"
	depth="1"
>
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
			isShow: 131
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

<style>
false
</style>
