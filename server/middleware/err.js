module.exports = () => {
	return (err, req, res, next) => {

		if (err.name === 'UnauthorizedError') {
			res.status(401).send(err.message);
			return;
		} else if (err.name === 'IncludeError') {
			res.status(404).send(err.message);
			return;
		}

		res.status(500).send();
	};
};