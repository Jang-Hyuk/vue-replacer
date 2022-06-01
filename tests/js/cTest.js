const ttt = null;
$(function () {
	Vue.use(VueAwesomeSwiper);
	/* ### Vue */

	console.log('«„«„');

	console.log('hi');
	/**
	 * @typedef {Object} tableSchema
	 * @property {string} [id=''] column id
	 */

	var defaultLabels = {
		first: 'First123544',
		last: 'Last',
		previous: 'Previous',
		next: 'Next'
	};

	Vue.component('TalkConts', {
		data: function () {
			return {
				isShow: 121
			};
		},
		created: function () {
			var vm = this;
			vm.on();
			vm.job();
		},

		template: '#c-talk-conts'
	});
	/* ### !Vue */
});
