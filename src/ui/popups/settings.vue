<script>
import Settings from "modules/settings";
import { centerX } from "@/ui/popups/popups";
import tasks from "ui/sections/tasks.vue";
import resources from "ui/panes/resources.vue";
import Menu from "@/ui/components/menu.vue";
import Game from "@/game.js";
import ItemsBase from "ui/itemsBase.js";

/**
 * @emits save-settings
 * @emits setting
 */
export default {
	mixins: [ItemsBase],
	components: {
		"vue-menu": Menu,
		resources,
		tasks,
	},
	emits: ["close-settings"],

	data() {
		let vars = Settings.vars;
		let curview = Settings.get("curview") || "sect_settings_main";

		return {
			psection: null,
			sCompactMode: vars.compactMode,
			sDarkMode: vars.darkMode,
			sSmoothBars: vars.smoothBars,
			sDebugRate: vars.debugRate,
			sTotalRate: vars.totalRate,
			sEnsureMaxProduction: vars.ensureMaxProduction,
			sSpeedupFactor: vars.speedupFactor,
			saves: Object.assign({}, Settings.getSubVars("saves")),
		};
	},

	updated() {
		centerX(this.$el);
	},

	created() {
		this.psection = Game.state.sections.find(v => v.id === "sect_settings_main");
		for (let p in Settings.vars) {
			this.dispatch("setting", p, Settings.vars[p]);
		}
	},

	methods: {
		clear() {},

		close() {
			this.dispatch("save-settings");
			this.$emit("close-settings");
		},
	},

	computed: {
		menuItems() {
			return Game.state.sections.filter(it => it.parent === "settings");
		},
		compactMode: {
			get() {
				return this.sCompactMode;
			},
			set(v) {
				Settings.set("compactMode", v);
				this.sCompactMode = v;
				this.dispatch("setting", "compactMode", v);
			},
		},
		autosave: {
			get() {
				return this.saves.autosave;
			},
			set(v) {
				this.saves.autosave = Settings.setSubVar("saves", "autosave", v);
				this.dispatch("setting", "autosave", v);
			},
		},
		darkMode: {
			get() {
				return this.sDarkMode;
			},
			set(v) {
				Settings.set("darkMode", v);
				this.sDarkMode = v;
				this.dispatch("setting", "darkMode", v);
			},
		},
		smoothBars: {
			get() {
				return this.sSmoothBars;
			},
			set(v) {
				Settings.set("smoothBars", v);
				this.sSmoothBars = v;
				this.dispatch("setting", "smoothBars", v);
			},
		},
		debugRate: {
			get() {
				return this.sDebugRate;
			},
			set(v) {
				Settings.set("debugRate", v);
				this.sDebugRate = v;
				this.dispatch("setting", "debugRate", v);
			},
		},
		totalRate: {
			get() {
				return this.sTotalRate;
			},
			set(v) {
				Settings.set("totalRate", v);
				this.sTotalRate = v;
				this.dispatch("setting", "totalRate", v);
			},
		},
		ensureMaxProduction: {
			get() {
				return this.sEnsureMaxProduction;
			},
			set(v) {
				Settings.set("ensureMaxProduction", v);
				this.sEnsureMaxProduction = v;
				this.dispatch("setting", "ensureMaxProduction", v);
			},
		},
		speedupFactor: {
			get() {
				return this.sSpeedupFactor;
			},
			set(v) {
				Settings.set("speedupFactor", v);
				this.sSpeedupFactor = v;
				this.dispatch("setting", "speedupFactor", v);
			},
		},
		autoSaveTip() {
			return "บันทึกเกมปัจจุบันเป็นระยะ";
		},
	},
};
</script>

<template>
	<div :class="['settings', 'popup']">
		<vue-menu class="game-mid" :items="menuItems" v-model="psection">
			<template #sect_settings_main>
				<div>
					<label :for="elmId('dark-mode')">โหมดมืด</label>
					<input type="checkbox" :id="elmId('dark-mode')" v-model="darkMode" />
				</div>
				<div>
					<label :for="elmId('compact-mode')">โหมดกะทัดรัด</label>
					<input type="checkbox" :id="elmId('compact-mode')" v-model="compactMode" />
				</div>

				<div>
					<label :for="elmId('smooth-bars')">แถบเลื่อนเรียบ</label>
					<input type="checkbox" :id="elmId('smooth-bars')" v-model="smoothBars" />
				</div>
				<div>
					<label :for="elmId('auto-save')">บันทึกอัตโนมัติ</label>
					<input type="checkbox" :id="elmId('auto-save')" v-model="autosave" />
					<div class="calc-text">
						บันทึกเกมลงในหน่วยความจำเป็นระยะ โดยค่าเริ่มต้นเกมจะถูกบันทึกลงในหน่วยความจำของเบราว์เซอร์
					</div>
				</div>
			</template>
			<template #sect_settings_extra>
				<h3>สถิติทูลทิป</h3>
				<div>
					<label :for="elmId('debug-rate')">ขยายอัตราทรัพยากร</label>
					<input type="checkbox" :id="elmId('debug-rate')" v-model="debugRate" />
					<div class="calc-text">
						แสดงรายได้ทรัพยากรที่คำนวณได้จากอัตราที่ปรับแล้ว R ตัวแปลง C ภารกิจที่กำลังดำเนิน T และบัฟ B
					</div>
				</div>
				<div>
					<label :for="elmId('total-rate')">แสดงผลรวมของภารกิจ</label>
					<input type="checkbox" :id="elmId('total-rate')" v-model="totalRate" />
					<div class="calc-text">
						แสดงค่าใช้จ่ายที่เหลือต้องจ่ายและทรัพยากรที่ต้องได้จนกว่าจะสำเร็จครั้งถัดไป (สำหรับภารกิจที่มีระยะเวลาสำเร็จมากกว่า 1 วินาที)
					</div>
				</div>
				<h3>การปรับการเล่นเกม</h3>
				<div>
					<label :for="elmId('ensure-max')">โหมดประสิทธิภาพสูงสุด</label>
					<input type="checkbox" :id="elmId('ensure-max')" v-model="ensureMaxProduction" />
					<div class="calc-text">
						การกระทำจะเกิดขึ้นเมื่อผลลัพธ์สามารถเก็บได้ครบเท่านั้น<br />
						คำเตือน! โหมดนี้อาจทำให้คุณไม่สามารถเติมทรัพยากรจนเต็มได้ แต่จะช่วยป้องกันการผลิตที่สูญเปล่า
					</div>
				</div>
				<div>
					<label :for="elmId('speedup-factor')">ความเร็วเร่งเวลา</label>
					<input
						type="number"
						min="1"
						max="1000"
						required
						:id="elmId('speedup-factor')"
						v-model="speedupFactor" />
					<div class="calc-text">
						ตัวคูณความเร็วสำหรับฟีเจอร์เร่งเวลา ไม่แนะนำให้ตั้งเกิน 25 ขึ้นอยู่กับประสิทธิภาพของเครื่องคอมพิวเตอร์ของคุณ
					</div>
				</div>
			</template>
		</vue-menu>
		<hr />

		<div class="buttons">
			<span>
				<confirm @confirm="dispatch('reset')">ล้างจอมเวท</confirm>
				<confirm @confirm="dispatch('resetHall')">ล้างเซฟห้องโถง</confirm>
			</span>

			<button type="button" class="close" @click="close">ปิด</button>
		</div>
	</div>
</template>

<style scoped>
.settings {
	height: auto;
	min-height: 17rem;
	min-width: 30%;
	max-width: 60%;
	position: absolute;
	z-index: 10000;
	top: 3rem;
	background: var(--background-color);
	border: var(--popup-border);
	border-radius: 0.2rem;
	padding: var(--md-gap);
}

hr {
	margin-bottom: 2.2rem;
}

.menu-content > h3 {
	margin: 0.1em;
}

.menu-content > div {
	padding: 0.1rem 0.3rem 0 0.3rem;
}

div.full div.game-mid {
	border-left: 0;
	border-right: 0;
}

.buttons {
	display: flex;
	position: absolute;
	bottom: var(--md-gap);
	right: var(--md-gap);
	left: var(--md-gap);
	justify-content: space-between;
}
</style>
