import { useState } from 'react';
import { toInputDate } from '../utils.js';

export default function TransactionForm({ categories, initial, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    type: initial?.type || 'expense',
    amount: initial?.amount ?? '',
    categoryId: initial?.categoryId?._id || initial?.categoryId || '',
    date: initial ? toInputDate(initial.date) : toInputDate(),
    description: initial?.description || '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const options = categories.filter((c) => c.type === form.type);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({ ...form, amount: Number(form.amount) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="form">
      <div className="segmented" role="group" aria-label="Transaction type">
        {['expense', 'income'].map((t) => (
          <button
            type="button"
            key={t}
            className={form.type === t ? `active ${t}` : ''}
            onClick={() => setForm((f) => ({ ...f, type: t, categoryId: '' }))}
          >
            {t === 'expense' ? 'Expense' : 'Income'}
          </button>
        ))}
      </div>

      <label>Amount (₹)
        <input type="number" min="0.01" step="0.01" required value={form.amount} onChange={(e) => set('amount', e.target.value)} />
      </label>

      <label>Category
        <select required value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
          <option value="">Choose a category</option>
          {options.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </label>

      <label>Date
        <input type="date" required value={form.date} onChange={(e) => set('date', e.target.value)} />
      </label>

      <label>Note
        <input type="text" maxLength={200} placeholder="Optional" value={form.description} onChange={(e) => set('description', e.target.value)} />
      </label>

      <div className="form-actions">
        <button type="button" className="btn btn-quiet" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : initial ? 'Save changes' : 'Add transaction'}
        </button>
      </div>
    </form>
  );
}
