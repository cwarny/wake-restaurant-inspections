const router = require('express').Router(),
	controller = require('./controller');

router.route('/:violation_id')
	.get(controller.getOne);

module.exports = router;