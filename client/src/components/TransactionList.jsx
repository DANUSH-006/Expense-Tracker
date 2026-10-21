import { money, fmtDate } from '../utils.js';

export default function TransactionList({ items, onEdit, onDelete }) {
  if (!items.length) return <p className="empty">No transactions found. Add your first one to get started.</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Date</th><th>Category</th><th>Note</th><th className="num">Amount</th>{onEdit && <th />}</tr>
        </thead>
        <tbody>
          {items.map((t) => (
            <tr key={t._id}>
              <td>{fmtDate(t.date)}</td>
              <td>
                <span className="dot" style={{ background: t.categoryId?.color }} />
                {t.categoryId?.name || 'Uncategorised'}
              </td>
              <td className="muted">{t.description || '-'}</td>
              <td className={`num ${t.type === 'income' ? 'pos' : 'neg'}`}>
                {t.type === 'income' ? '+' : '-'}{money(t.amount)}
              </td>
              {onEdit && (
                <td className="row-actions">
                  <button className="btn btn-quiet" onClick={() => onEdit(t)}>Edit</button>
                  <button className="btn btn-quiet danger" onClick={() => onDelete(t)}>Delete</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
