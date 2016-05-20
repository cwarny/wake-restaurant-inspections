const router = require('express').Router();

router.use('/inspections', require('./inspection/routes'));
router.use('/restaurants', require('./restaurant/routes'));

module.exports = router;