import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../services/api.js';
import { MONTHS } from '../utils.js';
import SummaryCards from '../components/SummaryCards.jsx';
import { CategoryPie, MonthlyBar, DailyLine } from '../components/Charts.jsx';
import TransactionList from '../components/TransactionList.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import Modal from '../components/Modal.jsx';

export default function Dashboard() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const p = { year, month };
    try {
      const [overview, byCategory, monthly, daily, recent, cats] = await Promise.all([
        api.get('/summary/overview', { params: p }),
        api.get('/summary/category', { params: { ...p, type: 'expense' } }),
        api.get('/summary/monthly', { params: { year } }),
        api.get('/summary/daily', { params: p }),
        api.get('/transactions', { params: { ...p, limit: 5 } }),
        api.get('/categories'),
      ]);
      setData({ overview: overview.data, byCategory: byCategory.data, monthly: monthly.data, daily: daily.data, recent: recent.data.data });
      setCategories(cats.data);
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  const add = async (values) => {
    try {
      await api.post('/transactions', values);
      toast.success('Transaction added');
      setAdding(false);
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const years = Array.from({ length: 6 }, (_, i) => now.getFullYear() - i);

  return (
    <>
      <div className="page-head">
        <h1>{MONTHS[month - 1]} {year}</h1>
        <div className="head-actions">
          <select aria-label="Month" value={month} onChange={(e) => setMonth(+e.target.value)}>
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select aria-label="Year" value={year} onChange={(e) => setYear(+e.target.value)}>
            {years.map((y) => <option key={y}>{y}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => setAdding(true)}>Add transaction</button>
        </div>
      </div>

      {loading && !data ? <p className="center-note">Loading your summary…</p> : data && (
        <>
          <SummaryCards overview={data.overview} />
          <div className="grid-2">
            <section className="panel"><h2>Spending by category</h2><CategoryPie data={data.byCategory} /></section>
            <section className="panel"><h2>Income vs expenses in {year}</h2><MonthlyBar data={data.monthly} /></section>
          </div>
          <section className="panel"><h2>Daily spending</h2><DailyLine data={data.daily} /></section>
          <section className="panel">
            <div className="panel-head">
              <h2>Recent transactions</h2>
              <Link to="/transactions">View all</Link>
            </div>
            <TransactionList items={data.recent} />
          </section>
        </>
      )}

      {adding && (
        <Modal title="Add transaction" onClose={() => setAdding(false)}>
          <TransactionForm categories={categories} onSubmit={add} onCancel={() => setAdding(false)} />
        </Modal>
      )}
    </>
  );
}
