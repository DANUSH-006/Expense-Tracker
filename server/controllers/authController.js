const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Category = require('../models/Category');

const DEFAULT_CATEGORIES = [
  { name: 'Salary', type: 'income', color: '#1b7f5a' },
  { name: 'Freelance', type: 'income', color: '#2f9e8f' },
  { name: 'Other income', type: 'income', color: '#7bb661' },
  { name: 'Food', type: 'expense', color: '#e07a3f' },
  { name: 'Rent', type: 'expense', color: '#c2412d' },
  { name: 'Transport', type: 'expense', color: '#3b82c4' },
  { name: 'Shopping', type: 'expense', color: '#a855a8' },
  { name: 'Bills', type: 'expense', color: '#d4a017' },
  { name: 'Health', type: 'expense', color: '#e0567a' },
  { name: 'Entertainment', type: 'expense', color: '#6b6bd6' },
  { name: 'Travel', type: 'expense', color: '#2a9d8f' },
];

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email });

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    await Category.insertMany(DEFAULT_CATEGORIES.map((c) => ({ ...c, userId: user._id })));
    res.status(201).json({ token: signToken(user._id), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }
    res.json({ token: signToken(user._id), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ message: 'User no longer exists' });
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};
