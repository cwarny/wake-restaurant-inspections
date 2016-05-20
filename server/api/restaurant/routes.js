const router = require('express').Router(),
	controller = require('./controller');

router.route('/')
	.get(controller.get);

router.route('/:restaurant_id')
	.get(controller.getOne);

module.exports = router;