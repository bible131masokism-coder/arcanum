<script>
export default {
	emits: ["click", "confirm", "cancel"],

	/**
	 * @property {string} confirm - confirm display text.
	 * @property {string} cancel - cancel display text.
	 */
	props: ["confirm", "cancel"],

	data() {
		return {
			btnConfirm: this.confirm || "ยืนยัน",
			btnCancel: this.cancel || "ยกเลิก",
			confirming: false,
		};
	},

	methods: {
		/**
		 * @public
		 * Resets the confirm dialog when the Confirm prompt
		 * is no longer applicable.
		 */
		reset() {
			this.confirming = false;
		},
		mainClick() {
			this.confirming = true;
			this.$emit("click");
		},
		confirmClick() {
			this.confirming = false;
			this.$emit("confirm");
		},
		cancelClick() {
			this.confirming = false;
			this.$emit("cancel");
		},
	},
};
</script>

<template>
	<span class="my-span" v-if="confirming">
		<button type="button" @click="confirmClick">{{ btnConfirm }}</button>
		<button type="button" @click="cancelClick">{{ btnCancel }}</button>
	</span>
	<span v-else class="my-span">
		<button type="button" @click="mainClick"><slot>ลบ</slot></button>
	</span>
</template>

<style scoped>
span.my-span {
	display: contents;
}
</style>
