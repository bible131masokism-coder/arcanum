import game from "@/game";
import { precise } from "@/util/format";
import { FP, SECONDARY_POTENCY_POWER } from "@/values/consts";
import Char from "@/chars/char";
import { RollOver } from "@/ui/popups/itemPopup.vue";
import Range from "@/values/range";
import FValue from "@/values/rvals/fvalue";

export default function HealingMixin(itemProp = "item") {
	return {
		methods: {
			getHealing(it, hide = null) {
				if (hide) {
					if (it.healing instanceof FValue || it.heal instanceof FValue) {
						return true;
					} else return it.healing || it.heal;
				}
				let heal = it.healing || it.heal;
				return this.getHealingStr(heal, it);
			},
			getHealingStr(heal, it) {
				let mult = this.getHealingMult(it);
				let bonus = this.getHealingBonus(it);
				if (it.showinstanced) {
					mult = 1;
					bonus = 0;
				}
				if (!heal) return null;
				else if (typeof heal === "number") return precise(heal * mult + bonus);

				if (heal instanceof FValue) {
					let params = {
						[FP.ACTOR]:
							RollOver.item instanceof Char || RollOver.item instanceof Monster
								? RollOver.item
								: RollOver.source instanceof Char
									? RollOver.source
									: game.state.player,
						[FP.ITEM]: this[itemProp],
						[FP.GDATA]: (RollOver.item instanceof Char || RollOver.item instanceof Monster
							? RollOver.item
							: RollOver.source instanceof Char
								? RollOver.source
								: game.state.player
						).context
							? (RollOver.item instanceof Char || RollOver.item instanceof Monster
									? RollOver.item
									: RollOver.source instanceof Char
										? RollOver.source
										: game.state.player
								).context.state.items
							: null,
					};
					return precise(heal.applyDummy(params) * mult + bonus);
				}
				if (heal) {
					let healdisp;
					if (heal instanceof String && RangeTest.test(heal)) heal = new Range(heal);
					if (heal instanceof Range) {
						healdisp = heal.instantiate();
						healdisp.add(bonus);
						healdisp.multiply(mult);
					} else {
						healdisp = precise(heal * mult + bonus);
					}
					return healdisp.toString();
					//return healdisp.toString(this[itemProp]);
				}
				console.warn("Failed healing parse", heal);
				return null;
			},
			displayHealing(it) {
				if (!it) return false;

				let heal = it.healing || it.heal;
				return heal != null && (heal instanceof FValue || this.getHealingStr(heal, it));
			},
			getHealingMult(it) {
				let PotencyMult = 1;
				let Actor;
				if (RollOver.item instanceof Char || RollOver.item.type == "monster") {
					Actor = RollOver.item;
				} else if (RollOver.source instanceof Char) {
					Actor = RollOver.source;
				} else Actor = game.state.player;
				if (Actor.context) {
					if (it.potencies) {
						for (let p of it.potencies) PotencyMult *= this.getPotencyMult(p, Actor);
					}
					if (it.secondaryPotencies) {
						for (let p of it.secondaryPotencies) PotencyMult *= this.getPotencyMult(p, Actor, true);
					}
				}
				return PotencyMult;
			},
			getPotencyMult(potencyName, actor, secondary) {
				let potency = actor.context.state.getData(potencyName, false, false);
				if (!potency) return 1;
				let mult = potency.damage.getApply({
					[FP.ACTOR]: actor,
					[FP.TARGET]: game.state.player,
					[FP.CONTEXT]: game.state.player.context,
					[FP.ITEM]: potency,
				});
				if (secondary) {
					let power = potency.power ?? SECONDARY_POTENCY_POWER;
					mult = Math.pow(mult, power);
				}
				return mult;
			},
			getHealingBonus(it) {
				let HealingBonus = 0;
				let Actor;
				if (RollOver.item instanceof Char || RollOver.item.type == "monster") {
					Actor = RollOver.item;
				} else if (RollOver.source instanceof Char) {
					Actor = RollOver.source;
				} else Actor = game.state.player;
				if (Actor && Actor.getBonus) HealingBonus += Actor.getBonus(it.kind);
				if (it.bonus) HealingBonus += it.bonus;
				return HealingBonus;
			},
		},
	};
}
