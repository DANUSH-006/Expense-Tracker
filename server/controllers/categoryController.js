const Category = require('../models/Category');
const Transaction = require('../models/Transaction');

exports.list = async (req, res, next) => {
  try {
    const filter = { userId: req.user.id };
    if (req.query.type) filter.type = req.query.type;
    res.json(await Category.find(filter).sort({ type: 1, name: 1 }));
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, type, color } = req.body;
    const category = await Category.create({ userId: req.user.id, name, type, color });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { name, color } = req.body;
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name, color },
      { new: true, runValidators: true }
    );
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const inUse = await Transaction.exists({ userId: req.user.id, categoryId: req.params.id });
    if (inUse) {
      return res.status(400).json({ message: 'This category has transactions. Reassign or delete them first.' });
    }
    const category = await Category.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
};
