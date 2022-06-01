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
			<comp-temp></comp-temp>
			<div class="cs_inperson__mylist_reply_master_wrap">
				<div class="cs_inperson__mylist_reply_master_title">
					<span class="cs_inperson__mylist_reply_master_ico_reply">[관리자 답변]</span>
					<span class="cs_inperson__mylist_reply_master_date">{{
						inquiryInfo.re_date
					}}</span>
				</div>
				<div class="cs_inperson__mylist_reply_master_txt_wrap">
					<pre class="cs_inperson__mylist_reply_master_txt">
											{{ inquiryInfo.response }}
										</pre>
				</div>
			</div>
			<pre class="cs_inperson__mylist_reply_txt_detail">
				{{ inquiryInfo.contents }}
						</pre>
			<template slot="hi">
				<div>슬롯이당께</div>
			</template>
		</div>
	</div>
</template>

<script id="photoPopup" fileSrc="../js/cTest.js" isSync="1" isTemplate="1">
import CompTemp from './CompTemp.vue';

console.log('허허');

console.log('hi');
/**
 * @typedef {Object} tableSchema
 * @property {string} [id=''] column id
 */

var defaultLabels = {
	first: 'First123544',
	last: 'Last',
	previous: 'Previous',
	next: 'Next'
};

export default {
	components: { CompTemp },
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
};
</script>
