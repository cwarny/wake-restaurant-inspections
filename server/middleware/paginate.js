module.exports = () => {
	return (req, res, next) => {
		var page = req.query.page,
			pageNumber = page && page.number ? page.number : 1,
			pageLimit = page && page.limit ? page.limit : 10,
			pageOffset = (pageNumber - 1) * pageLimit;

		req.pageLimit = pageLimit;
		req.pageOffset = pageOffset;
		req.pageNumber = pageNumber;

		next();
	};
};