import Events, { CHAR_DIED, COMBAT_HIT, EVT_COMBAT, IS_IMMUNE } from "@/events";
import { FP, SECONDARY_POTENCY_POWER } from "@/values/consts";
import Range, { RangeTest } from "@/values/range";
import FValue from "@/values/rvals/fvalue";
import RValue from "@/values/rvals/rvalue";

export const MaxCombatants = 100;
export const TargetSelf = 0;
export const NotTargetSelf = 32; //excludes the user from the valid targets list.
export const CanTargetAllyLeader = 1;
export const CanTargetAllyMinions = 2;
export const CanTargetEnemyLeader = 4;
export const CanTargetEnemyMinions = 8;
export const FixedTarget = 16;
export const DefaultToMaxCombatants = 64;

/**
 * @const {object.<string,number>} Targets - targetting constants.
 */
export const Targets = {
	self: TargetSelf,
	ally: CanTargetAllyLeader + CanTargetAllyMinions,
	allies: CanTargetAllyLeader + CanTargetAllyMinions + DefaultToMaxCombatants,
	enemy: CanTargetEnemyLeader + CanTargetEnemyMinions,
	enemies: CanTargetEnemyLeader + CanTargetEnemyMinions + DefaultToMaxCombatants,
	leader: CanTargetAllyLeader,
	enemyleader: CanTargetEnemyLeader,
	randomleader: CanTargetAllyLeader + CanTargetEnemyLeader,
	bothleaders: CanTargetAllyLeader + CanTargetEnemyLeader + DefaultToMaxCombatants,
	minion: CanTargetAllyMinions,
	minions: CanTargetAllyMinions + DefaultToMaxCombatants,
	flunky: CanTargetEnemyMinions,
	flunkies: CanTargetEnemyMinions + DefaultToMaxCombatants,
	otherminion: CanTargetAllyMinions + NotTargetSelf, //+not self
	otherminions: CanTargetAllyMinions + NotTargetSelf + DefaultToMaxCombatants, //+not self
	nonleader: CanTargetAllyMinions + CanTargetEnemyMinions,
	nonleaders: CanTargetAllyMinions + CanTargetEnemyMinions + DefaultToMaxCombatants,
	random: CanTargetAllyLeader + CanTargetAllyMinions + CanTargetEnemyLeader + CanTargetEnemyMinions,
	randomminion: CanTargetAllyMinions + CanTargetEnemyMinions,
	randomotherminion: CanTargetAllyMinions + CanTargetEnemyMinions + NotTargetSelf, //for confuse purposes
	fixed: FixedTarget, //only works with things that can specify an explicit target, currently only onHit and onMiss does that.
	all:
		CanTargetAllyLeader +
		CanTargetAllyMinions +
		CanTargetEnemyLeader +
		CanTargetEnemyMinions +
		DefaultToMaxCombatants,
	epicenter:
		CanTargetAllyLeader +
		CanTargetAllyMinions +
		CanTargetEnemyLeader +
		CanTargetEnemyMinions +
		NotTargetSelf +
		DefaultToMaxCombatants, //+not self
	minionepicenter: CanTargetAllyMinions + CanTargetEnemyMinions + NotTargetSelf + DefaultToMaxCombatants, //for when leaders are not to be affected
};

export const ConfuseTargets = {
	[Targets.ally]: Targets.random,
	[Targets.allies]: Targets.all,
	[Targets.enemy]: Targets.random,
	[Targets.enemies]: Targets.all,
	[Targets.leader]: Targets.randomleader,
	[Targets.enemyleader]: Targets.randomleader,
	[Targets.minion]: Targets.randomminion,
	[Targets.minions]: Targets.all,
	[Targets.flunky]: Targets.randomminion,
	[Targets.flunkies]: Targets.all,
	[Targets.otherminion]: Targets.randomotherminion,
	[Targets.otherminions]: Targets.minionepicenter,
};

export const CharmTargets = {
	[Targets.ally]: Targets.enemy,
	[Targets.allies]: Targets.enemies,
	[Targets.enemy]: Targets.ally,
	[Targets.enemies]: Targets.allies,
	[Targets.leader]: Targets.enemyleader,
	[Targets.enemyleader]: Targets.leader,
	[Targets.minion]: Targets.flunky,
	[Targets.minions]: Targets.flunkies,
	[Targets.flunky]: Targets.minion + NotTargetSelf,
	[Targets.flunkies]: Targets.minions + NotTargetSelf,
	[Targets.otherminion]: Targets.flunky,
	[Targets.otherminions]: Targets.flunkies,
};

/* Randomize array in-place using Durstenfeld shuffle algorithm */
export function shuffleArray(a) {
	for (let i = a.length - 1; i >= 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const swap = a[i];
		a[i] = a[j];
		a[j] = swap;
	}
}

export function AffectedTargets(targets, targetspec) {
	const affectedBy = targetspec.affectedby;
	const notAffectedBy = targetspec.notaffectedby;

	const both = []; // targets fitting both criteria - highest priority
	const single = []; // medium priority
	const none = []; // lower priority

	for (let target of targets) {
		const isAffected =
			!affectedBy ||
			(affectedBy.all
				? affectedBy.condition.every(c => target.hasDot(c))
				: affectedBy.condition.some(c => target.hasDot(c)));

		// strict check failing means target should not be added to any array
		if (!isAffected && affectedBy.strict) continue;

		const isNotAffected =
			!notAffectedBy ||
			(notAffectedBy.all
				? notAffectedBy.condition.every(c => !target.hasDot(c))
				: notAffectedBy.condition.some(c => !target.hasDot(c)));

		// strict check failing means target should not be added to any array
		if (!isNotAffected && notAffectedBy.strict) continue;

		if (isAffected && isNotAffected) both.push(target);
		else if (isAffected || isNotAffected) single.push(target);
		else none.push(target);
	}

	both.push.apply(both, single);
	both.push.apply(both, none);
	return both;
}

/**
 * @param {Char} a
 * @param {Char} b
 * @returns {number} - see array.sort compareFn
 */
export const CompareTargetStats = (a, b, targetspec) => {
	if (!targetspec) return 0;
	const stat = targetspec.stat;
	if (!stat) return 0;

	const aS = targetspec.usepercentage ? a[stat] / a[stat]["max"] : a[stat];
	const bS = targetspec.usepercentage ? b[stat] / b[stat]["max"] : b[stat];

	return targetspec.highest ? bS - aS : aS - bS;
};

/**
 * @param {Char[]} a - array of targets.
 * @returns {Char} next attack target
 */
export const NextTarget = a => {
	for (let i = a.length - 1; i >= 0; i--) {
		if (a[i].alive) return a[i];
	}
};

/**
 * Parse string target into integer target for flag checking.
 * @param {string} s
 * @returns {number}
 */
export const ParseTarget = s => {
	return Targets[s] ?? Targets.enemy;
};

export const GetTarget = n => {
	if (typeof n !== "number") return "";

	let targs = Object.entries(Targets);

	let str = targs.find(it => it[1] === n);
	return str ? str[0] : "";
};

/**
 * Create a function that returns a numeric damage value.
 * function has format: (a)ctor, (t)arget, (c)ontext, (i)tem
 * @param {string} s
 * @returns {(a,t,c,i)=>number}
 */
export const MakeDmgFunc = s => {
	return new FValue([FP.ACTOR, FP.TARGET, FP.CONTEXT, FP.ITEM, FP.GDATA], s);
};

export const ParseDmg = v => {
	if (v === null || v === undefined || v === "") return null;

	if (typeof v === "string" && !RangeTest.test(v) && isNaN(v)) return MakeDmgFunc(v);
	else if (v instanceof RValue) return v;
	return new Range(v);
};

/**
 * Apply an attack. Attack is already assumed to have hit, but immunities,
 * resistances, can still be applied.
 * @param {Char} target
 * @param {Object} action
 */
export const ApplyAction = (target, action, attacker = null, player = null) => {
	if ((!target || !target.alive) && target.id != attacker.id) return; //can still do things on self even if dead, useful for onDeath purposes.
	if (target.isImmune(action.kind)) {
		Events.emit(IS_IMMUNE, target, action.kind);
		return false;
	}

	if (action.damage) ApplyDamage(target, action, attacker);
	if (action.healing) ApplyHealing(target, action, attacker);
	if (action.cure) {
		target.cure(action.cure);
	}
	if (action.state) {
		target.addDot(action.state, action, null, attacker);
	}

	if (action.result) {
		//console.log('APPLY ON: '+ target.name );
		//if ( attacker && action.name ) Events.emit(EVT_COMBAT, attacker.name + ' uses ' + action.name );
		target.context.applyVars(action.result);
	}
	if (action.acquire) {
		player.context.applyVars(action.acquire, 1, 1, attacker, target);
	}
	if (action.dot) {
		target.addDot(action.dot, action, null, attacker);
	}
	if (action.summon) {
		let smntarget = target || attacker;
		smntarget.context.summon(action.summon, attacker, target);
	}

	return true;
};

export const CalcDamage = (dmg, attack, attacker, target = null, applyBonus = true) => {
	if (!dmg) return;

	if (dmg instanceof FValue) {
		//let f = dmg.fn;
		dmg = dmg.getApply({
			[FP.ACTOR]: attacker,
			[FP.TARGET]: target,
			[FP.CONTEXT]: target.context,
			[FP.ITEM]: attack.source,
			[FP.GDATA]: attacker.context.state.items,
		});
	} else dmg = dmg.value;
	if (applyBonus) {
		if (attack.bonus) dmg += attack.bonus;
		if (attacker) {
			if (attacker.getBonus) dmg += attacker.getBonus(attack.kind);
			if (attacker.context && attack.potencies) {
				for (let p of attack.potencies) {
					dmg = dmg * getPotencyMult(p, attacker, target);
				}
			}
			if (attacker.context && attack.secondaryPotencies) {
				for (let p of attack.secondaryPotencies) {
					dmg = dmg * getPotencyMult(p, attacker, target, true);
				}
			}
		}
	}
	return dmg;
};

const getPotencyMult = (potencyName, attacker, target, secondary = false) => {
	let potency = attacker.context.state.getData(potencyName, false, false);
	if (!potency) return 1;
	let mult = potency.damage.getApply({
		[FP.ACTOR]: attacker,
		[FP.TARGET]: target,
		[FP.CONTEXT]: target.context,
		[FP.ITEM]: potency,
	});
	if (secondary) {
		let power = potency.power ?? SECONDARY_POTENCY_POWER;
		mult = Math.pow(mult, power);
	}
	return mult;
};

export const ApplyDamage = (target, attack, attacker) => {
	let dmg = CalcDamage(attack.damage, attack, attacker, target, !attack.showinstanced);

	let resistMultiplier = target.getResistMultiplier(attack.kind);
	dmg *= resistMultiplier;

	let defenseMultiplier = attack.nodefense ? 1 : target.getDefenseMultiplier();
	dmg *= defenseMultiplier;
	let reflectbase = dmg;
	if (!attack.noLogs) Events.emit(COMBAT_HIT, target, dmg, attack.name || (attacker ? attacker.name : ""));

	if (target.barrier > dmg) {
		target.barrier -= dmg;
		dmg = 0;
	} else {
		dmg -= target.barrier;
		target.barrier = 0;
		target.hp -= dmg;
	}

	if (attack.leech && attacker && dmg > 0) {
		let amt = Math.floor(100 * attack.leech * dmg) / 100;
		attacker.hp += amt;
		Events.emit(EVT_COMBAT, null, attacker.name.toTitleCase() + " Steals " + amt + " Life");
	}
	if (target.hp <= 0) {
		Events.emit(CHAR_DIED, target, attack);
	}
	if (attacker && !attack.unreflectable) {
		//do not retaliate to dot things
		if (+target.stat_thorns > 0 && target.getThornAttack(0) && attacker.hp > 0) {
			ApplyDamage(attacker, target.getThornAttack(+target.stat_thorns), target);
		}
		if (+target.stat_reflect > 0 && target.getReflectAttack(0) && attacker.hp > 0) {
			ApplyDamage(attacker, target.getReflectAttack((+target.stat_reflect / 100) * reflectbase), target);
		}

		target.retaliate(attacker, true);
	}
};

export const ApplyHealing = (target, attack, attacker) => {
	let heal = CalcDamage(attack.healing, attack, attacker, target, !attack.showinstanced);
	target.hp += heal;
};

/**
 * @note currently unused.
 * Convert damage object to raw damage value.
 * @param {number|function|Range} dmg
 * @returns {number}
 */
export function getDamage(dmg) {
	let typ = typeof dmg;

	if (typ === "object") return dmg.value;
	else if (typ === "number") return dmg;
	else if (typeof dmg === "function") {
	}

	console.warn("Invalid damage: " + dmg);
	return 0;
}

/**
 * Sets an attack/dot to be instantiated, that is, unaffected by any changes on the source
 * @param {attack/dot} attack - thing to modify
 * @param {char} applier - the one using the attack
 * @param {char} target - the target of the attack
 * @returns modified attack
 */
export const instanceDamage = (attack, applier, target) => {
	attack.damage = CalcDamage(attack.damage, attack, applier, target);
	attack.healing = CalcDamage(attack.healing, attack, applier, target);
	attack.tohit += applier.getHit();
	attack.showinstanced = true;
	return attack;
};
export const processDot = dot => {
	if (dot.conditional?.onSuccess) dot.conditional.onSuccess = processDot(dot.conditional.onSuccess);
	if (dot.conditional?.onFailure) dot.conditional.onFailure = processDot(dot.conditional.onFailure);
	if (dot.attack) dot.attack = processAttackForDot(dot.attack);
	if (dot.onExpire) dot.onExpire = processAttackForDot(dot.onExpire);
	if (dot.onDeath) dot.onDeath = processAttackForDot(dot.onDeath);
	if (dot.onHit) dot.onHit = processAttackForDot(dot.onHit);
	if (dot.onMiss) dot.onMiss = processAttackForDot(dot.onMiss);
	if (dot.onApply) dot.onApply = processAttackForDot(dot.onApply);
	return dot;
};

export const processAttackForDot = attack => {
	attack.targetstring = attack.targets;
	if (attack.hits) {
		for (let b = attack.hits.length - 1; b >= 0; b--) {
			attack.hits[b].targetstring = attack.hits[b].targets;
			if (attack.hits[b].dot) attack.hits[b].dot = processDot(attack.hits[b].dot);
		}
	}
	if (attack.dot) attack.dot = processDot(attack.dot);
	return attack;
};

export const SelectAttack = attack => {
	if (!Array.isArray(attack)) return attack;

	let weight = 0;
	let i = attack.length;
	while (i-- > 0) {
		weight += Math.max(0, attack[i].weight ?? 1);
	}
	weight *= Math.random();
	i = attack.length;
	while (weight >= 0 && i-- > 0) {
		weight -= Math.max(0, attack[i].weight ?? 1);
	}

	return attack[i];
};
