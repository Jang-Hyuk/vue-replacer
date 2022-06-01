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
	
	data() {
		return {
			isShow: 121
		};
	},
	created() {
		var vm = this;
		vm.on();
		vm.job();
	},

	template: '#c-talk-conts'
});
	/* ### !Vue */
});
