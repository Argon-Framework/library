const has = (o: any, k: any) => Object.prototype.hasOwnProperty.call(o, k);

export const mergeDefault = (def: any, given: any): any => {
	for (const key in def) {
		if (!has(given, key) || given[key] === undefined) {
			given[key] = def[key];
		} else if (given[key] === Object(given[key])) {
			// @ts-ignore
			given[key] = mergeDefault(def[key], given[key]);
		}
	}

	return given;
};
