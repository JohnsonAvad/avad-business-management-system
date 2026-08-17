import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useCurrency } from '../context/CurrencyContext';
import Icon from '../components/Icon';

export default function NewQuotation() {
  const { customers, products, addQuotation } = useData();
  const { format } = useCurrency();
  const [customerId, setCustomerId] = useState(null);
  const [search, setSearch] = useState('');
  const [prodSearch, setProdSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [validDays, setValidDays] = useState('7');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const qtyOf = i => Number(i.qty) || 0;
  const total = cart.reduce((a, i) => a + qtyOf(i) * i.price, 0);
  const customer = (customers || []).find(c => c.id === customerId);
  const fCustomers = (customers || []).filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));
  const fProducts = (products || []).filter(p => p.active !== false && p.name.toLowerCase().includes(prodSearch.toLowerCase()));

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
  const removeLine = id => setCart(prev => prev.filter(i => i.productId !== id));

  function save() {
    setError('');
    if (!customer) return setError('Please choose a customer.');
    if (cart.length === 0 || cart.some(i => qtyOf(i) <= 0)) return setError('Add at least one item with a quantity.');
    const dd = new Date(); dd.setDate(dd.getDate() + Number(validDays));
    addQuotation({ customerId, customerName: customer.name, items: cart.map(i => ({ ...i, qty: qtyOf(i) })), total, validUntil: dd.toISOString().slice(0, 10) });
    setDone(true);
  }

  if (done) {
    return (
      <div className="panel success-wrap">
        <div className="success-icon">✓</div>
        <h2>Quotation saved!</h2>
        <div className="page-sub">You can now send, accept, or convert it to an invoice.</div>
        <div className="nav-row">
          <Link to="/quotations" className="btn btn-green btn-lg">View Quotations</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">New Quotation</h1>
          <div className="page-sub">Give a customer a price estimate.</div>
        </div>
        <Link to="/quotations" className="btn btn-outline">Cancel</Link>
      </div>

      {error && <div className="alert red" style={{ marginBottom: 14 }}>{error}</div>}

      <div className="panel" style={{ marginBottom: 14 }}>
        <div className="panel-title">1. Who is it for?</div>
        <div className="search-bar" style={{ marginBottom: 12 }}>
          <Icon name="search" size={18} />
          <input placeholder="Search customer..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="choice-grid">
          {fCustomers.map(c => (
            <button key={c.id} className={'choice-card' + (customerId === c.id ? ' selected' : '')} onClick={() => setCustomerId(c.id)}
              style={customerId === c.id ? { borderColor: 'var(--green)', background: 'var(--green-light)' } : {}}>
              <div className="choice-title">{c.name}</div>
              <div className="choice-sub">{c.phone}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 14 }}>
        <div className="panel-title">2. What are you quoting?</div>
        <div className="search-bar">
          <Icon name="search" size={18} />
          <input placeholder="Search product..." value={prodSearch} onChange={e => setProdSearch(e.target.value)} />
        </div>
        <div className="product-grid">
          {fProducts.map(p => (
            <button key={p.id} className="product-card" onClick={() => addToCart(p)}>
              <div className="p-name">{p.name}</div>
              <div className="p-price">{format(p.price)}</div>
            </button>
          ))}
        </div>
      </div>

      {cart.length > 0 && (
        <div className="cart">
          <div className="panel-title">Basket</div>
          {cart.map(i => (
            <div className="cart-row" key={i.productId}>
              <div style={{ flex: 1, minWidth: 140 }}><div style={{ fontWeight: 700 }}>{i.name}</div></div>
              <div className="qty-ctrl">
                <input className="qty-input" inputMode="numeric" value={i.qty} onChange={e => setQty(i.productId, e.target.value)} />
              </div>
              <div style={{ fontWeight: 800, minWidth: 110, textAlign: 'right' }}>{format(qtyOf(i) * i.price)}</div>
              <button className="qty-btn" onClick={() => removeLine(i.productId)}>×</button>
            </div>
          ))}
          <div className="total-line big" style={{ marginTop: 10 }}><span>Total</span><span className="amt">{format(total)}</span></div>
          <div className="form-group" style={{ marginTop: 12 }}>
            <label>Valid for</label>
            <select className="input" value={validDays} onChange={e => setValidDays(e.target.value)}>
              <option value="7">7 days</option><option value="14">14 days</option><option value="30">30 days</option>
            </select>
          </div>
          <button className="btn btn-green btn-lg" style={{ width: '100%' }} onClick={save}>Save Quotation</button>
        </div>
      )}
    </>
  );
}