<!-- 태수투 ss -->
<template
	id="photoPopup"
	isTemplate="0"
	isSync="1"
	depth="3"
	fileSrc="../html/cTest.html"
>
	<div v-if="isShow" id="photoPopup" class="qmeet_pop_wrap qMeet_pop_wrap">
		<div class="qmeet_banner">
			<!-- 배너영역 슬라이드-->
			<div class="qMeet_pop_evnt_bg" onclick="history.back()"></div>
			<div class="qmeet_banner__wrap">
				<button class="qMeet_pop_cls" onclick="history.back()">닫기</button>
				<div class="qmeet_banner__pagination"></div>
				<!-- 페이지네이션영역 -->
			</div>
			<template slot="hi">
				<div>슬롯이당께</div>
			</template>
		</div>
	</div>
</template>

<script id="photoPopup" isSync="1">
console.log('hi');
export default {
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
};
</script>
