module.exports = {
	normalizeRecord: (type, id, score, record) => {
		var normalizedRecord = {
			type: type,
			id: id,
			attributes: JSON.parse(JSON.stringify(record))
		};

		if (score) normalizedRecord.attributes.score = score;		

		return normalizedRecord;
	}
};