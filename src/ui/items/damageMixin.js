import game from "@/game";
import { precise } from "@/util/format";
import { FP, SECONDARY_POTENCY_POWER } from "@/values/consts";
import Char from "@/chars/char";
import { RollOver } from "@/ui/popups/itemPopup.vue";
import Range, { RangeTest } from "@/values/range";
import FValue from "@/values/rvals/fvalue";
import Monster from "@/items/monster";

export default function DamageMixin(itemProp = "item") {
	return {
		methods: {
			getTarget() {
				const item = this[itemProp];
				if (item.context) {
					return item.context.state.self;
				}
				if (RollOver.item instanceof Char) {
					return RollOver.item;
				}
				if (RollOver.source instanceof Char) {
					return RollOver.source;
				}
				return game.state.player;
			},
			getActor() {
				const item = this[itemProp];
				if (item.source instanceof Char) {
					return item.source;
				}
				if (item.applier instanceof Char) {
					return item.applier;
				}
				if (item.context) {
					return item.context.state.self;
				}
				if (RollOver.item instanceof Char || RollOver.item instanceof Monster) {
					return RollOver.item;
				}
				if (RollOver.source instanceof Char) {
					return RollOver.source;
				}
				return game.state.player;
			},
			getDamage(it, hide = null) {
				if (hide) {
					if (it.damage instanceof FValue || it.dmg instanceof FValue) {
						return true;
					} else return it.damage || it.dmg;
				}
				let dmg = it.damage || it.dmg;
				return this.getDamageStr(dmg, it);
			},
			getDamageStr(dmg, it) {
				let mult = this.getDamageMult(it);
				let bonus = this.getDamageBonus(it);
				if (it.showinstanced) {
					mult = 1;
					bonus = 0;
				}
				if (!dmg) return null;
				else if (typeof dmg === "number") return precise(dmg * mult + bonus);

				if (dmg instanceof FValue) {
					return this.getDummyDamage(dmg, mult, bonus);
				}
				if (dmg) {
					let dmgdisp;
					if ((dmg instanceof String || typeof dmg === "string") && RangeTest.test(dmg)) dmg = new Range(dmg);
					if (dmg instanceof Range) {
						dmgdisp = dmg.instantiate();
						dmgdisp.add(bonus);
						dmgdisp.multiply(mult);
					} else {
						dmgdisp = precise(dmg * mult + bonus);
					}
					return dmgdisp.toString();
					//return dmgdisp.toString(this[itemProp]);
				}
				console.warn("Failed damage parse", dmg);
				return null;
			},
			getDummyDamage(dmg, mult = 1, bonus = 0) {
				const item = this[itemProp];
				let params = {
					[FP.TARGET]: this.getTarget(),
					[FP.ACTOR]: this.getActor(),
					[FP.ITEM]: item,
					[FP.GDATA]: this.getActor().context ? this.getActor().context.state.items : null,
				};
				return precise(dmg.applyDummy(params) * mult + bonus);
			},
			displayDamage(it) {
				if (!it) return false;

				let dmg = it.damage || it.dmg;
				return dmg != null && (dmg instanceof FValue || this.getDamageStr(dmg, it));
			},
			getDamageMult(it) {
				let PotencyMult = 1;
				let Actor = this.getActor();
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
			getDamageBonus(it) {
				let DamageBonus = 0;
				let Actor = this.getActor();
				if (Actor && Actor.getBonus) DamageBonus += Actor.getBonus(it.kind);
				if (it.bonus) DamageBonus += it.bonus;
				return DamageBonus;
			},
		},
	};
}
