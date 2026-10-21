import { useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../services/api.js';

export default function CategoryManager({ categories, onChange }) {
  const [form, setForm] = useState({ name: '', type: 'expense', color: '#3b82c4' });

  const add = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories', form);
      toast.success('Category added');
      setForm({ ...form, name: '' });
      onChange();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete the category "${c.name}"?`)) return;
    try {
      await api.delete(`/categories/${c._id}`);
      toast.success('Category deleted');
      onChange();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <div>
      <form onSubmit={add} className="inline-form">
        <input required placeholder="New category name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input type="color" aria-label="Category colour" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
        <button className="btn btn-primary">Add category</button>
      </form>

      {['expense', 'income'].map((type) => (
        <div key={type} className="cat-group">
          <h3>{type === 'expense' ? 'Expense categories' : 'Income categories'}</h3>
          <ul className="chips">
            {categories.filter((c) => c.type === type).map((c) => (
              <li key={c._id}>
                <span className="dot" style={{ background: c.color }} />{c.name}
                <button onClick={() => remove(c)} aria-label={`Delete ${c.name}`}>×</button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
