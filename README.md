# Ledgerly: Personal Expense Tracker (MERN)

Track income and expenses, organise them into categories, and see monthly summaries with charts.

**Stack:** MongoDB, Express, React (Vite), Node.js, Recharts, JWT auth.

## Features
- Register / login with hashed passwords and JWT
- Add, edit, delete transactions (income or expense)
- Default categories on sign-up, plus your own custom categories
- Dashboard: balance, income, expenses, spending by category (donut), income vs expenses by month (bars), daily spending (line)
- Transactions page with search, filters (type, category, month, year) and pagination
- Server-side validation, helmet, rate limiting, per-user data isolation

## Project structure
```
expense-tracker/
├── server/
│   ├── config/db.js
│   ├── models/        User, Category, Transaction
│   ├── controllers/   auth, category, transaction, summary
│   ├── routes/        auth, categories, transactions, summary
│   ├── middleware/    auth, validate, errorHandler
│   ├── .env.example
│   └── server.js
└── client/
    └── src/
        ├── components/  Navbar, Modal, SummaryCards, Charts, TransactionForm, TransactionList, CategoryManager, ProtectedRoute
        ├── pages/       Login, Register, Dashboard, Transactions
        ├── context/     AuthContext.jsx
        ├── services/    api.js
        └── App.jsx, main.jsx, index.css
```

## Setup

**Requirements:** Node.js 18+, and MongoDB (local install or a free MongoDB Atlas cluster).

1. Install dependencies
   ```bash
   npm run install:all
   ```
2. Configure the server. A starter `server/.env` is included; edit it:
   ```
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/expense-tracker   # or your Atlas string
   JWT_SECRET=use_a_long_random_string
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   ```
3. Run both apps (two terminals, or `npm run dev` from the root)
   ```bash
   npm run server   # http://localhost:5000
   npm run client   # http://localhost:5173
   ```
4. Open http://localhost:5173, create an account, and add transactions.

## API

All routes except `/auth/register` and `/auth/login` need `Authorization: Bearer <token>`.

| Method | Route | Purpose |
|---|---|---|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Log in |
| GET | /api/auth/me | Current user |
| GET/POST | /api/categories | List / create |
| PUT/DELETE | /api/categories/:id | Update / delete (blocked if in use) |
| GET | /api/transactions?month=&year=&category=&type=&search=&page=&limit= | List with filters |
| POST | /api/transactions | Create |
| PUT/DELETE | /api/transactions/:id | Update / delete |
| GET | /api/summary/overview?year=&month= | Income, expense, balance |
| GET | /api/summary/monthly?year= | 12 months of income/expense |
| GET | /api/summary/category?year=&month=&type= | Totals per category |
| GET | /api/summary/daily?year=&month= | Spending per day |

## Deployment
- **Database:** MongoDB Atlas
- **Backend:** Render or Railway. Set `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (your frontend URL), `PORT`.
- **Frontend:** Vercel or Netlify. Build command `npm run build`, output `dist`. Set `VITE_API_URL=https://your-api-host/api`.
- For a single-page app host, add a rewrite so all routes serve `index.html`.

## Notes
- Transaction dates are stored at UTC midnight and grouped by UTC month to avoid timezone drift.
- Amounts are stored as numbers in rupees. For a production finance app, store the smallest unit (paise) as integers.

## Ideas to extend
Monthly budgets with alerts, CSV export, recurring transactions, receipt uploads, Google login, dark mode.
