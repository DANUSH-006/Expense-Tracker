import { money } from '../utils.js';

export default function SummaryCards({ overview }) {
  const { income = 0, expense = 0, balance = 0 } = overview || {};
  return (
    <section className="summary">
      <div className="balance">
        <span className="label">Balance</span>
        <strong className={balance < 0 ? 'neg' : ''}>{money(balance)}</strong>
      </div>
      <div className="stat">
        <span className="label">Income</span>
        <strong className="pos">{money(income)}</strong>
      </div>
      <div className="stat">
        <span className="label">Expenses</span>
        <strong className="neg">{money(expense)}</strong>
      </div>
    </section>
  );
}
