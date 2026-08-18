import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useCurrency } from '../context/CurrencyContext';
import Icon from '../components/Icon';
import BarcodeScanner from '../components/BarcodeScanner';

export default function NewSale() {
  const { customers, products, receipts, addSale } = useData();
  const { format } = useCurrency();

  const [step, setStep] = useState(1);
  const [customerId, setCustomerId] = useState(null);
  const [custSearch, setCustSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [prodSearch, setProdSearch] = useState('');
  const [method, setMethod] = useState('Cash');
  const [paidInput, setPaidInput] = useState('');
  const [dueDays, setDueDays] = useState('7');
  const [scanning, setScanning] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);

  const isWalkin = customerId === 'walkin';
  const customer = isWalkin ? null : (customers || []).find(c => c.id === customerId);
  const qtyOf = i => Number(i.qty) || 0;
  const total = cart.reduce((a, i) => a + qtyOf(i) * i.price, 0);

  const filteredCustomers = (customers || []).filter(c =>
    c.name.toLowerCase().includes(custSearch.toLowerCase()) || c.phone.includes(custSearch)
  );
  const filteredProducts = (products || []).filter(p =>
    p.active !== false && p.name.toLowerCase().includes(prodSearch.toLowerCase())
  );

  function pickCustomer(id) { setError(''); setCustomerId(id); setMethod('Cash'); setStep(2); }

  function addToCart(p) {
    setError('');
    setCart(prev => {
      const line = prev.find(i => i.productId === p.id);
      const already = line ? qtyOf(line) : 0;
      if (already >= p.stock) { setError('No more stock available for ' + p.name + '.'); return prev; }
      if (line) return prev.map(i => i.productId === p.id ? { ...i, qty: String(qtyOf(i) + 1) } : i);
      return [...prev, { productId: p.id, name: p.name, price: p.price, qty: '1' }];
    });
  }

  function changeQty(id, delta) {
    setError('');
    setCart(prev => {
      const next = [];
      for (const i of prev) {
        if (i.productId !== id) { next.push(i); continue; }
        const q = qtyOf(i) + delta;
        if (q <= 0) continue;
        const prod = (products || []).find(p => p.id === id);
        if (prod && q > prod.stock) { setError('Only ' + prod.stock + ' in stock for ' + prod.name + '.'); next.push(i); continue; }
        next.push({ ...i, qty: String(q) });
      }
      return next;
    });
  }

  function setQty(id, value) {
    setError('');
    const clean = String(value).replace(/[^\d]/g, '');
    const prod = (products || []).find(p => p.id === id);
    if (clean !== '' && prod && Number(clean) > prod.stock) {
      setError('Only ' + prod.stock + ' in stock for ' + prod.name + '.');
      return;
    }
    setCart(prev => prev.map(i => i.productId === id ? { ...i, qty: clean } : i));
  }

  const removeLine = id => setCart(prev => prev.filter(i => i.productId !== id));

  function scanBarcode(code) {
    setError('');
    const clean = String(code).trim();
    if (!clean) return;
    const prod = (products || []).find(p => p.active !== false && p.barcode === clean);
    if (!prod) { setError('No product has barcode ' + clean + '. Add it in Inventory first.'); return; }
    addToCart(prod);
    setBarcodeInput('');
  }

  function goPayment() {
    setError('');
    if (cart.some(i => qtyOf(i) <= 0)) return setError('Please enter a quantity for every item in the basket.');
    setPaidInput('');
    setStep(3);
  }

  const paidNum = method === 'Credit' ? 0 : (paidInput === '' ? total : Number(paidInput));
  const change = paidNum > total ? paidNum - total : 0;
  const paidReal = Math.min(paidNum > 0 ? paidNum : 0, total);
  const owed = total - paidReal;

  function finish() {
    setError('');
    if (cart.some(i => qtyOf(i) <= 0)) return setError('Please enter a quantity for every item in the basket.');
    if (isNaN(paidNum) || paidNum < 0) return setError('Please enter a valid amount.');
    if (isWalkin && paidReal < total) return setError('Walk-in customers must pay now. Please enter the full amount.');
    const receiptNo = paidReal > 0 ? 'RCP-' + String((receipts ? receipts.length : 0) + 1).padStart(4, '0') : null;
    const dd = new Date(); dd.setDate(dd.getDate() + Number(dueDays || 0));
    addSale({
      dueDate: dd.toISOString().slice(0, 10),
      customerId: isWalkin ? null : customerId,
      customerName: isWalkin ? 'Walk-in' : customer.name,
      items: cart.map(i => ({ ...i, qty: qtyOf(i) })),
      total, paid: paidReal, method,
    });
    setDone({
      customerName: isWalkin ? 'Walk-in' : customer.name,
      total, paid: paidReal, change, owed, method, receiptNo,
    });
  }

  function reset() {
    setStep(1); setCustomerId(null); setCart([]); setProdSearch('');
    setMethod('Cash'); setPaidInput(''); setDone(null); setError('');
  }

  if (done) {
    return (
      <div className="panel success-wrap">
        <div className="success-icon">✓</div>
        <h2>Sale saved!</h2>
        <div className="page-sub">Well done. The sale has been recorded.</div>
        <div className="panel receipt-card">
          <div className="total-line"><span>Customer</span><span>{done.customerName}</span></div>
          <div className="total-line big"><span>Total</span><span className="amt">{format(done.total)}</span></div>
          <div className="total-line"><span>Paid ({done.method})</span><span className="amt green">{format(done.paid)}</span></div>
          {done.change > 0 && <div className="total-line"><span>Change to give</span><span className="amt red">{format(done.change)}</span></div>}
          {done.owed > 0 && <div className="total-line"><span>Still owed</span><span className="amt red">{format(done.owed)}</span></div>}
          {done.receiptNo && <div className="total-line"><span>Receipt No.</span><span className="amt blue">{done.receiptNo}</span></div>}
        </div>
        <div className="nav-row">
          <button className="btn btn-green btn-lg" onClick={reset}><Icon name="plus" size={16} /> Start Another Sale</button>
          <Link to="/sales" className="btn btn-outline btn-lg">View All Sales</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">New Sale</h1>
          <div className="page-sub">Follow the 3 easy steps.</div>
        </div>
        <Link to="/sales" className="btn btn-outline">Cancel</Link>
      </div>

      <div className="stepper">
        {['Customer', 'Products', 'Payment'].map((label, i) => (
          <div key={label} className={'step' + (step === i + 1 ? ' active' : step > i + 1 ? ' done' : '')}>
            <div className="step-dot">{step > i + 1 ? '✓' : i + 1}</div>
            <div>{label}</div>
          </div>
        ))}
      </div>

      {error && <div className="alert red" style={{ marginBottom: 14 }}>{error}</div>}

      {step === 1 && (
        <div className="panel">
          <div className="panel-title">Who is buying?</div>
          <div className="search-bar" style={{ marginBottom: 14 }}>
            <Icon name="search" size={18} />
            <input placeholder="Search customer..." value={custSearch} onChange={e => setCustSearch(e.target.value)} />
          </div>
          <div className="choice-grid">
            <button className="choice-card" onClick={() => pickCustomer('walkin')}>
              <div className="choice-title">Walk-in Customer</div>
              <div className="choice-sub">Paying now, no account needed</div>
            </button>
            {filteredCustomers.map(c => (
              <button key={c.id} className="choice-card" onClick={() => pickCustomer(c.id)}>
                <div className="choice-title">{c.name}</div>
                <div className="choice-sub">{c.phone}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <>
          <div className="panel">
            <div className="panel-title">What are they buying?</div>
                       <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              <div className="search-bar" style={{ flex: 1, minWidth: 160, marginBottom: 0 }}>
                <Icon name="search" size={18} />
                <input placeholder="Search product..." value={prodSearch} onChange={e => setProdSearch(e.target.value)} />
              </div>
              <form className="search-bar" style={{ flex: 1, minWidth: 160, marginBottom: 0 }}
                onSubmit={e => { e.preventDefault(); scanBarcode(barcodeInput); }}>
                <input placeholder="Scan / type barcode + Enter" value={barcodeInput} onChange={e => setBarcodeInput(e.target.value)} />
              </form>
              <button type="button" className="btn btn-blue" onClick={() => setScanning(true)}>📷 Scan</button>
            </div>
            <div className="product-grid">
              {filteredProducts.map(p => {
                const inCart = cart.find(i => i.productId === p.id);
                const left = p.stock - (inCart ? qtyOf(inCart) : 0);
                return (
                  <button key={p.id} className={'product-card' + (left <= 0 ? ' out' : '')} onClick={() => addToCart(p)}>
                    <div className="p-name">{p.name}</div>
                    <div className="p-price">{format(p.price)}</div>
                    <div className="p-stock">{left} in stock</div>
                  </button>
                );
              })}
            </div>
          </div>

          {cart.length > 0 && (
            <div className="cart">
              <div className="panel-title">Basket</div>
              {cart.map(i => (
                <div className="cart-row" key={i.productId}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{i.name}</div>
                    <div className="choice-sub">{format(i.price)} each</div>
                  </div>
                  <div className="qty-ctrl">
                    <button className="qty-btn" onClick={() => changeQty(i.productId, -1)}>−</button>
                    <input className="qty-input" inputMode="numeric" value={i.qty}
                      onChange={e => setQty(i.productId, e.target.value)} />
                    <button className="qty-btn" onClick={() => changeQty(i.productId, 1)}>+</button>
                  </div>
                  <div style={{ fontWeight: 800, minWidth: 110, textAlign: 'right' }}>{format(qtyOf(i) * i.price)}</div>
                  <button className="qty-btn" title="Remove" onClick={() => removeLine(i.productId)}>×</button>
                </div>
              ))}
              <div className="total-line big" style={{ marginTop: 10 }}>
                <span>Total</span><span className="amt">{format(total)}</span>
              </div>
              <button className="btn btn-green btn-lg" style={{ width: '100%' }} onClick={goPayment}>
                Continue to Payment →
              </button>
            </div>
          )}
        </>
      )}

      {step === 3 && (
        <div className="panel" style={{ maxWidth: 560 }}>
          <button className="btn btn-outline" style={{ marginBottom: 12 }} onClick={() => setStep(2)}>← Back</button>
          <div className="panel-title">Payment</div>
          <div className="total-line"><span>Customer</span><span>{isWalkin ? 'Walk-in' : customer?.name}</span></div>
          <div className="total-line"><span>Items</span><span>{cart.reduce((a, i) => a + qtyOf(i), 0)}</span></div>
          <div className="total-line big"><span>Total to pay</span><span className="amt">{format(total)}</span></div>

          <div className="label" style={{ margin: '16px 0 6px' }}>How are they paying?</div>
          <div className="pay-methods">
            {['Cash', 'Mobile Money', 'Bank'].map(m => (
              <button key={m} className={'pay-btn' + (method === m ? ' selected' : '')} onClick={() => setMethod(m)}>{m}</button>
            ))}
            {!isWalkin && (
              <button className={'pay-btn' + (method === 'Credit' ? ' selected' : '')} onClick={() => setMethod('Credit')}>Credit (Pay Later)</button>
            )}
          </div>

                    <div className="form-group">
            <label>Payment due in</label>
            <select className="input" value={dueDays} onChange={e => setDueDays(e.target.value)}>
              <option value="0">Today</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
            </select>
          </div>

          {method !== 'Credit' && (
            <div className="form-group">
              <label>Amount received now</label>
              <input inputMode="numeric" value={paidInput} onChange={e => setPaidInput(e.target.value)} placeholder={String(total)} />
            </div>
          )}

          {method === 'Credit' && (
            <div className="alert amber">The customer will owe {format(total)}. It will be added to their account.</div>
          )}

          {method !== 'Credit' && paidNum > total && (
            <div className="total-line"><span>Change to give</span><span className="amt red">{format(change)}</span></div>
          )}
          {owed > 0 && !isWalkin && (
            <div className="total-line"><span>Customer will still owe</span><span className="amt red">{format(owed)}</span></div>
          )}

          <button className="btn btn-green btn-lg" style={{ width: '100%', marginTop: 18 }} onClick={finish}>
            ✓ Finish Sale
          </button>
        </div>
      )}
         {scanning && (
        <BarcodeScanner onScan={code => { setScanning(false); scanBarcode(code); }} onClose={() => setScanning(false)} />
      )}
    </>
  );
}