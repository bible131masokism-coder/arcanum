const HALL_FILE = "hall";
const SETTINGS_DIR = "settings/";

const Remote = null;

/**
 * Handles persisting data to various sources: local, remote, file.
 */
export const Persist = {
	loggedIn() {
		return Remote?.loggedIn;
	},

	logout() {
		if (Remote?.loggedIn) Remote.logout();
	},

	loaders: [],

	/**
	 *
	 * @param {*} loader
	 * @param {boolean} first - whether this should be first loader attempted.
	 */
	addLoader(loader, first) {
		if (first) {
			this.loaders.unshift(loader);
		} else {
			this.loaders.push(loader);
		}
		return loader;
	},

	/**
	 * Clear all data.
	 */
	async clearAll() {
		for (let i = 0; i < this.loaders.length; i++) {
			try {
				this.loaders[i].clearAll();
			} catch (err) {
				console.warn(err);
			}
		}
	},

	async deleteChar(charid) {
		for (let i = 0; i < this.loaders.length; i++) {
			try {
				this.loaders[i].deleteChar(charid);
			} catch (err) {
				console.warn(err);
			}
		}
	},

	/**
	 * @param {string} data
	 * @param {string} charid
	 *
	 * @returns {Promise.<object>}
	 */
	async saveChar(data, charid) {
		for (let i = 0; i < this.loaders.length; i++) {
			const ldr = this.loaders[i];
			try {
				await ldr.saveChar(data, charid);
				this.setMeta("char", charid, ldr.id || i);
			} catch (err) {
				console.warn(err);
			}
		}
	},

	/**
	 * @param {string} data
	 * @param {?string} [hid=HALL_FILE]
	 */
	async saveHall(data, hid = HALL_FILE) {
		for (let i = 0; i < this.loaders.length; i++) {
			const ldr = this.loaders[i];
			try {
				await ldr.saveHall(data, hid);
				this.setMeta("hall", hid, ldr.id || i);
			} catch (err) {
				console.warn(err);
			}
		}
	},

	/**
	 * @param {string} charid
	 * @returns {Promise<object>}
	 */
	async loadChar(charid) {
		let best = null;
		let bestTime = -1;

		for (let i = 0; i < this.loaders.length; i++) {
			const ldr = this.loaders[i];
			if (!ldr.loadChar) continue;

			let res = null;
			try {
				res = await ldr.loadChar(charid);
			} catch (err) {
				console.warn(err);
			}
			if (!res) continue;

			const t = this.getMeta("char", charid, ldr.id || i);
			if (t > bestTime) {
				best = res;
				bestTime = t;
			}
		}

		return best;
	},

	/**
	 * @returns {Promise.<object>}
	 */
	async loadHall(hid = HALL_FILE) {
		let best = null;
		let bestTime = -1;

		for (let i = 0; i < this.loaders.length; i++) {
			const ldr = this.loaders[i];
			if (!ldr.loadHall) continue;

			let res = null;
			try {
				res = await ldr.loadHall(hid);
			} catch (err) {
				console.warn(err);
			}
			if (!res) continue;

			const t = this.getMeta("hall", hid, ldr.id || i);
			if (t > bestTime) {
				best = res;
				bestTime = t;
			}
		}

		return best;
	},

	/**
	 * Timestamp of the last successful save to a given loader & key.
	 * Kept in localStorage so it survives even if IndexedDB is unavailable.
	 */
	metaKey(kind, key, id) {
		return `save/meta/${kind}/${key}/${id}`;
	},

	setMeta(kind, key, id) {
		try {
			window.localStorage.setItem(this.metaKey(kind, key, id), String(Date.now()));
		} catch (err) {
			console.warn(err);
		}
	},

	getMeta(kind, key, id) {
		try {
			const v = window.localStorage.getItem(this.metaKey(kind, key, id));
			return v ? Number(v) : 0;
		} catch (err) {
			return 0;
		}
	},

	saveSettings(data, charid) {
		window.localStorage.setItem(this.settingsLoc(charid), data);
	},

	loadSettings(charid) {
		return window.localStorage.getItem(this.settingsLoc(charid));
	},

	/**
	 * Path of settings file for character.
	 * @param {string} charid
	 * @returns {string} path to settings file.
	 */
	settingsLoc(charid) {
		return SETTINGS_DIR + "/" + charid + "/";
	},
};
