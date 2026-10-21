const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

// Aggregation pipelines do not auto-cast ids, so convert explicitly
const uid = (req) => new mongoose.Types.ObjectId(req.user.id);

const rangeFor = (year, month) =>
  month
    ? { $gte: new Date(Date.UTC(year, month - 1, 1)), $lt: new Date(Date.UTC(year, month, 1)) }
    : { $gte: new Date(Date.UTC(year, 0, 1)), $lt: new Date(Date.UTC(year + 1, 0, 1)) };

const parse = (req) => ({
  year: parseInt(req.query.year) || new Date().getUTCFullYear(),
  month: req.query.month ? parseInt(req.query.month) : null,
});

// GET /api/summary/overview?year=&month=   (month optional -> whole year)
exports.overview = async (req, res, next) => {
  try {
    const { year, month } = parse(req);
    const rows = await Transaction.aggregate([
      { $match: { userId: uid(req), date: rangeFor(year, month) } },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    const get = (t) => rows.find((r) => r._id === t) || { total: 0, count: 0 };
    const income = get('income').total;
    const expense = get('expense').total;
    res.json({ income, expense, balance: income - expense, count: get('income').count + get('expense').count });
  } catch (err) {
    next(err);
  }
};

// GET /api/summary/monthly?year=   -> 12 rows of { month, income, expense }
exports.monthly = async (req, res, next) => {
  try {
    const { year } = parse(req);
    const rows = await Transaction.aggregate([
      { $match: { userId: uid(req), date: rangeFor(year) } },
      { $group: { _id: { month: { $month: '$date' }, type: '$type' }, total: { $sum: '$amount' } } },
    ]);
    const result = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, income: 0, expense: 0 }));
    rows.forEach((r) => {
      result[r._id.month - 1][r._id.type] = r.total;
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// GET /api/summary/category?year=&month=&type=expense
exports.category = async (req, res, next) => {
  try {
    const { year, month } = parse(req);
    const type = req.query.type === 'income' ? 'income' : 'expense';
    const rows = await Transaction.aggregate([
      { $match: { userId: uid(req), type, date: rangeFor(year, month) } },
      { $group: { _id: '$categoryId', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'cat' } },
      { $unwind: '$cat' },
      { $project: { _id: 0, categoryId: '$_id', name: '$cat.name', color: '$cat.color', total: 1, count: 1 } },
      { $sort: { total: -1 } },
    ]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/summary/daily?year=&month=   -> spending per day of the month
exports.daily = async (req, res, next) => {
  try {
    const { year, month } = parse(req);
    if (!month) return res.status(400).json({ message: 'month is required' });
    const rows = await Transaction.aggregate([
      { $match: { userId: uid(req), type: 'expense', date: rangeFor(year, month) } },
      { $group: { _id: { $dayOfMonth: '$date' }, total: { $sum: '$amount' } } },
    ]);
    const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const result = Array.from({ length: days }, (_, i) => ({ day: i + 1, expense: 0 }));
    rows.forEach((r) => {
      result[r._id - 1].expense = r.total;
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};
