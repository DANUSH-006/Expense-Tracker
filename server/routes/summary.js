const router = require('express').Router();
const auth = require('../middleware/auth');
const s = require('../controllers/summaryController');

router.use(auth);

router.get('/overview', s.overview);
router.get('/monthly', s.monthly);
router.get('/category', s.category);
router.get('/daily', s.daily);

module.exports = router;
