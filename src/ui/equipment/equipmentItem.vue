<script>
import Game from "@/game";
export default {
	props: ["item", "loot", "craft", "enchant"],
	emits: ["action"],
	computed: {
		title() {
			return `${this.item.name}${this.item.count > 1 ? " (" + Math.floor(this.item.count) + ")" : ""}`;
		},
		enchantingSection() {
			return Game.state.sections.find(s => s.id == "sect_enchant");
		},
		enchantingLocked() {
			const it = this.enchantingSection;
			return it.disabled === true || it.locks > 0 || it.locked !== false;
		},
	},
	methods: {
		canTake() {
			return Game.state.inventory.canAdd(this.item);
		},
		canEquip() {
			return Game.canEquip(this.item);
		},
		canUse() {
			return Game.canUse(this.item);
		},
		canCraft() {
			return this.canTake() && Game.canPay(this.item.cost);
		},
		canEnchant() {
			return this.item.enchants < this.item.enchants.max;
		},
	},
};
</script>

<template>
	<div class="item" @mouseenter.capture.stop="itemOver($event, item)">
		<div class="item-name">{{ title }}</div>
		<div class="item-actions">
			<template v-if="craft">
				<button class="item-action" :disabled="!canCraft()" @click="$emit('action', 'craft')">Craft</button>
				<span v-if="!canTake()">Full inventory!</span>
			</template>
			<template v-else-if="enchant">
				<button class="item-action" @click="$emit('action', 'enchant')">X</button>
				<span v-if="!canEnchant()">Full!</span>
			</template>
			<template v-else>
				<button class="item-action" v-if="loot" :disabled="!canTake()" @click="$emit('action', 'take')">
					Take
				</button>
				<template v-else>
					<button
						class="item-action"
						v-if="item.equippable"
						:disabled="!canEquip()"
						@click="$emit('action', 'equip')">
						Equip
					</button>
					<button
						class="item-action"
						v-if="!enchantingLocked && item.enchants && item.enchants.max > 0"
						@click="$emit('action', 'enchant')">
						Enchant
					</button>
					<button class="item-action" v-if="item.use" :disabled="!canUse()" @click="$emit('action', 'use')">
						Use
					</button>
				</template>
				<button class="item-action" @click="$emit('action', 'sell', 1)">Sell</button>
				<button class="item-action" v-if="item.count > 1" @click="$emit('action', 'sell', item.count)">
					Sell All
				</button>
			</template>
		</div>
	</div>
</template>

<style scoped>
.item {
	width: 13.7rem;
	height: 7rem;

	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-between;
	border: 1px solid #88888888;
}

.item-name {
	flex: 1;
	padding: var(--tiny-gap);
	text-wrap: stable;
	text-align: center;
}

.item-actions {
	padding: var(--tiny-gap);
	gap: 5px;

	display: flex;
	justify-content: center;
}

.item-action {
	width: 4rem;
	margin: 0;
}
</style>
