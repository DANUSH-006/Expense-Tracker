const Transaction = require('../models/Transaction');
const Category = require('../models/Category');

const monthRange = (year, month) => ({
  $gte: new Date(Date.UTC(year, month - 1, 1)),
  $lt: new Date(Date.UTC(year, month, 1)),
});

// Confirms the category belongs to the user and matches the transaction type
async function checkCategory(userId, categoryId, type) {
  const category = await Category.findOne({ _id: categoryId, userId });
  if (!category) return 'Category not found';
  if (category.type !== type) return `Category "${category.name}" is for ${category.type}, not ${type}`;
  return null;
}

exports.list = async (req, res, next) => {
  try {
    const { month, year, category, type, search } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);

    const filter = { userId: req.user.id };
    if (type) filter.type = type;
    if (category) filter.categoryId = category;
    if (search) filter.description = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    if (year && month) filter.date = monthRange(+year, +month);
    else if (year) {
      filter.date = { $gte: new Date(Date.UTC(+year, 0, 1)), $lt: new Date(Date.UTC(+year + 1, 0, 1)) };
    }

    const [data, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('categoryId', 'name color'),
      Transaction.countDocuments(filter),
    ]);

    res.json({ data, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { categoryId, type, amount, description, date } = req.body;
    const problem = await checkCategory(req.user.id, categoryId, type);
    if (problem) return res.status(400).json({ message: problem });
    const tx = await Transaction.create({ userId: req.user.id, categoryId, type, amount, description, date });
    res.status(201).json(await tx.populate('categoryId', 'name color'));
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { categoryId, type, amount, description, date } = req.body;
    const problem = await checkCategory(req.user.id, categoryId, type);
    if (problem) return res.status(400).json({ message: problem });
    const tx = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { categoryId, type, amount, description, date },
      { new: true, runValidators: true }
    ).populate('categoryId', 'name color');
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });
    res.json(tx);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const tx = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    next(err);
  }
};
