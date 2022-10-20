<template id="cDemo" isSync="1" isTemplate="1" fileSrc="../html/cDemo.html" depth="">
	<div>Hello {{ vrData }}</div>
</template>

<script id="jsCDemo" isSync="1" isTemplate="1" fileSrc="../js/cDemo.js" depth="">
export default {
	data() {
		return {
			vrData: 'vrComponent ют╢о╢ы.'
		};
	},
	template: '#cDemo'
};
</script>

<style></style>
