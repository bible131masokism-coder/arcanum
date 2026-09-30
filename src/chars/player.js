import Char from "@/chars/char";
import Wearable from "@/chars/wearable";
import GData from "@/items/gdata";
import Resource from "@/items/resource";
import { getDelay, RESOURCE, TEAM_PLAYER, WEAPON } from "@/values/consts";
import Stat from "@/values/rvals/stat";
import Events, { CHAR_CLASS, CHAR_NAME, CHAR_TITLE, LEVEL_UP, NEW_TITLE, UNIQUE_TITLE } from "../events";

import { Changed } from "@/changes";
import { NO_ATTACK, NO_ONHIT, NO_ONMISS } from "@/chars/states";
import game from "@/game";
import DataList from "@/inventories/dataList";
import { SAVE_IDS } from "@/inventories/inventory";
import { UNIQUE_TITLES } from "./title";

const Fists = new Wearable(null, {
	id: "baseWeapon",
	name: "fists",
	type: WEAPON,
	attack: {
		name: "fists",
		tohit: 1,
		kind: "blunt",
		damage: "0~1",
	},
});

/**
 * @constant {number} EXP_RATE
 */
const EXP_RATE = 0.125;

export default class Player extends Char {
	get level() {
		return this._level;
	}
	set level(v) {
		if (this._level && typeof v === "number") {
			this._level.value = v;
		} else this._level = v;
	}

	/**
	 * currently active title.
	 * @property {string} title
	 */
	get title() {
		return this._title;
	}
	set title(v) {
		this._title = v;
	}

	/**
	 * @property {string[]} titles
	 */
	get titles() {
		if (this._titles == null) this._titles = [];
		return this._titles;
	}
	set titles(v) {
		this._titles = v;
	}

	/**
	 * @property {} exp
	 */
	get exp() {
		return this._exp;
	}
	set exp(v) {
		if (this._exp === undefined) this._exp = v;
		else {
			this._exp.value = v;
			while (this._next > 0 && this._exp.value >= this._next) this.levelUp();
		}
	}

	/**
	 * @property {string} gclass - name of last game class attained.
	 */
	get gclass() {
		return this._gclass;
	}
	set gclass(v) {
		this._gclass = v;
	}

	/**
	 * @property {number} next - exp to level up.
	 */
	get next() {
		return this._next;
	}
	set next(v) {
		this._next = v;
	}

	/**
	 * @property {GData} hp - player hitpoints.
	 */
	get hp() {
		return this._hp;
	}
	set hp(v) {
		if (this._hp) this._hp.value = v;
		else if (v instanceof GData) this._hp = v;
		else console.error("Invalid Hp: " + v);
	}

	/**
	 * @property {Stat} damage - bonus damage per attack.
	 */
	get damage() {
		return this._damage;
	}
	set damage(v) {
		this._damage = v instanceof Stat ? v : new Stat(v);
	}

	/**
	 * @property {DataList<Wearable>} weapons - active weapons.
	 */
	get weapons() {
		return this._weapons;
	}
	set weapons(v) {
		this._weapons = new DataList(v);
		this._weapons.saveMode = SAVE_IDS;
		this._weapons.removeDupes = true;
	}

	/**
	 * Property continues to exist so spells/abilities can access 'current weapon'
	 * @property {Wearable} weapon - primary weapon.
	 */
	get weapon() {
		return this._weapons ? this._weapons.curItem() : null;
	}

	get onHitList() {
		return this._onHitList;
	}
	set onHitList(v) {
		this._onHitList = new DataList(v);
		this._onHitList.id = "onHitList";
		this._onHitList.saveMode = SAVE_IDS;
		this._onHitList.removeDupes = true;
	}

	get onMissList() {
		return this._onMissList;
	}
	set onMissList(v) {
		this._onMissList = new DataList(v);
		this._onMissList.id = "onMissList";
		this._onMissList.saveMode = SAVE_IDS;
		this._onMissList.removeDupes = true;
	}

	/**
	 * NOTE: Elements that are themselves Items are not encoded,
	 * since they are encoded in the Item array.
	 * @return {object}
	 */
	toJSON() {
		let data = {};

		data.defense = this.defense;
		data.tohit = this.tohit;
		data.name = this.name;

		data.titles = this.titles;
		data.title = this.title;
		data.classes = this.classes.map(gclass => gclass.id);

		data.next = this.next;
		// attack timer.
		data.timer = this.timer;
		data.alignment = this.alignment;
		data.damage = this.damage;
		data.dots = this.dots;

		data.bonuses = this.bonuses;
		data.immunities = this.immunities;
		data.resist = this.resist;

		data.retreat = this.retreat || undefined;

		data.gclass = this.gclass;

		data.weapons = this.weapons;
		data.onHitList = this.onHitList;
		data.onMissList = this.onMissList;

		if (data.attack) delete data.attack;

		return data;
	}

	constructor(vars = null) {
		super(vars);

		this.id = this.type = "player";
		if (!vars || !vars.name) this.name = "Wizrobe";

		if (!this.weapons) {
			this.weapons = null;
		}
		if (!this.onHitList) {
			this.onHitList = null;
		}
		if (!this.onMissList) {
			this.onMissList = null;
		}

		//if ( vars ) Object.assign( this, vars );
		if (!this.level) this.level = 0;
		this._title = this._title || "Waif";

		this.titles = this._titles || [];

		this.classes ??= [];

		this._next = this._next || 50;

		this.team = TEAM_PLAYER;
		this.chainhit = this.chainhit || 1;
		this.chaincast = this.chaincast || 1;
		/**
		 * @property {GData[]} retreats - stats to check for empty before retreating.
		 * Initialized from RetreatStats
		 */
		this.defeators = [];

		this.retreat = this.retreat || 0;

		this.initStates();

		if (!this.tohit) this.tohit = 1;
		if (!this.defense) this.defense = 0;

		this.alignment = this.alignment || "neutral";

		if (this.damage === null || this.damage === undefined) this.damage = 1;
	}

	/**
	 *
	 * @param {Gclass} gclass - class object added added
	 */
	setClass(gclass) {
		this.gclass = gclass.name;
		this.classes.push(gclass);
		this.addTitle(gclass.name, false);
		this.trySetUniqueTitle();
		Events.emit(CHAR_CLASS, this);
	}

	setName(name) {
		if (!name) return;
		this.name = name;
		Changed.add(this);
		Events.emit(CHAR_NAME, this);
	}

	setTitle(title) {
		if (!title) return;
		title = title.trim();
		this.title = title;
		this.addTitle(title);

		Events.emit(CHAR_TITLE, this);
	}

	addTitle(title, notify = true) {
		title = title.trim();
		if (this._titles.includes(title.trim().toTitleCase())) return;

		this.context.applyVars("fame", 0.1);
		this._titles.push(title.toTitleCase());
		if (notify) Events.emit(NEW_TITLE, title);
	}

	trySetUniqueTitle() {
		let expertClasses = this.classes.filter(v => v.hasTag("t_expertclass"));
		if (expertClasses.length < 2) return;
		let class1 = expertClasses[0];
		let class2 = expertClasses[1];
		let title = UNIQUE_TITLES[class1.id];
		this.gclass = title.combo[class2.id] ?? title.prefix + " " + UNIQUE_TITLES[class2.id].suffix;
		Events.emit(UNIQUE_TITLE, this.gclass);
	}

	revive(gs) {
		super.revive(gs);

		this.weapons.revive(gs, (s, v) => {
			s.equip.find(v);
		});
		this.onHitList.revive(gs, (s, v) => {
			s.equip.find(v);
		});
		this.onMissList.revive(gs, (s, v) => {
			s.equip.find(v);
		});

		if (this.weapons.count === 0) {
			this.weapons.add(Fists);
		}

		this.refreshClassList(gs);

		this.spells = gs.getData("spelllist");

		let checkLevelUp = this.checkLevelUp.bind(this);
		// Time for cursed coding
		let expStat = this.exp;
		let expValueDesc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(expStat), "value");
		Object.defineProperty(expStat, "value", {
			get() {
				return expValueDesc.get.apply(expStat);
			},
			set(v) {
				expValueDesc.set.apply(expStat, [v]);
				checkLevelUp();
			},
		});

		let exp = Object.getOwnPropertyDescriptor(this, "exp");
		Object.defineProperty(this, "exp", {
			get() {
				return exp.get();
			},
			set(v) {
				exp.set(v);
				checkLevelUp();
			},
		});

		this.checkLevelUp();
	}

	refreshClassList(gs) {
		let missingClasses = gs.classes.filter(v => !v.disabled && v.value >= 1 && this.classes.indexOf(v.id) < 0);
		this.classes = this.classes.map(classId => gs.getData(classId)).filter(gclass => gclass);
		if (!missingClasses.length) return;
		missingClasses.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
		for (let newClass of missingClasses) {
			this.classes.push(newClass);
		}
	}

	checkLevelUp() {
		let stat = this.exp;
		while (this.next > 0 && stat.value >= this.next) this.levelUp();
	}

	/**
	 * Add item to active weapons.
	 * @param {Wearable} it
	 */
	addWeapon(it) {
		this.weapons.add(it);
		if (this.weapons.count > 1) {
			// check for fists.
			this.weapons.remove(Fists);
		}
	}

	/**
	 * Remove item from active weapons.
	 * @param {Wearable} it
	 */
	removeWeapon(it) {
		this.weapons.remove(it);
		if (this.weapons.count === 0) {
			this.weapons.add(Fists);
		}
	}

	/**
	 * Add item to active onHits.
	 * @param {Wearable} it
	 */
	addOnHit(it) {
		this.onHitList.add(it);
	}

	/**
	 * Remove item from active onHits.
	 * @param {Wearable} it
	 */
	removeOnHit(it) {
		this.onHitList.remove(it);
	}

	/**
	 * Add item to active onHits.
	 * @param {Wearable} it
	 */
	addOnMiss(it) {
		this.onMissList.add(it);
	}

	/**
	 * Remove item from active onHits.
	 * @param {Wearable} it
	 */
	removeOnMiss(it) {
		this.onMissList.remove(it);
	}

	getWeapon() {
		let weaponset = game.state.equip.slots["mainhand"].item;
		if (!weaponset || weaponset.length == 0) return Fists;
		return Array.isArray(weaponset) ? weaponset[0] : weaponset;
	}

	getWeaponDamage() {
		const rawDamage = this.getWeapon().damage;
		return rawDamage;
	}
	/**
	 * Called once game actually begins. Dot-mods can't be applied
	 * before game start because they can trigger game functions.
	 */
	begin() {
		for (let i = this.dots.length - 1; i >= 0; i--) {
			if (this.dots[i].mod) this.context.applyMods(this.dots[i].mod, 1);
		}
	}

	/**
	 * Determine if player has fully rested and can re-enter a locale.
	 * @returns {boolean}
	 */
	rested() {
		for (let i = this.defeators.length - 1; i >= 0; i--) {
			if (this.defeators[i].maxed() === false) return false;
		}
		return true;
	}

	/**
	 * @returns {boolean}
	 */
	defeated() {
		for (let i = this.defeators.length - 1; i >= 0; i--) {
			if (this.defeators[i].empty()) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Explore player action.
	 * @param {*} dt
	 */
	explore(dt) {
		this.timer -= dt;
		if (this.timer <= 0) {
			this.timer += getDelay(this.speed);
			let currSpell;
			let cantripsArr = [];
			// attempt to use cast spell first.
			for (let i = this.castAmt(this.chaincast); i > 0; i--) {
				currSpell = this.tryCast();
				if (currSpell && currSpell.freeaction && !cantripsArr.find(i => i.id == currSpell.id)) {
					i++;
					cantripsArr.push(currSpell); //if spell is tagged as free action it does not use up a cast, but no more than once a turn
				}
			}
		}
	}

	/**
	 * Get combat action.
	 * @param {*} dt
	 */
	combat(dt) {
		this.timer -= dt;
		if (this.timer <= 0) {
			this.timer += getDelay(this.speed);
			// attempt to use spells first.
			let currSpell;
			let cantripsArr = [];
			for (let i = this.castAmt(this.chaincast); i > 0; i--) {
				currSpell = this.tryCast(cantripsArr);
				if (currSpell && currSpell.freeaction) {
					i++;
					cantripsArr.push(currSpell); //if spell is tagged as free action it does not use up a cast, but no more than once a turn
				}
			}
			//you can now actually use fists with spells, why was that not allowed?
			let blocked = this.getCause(NO_ATTACK);
			if (blocked) return blocked;
			let atkarr = [];
			cantripsArr = [];
			for (let i = this.castAmt(this.chainhit); i > 0; i--) {
				let nextattack = this.nextAttack(cantripsArr); //handling for null attack arrays
				if (nextattack.item && nextattack.item.freeaction) {
					i++;
					cantripsArr.push(nextattack.item); //if weapon is tagged as free action it does not use up a cast, but no more than once a turn
				}
				if (nextattack.attack) atkarr.push(nextattack.attack);
			}
			return atkarr.length > 0 ? atkarr : null;
		}
	}
	tryCast(blockArr) {
		return this.spells?.onUse(this.context, blockArr) ?? null;
	}

	/**
	 * Get next weapon attack.
	 */
	nextAttack(blockArr) {
		let i = 0;
		let nxt;
		while (i < this.weapons.items.length) {
			nxt = this.weapons.nextItem();
			i++;
			if (nxt?.attack && !blockArr.find(item => item.id == nxt.id)) break;
		}
		let nextattack = Array.isArray(nxt?.attack)
			? nxt.attack[Math.floor(Math.random() * nxt.attack.length)]
			: (nxt?.attack ?? null);
		return !blockArr.find(item => item.id == nxt.id)
			? { item: nxt, attack: nextattack }
			: { item: null, attack: null };
	}

	/**
	 * @returns {Resource[]} - list of all resources defined by Player.
	 */
	getResources() {
		const res = [];

		for (let p in this) {
			const obj = this[p];
			if (obj !== null && typeof obj === "object" && obj.type === RESOURCE) res.push(obj);
		}

		return res;
	}

	levelUp() {
		this.level.amount(1);

		this._exp.value.value -= this._next;
		this._next = Math.floor(this._next * (1 + EXP_RATE));

		Changed.add(this);

		Events.emit(LEVEL_UP, this, this._level.valueOf());
	}

	/**
	 * Init immunities, resists, etc.
	 */
	initStates() {
		this._negate = this._negate || {};
		for (let p in this._negate) {
			this._negate[p] = new Stat(this._negate[p]);
		}

		this._resist = this._resist || {};
		for (let p in this._resist) {
			if (+this._resist[p] !== 0) this._resist[p] = new Stat(this._resist[p]);
			else delete this._resist[p];
		}

		this.regen = this.regen || 0;

		if (!this.immunities)
			this.immunities = {
				fire: 0,
				water: 0,
				air: 0,
				earth: 0,
				light: 0,
				shadow: 0,
				arcane: 0,
				physical: 0,
				natural: 0,
				poison: 0,
				disease: 0,
			};

		if (!this.bonuses) this.bonuses = {};
	}

	retaliate(attacker, hit = false) {
		super.retaliate(attacker, hit);
		if (this.getCause(hit ? NO_ONHIT : NO_ONMISS)) return;
		const list = hit ? this.onHitList : this.onMissList;
		const actionId = hit ? "onHit" : "onMiss";
		let i = 0;
		let nxt;
		while (i < list.items.length) {
			nxt = list.nextItem();
			i++;
			if (nxt[actionId]) this.emitRetaliation(attacker, nxt[actionId]);
		}
	}
}
