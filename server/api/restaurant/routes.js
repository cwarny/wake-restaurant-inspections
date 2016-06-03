const router = require('express').Router(),
	controller = require('./controller');

router.route('/')
	.all(require('../../middleware/sort')(), require('../../middleware/paginate')()) // Route-specific middleware
	.get(controller.get);

router.route('/:restaurant_id')
	.get(controller.getOne);

module.exports = router;