import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useCurrency } from '../context/CurrencyContext';

const STAGES = ['Lead', 'Contacted', 'Quotation Sent', 'Won', 'Lost'];

export default function CRM() {
  const { customers, deals, followups, feedbacks, addDeal, updateDeal, addFollowup, updateFollowup, addFeedback } = useData();
  const { format } = useCurrency();
  const [tab, setTab] = useState('pipeline');
  const [modal, setModal] = useState(null);
  const [dForm, setDForm] = useState({ customer: '', stage: 'Lead', value: '', note: '' });
  const [fForm, setFForm] = useState({ customer: '', dueDate: '', note: '' });
  const [bForm, setBForm] = useState({ customer: '', rating: '5', comment: '' });
  const [error, setError] = useState('');

  const todayStr = new Date().toISOString().slice(0, 10);
  const names = (customers || []).map(c => c.name);
  const openValue = (deals || []).filter(d => d.stage !== 'Won' && d.stage !== 'Lost').reduce((a, d) => a + (d.value || 0), 0);
  const wonValue = (deals || []).filter(d => d.stage === 'Won').reduce((a, d) => a + (d.value || 0), 0);
  const overdueCount = (followups || []).filter(f => !f.done && f.dueDate < todayStr).length;

  const stageBadge = st => ({ Lead: 'blue', Contacted: 'amber', 'Quotation Sent': 'blue', Won: 'green', Lost: 'red' }[st] || 'grey');

  function saveDeal(e) {
    e.preventDefault(); setError('');
    if (!dForm.customer) return setError('Please choose a customer.');
    addDeal({ customer: dForm.customer, stage: dForm.stage, value: Number(dForm.value) || 0, note: dForm.note });
    setModal(null); setDForm({ customer: '', stage: 'Lead', value: '', note: '' });
  }
  function saveFollowup(e) {
    e.preventDefault(); setError('');
    if (!fForm.customer) return setError('Please choose a customer.');
    if (!fForm.dueDate) return setError('Please pick a date.');
    addFollowup({ customer: fForm.customer, dueDate: fForm.dueDate, note: fForm.note });
    setModal(null); setFForm({ customer: '', dueDate: '', note: '' });
  }
  function saveFeedback(e) {
    e.preventDefault(); setError('');
    if (!bForm.customer) return setError('Please choose a customer.');
    addFeedback({ customer: bForm.customer, rating: Number(bForm.rating), comment: bForm.comment });
    setModal(null); setBForm({ customer: '', rating: '5', comment: '' });
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer Relations (CRM)</h1>
          <div className="page-sub">Grow relationships, never forget a follow-up.</div>
        </div>
        <div className="pay-methods" style={{ margin: 0 }}>
          {[['pipeline', 'Pipeline'], ['followups', 'Follow-ups' + (overdueCount ? ' (' + overdueCount + ')' : '')], ['feedback', 'Feedback']].map(([k, label]) => (
            <button key={k} className={'pay-btn' + (tab === k ? ' selected' : '')} onClick={() => setTab(k)}>{label}</button>
          ))}
        </div>
      </div>

      {tab === 'pipeline' && (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div><div className="stat-label">Open Pipeline Value</div><div className="stat-value blue">{format(openValue)}</div></div>
            </div>
            <div className="stat-card">
              <div><div className="stat-label">Won Value</div><div className="stat-value green">{format(wonValue)}</div></div>
            </div>
          </div>
          <div className="page-header" style={{ marginBottom: 12 }}>
            <div />
            <button className="btn btn-green" onClick={() => { setError(''); setModal('deal'); }}>+ New Deal</button>
          </div>
          {(deals || []).length === 0 ? <div className="panel empty-state">No deals yet. Add your first opportunity!</div> : (
            STAGES.map(st => {
              const list = (deals || []).filter(d => d.stage === st);
              if (list.length === 0) return null;
              return (
                <div className="panel" key={st} style={{ marginBottom: 12 }}>
                  <div className="panel-title">{st} ({list.length})</div>
                  {list.map(d => (
                    <div key={d.id} className="cart-row">
                      <div style={{ flex: 1, minWidth: 160 }}>
                        <div style={{ fontWeight: 700 }}>{d.customer}</div>
                        <div className="choice-sub">{d.note || '—'}</div>
                      </div>
                      <div style={{ fontWeight: 800, minWidth: 110, textAlign: 'right' }}>{format(d.value)}</div>
                      <select className="currency-select" value={d.stage} onChange={e => updateDeal(d.id, { stage: e.target.value })}>
                        {STAGES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </>
      )}

      {tab === 'followups' && (
        <>
          <div className="page-header" style={{ marginBottom: 12 }}>
            <div />
            <button className="btn btn-green" onClick={() => { setError(''); setModal('followup'); }}>+ New Follow-up</button>
          </div>
          <div className="panel">
            {(followups || []).length === 0 ? <div className="empty-state">No follow-ups. Add reminders so no customer is forgotten.</div> : (
              [...(followups || [])].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).map(f => {
                const overdue = !f.done && f.dueDate < todayStr;
                return (
                  <div key={f.id} className="cart-row" style={f.done ? { opacity: 0.55 } : {}}>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div style={{ fontWeight: 700, textDecoration: f.done ? 'line-through' : 'none' }}>{f.customer}</div>
                      <div className="choice-sub">{f.note || '—'}</div>
                    </div>
                    <span className={'badge ' + (f.done ? 'grey' : overdue ? 'red' : 'green')}>
                      {f.done ? 'Done' : overdue ? 'Overdue • ' + f.dueDate : 'Due ' + f.dueDate}
                    </span>
                    <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 13 }}
                      onClick={() => updateFollowup(f.id, { done: !f.done })}>
                      {f.done ? 'Undo' : '✓ Done'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {tab === 'feedback' && (
        <>
          <div className="page-header" style={{ marginBottom: 12 }}>
            <div />
            <button className="btn btn-green" onClick={() => { setError(''); setModal('feedback'); }}>+ Add Feedback</button>
          </div>
          <div className="panel">
            {(feedbacks || []).length === 0 ? <div className="empty-state">No feedback yet.</div> : (
              [...(feedbacks || [])].reverse().map(fb => (
                <div key={fb.id} className="cart-row">
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontWeight: 700 }}>{fb.customer}</div>
                    <div className="choice-sub">{fb.comment || '—'}</div>
                  </div>
                  <div style={{ color: 'var(--amber)', fontWeight: 800, fontSize: 16 }}>
                    {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}
                  </div>
                  <div className="choice-sub">{fb.date}</div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {modal === 'deal' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <form className="modal-card" onClick={e => e.stopPropagation()} onSubmit={saveDeal}>
            <div className="modal-title">New Deal</div>
            <div className="form-group">
              <label>Customer</label>
              <select className="input" value={dForm.customer} onChange={e => setDForm({ ...dForm, customer: e.target.value })}>
                <option value="">-- Choose --</option>
                {names.map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Stage</label>
              <select className="input" value={dForm.stage} onChange={e => setDForm({ ...dForm, stage: e.target.value })}>
                {STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Estimated value</label>
              <input className="input" inputMode="numeric" value={dForm.value} onChange={e => setDForm({ ...dForm, value: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Note</label>
              <input className="input" value={dForm.note} onChange={e => setDForm({ ...dForm, note: e.target.value })} />
            </div>
            {error && <div className="alert red" style={{ marginTop: 0 }}>{error}</div>}
            <div className="form-actions">
              <button type="button" className="btn btn-outline btn-lg" style={{ flex: 1 }} onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-green btn-lg" style={{ flex: 1 }}>Save Deal</button>
            </div>
          </form>
        </div>
      )}

      {modal === 'followup' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <form className="modal-card" onClick={e => e.stopPropagation()} onSubmit={saveFollowup}>
            <div className="modal-title">New Follow-up Reminder</div>
            <div className="form-group">
              <label>Customer</label>
              <select className="input" value={fForm.customer} onChange={e => setFForm({ ...fForm, customer: e.target.value })}>
                <option value="">-- Choose --</option>
                {names.map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Due date</label>
              <input className="input" type="date" value={fForm.dueDate} onChange={e => setFForm({ ...fForm, dueDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Reminder note</label>
              <input className="input" placeholder="e.g. Call about balance" value={fForm.note} onChange={e => setFForm({ ...fForm, note: e.target.value })} />
            </div>
            {error && <div className="alert red" style={{ marginTop: 0 }}>{error}</div>}
            <div className="form-actions">
              <button type="button" className="btn btn-outline btn-lg" style={{ flex: 1 }} onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-green btn-lg" style={{ flex: 1 }}>Save Reminder</button>
            </div>
          </form>
        </div>
      )}

      {modal === 'feedback' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <form className="modal-card" onClick={e => e.stopPropagation()} onSubmit={saveFeedback}>
            <div className="modal-title">Add Customer Feedback</div>
            <div className="form-group">
              <label>Customer</label>
              <select className="input" value={bForm.customer} onChange={e => setBForm({ ...bForm, customer: e.target.value })}>
                <option value="">-- Choose --</option>
                {names.map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Rating</label>
              <select className="input" value={bForm.rating} onChange={e => setBForm({ ...bForm, rating: e.target.value })}>
                {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} star{r > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Comment</label>
              <input className="input" value={bForm.comment} onChange={e => setBForm({ ...bForm, comment: e.target.value })} />
            </div>
            {error && <div className="alert red" style={{ marginTop: 0 }}>{error}</div>}
            <div className="form-actions">
              <button type="button" className="btn btn-outline btn-lg" style={{ flex: 1 }} onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-green btn-lg" style={{ flex: 1 }}>Save Feedback</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}