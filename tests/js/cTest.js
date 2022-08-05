/* ### Vue JsPhotoPopup */
var defaultLabels = {
	first: 'First',
	last: 'Last',
	previous: 'Previous',
	next: 'Next'
};

Vue.component('TalkConts', {
	components: { CompTemp: CompTemp },
	data: function () {
		return {
			isShow: 1,
			한글: '테스하15'
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
