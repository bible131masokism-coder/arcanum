<script>
import game from "@/game";
import { TYP_PCT } from "@/values/consts";

export default {
	props: ["item", "smn"],
	name: "summon",
	computed: {
		percent() {
			return this.summon[TYP_PCT];
		},
		summoncondition() {
			return this.summon.summonconditiontext;
		},
		summon() {
			return this.smn || this.item.summon;
		},
		itemName() {
			return game.state.getData(this.summon.id).name.toTitleCase();
		},
		cap() {
			return this.summon.max || "♾️";
		},
		count() {
			if (!this.summon.count || this.summon.count == 1) return " (1)";
			return " (" + this.summon.count.toString() + ")";
		},
		keep() {
			return this.summon.keep || false;
		},
	},
};
</script>

<template>
	<div class="summon">
		<div v-if="Array.isArray(summon)">
			<div v-for="(smnunit, idx) in summon" :key="'smn-' + idx">
				<div v-if="idx !== 0" class="info-sect"></div>
				<summon :item="item" :smn="smnunit" />
			</div>
		</div>
		<div v-else>
			<div v-if="percent">
				<div>โอกาสในการเรียก: {{ percent }}</div>
			</div>
			<div v-if="summoncondition">
				<div>เงื่อนไข: {{ summoncondition }}</div>
			</div>
			<div>ชื่อ: {{ itemName }}{{ count }}</div>
			<div>สูงสุด: {{ cap }}</div>
			<div v-if="keep">แทนที่จะเรียกชั่วคราว จะสร้างมินเนี่ยนถาวร</div>
		</div>
	</div>
</template>
