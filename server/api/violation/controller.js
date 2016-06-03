const esSettings = require('../../config/esSettings'),
	utils = require('../../util');

exports.getOne = (req, res, next) => {
	var /*username = req.auth.username,*/
		violation_id = req.params.violation_id;

	es.get({
		index: 'wake',
		type: 'violation',
		id: violation_id
	}, (err, resp) => {
		if (err) {
			next(err);
		} else {
			res.send({ 
				data: utils.normalizeViolation(resp._id, null, resp._source) 
			});
		}
	});
};