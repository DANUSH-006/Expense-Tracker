import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../services/api.js';
import { MONTHS } from '../utils.js';
import TransactionList from '../components/TransactionList.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import CategoryManager from '../components/CategoryManager.jsx';
import Modal from '../components/Modal.jsx';

const blank = { month: '', year: '', category: '', type: '', search: '' };

export default function Transactions() {
  const [filters, setFilters] = useState(blank);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ data: [], total: 0, pages: 1 });
  const [categories, setCategories] = useState([]);
  const [modal, setModal] = useState(null); // 'add' | 'categories' | transaction being edited
  const [loading, setLoading] = useState(true);

  const loadCategories = useCallback(() => api.get('/categories').then((r) => setCategories(r.data)), []);

  const load = useCallback(async () => {
    setLoading(true);
    const params = { page, limit: 10 };
    Object.entries(filters).forEach(([k, v]) => v && (params[k] = v));
    // A month filter needs a year; default to the current one
    if (params.month && !params.year) params.year = new Date().getFullYear();
    try {
      const res = await api.get('/transactions', { params });
      setResult(res.data);
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { loadCategories().catch((e) => toast.error(errMsg(e))); }, [loadCategories]);
  useEffect(() => { load(); }, [load]);

  // Debounce the search box
  useEffect(() => {
    const t = setTimeout(() => { setFilters((f) => ({ ...f, search })); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const setFilter = (k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); };

  const save = async (values) => {
    const editing = modal && modal !== 'add';
    try {
      if (editing) await api.put(`/transactions/${modal._id}`, values);
      else await api.post('/transactions', values);
      toast.success(editing ? 'Changes saved' : 'Transaction added');
      setModal(null);
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const remove = async (t) => {
    if (!window.confirm('Delete this transaction? This cannot be undone.')) return;
    try {
      await api.delete(`/transactions/${t._id}`);
      toast.success('Transaction deleted');
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

  return (
    <>
      <div className="page-head">
        <h1>Transactions</h1>
        <div className="head-actions">
          <button className="btn" onClick={() => setModal('categories')}>Manage categories</button>
          <button className="btn btn-primary" onClick={() => setModal('add')}>Add transaction</button>
        </div>
      </div>

      <section className="panel">
        <div className="filters">
          <input type="search" placeholder="Search notes" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select aria-label="Type" value={filters.type} onChange={(e) => setFilter('type', e.target.value)}>
            <option value="">All types</option><option value="expense">Expenses</option><option value="income">Income</option>
          </select>
          <select aria-label="Category" value={filters.category} onChange={(e) => setFilter('category', e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select aria-label="Month" value={filters.month} onChange={(e) => setFilter('month', e.target.value)}>
            <option value="">Any month</option>
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select aria-label="Year" value={filters.year} onChange={(e) => setFilter('year', e.target.value)}>
            <option value="">Any year</option>
            {years.map((y) => <option key={y}>{y}</option>)}
          </select>
          <button className="btn btn-quiet" onClick={() => { setFilters(blank); setSearch(''); setPage(1); }}>Clear filters</button>
        </div>

        {loading ? <p className="center-note">Loading transactions…</p> : (
          <TransactionList items={result.data} onEdit={(t) => setModal(t)} onDelete={remove} />
        )}

        <div className="pager">
          <span className="muted">{result.total} transaction{result.total === 1 ? '' : 's'}</span>
          <div>
            <button className="btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
            <span className="muted pager-page">Page {page} of {result.pages}</span>
            <button className="btn" disabled={page >= result.pages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </div>
      </section>

      {modal === 'categories' && (
        <Modal title="Categories" onClose={() => setModal(null)}>
          <CategoryManager categories={categories} onChange={loadCategories} />
        </Modal>
      )}
      {modal && modal !== 'categories' && (
        <Modal title={modal === 'add' ? 'Add transaction' : 'Edit transaction'} onClose={() => setModal(null)}>
          <TransactionForm categories={categories} initial={modal === 'add' ? null : modal} onSubmit={save} onCancel={() => setModal(null)} />
        </Modal>
      )}
    </>
  );
}
