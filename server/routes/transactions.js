const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const t = require('../controllers/transactionController');

router.use(auth);

const rules = [
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0').toFloat(),
  body('categoryId').isMongoId().withMessage('Choose a category'),
  body('date').isISO8601().withMessage('Enter a valid date'),
  body('description').optional({ values: 'falsy' }).isLength({ max: 200 }).withMessage('Description is too long'),
];

router.get('/', t.list);
router.post('/', rules, validate, t.create);
router.put('/:id', rules, validate, t.update);
router.delete('/:id', t.remove);

module.exports = router;
