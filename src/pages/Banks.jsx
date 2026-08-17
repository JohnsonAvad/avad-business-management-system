import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useCurrency } from '../context/CurrencyContext';
import Icon from '../components/Icon';

export default function Banks() {
  const { accounts, journal, addJournal } = useData();
  const { format } = useCurrency();
  const moneyAccounts = (accounts || []).filter(a => a.bank);
  const [sel, setSel] = useState('1000');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ amount: '', from: '1000', to: '1010', note: '' });
  const [error, setError] = useState('');

  const balanceOf = code => (journal || []).reduce((a, e) => a + e.lines.reduce((x, l) => l.account === code ? x + (l.debit || 0) - (l.credit || 0) : x, 0), 0);
  const total = moneyAccounts.reduce((a, m) => a + balanceOf(m.code), 0);

  const rows = [];
  let run = 0;
  (journal || []).forEach(e => e.lines.forEach(l => {
    if (l.account === sel) {
      run += (l.debit || 0) - (l.credit || 0);
      rows.push({ id: e.id + '-' + l.account, date: e.date, ref: e.ref, memo: e.memo, in: l.debit || 0, out: l.credit || 0, balance: run });
    }
  }));

  function save(e) {
    e.preventDefault();
    setError('');
    const amt = Number(form.amount);
    if (!amt || amt <= 0) return setError('Please enter a valid amount.');
    if (modal === 'add') addJournal({ memo: form.note || 'Owner put money in', debitAccount: sel, creditAccount: '3000', amount: amt, ref: 'BNK' });
    if (modal === 'take') addJournal({ memo: form.note || 'Owner took money out', debitAccount: '3000', creditAccount: sel, amount: amt, ref: 'BNK' });
    if (modal === 'transfer') {
      if (form.from === form.to) return setError('Choose two different accounts.');
      addJournal({ memo: form.note || 'Transfer between accounts', debitAccount: form.to, creditAccount: form.from, amount: amt, ref: 'BNK' });
    }
    setModal(null);
    setForm({ amount: '', from: '1000', to: '1010', note: '' });
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Banks</h1>
          <div className="page-sub">All your money in one place.</div>
        </div>
        <div className="pay-methods" style={{ margin: 0 }}>
          <button className="btn btn-green" onClick={() => { setError(''); setModal('add'); }}>Add Money</button>
          <button className="btn btn-outline" onClick={() => { setError(''); setModal('take'); }}>Take Money</button>
          <button className="btn btn-blue" onClick={() => { setError(''); setModal('transfer'); }}>Transfer</button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div><div className="stat-label">Total Money Available</div><div className="stat-value green">{format(total)}</div></div>
          <div className="stat-icon green"><Icon name="banks" /></div>
        </div>
        {moneyAccounts.map(m => (
          <div className="stat-card" key={m.code}>
            <div><div className="stat-label">{m.name}</div><div className="stat-value blue">{format(balanceOf(m.code))}</div></div>
            <div className="stat-icon blue"><Icon name="banks" /></div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="pay-methods">
          {moneyAccounts.map(m => (
            <button key={m.code} className={'pay-btn' + (sel === m.code ? ' selected' : '')} onClick={() => setSel(m.code)}>{m.name}</button>
          ))}
        </div>
        <table className="table">
          <thead><tr><th>Date</th><th>Ref</th><th>Description</th><th>Money In</th><th>Money Out</th><th>Balance</th></tr></thead>
          <tbody>
            {rows.length === 0 ? <tr><td colSpan="6"><div className="empty-state">No transactions on this account yet.</div></td></tr> :
              rows.map(r => (
                <tr key={r.id}>
                  <td>{r.date}</td><td>{r.ref}</td><td>{r.memo}</td>
                  <td style={{ color: 'var(--green-deep)', fontWeight: 700 }}>{r.in ? format(r.in) : '—'}</td>
                  <td style={{ color: 'var(--red)', fontWeight: 700 }}>{r.out ? format(r.out) : '—'}</td>
                  <td style={{ fontWeight: 800 }}>{format(r.balance)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <form className="modal-card" onClick={e => e.stopPropagation()} onSubmit={save}>
            <div className="modal-title">
              {modal === 'add' ? 'Add Money' : modal === 'take' ? 'Take Money Out' : 'Transfer Between Accounts'}
            </div>
            {modal === 'transfer' ? (
              <>
                <div className="form-group">
                  <label>From</label>
                  <select className="input" value={form.from} onChange={e => setForm({ ...form, from: e.target.value })}>
                    {moneyAccounts.map(m => <option key={m.code} value={m.code}>{m.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>To</label>
                  <select className="input" value={form.to} onChange={e => setForm({ ...form, to: e.target.value })}>
                    {moneyAccounts.map(m => <option key={m.code} value={m.code}>{m.name}</option>)}
                  </select>
                </div>
              </>
            ) : (
              <div className="form-group">
                <label>Account</label>
                <select className="input" value={sel} onChange={e => setSel(e.target.value)}>
                  {moneyAccounts.map(m => <option key={m.code} value={m.code}>{m.name}</option>)}
                </select>
              </div>
            )}
            <div className="form-group">
              <label>Amount</label>
              <input className="input" inputMode="numeric" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Note (optional)</label>
              <input className="input" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
            </div>
            {error && <div className="alert red" style={{ marginTop: 0 }}>{error}</div>}
            <div className="form-actions">
              <button type="button" className="btn btn-outline btn-lg" style={{ flex: 1 }} onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-green btn-lg" style={{ flex: 1 }}>Save</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}