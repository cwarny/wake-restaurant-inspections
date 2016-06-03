module.exports = () => {
	return (req, res, next) => {
		var sortingProperty = req.query.sort || '_score',
			sortingDir = 'asc';
		
		if (sortingProperty[0] === '-') {
			sortingDir = 'desc';
			sortingProperty = sortingProperty.slice(1);
		}

		req.sortingProperty = sortingProperty;
		req.sortingDir = sortingDir;

		next();
	};
};