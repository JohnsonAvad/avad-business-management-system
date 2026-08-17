import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useCurrency } from '../context/CurrencyContext';

export default function Accounting() {
  const { accounts, journal, addJournal, addAccount } = useData();
  const { format } = useCurrency();
  const [tab, setTab] = useState('chart');
  const [jForm, setJForm] = useState({ memo: '', debit: '1000', credit: '4000', amount: '' });
  const [jError, setJError] = useState('');
  const [aForm, setAForm] = useState({ code: '', name: '', type: 'Asset' });
  const [ledgerAcc, setLedgerAcc] = useState('1000');

  const accName = code => (accounts || []).find(a => a.code === code)?.name || code;

  const totals = {};
  (journal || []).forEach(e => e.lines.forEach(l => {
    totals[l.account] = totals[l.account] || { debit: 0, credit: 0 };
    totals[l.account].debit += l.debit || 0;
    totals[l.account].credit += l.credit || 0;
  }));
  const sumDebit = Object.values(totals).reduce((a, t) => a + t.debit, 0);
  const sumCredit = Object.values(totals).reduce((a, t) => a + t.credit, 0);

  const ledgerRows = [];
  let run = 0;
  (journal || []).forEach(e => e.lines.forEach(l => {
    if (l.account === ledgerAcc) {
      run += (l.debit || 0) - (l.credit || 0);
      ledgerRows.push({ id: e.id + '-' + l.account, date: e.date, ref: e.ref, memo: e.memo, debit: l.debit || 0, credit: l.credit || 0, balance: run });
    }
  }));

  function saveJournal(e) {
    e.preventDefault();
    setJError('');
    const amt = Number(jForm.amount);
    if (!amt || amt <= 0) return setJError('Please enter a valid amount.');
    if (jForm.debit === jForm.credit) return setJError('Debit and credit accounts must be different.');
    addJournal({ memo: jForm.memo, debitAccount: jForm.debit, creditAccount: jForm.credit, amount: amt });
    setJForm({ memo: '', debit: '1000', credit: '4000', amount: '' });
  }

  function saveAccount(e) {
    e.preventDefault();
    if (!aForm.code.trim() || !aForm.name.trim()) return;
    addAccount({ code: aForm.code.trim(), name: aForm.name.trim(), type: aForm.type });
    setAForm({ code: '', name: '', type: 'Asset' });
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Accounting</h1>
          <div className="page-sub">Your books, kept automatically.</div>
        </div>
        <div className="pay-methods" style={{ margin: 0 }}>
          {[['chart', 'Accounts'], ['journal', 'Journal'], ['trial', 'Trial Balance'], ['ledger', 'Ledgers']].map(([k, label]) => (
            <button key={k} className={'pay-btn' + (tab === k ? ' selected' : '')} onClick={() => setTab(k)}>{label}</button>
          ))}
        </div>
      </div>

      {tab === 'chart' && (
        <div className="panel">
          <table className="table">
            <thead><tr><th>Code</th><th>Account Name</th><th>Type</th></tr></thead>
            <tbody>
              {(accounts || []).map(a => (
                <tr key={a.code}><td style={{ fontWeight: 700 }}>{a.code}</td><td>{a.name}</td><td><span className="badge blue">{a.type}</span></td></tr>
              ))}
            </tbody>
          </table>
          <form onSubmit={saveAccount} style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input className="input" style={{ flex: 1, minWidth: 80 }} placeholder="Code e.g. 6100" value={aForm.code} onChange={e => setAForm({ ...aForm, code: e.target.value })} />
            <input className="input" style={{ flex: 2, minWidth: 140 }} placeholder="Account name" value={aForm.name} onChange={e => setAForm({ ...aForm, name: e.target.value })} />
            <select className="input" style={{ flex: 1, minWidth: 100 }} value={aForm.type} onChange={e => setAForm({ ...aForm, type: e.target.value })}>
              {['Asset', 'Liability', 'Equity', 'Income', 'Expense'].map(t => <option key={t}>{t}</option>)}
            </select>
            <button className="btn btn-green" type="submit">Add</button>
          </form>
        </div>
      )}

      {tab === 'journal' && (
        <>
          <div className="panel" style={{ marginBottom: 14 }}>
            <div className="panel-title">New Journal Entry</div>
            <form onSubmit={saveJournal}>
              <div className="form-group">
                <label>Description</label>
                <input className="input" placeholder="e.g. Correction of..." value={jForm.memo} onChange={e => setJForm({ ...jForm, memo: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Debit account (money goes in)</label>
                <select className="input" value={jForm.debit} onChange={e => setJForm({ ...jForm, debit: e.target.value })}>
                  {(accounts || []).map(a => <option key={a.code} value={a.code}>{a.code} – {a.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Credit account (money comes from)</label>
                <select className="input" value={jForm.credit} onChange={e => setJForm({ ...jForm, credit: e.target.value })}>
                  {(accounts || []).map(a => <option key={a.code} value={a.code}>{a.code} – {a.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input className="input" inputMode="numeric" value={jForm.amount} onChange={e => setJForm({ ...jForm, amount: e.target.value })} />
              </div>
              {jError && <div className="alert red" style={{ marginTop: 0 }}>{jError}</div>}
              <button className="btn btn-green" style={{ width: '100%' }} type="submit">Save Entry</button>
            </form>
          </div>
          <div className="panel">
            <div className="panel-title">Journal ({(journal || []).length} entries)</div>
            {(journal || []).length === 0 ? <div className="empty-state">No entries yet. Make a sale or expense and it appears here automatically.</div> : (
              [...(journal || [])].reverse().map(e => (
                <div key={e.id} style={{ borderBottom: '1px solid var(--border)', padding: '10px 0' }}>
                  <div style={{ fontWeight: 700 }}>{e.date} • {e.ref} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>— {e.memo}</span></div>
                  {e.lines.map((l, i) => (
                    <div key={i} style={{ fontSize: 13, color: '#374151', paddingLeft: 12 }}>
                      {l.debit > 0 ? 'DR' : 'CR'} {l.account} {accName(l.account)} — <strong>{format(l.debit > 0 ? l.debit : l.credit)}</strong>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </>
      )}

      {tab === 'trial' && (
        <div className="panel">
          <div className="panel-title">Trial Balance</div>
          <table className="table">
            <thead><tr><th>Code</th><th>Account</th><th>Debit</th><th>Credit</th></tr></thead>
            <tbody>
              {(accounts || []).map(a => {
                const t = totals[a.code] || { debit: 0, credit: 0 };
                return (
                  <tr key={a.code}>
                    <td style={{ fontWeight: 700 }}>{a.code}</td>
                    <td>{a.name}</td>
                    <td>{t.debit ? format(t.debit) : '—'}</td>
                    <td>{t.credit ? format(t.credit) : '—'}</td>
                  </tr>
                );
              })}
              <tr style={{ background: 'var(--green-light)' }}>
                <td></td><td style={{ fontWeight: 800 }}>TOTAL</td>
                <td style={{ fontWeight: 800 }}>{format(sumDebit)}</td>
                <td style={{ fontWeight: 800 }}>{format(sumCredit)}</td>
              </tr>
            </tbody>
          </table>
          <div className={'alert ' + (sumDebit === sumCredit ? 'green' : 'red')} style={{ marginTop: 12 }}>
            {sumDebit === sumCredit ? '✓ Books are balanced.' : 'Warning: books are not balanced!'}
          </div>
        </div>
      )}

      {tab === 'ledger' && (
        <div className="panel">
          <div className="form-group" style={{ maxWidth: 320 }}>
            <label>Choose account</label>
            <select className="input" value={ledgerAcc} onChange={e => setLedgerAcc(e.target.value)}>
              {(accounts || []).map(a => <option key={a.code} value={a.code}>{a.code} – {a.name}</option>)}
            </select>
          </div>
          <table className="table">
            <thead><tr><th>Date</th><th>Ref</th><th>Description</th><th>Debit</th><th>Credit</th><th>Balance</th></tr></thead>
            <tbody>
              {ledgerRows.length === 0 ? <tr><td colSpan="6"><div className="empty-state">No activity on this account yet.</div></td></tr> :
                ledgerRows.map(r => (
                  <tr key={r.id}>
                    <td>{r.date}</td><td>{r.ref}</td><td>{r.memo}</td>
                    <td>{r.debit ? format(r.debit) : '—'}</td>
                    <td>{r.credit ? format(r.credit) : '—'}</td>
                    <td style={{ fontWeight: 800, color: r.balance >= 0 ? 'var(--green-deep)' : 'var(--red)' }}>{format(r.balance)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}