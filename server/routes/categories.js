const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const c = require('../controllers/categoryController');

router.use(auth);

const rules = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('color').optional().matches(/^#[0-9a-fA-F]{6}$/).withMessage('Color must be a hex value like #1b7f5a'),
];

router.get('/', c.list);
router.post('/', [...rules, body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense')], validate, c.create);
router.put('/:id', rules, validate, c.update);
router.delete('/:id', c.remove);

module.exports = router;
