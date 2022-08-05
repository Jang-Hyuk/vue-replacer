<!-- 태수투 ss -->
<template
	id="photoPopup"
	isTemplate="0"
	isSync="1"
	depth="0"
	fileSrc="../html/cTest.html"
>
	<div v-if="isShow" id="photoPopup11" class="qmeet_pop_wrap qMeet_pop_wrap">
		<div class="qmeet_banner">
			<div class="qMeet_pop_evnt_bg" onclick="history.back()"></div>
			<comp-temp></comp-temp>

			<template slot="hi">
				<div>슬롯이</div>
			</template>
		</div>
	</div>
</template>

<script id="JsPhotoPopup" fileSrc="../js/cTest.js" isSync="1" isTemplate="1" depth="1">
var defaultLabels = {
	first: 'First',
	last: 'Last',
	previous: 'Previous',
	next: 'Next'
};

export default {
	components: { CompTemp },
	data() {
		return {
			isShow: 1,
			한글: '테스하15'
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

<style
	id="cssPhotoPopup"
	isSync="1"
	isTemplate="1"
	depth="0"
	fileSrc="../html/cTest.html"
>
table td {
	word-wrap: break-word !important;
	word-break: break-word !important;
}

.cs_inperson {
	margin: 94px 0 1;
}

/* #8072 자주하는질문(FAQ) */
.cs_inperson__faq {
	padding: 0 0 60px 0;
}

.hello {
	color: aliceblue;
}

/* #8072 자주하는질문(FAQ) 끝 */
</style>
