var ttt = null;
$(function () {
	Vue.use(VueAwesomeSwiper);
	/* ### Vue */
	Vue.component('TalkConts', {
		data() {
			return {
				isShow: 12
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
