const ttt = null;
$(function () {
	Vue.use(VueAwesomeSwiper);
	/* ### Vue */
	var defaultLabels = {
		first: 'First123544',
		last: 'Last',
		previous: 'Previous',
		next: 'Next'
	};

	Vue.component('TalkConts', {
		data: function () {
			return {
				isShow: 121,
				한글: '테스트?'
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
