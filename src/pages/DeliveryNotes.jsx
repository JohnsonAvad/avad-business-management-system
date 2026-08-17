import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useCurrency } from '../context/CurrencyContext';
import PrintDoc from '../components/PrintDoc';
import Icon from '../components/Icon';

export default function DeliveryNotes() {
  const { deliveryNotes, customers, products, addDeliveryNote, updateDeliveryNote } = useData();
  const { format } = useCurrency();
  const [doc, setDoc] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [deliveredBy, setDeliveredBy] = useState('');
  const [prodSearch, setProdSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [error, setError] = useState('');
  const business = JSON.parse(localStorage.getItem('avad_business') || '{}');

  const qtyOf = i => Number(i.qty) || 0;
  const list = [...(deliveryNotes || [])].reverse();
  const fProducts = (products || []).filter(p => p.active !== false && p.name.toLowerCase().includes(prodSearch.toLowerCase()));
  const phoneOf = name => (customers || []).find(c => c.name === name)?.phone || '';

  function addToCart(p) {
    setCart(prev => {
      const line = prev.find(i => i.productId === p.id);
      if (line) return prev.map(i => i.productId === p.id ? { ...i, qty: String(qtyOf(i) + 1) } : i);
      return [...prev, { productId: p.id, name: p.name, price: p.price, qty: '1' }];
    });
  }
  function setQty(id, value) {
    const clean = String(value).replace(/[^\d]/g, '');
    setCart(prev => prev.map(i => i.productId === id ? { ...i, qty: clean } : i));
  }

  function save(e) {
    e.preventDefault();
    setError('');
    const customer = (customers || []).find(c => c.id === Number(customerId));
    if (!customer) return setError('Please choose a customer.');
    if (cart.length === 0 || cart.some(i => qtyOf(i) <= 0)) return setError('Add at least one item with a quantity.');
    if (!deliveredBy.trim()) return setError('Please write who delivered the goods.');
    addDeliveryNote({ customerName: customer.name, items: cart.map(i => ({ ...i, qty: qtyOf(i) })), deliveredBy: deliveredBy.trim() });
    setShowNew(false); setCustomerId(''); setDeliveredBy(''); setCart([]);
  }

  function open(d) {
    setDoc({
      type: 'DELIVERY', number: d.number, date: d.date, customer: d.customer, deliveredBy: d.deliveredBy,
      customerPhone: phoneOf(d.customer), items: d.items || [], total: 0, paid: 0, method: '',
      businessName: business.name, logo: business.logo, businessPhone: business.phone,
      businessAddress: business.address, footer: business.footer,
    });
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Delivery Notes</h1>
          <div className="page-sub">Proof of goods delivered.</div>
        </div>
        <button className="btn btn-green btn-lg" onClick={() => { setError(''); setShowNew(true); }}>+ New Delivery Note</button>
      </div>

      <div className="panel">
        {list.length === 0 ? <div className="empty-state">No delivery notes yet.</div> : (
          <table className="table">
            <thead><tr><th>No.</th><th>Date</th><th>Customer</th><th>Delivered by</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {list.map(d => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 700 }}>{d.number}</td>
                  <td>{d.date}</td>
                  <td>{d.customer}</td>
                  <td>{d.deliveredBy}</td>
                  <td><span className={'badge ' + (d.status === 'Delivered' ? 'green' : 'amber')}>{d.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button className="btn btn-outline" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => open(d)}>View</button>
                      {d.status === 'Pending' && (
                        <button className="btn btn-green" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => updateDeliveryNote(d.id, { status: 'Delivered' })}>Mark Delivered</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showNew && (
        <div className="modal-overlay" onClick={() => setShowNew(false)}>
          <form className="modal-card" style={{ maxWidth: 560, maxHeight: '88vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()} onSubmit={save}>
            <div className="modal-title">New Delivery Note</div>
            <div className="form-group">
              <label>Customer</label>
              <select className="input" value={customerId} onChange={e => setCustomerId(e.target.value)}>
                <option value="">-- Choose customer --</option>
                {(customers || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Delivered by</label>
              <input className="input" placeholder="e.g. Driver name" value={deliveredBy} onChange={e => setDeliveredBy(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Add items</label>
              <div className="search-bar"><Icon name="search" size={18} /><input placeholder="Search product..." value={prodSearch} onChange={e => setProdSearch(e.target.value)} /></div>
              <div className="product-grid" style={{ marginTop: 10 }}>
                {fProducts.slice(0, 6).map(p => (
                  <button type="button" key={p.id} className="product-card" onClick={() => addToCart(p)}>
                    <div className="p-name">{p.name}</div>
                  </button>
                ))}
              </div>
            </div>
            {cart.length > 0 && cart.map(i => (
              <div className="cart-row" key={i.productId}>
                <div style={{ flex: 1, fontWeight: 700 }}>{i.name}</div>
                <input className="qty-input" inputMode="numeric" value={i.qty} onChange={e => setQty(i.productId, e.target.value)} />
                <button type="button" className="qty-btn" onClick={() => setCart(prev => prev.filter(x => x.productId !== i.productId))}>×</button>
              </div>
            ))}
            {error && <div className="alert red" style={{ marginTop: 8 }}>{error}</div>}
            <div className="form-actions">
              <button type="button" className="btn btn-outline btn-lg" style={{ flex: 1 }} onClick={() => setShowNew(false)}>Cancel</button>
              <button type="submit" className="btn btn-green btn-lg" style={{ flex: 1 }}>Save</button>
            </div>
          </form>
        </div>
      )}

      {doc && <PrintDoc doc={doc} onClose={() => setDoc(null)} />}
    </>
  );
}