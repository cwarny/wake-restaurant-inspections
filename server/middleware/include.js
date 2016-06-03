const utils = require('../util'),
	esSettings = require('../config/esSettings');

var validIncludes = utils.getValidIncludes(esSettings['mappings']);

module.exports = () => {
	return (req, res, next) => {
		var include = req.query.include || '',
			include = include.split(',').filter(d => d !== '');

		if (include.length) {
			var s1 = new Set(include);
			var s2 = new Set(validIncludes['inspection']);
			var intersection = new Set([...s1].filter(x => s2.has(x)));
			if (!intersection.size) {
				return res.status(404).send();
			}
			req.include = include;
			return next();
		}
		req.include = include;
		return next();
	};
};