<script>
/**
 * Not currenty used because Firebase has an OpenSource
 * registration dialog/component.
 * Could be used with alternative save-frameworks.
 */
export default {
	data() {
		return {
			email: null,
			pw: null,
			err: null,
			sent: false,
		};
	},
	mounted() {
		this.listen("register-sent", this.onRegister, this);
		this.listen("register-error", this.onError, this);
	},
	beforeUnmount() {
		this.removeListener("register-sent", this.onRegister, this);
		this.removeListener("register-error", this.onError, this);
	},
	methods: {
		register() {
			if (!this.email) {
				this.err = "ต้องกรอกอีเมล";
			} else if (!this.pw) {
				this.err = "ต้องกรอกรหัสผ่าน";
			} else {
				this.dispatch("try-register", this.email, this.pw);
				this.email = null;
			}
		},

		onRegister() {
			this.err = "ส่งอีเมลยืนยันแล้ว\nกรุณาตรวจสอบโฟลเดอร์จดหมายขยะ";
		},

		onError(err) {
			console.dir(err);
			this.err = err.message;
		},
	},
};
</script>

<template>
	<div class="popup">
		<div v-if="err">{{ err }}</div>
		<div v-if="!sent">
			<input type="email" placeholder="email@email.com" v-model="email" />
			<input type="password" placeholder="รหัสผ่าน" v-model="pw" />
			<input type="submit" value="สมัครสมาชิก" @click="register" />
			<button type="button" @click="$emit('close')">ยกเลิก</button>
		</div>
	</div>
</template>
