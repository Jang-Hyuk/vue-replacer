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
			isShow: 123456,
			�ѱ�: '�׽�Ʈ1'
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
