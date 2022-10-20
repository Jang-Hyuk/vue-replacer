<template
	id="instanceDemo"
	isSync="1"
	isUtf8="1"
	fileSrc="../html/instanceDemo.html"
	depth=""
>
	<div id="instanceDemoEl">
		안녕1 {{ vrData }}
		<c-demo></c-demo>
	</div>
</template>

<script id="jsInstanceDemo" isSync="1" isUtf8="1" fileSrc="../js/instanceDemo.js">
export default {
	el: '#instanceDemoEl',
	data() {
		return {
			vrData: '슈밤1'
		};
	}
};
</script>

<style
	id="cssInstanceDemo"
	isSync="0"
	isUtf8="1"
	fileSrc="../html/instanceDemo.html"
	depth=""
>
table td {
	word-wrap: break-word !important;
	word-break: break-word !important;
}
</style>
