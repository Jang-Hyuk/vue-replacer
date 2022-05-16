var ttt = null;
$(function () {
	/* ### Vue */
	Vue.use(VueAwesomeSwiper);
	Vue.component('TalkConts', {
		data: function () {
			return {
				isShow: 1
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
