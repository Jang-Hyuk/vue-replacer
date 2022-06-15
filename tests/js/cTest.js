/* ### Vue JsPhotoPopup */
var defaultLabels = {
	first: 'First',
	last: 'Last',
	previous: 'Previous',
	next: 'Next'
};

Vue.component('TalkConts', {
	data: function () {
		return {
			isShow: 12345,
			한글: '테스트1'
		};
	},
	created: function () {
		var vm = this;
		vm.on();
		vm.job();
	},

	template: '#c-talk-conts'
});
/* ### !Vue JsPhotoPopup */
