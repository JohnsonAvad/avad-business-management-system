import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useCurrency } from '../context/CurrencyContext';
import Icon from '../components/Icon';

const CATEGORIES = ['Rent', 'Transport', 'Electricity', 'Water', 'Salaries', 'Repairs', 'Marketing', 'Communication', 'Stationery', 'Other'];

export default function Expenses() {
  const { expenses, addExpense } = useData();
  const { format } = useCurrency();
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('All');
  const [form, setForm] = useState({ amount: '', category: CATEGORIES[0], note: '', method: 'Cash' });
  const [error, setError] = useState('');

  const t = new Date().toISOString().slice(0, 10);
  const month = t.slice(0, 7);
  const spentToday = expenses.filter(e => e.date === t).reduce((a, e) => a + e.amount, 0);
  const spentMonth = expenses.filter(e => e.date.startsWith(month)).reduce((a, e) => a + e.amount, 0);
  const list = [...expenses].filter(e => filter === 'All' || e.category === filter).reverse();

  function save(e) {
    e.preventDefault();
    setError('');
    const amt = Number(form.amount);
    if (!amt || amt <= 0) return setError('Please enter a valid amount.');
    if (!form.note.trim()) return setError('Please write a short note (what was this for?).');
    addExpense({ amount: amt, category: form.category, note: form.note.trim(), method: form.method });
    setForm({ amount: '', category: CATEGORIES[0], note: '', method: 'Cash' });
    setShowAdd(false);
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <div className="page-sub">Money going out of the business.</div>
        </div>
        <button className="btn btn-green btn-lg" onClick={() => { setError(''); setShowAdd(true); }}>
          <Icon name="plus" size={18} /> Add Expense
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div><div className="stat-label">Spent Today</div><div className="stat-value red">{format(spentToday)}</div></div>
          <div className="stat-icon amber"><Icon name="expenses" /></div>
        </div>
        <div className="stat-card">
          <div><div className="stat-label">Spent This Month</div><div className="stat-value red">{format(spentMonth)}</div></div>
          <div className="stat-icon amber"><Icon name="reports" /></div>
        </div>
      </div>

      <div className="panel">
        <div className="form-group" style={{ maxWidth: 240, marginBottom: 16 }}>
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option>All</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        {list.length === 0 ? (
          <div className="empty-state">No expenses in this category yet.</div>
        ) : (
          <table className="table">
            <thead><tr><th>Date</th><th>Category</th><th>Note</th><th>Amount</th></tr></thead>
            <tbody>
              {list.map(e => (
                <tr key={e.id}>
                  <td>{e.date}</td>
                  <td><span className="badge blue">{e.category}</span></td>
                  <td>{e.note}</td>
                  <td style={{ fontWeight: 800, color: 'var(--red)' }}>{format(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <form className="modal-card" onClick={e => e.stopPropagation()} onSubmit={save}>
            <div className="modal-title">Add Expense</div>
            <div className="form-group">
              <label>Amount</label>
              <input inputMode="numeric" placeholder="e.g. 20000" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} autoFocus />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>What was this for?</label>
              <input placeholder="e.g. Taxi to market" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Paid using</label>
              <div className="pay-methods" style={{ margin: 0 }}>
                {['Cash', 'Mobile Money', 'Bank'].map(m => (
                  <button type="button" key={m} className={'pay-btn' + (form.method === m ? ' selected' : '')} onClick={() => setForm({ ...form, method: m })}>{m}</button>
                ))}
              </div>
            </div>
            {error && <div className="alert red" style={{ marginTop: 0 }}>{error}</div>}
            <div className="form-actions">
              <button type="button" className="btn btn-outline btn-lg" style={{ flex: 1 }} onClick={() => setShowAdd(false)}>Cancel</button>
              <button type="submit" className="btn btn-green btn-lg" style={{ flex: 1 }}>Save Expense</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}