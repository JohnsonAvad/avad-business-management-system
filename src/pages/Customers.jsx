import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useCurrency } from '../context/CurrencyContext';
import Icon from '../components/Icon';
import { isValidPhone, cleanPhoneInput } from '../utils/helpers';
export default function Customers() {
  const { customers, sales, receipts, addCustomer, addPayment } = useData();
  const { format } = useCurrency();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewId, setViewId] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [error, setError] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Cash');
  const [payError, setPayError] = useState('');

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  const viewCustomer = customers.find(c => c.id === viewId);
  const activity = viewCustomer ? [
    ...sales.filter(s => s.customer === viewCustomer.name).map(s => ({ id: 's' + s.id, date: s.date, type: 'Sale', amount: s.amount })),
    ...(receipts || []).filter(r => r.customer === viewCustomer.name).map(r => ({ id: 'r' + r.id, date: r.date, type: 'Payment', amount: r.amount })),
  ].sort((a, b) => b.date.localeCompare(a.date)) : [];
  const totalBought = viewCustomer
    ? sales.filter(s => s.customer === viewCustomer.name).reduce((a, s) => a + s.amount, 0)
    : 0;

  const handleSave = (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Please enter the customer name.');
    if (!isValidPhone(form.phone)) return setError('Please enter a valid phone number (10 digits, e.g. 0772 000 000).');
    addCustomer({ name: form.name.trim(), phone: form.phone.trim() });
    setForm({ name: '', phone: '' });
    setShowModal(false);
  };

  function openView(id) { setViewId(id); setPayAmount(''); setPayError(''); }

  function savePayment(e) {
    e.preventDefault();
    setPayError('');
    const amt = Number(payAmount);
    if (!amt || amt <= 0) return setPayError('Please enter a valid amount.');
    if (amt > viewCustomer.balance) return setPayError('This customer only owes ' + format(viewCustomer.balance) + '.');
    addPayment({ customerId: viewCustomer.id, amount: amt, method: payMethod });
    setPayAmount('');
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <div className="page-sub">People who buy from you.</div>
        </div>
        <button className="btn btn-green btn-lg" onClick={() => setShowModal(true)}>
          <Icon name="plus" size={18} /> Add New Customer
        </button>
      </div>

      <div className="panel">
        <div style={{ marginBottom: 16 }}>
          <div className="search-bar">
            <Icon name="search" size={18} />
            <input placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">No customers found. Add your first customer!</div>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Phone Number</th><th>Money Owed</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>{c.phone}</td>
                  <td>
                    <span className={c.balance > 0 ? 'stat-value red' : 'stat-value green'} style={{ fontSize: 15 }}>
                      {format(c.balance)}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => openView(c.id)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <form className="modal-card" onClick={e => e.stopPropagation()} onSubmit={handleSave}>
            <div className="modal-title">Add New Customer</div>
            <div className="form-group">
              <label>Customer Name</label>
              <input type="text" placeholder="e.g. John Doe" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
            <input type="tel" placeholder="e.g. 0772 000 000" value={form.phone}
            onChange={e => setForm({ ...form, phone: cleanPhoneInput(e.target.value) })} />
            </div>
            {error && <div className="alert red" style={{ marginTop: 0 }}>{error}</div>}
            <div className="form-actions">
              <button type="button" className="btn btn-outline btn-lg" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-green btn-lg" style={{ flex: 1 }}>Save Customer</button>
            </div>
          </form>
        </div>
      )}

      {viewCustomer && (
        <div className="modal-overlay" onClick={() => setViewId(null)}>
          <div className="modal-card" style={{ maxWidth: 560, maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="modal-title" style={{ marginBottom: 2 }}>{viewCustomer.name}</div>
                <div className="choice-sub">{viewCustomer.phone}</div>
              </div>
              <button className="qty-btn" onClick={() => setViewId(null)}>×</button>
            </div>

            <div className="stat-grid" style={{ gridTemplateColumns: '1fr 1fr', margin: '16px 0' }}>
              <div className="stat-card">
                <div>
                  <div className="stat-label">Money Owed</div>
                  <div className={viewCustomer.balance > 0 ? 'stat-value red' : 'stat-value green'}>{format(viewCustomer.balance)}</div>
                </div>
              </div>
              <div className="stat-card">
                <div>
                  <div className="stat-label">Total Bought</div>
                  <div className="stat-value blue">{format(totalBought)}</div>
                </div>
              </div>
            </div>

            {viewCustomer.balance > 0 && (
              <form onSubmit={savePayment} className="panel" style={{ background: 'var(--bg)', marginBottom: 16 }}>
                <div className="panel-title">Receive Payment</div>
                <div className="form-group">
                  <label>Amount received</label>
                  <input inputMode="numeric" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder={String(viewCustomer.balance)} />
                </div>
                <div className="pay-methods">
                  {['Cash', 'Mobile Money', 'Bank'].map(m => (
                    <button type="button" key={m} className={'pay-btn' + (payMethod === m ? ' selected' : '')} onClick={() => setPayMethod(m)}>{m}</button>
                  ))}
                </div>
                {payError && <div className="alert red" style={{ marginTop: 0 }}>{payError}</div>}
                <button type="submit" className="btn btn-green" style={{ width: '100%' }}>Save Payment</button>
              </form>
            )}

            <div className="panel-title">Recent Activity</div>
            {activity.length === 0 ? (
              <div className="empty-state">No activity yet.</div>
            ) : (
              <table className="table">
                <thead><tr><th>Date</th><th>Type</th><th>Amount</th></tr></thead>
                <tbody>
                  {activity.slice(0, 8).map(a => (
                    <tr key={a.id}>
                      <td>{a.date}</td>
                      <td><span className={'badge ' + (a.type === 'Payment' ? 'green' : 'blue')}>{a.type}</span></td>
                      <td style={{ fontWeight: 700 }}>{format(a.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </>
  );
}