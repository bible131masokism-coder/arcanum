<script>
import ItemsBase from "@/ui/itemsBase";
import InfoBlock from "@/ui/items/info-block.vue";
import DamageMixin from "@/ui/items/damageMixin.js";
import game from "@/game";
import Summon from "@/ui/items/summon.vue";
import HealingMixin from "@/ui/items/healingMixin.js";
import { defineAsyncComponent } from "vue";
import { TYP_PCT } from "@/values/consts";

/**
 * This is the dot InfoBlock in an info-popup, not the dotView in window.
 */
export default {
	props: ["dot", "title", "item", "target"],
	name: "dot",
	mixins: [ItemsBase, DamageMixin(), HealingMixin()],
	components: {
		gdata: defineAsyncComponent(() => import(/* webpackChunkName: "gdata-ui" */ "./gdata.vue")),
		info: InfoBlock,
		Summon,
		attack: defineAsyncComponent(() => import("./attack.vue")),
	},
	computed: {
		percent() {
			return this.dot[TYP_PCT];
		},
		damage() {
			return this.getDamage(this.dot);
		},
		healing() {
			return this.getHealing(this.dot);
		},
		leech() {
			return this.dot.leech * 100 + "%";
		},
		name() {
			return this.dot.name || this.dot.id || this.item?.name;
		},
		potencyPrimary() {
			if (!this.dot?.potencies) return "";
			let potencystring = "";
			for (let a of this.dot.potencies) {
				if (potencystring != "") potencystring = potencystring.concat(", ");
				potencystring = potencystring.concat(game.state.getData(a).name.replace(" potency", "").toTitleCase());
			}
			return potencystring;
		},
		potencySecondary() {
			if (!this.dot?.secondaryPotencies) return "";
			let potencystring = "";
			for (let a of this.dot.secondaryPotencies) {
				if (potencystring != "") potencystring = potencystring.concat(", ");
				potencystring = potencystring.concat(game.state.getData(a).name.replace(" potency", "").toTitleCase());
			}
			return potencystring;
		},
	},
};
</script>

<template>
	<div class="dot">
		<div v-if="title" class="note-text">{{ title }}:</div>

		<div v-if="Array.isArray(dot)">
			<div v-for="(dots, idx) in dot" :key="'dot-' + idx">
				<div v-if="idx !== 0" class="info-sect"></div>
				<dot-info :dot="dots" :item="this.item" :target="this.target" />
			</div>
		</div>
		<div v-else>
			<div v-if="name && item?.name !== name">
				<span>ชื่อ: </span><span>{{ name.toString().toTitleCase() }}</span>
			</div>
			<div>
				<div v-if="!dot.damage && !dot.dmg && !dot.effect && !dot.mod && !name">
					<div v-if="dot.id">ไอดี: {{ dot.id.toString().toTitleCase() }}</div>
				</div>
			</div>
			<div v-if="percent">
				<div>โอกาสในการใช้เอฟเฟกต์: {{ percent }}</div>
			</div>
			<div>
				<div v-if="displayDamage(dot)">
					<span>ความเสียหายโดยประมาณ: </span><span>{{ damage }}</span>
					<div v-if="dot.kind">ประเภทความเสียหาย: {{ dot.kind.toString().toTitleCase() }}</div>
					<div v-if="potencyPrimary.length > 0">ศักยภาพหลัก: {{ potencyPrimary }}</div>
					<div v-if="potencySecondary.length > 0">ศักยภาพรอง: {{ potencySecondary }}</div>
					<div v-if="dot.leech">เปลี่ยนความเสียหาย {{ leech }} เป็นการรักษา</div>
					<div v-if="dot.nodefense">ไม่สนใจการป้องกัน</div>
				</div>
				<div v-if="displayHealing(dot)">
					<span>การรักษาโดยประมาณ: </span><span>{{ healing }}</span>
					<div v-if="dot.kind">ประเภทการรักษา: {{ dot.kind.toString().toTitleCase() }}</div>
					<div v-if="potencyPrimary.length > 0">ศักยภาพหลัก: {{ potencyPrimary }}</div>
					<div v-if="potencySecondary.length > 0">ศักยภาพรอง: {{ potencySecondary }}</div>
				</div>
				<div v-if="dot.duration">ระยะเวลา: {{ dot.duration + "s" || "infinity" }}</div>
			</div>
			<div v-if="dot.conditiontext">
				<div class="info-sect">มีเอฟเฟกต์แบบมีเงื่อนไข:</div>
				<div>
					{{ dot.conditiontext }}
				</div>
			</div>
			<div v-if="dot.removedot">
				<div>เอฟเฟกต์นี้จะถูกลบออก</div>
			</div>
			<div v-if="dot.conditional?.onSuccess">
				<div class="info-subsect">เมื่อเงื่อนไขสำเร็จ</div>
				<dot-info :dot="dot.conditional.onSuccess" :item="this.item" :target="this.target" />
			</div>
			<div v-if="dot.conditional?.onFailure">
				<div class="info-subsect">เมื่อเงื่อนไขไม่สำเร็จ</div>
				<dot-info :dot="dot.conditional.onFailure" :item="this.item" :target="this.target" />
			</div>
			<div v-if="dot.effect">
				<div class="info-sect">เอฟเฟกต์</div>
				<info :info="dot.effect" rate="true" />
			</div>
			<div v-if="dot.summon">
				<div class="info-sect">การเรียก</div>
				<Summon :item="dot" class="info-subsubsect" />
			</div>
			<div v-if="dot.mod">
				<div class="info-sect">การปรับเปลี่ยน</div>
				<info v-if="this.target === 'allies'" :info="dot.mod" :target="'friendly allies'" />
				<info v-else :info="dot.mod" :target="this.target" />
			</div>
			<div v-if="dot.attack">
				<div class="info-sect">การโจมตี</div>
				<attack :item="dot" class="info-subsubsect" />
			</div>
			<div v-if="dot.onExpire">
				<div class="info-sect">เมื่อหมดเวลา</div>
				<attack :item="dot" onexpireflag="true" class="info-subsubsect" />
			</div>
			<div v-if="dot.onHit">
				<div class="info-sect">เมื่อถูกโจมตีโดยตรง</div>
				<attack :item="dot" onhitflag="true" class="info-subsubsect" />
			</div>
			<div v-if="dot.onMiss">
				<div class="info-sect">หลังจากหลบการโจมตีได้</div>
				<attack :item="dot" onmissflag="true" class="info-subsubsect" />
			</div>
			<div v-if="dot.onDeath">
				<div class="info-sect">เมื่อเป้าหมายถูกฆ่า</div>
				<attack :item="dot" ondeathflag="true" class="info-subsubsect" />
			</div>
			<div v-if="dot.onApply">
				<div class="info-sect">เมื่อถูกใช้</div>
				<attack :item="dot" onapplyflag="true" class="info-subsubsect" />
			</div>
		</div>
	</div>
</template>
