<script>
import Wearable from "@/chars/wearable";
import { CRAFT_ITEM } from "@/events";
import Game from "@/game";
import ItemBase from "@/ui/itemsBase";
import { canTarget } from "@/values/consts";
import { defineAsyncComponent } from "vue";

export default {
	mixins: [ItemBase],
	components: {
		equipmentItem: defineAsyncComponent(() => import("../equipment/equipmentItem.vue")),
		enchantingItem: defineAsyncComponent(() => import("../equipment/enchantingSlot.vue")),
	},
	data() {
		return {
			selectedSlot: null,
			selectedProtoItem: null,
			selectedMaterial: null,
			enchantingMode: null,
			enchantingTarget: null,
			filteredKinds: [],
		};
	},
	computed: {
		sections() {
			return {
				loot: Game.state.sections.find(s => s.id == "sect_loot"),
				crafting: Game.state.sections.find(s => s.id == "sect_craft"),
				enchanting: Game.state.sections.find(s => s.id == "sect_enchant"),
			};
		},
		runner() {
			return Game.state.runner;
		},
		equip() {
			return Game.state.equip;
		},
		inventory() {
			return Game.state.inventory;
		},
		filteredInventory() {
			const items = this.inventory.items;
			if (this.enchantingMode) {
				const wearables = items.filter(it => ["armor", "weapon"].includes(it.type));
				if (this.filteredKinds.length == 0) return wearables;
				return wearables.filter(it => canTarget(this.filteredKinds, it));
			}
			if (!this.selectedSlot) return items;
			return items.filter(v => v.slot == this.selectedSlot.id);
		},
		drops() {
			return Game.state.drops;
		},
		filteredDrops() {
			if (!this.selectedSlot) return this.drops.items;
			return this.drops.items.filter(v => v.slot == this.selectedSlot.id);
		},
		slots() {
			return Object.values(this.equip.slots)
				.filter(it => it.max > 0)
				.sort((a, b) => this.getSlotOrder(a) - this.getSlotOrder(b));
		},
		allProtoItems() {
			return Game.state.armors.concat(Game.state.weapons);
		},
		protoItems() {
			if (!this.selectedSlot) return [];
			return this.allProtoItems
				.filter(v => v.slot == this.selectedSlot.id && !v.blocked())
				.sort((a, b) => this.getSlotOrder(a) - this.getSlotOrder(b));
		},
		allMaterials() {
			return Game.state.materials;
		},
		baseMaterials() {
			if (!this.selectedSlot) return [];
			return this.allMaterials
				.filter(v => !v.blocked() && this.protoItems.some(item => v.isCompatible(item)))
				.sort((a, b) => this.getSlotOrder(a) - this.getSlotOrder(b));
		},
		previewItem() {
			const item = this.selectedProtoItem;
			const material = this.selectedMaterial;
			if (!item) return null;
			if (!material) return null;

			const instance = new Wearable(item);
			instance.template = item;
			instance.begin(null);
			instance.applyMaterial(material);

			const costMultiplier = item.craftcostmult * material.craftcostmult;

			const cost = {};
			for (let id in item.cost) {
				cost[id] = item.cost[id] * costMultiplier;
			}
			for (let id in material.cost) {
				cost[id] ??= 0;
				cost[id] += material.cost[id] * costMultiplier;
			}
			instance.cost = cost;
			return instance;
		},
		enchantSlots() {
			return Game.state.items.enchantslots;
		},
		filteredEnchantSlots() {
			const items = this.enchantSlots.items;
			if (this.enchantingMode) {
				if (this.filteredKinds.length == 0) return items;
				return items.filter(it => canTarget(this.filteredKinds, it.target));
			}
			if (!this.selectedSlot) return items;
			return items.filter(v => v.target.slot == this.selectedSlot.id);
		},
		enchants() {
			return Game.state.enchants;
		},
		filteredEnchants() {
			return this.enchants.filter(this.canShowEnchant);
		},
		enchantingKinds() {
			const kinds = [];
			for (const e of this.enchants) {
				const only = e.only;
				if (Array.isArray(only)) {
					for (const kind of only) {
						if (!kinds.includes(kind)) kinds.push(kind);
					}
				} else if (only && !kinds.includes(only)) {
					kinds.push(only);
				}
			}
			return kinds;
		},
	},
	methods: {
		getSlotOrder(slot) {
			if (!slot.template) return -9999;
			return slot.sortOrder ?? 9999;
		},
		slotTitle(slot) {
			if (!slot.multi) return slot.name + ":";
			const current = slot.item ? slot.item.length : 0;
			return slot.name + " (" + current + "/" + slot.max + "):";
		},
		canEmpty(item) {
			return this.inventory.canAdd(item);
		},
		selectSlot(slot) {
			this.selectedSlot = slot != this.selectedSlot ? slot : null;
			this.selectedProtoItem = null;
			this.selectedMaterial = null;
		},
		selectProtoItem(item) {
			this.selectedProtoItem = item != this.selectedProtoItem ? item : null;
		},
		selectMaterial(material) {
			this.selectedMaterial = material != this.selectedMaterial ? material : null;
		},
		styleProtoItem(item) {
			return {
				selected: item == this.selectedProtoItem,
			};
		},
		isProtoItemCompatible(item) {
			return this.selectedMaterial ? !this.selectedMaterial.isCompatible(item) : false;
		},
		styleMaterial(material) {
			return {
				selected: material == this.selectedMaterial,
			};
		},
		isMaterialCompatible(material) {
			return this.selectedProtoItem ? !material.isCompatible(this.selectedProtoItem) : false;
		},
		toggleEnchantingMode() {
			this.enchantingMode = !this.enchantingMode;
		},
		toggleEnchantingTask() {
			Game.toggleTask(this.enchantSlots);
		},
		canShowEnchant(enchant) {
			const only = enchant.only;
			if (this.locked(enchant)) return false;
			if (!only) return true;
			if (this.enchantingTarget && !canTarget(only, this.enchantingTarget)) return false;

			if (this.filteredKinds.length == 0) return true;

			if (Array.isArray(only)) {
				return this.filteredKinds.some(v => only.includes(v));
			} else if (typeof only === "string" && filteredKinds.includes(only)) return true;
			else return false;
		},
		canUseEnchant(enchant) {
			if (enchant.buy && !enchant.owned) {
				return enchant.canBuy(Game);
			}
			return (
				this.enchantingTarget &&
				enchant.canUse() &&
				enchant.canAlter(this.enchantingTarget) &&
				this.enchantSlots.canAdd(enchant)
			);
		},
		onEnchant(enchant) {
			if (enchant.buy && !enchant.owned) {
				this.emit("buy", enchant);
				return;
			}
			this.emit("enchant", enchant, this.enchantingTarget);
			this.inventory.remove(this.enchantingTarget);
			this.enchantingTarget = null;
		},
		onAction(container, item, action, count) {
			switch (action) {
				case "equip":
					this.emit("equip", item, container);
					break;
				case "enchant":
					this.enchantingTarget = this.enchantingTarget != item ? item : null;
					if (!this.enchantingMode) this.filteredKinds = [];
					this.enchantingMode = true;
					break;
				case "craft":
					this.emit(CRAFT_ITEM, item);
					break;
				case "take":
					this.emit("take", item, container);
					break;
				case "use":
					this.emit("use", item, container);
					break;
				case "sell":
					this.emit("sell", item, container, count);
					break;
			}
		},
	},
};
</script>

<template>
	<div class="equipment">
		<div class="slots" v-if="enchantingMode">
			<div class="slots-title">
				🌟Enchants🌟
				<button type="button" @click="toggleEnchantingMode">🧙🏻</button>
			</div>
			<equipmentItem
				v-if="enchantingTarget"
				:item="enchantingTarget"
				:enchant="true"
				@action="(...params) => onAction(null, enchantingTarget, ...params)" />
			<div v-for="enchant in filteredEnchants" @mouseenter.capture.stop="itemOver($event, enchant)">
				<div class="title">
					{{ enchant.name.toTitleCase() }}
					<button type="button" :disabled="!canUseEnchant(enchant)" @click="onEnchant(enchant)">
						{{ enchant.buy && !enchant.owned ? "🔒" : "🌟" }}
					</button>
				</div>
			</div>
		</div>
		<div class="slots" v-else>
			<div class="slots-title">
				🧙🏻Equipment🧙🏻
				<button type="button" v-if="!locked(sections.enchanting)" @click="toggleEnchantingMode">🌟</button>
			</div>
			<div class="slot" v-for="slot in slots">
				<div class="title">
					{{ slotTitle(slot) }}
					<button type="button" @click="selectSlot(slot)">{{ slot == selectedSlot ? "<" : ">" }}</button>
				</div>
				<div
					class="slot-item"
					v-for="it in slot.item"
					:key="it.id"
					@mouseenter.capture.stop="itemOver($event, it)">
					<button type="button" class="remove" :disabled="!canEmpty(it)" @click="emit('unequip', slot, it)">
						X
					</button>
					<span class="item-name">{{ it.name.toTitleCase() }}</span>
				</div>
			</div>
		</div>
		<div class="equip-sections">
			<template v-if="enchantingMode">
				<div class="section-title">
					Enchanting.
					<button type="button" :disabled="enchantSlots.count == 0" @click="toggleEnchantingTask">
						{{ runner.has(enchantSlots) ? "Pause" : "Resume" }}
					</button>
				</div>
				<div class="note-text">Enchantment levels on an Item cannot exceed Item's enchant slots.</div>
				<div class="checkboxes">
					<div class="category" v-for="(p, k) in enchantingKinds" :key="k">
						<input type="checkbox" :value="p" :id="elmId('chk' + k)" v-model="filteredKinds" />
						<label :for="elmId('chk' + k)">{{ p.replace("t_", "") }}</label>
					</div>
				</div>
			</template>
			<template v-else-if="!locked(sections.crafting)">
				<div class="section-title">
					Crafting: {{ this.selectedSlot ? this.selectedSlot.name : "Select slot" }}
				</div>
				<div v-if="selectedSlot" style="border-top: 1px solid var(--separator-color)">
					Template:
					<button
						v-for="item in protoItems"
						@click="selectProtoItem(item)"
						:class="styleProtoItem(item)"
						:disabled="isProtoItemCompatible(item)"
						@mouseenter.capture.stop="itemOver($event, item)">
						{{ item.name }}
					</button>
				</div>
				<div v-if="selectedSlot" style="border-top: 1px solid var(--separator-color)">
					Materials:
					<button
						v-for="material in baseMaterials"
						@click="selectMaterial(material)"
						:class="styleMaterial(material)"
						:disabled="isMaterialCompatible(material)"
						@mouseenter.capture.stop="itemOver($event, material)">
						{{ material.name }}
					</button>
				</div>
				<div class="inventory" v-if="previewItem">
					<equipmentItem
						:item="previewItem"
						craft="true"
						@action="(...params) => onAction(null, previewItem, ...params)" />
				</div>
			</template>
			<div style="text-align: center; border-top: 1px solid var(--separator-color)">
				Inventory
				<span v-if="inventory.max > 0">
					- {{ inventory.items.length + " / " + Math.floor(inventory.max) + " Used" }}
				</span>
			</div>
			<div class="inventory">
				<equipmentItem
					v-for="item in filteredInventory"
					:item="item"
					@action="(...params) => onAction(inventory, item, ...params)" />
			</div>
			<template v-if="!locked(sections.enchanting) && (enchantingMode || enchantSlots.count > 0)">
				<div style="text-align: center; border-top: 1px solid var(--separator-color)">
					Enchanting
					<span v-if="enchantSlots.max > 0">
						- {{ enchantSlots.items.length + " / " + Math.floor(enchantSlots.max) + " Used" }}
					</span>
				</div>
				<div class="inventory">
					<enchantingItem
						v-for="slot in filteredEnchantSlots"
						:slot="slot"
						:active="true"
						@action="(...params) => onAction(enchantSlots, slot.target, ...params)" /></div
			></template>
			<template v-if="!locked(sections.loot) && !enchantingMode">
				<div style="text-align: center; border-top: 1px solid var(--separator-color)">Loot</div>
				<div class="inventory" style="border-bottom: 1px solid var(--separator-color)">
					<equipmentItem
						v-for="item in filteredDrops"
						:item="item"
						loot="true"
						@action="(...params) => onAction(drops, item, ...params)" />
				</div>
			</template>
		</div>
	</div>
</template>

<style scoped>
.equipment {
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: row;
}

.slots {
	width: 15rem;
	background-color: #6241;
	padding: var(--tiny-gap);
	overflow-y: auto;
	scrollbar-gutter: stable;
}

.slots-title {
	text-align: center;
	font-weight: bold;
	padding: var(--md-gap);
	border: 1px solid var(--separator-color);
}

.section-title {
	text-align: center;
	font-weight: bold;
	padding: var(--md-gap);
}

.slot {
	display: flex;
	height: unset;
	flex-flow: column;
	border-bottom: 1px solid var(--separator-color);
}

.slot button {
	padding: 0.4em;
}

.title {
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-weight: bold;
}

.equip-sections {
	flex: 1;
	padding: var(--tiny-gap);

	overflow-y: auto;
	scrollbar-gutter: stable;
}

.equip-sections button {
	padding: 0.6em;
}

.equip-sections button.selected {
	background-color: #2884;
}

.inventory {
	padding: var(--md-gap);
	display: flex;
	justify-content: center;
	flex-wrap: wrap;
	gap: 10px;
}

.note-text {
	padding: 0;
	margin: var(--comfy-gap) 0;
	font-style: italic;
	font-size: 0.85em;
	white-space: pre-wrap;
}

div.checkboxes {
	margin: 0;
	padding: 0 0.5em;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
}

div.checkboxes div.category {
	display: flex;
	flex-direction: row;
	margin: 2px 4px;
}
</style>
