var ttt = null;
$(function () {
	/* ### Vue */
	Vue.use(VueAwesomeSwiper);
	Vue.component('TalkConts', {
		data() {
			return {
				isShow: 1
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
