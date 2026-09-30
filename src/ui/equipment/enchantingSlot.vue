<script>
import Game from "@/game";
export default {
	props: ["slot"],
	emits: ["action"],
	computed: {
		title() {
			if (this.slot.done) return this.slot.target.name;
			return `${this.slot.target.name} + ${this.slot.item.name}`;
		},
	},
	methods: {
		canTake() {
			return Game.state.inventory.canAdd(this.slot.target);
		},
		doTake() {
			if (!this.canTake()) return;

			Game.state.inventory.add(this.slot.target);
			Game.state.items.enchantslots.remove(this.slot);
		},
	},
};
</script>

<template>
	<div class="slot" @mouseenter.capture.stop="itemOver($event, this.slot.target)">
		<div class="slot-name">{{ title }}</div>
		<div class="slot-actions">
			<span class="slot-action"> {{ slot.done ? "Done" : `${slot.percent()}%` }}</span>
			<button class="slot-action" :disabled="!canTake" @click="doTake">
				{{ slot.done ? "Take" : "Cancel" }}
			</button>
		</div>
	</div>
</template>

<style scoped>
.slot {
	width: 13.7rem;
	height: 7rem;

	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-between;
	border: 1px solid #88888888;
}

.slot-name {
	flex: 1;
	padding: var(--tiny-gap);
	text-wrap: stable;
	text-align: center;
}

.slot-actions {
	padding: var(--tiny-gap);
	gap: 5px;

	display: flex;
	justify-content: center;
}

.slot-action {
	width: 4rem;
	margin: 0;
}
</style>
