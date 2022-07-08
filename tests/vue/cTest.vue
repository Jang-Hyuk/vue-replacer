<!-- 태수투 ss -->
<template
	id="photoPopup"
	isTemplate="1"
	isSync="1"
	depth="1"
	fileSrc="../html/cTest.html"
>
	<div v-if="isShow" id="photoPopup11" class="qmeet_pop_wrap qMeet_pop_wrap">
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
					<span class="cs_inperson__mylist_reply_master_date">
						{{ inquiryInfo.re_date }}
					</span>
				</div>
				<div class="cs_inperson__mylist_reply_master_txt_wrap">
					<pre class="cs_inperson__mylist_reply_master_txt">
												{{ inquiryInfo.response }}
												</pre
					>
				</div>
			</div>
			<pre class="cs_inperson__mylist_reply_txt_detail">
					{{ inquiryInfo.contents }}
							</pre
			>

			<template slot="hi">
				<div>슬롯이당께</div>
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
			isShow: 123456,
			한글: '테스트1'
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
	depth="1"
	fileSrc="../html/cTest.html"
>
table td {
	word-wrap: break-word !important;
	word-break: break-word !important;
}

.cs_inperson {
	margin: 94px 0 1131;
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
