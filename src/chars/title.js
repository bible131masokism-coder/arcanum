import { loadFiles } from "@/dataLoader";

export const UNIQUE_TITLES = {};
const titleFileName = "titles";

export function preprocessUniqueTitles() {
	return loadFiles([titleFileName]).then(v => {
		const titles = v[titleFileName];
		Object.assign(UNIQUE_TITLES, titles);
		for (let a in UNIQUE_TITLES)
			for (let b in UNIQUE_TITLES[a].combo) {
				UNIQUE_TITLES[b].combo[a] = UNIQUE_TITLES[a].combo[b];
			}
	});
}
