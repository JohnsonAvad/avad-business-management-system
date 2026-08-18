import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useCurrency } from '../context/CurrencyContext';
import Icon from '../components/Icon';

export default function NewPurchase() {
  const { suppliers, products, supplierPayments, addPurchase } = useData();
  const { format } = useCurrency();

  const [step, setStep] = useState(1);
  const [supplierId, setSupplierId] = useState(null);
  const [supSearch, setSupSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [prodSearch, setProdSearch] = useState('');
  const [method, setMethod] = useState('Cash');
  const [paidInput, setPaidInput] = useState('');
  const [error, setError] = useState('');

  const [done, setDone] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const supplier = (suppliers || []).find(s => s.id === supplierId);
  const qtyOf = i => Number(i.qty) || 0;
  const costOf = i => Number(i.cost) || 0;
  const total = cart.reduce((a, i) => a + qtyOf(i) * costOf(i), 0);

  const filteredSuppliers = (suppliers || []).filter(s =>
    s.name.toLowerCase().includes(supSearch.toLowerCase()) || s.phone.includes(supSearch)
  );
  const filteredProducts = (products || []).filter(p =>
    p.active !== false && p.name.toLowerCase().includes(prodSearch.toLowerCase())
  );

  function pickSupplier(id) { setError(''); setSupplierId(id); setMethod('Cash'); setStep(2); }

  function addToCart(p) {
    setError('');
    setCart(prev => {
      const line = prev.find(i => i.productId === p.id);
      if (line) return prev.map(i => i.productId === p.id ? { ...i, qty: String(qtyOf(i) + 1) } : i);
      return [...prev, { productId: p.id, name: p.name, cost: String(p.cost || ''), qty: '1' }];
    });
  }

  function changeQty(id, delta) {
    setCart(prev => prev
      .map(i => i.productId === id ? { ...i, qty: String(Math.max(qtyOf(i) + delta, 0)) } : i)
      .filter(i => qtyOf(i) > 0));
  }

  function setQty(id, value) {
    const clean = String(value).replace(/[^\d]/g, '');
    setCart(prev => prev.map(i => i.productId === id ? { ...i, qty: clean } : i));
  }

  function changeCost(id, value) {
    const clean = String(value).replace(/[^\d]/g, '');
    setCart(prev => prev.map(i => i.productId === id ? { ...i, cost: clean } : i));
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
    if (cart.some(i => qtyOf(i) <= 0 || costOf(i) <= 0))
      return setError('Every item needs a quantity and a buying price.');
    setPaidInput('');
    setStep(3);
  }

  const paidNum = method === 'Credit' ? 0 : (paidInput === '' ? total : Number(paidInput));
  const paidReal = Math.min(paidNum > 0 ? paidNum : 0, total);
  const owed = total - paidReal;

  function finish() {
    setError('');
    if (cart.some(i => qtyOf(i) <= 0 || costOf(i) <= 0))
      return setError('Every item needs a quantity and a buying price.');
    if (isNaN(paidNum) || paidNum < 0) return setError('Please enter a valid amount.');
    const payNo = paidReal > 0 ? 'PAY-' + String((supplierPayments ? supplierPayments.length : 0) + 1).padStart(4, '0') : null;
    addPurchase({
      supplierId, supplierName: supplier.name,
      items: cart.map(i => ({ productId: i.productId, name: i.name, qty: qtyOf(i), cost: costOf(i) })),
      total, paid: paidReal, method,
    });
    setDone({ supplierName: supplier.name, total, paid: paidReal, owed, method, payNo });
  }

  function reset() {
    setStep(1); setSupplierId(null); setCart([]); setProdSearch('');
    setMethod('Cash'); setPaidInput(''); setDone(null); setError('');
  }

  if (done) {
    return (
      <div className="panel success-wrap">
        <div className="success-icon">✓</div>
        <h2>Purchase saved!</h2>
        <div className="page-sub">Stock has been increased automatically.</div>
        <div className="panel receipt-card">
          <div className="total-line"><span>Supplier</span><span>{done.supplierName}</span></div>
          <div className="total-line big"><span>Total</span><span className="amt">{format(done.total)}</span></div>
          <div className="total-line"><span>Paid ({done.method})</span><span className="amt green">{format(done.paid)}</span></div>
          {done.owed > 0 && <div className="total-line"><span>Still owed</span><span className="amt red">{format(done.owed)}</span></div>}
          {done.payNo && <div className="total-line"><span>Payment No.</span><span className="amt blue">{done.payNo}</span></div>}
        </div>
        <div className="alert green" style={{ maxWidth: 420, margin: '0 auto' }}>
          Your inventory now shows the new stock.
        </div>
        <div className="nav-row">
          <button className="btn btn-green btn-lg" onClick={reset}><Icon name="plus" size={16} /> Start Another Purchase</button>
          <Link to="/purchases" className="btn btn-outline btn-lg">View All Purchases</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">New Purchase</h1>
          <div className="page-sub">Follow the 3 easy steps.</div>
        </div>
        <Link to="/purchases" className="btn btn-outline">Cancel</Link>
      </div>

      <div className="stepper">
        {['Supplier', 'Products', 'Payment'].map((label, i) => (
          <div key={label} className={'step' + (step === i + 1 ? ' active' : step > i + 1 ? ' done' : '')}>
            <div className="step-dot">{step > i + 1 ? '✓' : i + 1}</div>
            <div>{label}</div>
          </div>
        ))}
      </div>

      {error && <div className="alert red" style={{ marginBottom: 14 }}>{error}</div>}

      {step === 1 && (
        <div className="panel">
          <div className="panel-title">Who are you buying from?</div>
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
          <div className="choice-grid">
            {filteredSuppliers.map(s => (
              <button key={s.id} className="choice-card" onClick={() => pickSupplier(s.id)}>
                <div className="choice-title">{s.name}</div>
                <div className="choice-sub">{s.phone}{s.balance > 0 ? ' • We owe ' + format(s.balance) : ''}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <>
          <div className="panel">
            <button className="btn btn-outline" style={{ marginBottom: 12 }} onClick={() => setStep(1)}>← Change supplier</button>
            <div className="panel-title">What are you buying?</div>
            <div className="search-bar">
              <Icon name="search" size={18} />
              <input placeholder="Search product..." value={prodSearch} onChange={e => setProdSearch(e.target.value)} autoFocus />
            </div>
            <div className="product-grid">
              {filteredProducts.map(p => (
                <button key={p.id} className="product-card" onClick={() => addToCart(p)}>
                  <div className="p-name">{p.name}</div>
                  <div className="p-price">{format(p.cost)}</div>
                  <div className="p-stock">{p.stock} in stock now</div>
                </button>
              ))}
            </div>
          </div>

          {cart.length > 0 && (
            <div className="cart">
              <div className="panel-title">Basket</div>
              {cart.map(i => (
                <div className="cart-row" key={i.productId}>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ fontWeight: 700 }}>{i.name}</div>
                  </div>
                  <div>
                    <div className="choice-sub" style={{ marginBottom: 4 }}>Buying price</div>
                    <input className="cost-input" inputMode="numeric" value={i.cost}
                      onChange={e => changeCost(i.productId, e.target.value)} />
                  </div>
                  <div className="qty-ctrl">
                    <button className="qty-btn" onClick={() => changeQty(i.productId, -1)}>−</button>
                    <input className="qty-input" inputMode="numeric" value={i.qty}
                      onChange={e => setQty(i.productId, e.target.value)} />
                    <button className="qty-btn" onClick={() => changeQty(i.productId, 1)}>+</button>
                  </div>
                  <div style={{ fontWeight: 800, minWidth: 110, textAlign: 'right' }}>{format(qtyOf(i) * costOf(i))}</div>
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
          <div className="total-line"><span>Supplier</span><span>{supplier?.name}</span></div>
          <div className="total-line"><span>Items</span><span>{cart.reduce((a, i) => a + qtyOf(i), 0)}</span></div>
          <div className="total-line big"><span>Total to pay</span><span className="amt">{format(total)}</span></div>

          <div className="label" style={{ margin: '16px 0 6px' }}>How are you paying?</div>
          <div className="pay-methods">
            {['Cash', 'Mobile Money', 'Bank'].map(m => (
              <button key={m} className={'pay-btn' + (method === m ? ' selected' : '')} onClick={() => setMethod(m)}>{m}</button>
            ))}
            <button className={'pay-btn' + (method === 'Credit' ? ' selected' : '')} onClick={() => setMethod('Credit')}>Credit (Pay Later)</button>
          </div>

          {method !== 'Credit' && (
            <div className="form-group">
              <label>Amount paid now</label>
              <input inputMode="numeric" value={paidInput} onChange={e => setPaidInput(e.target.value)} placeholder={String(total)} />
            </div>
          )}

          {method === 'Credit' && (
            <div className="alert amber">You will owe the supplier {format(total)}. It will be added to their account.</div>
          )}

          {owed > 0 && method !== 'Credit' && (
            <div className="total-line"><span>You will still owe</span><span className="amt red">{format(owed)}</span></div>
          )}

          <button className="btn btn-green btn-lg" style={{ width: '100%', marginTop: 18 }} onClick={finish}>
            ✓ Finish Purchase
          </button>
        </div>
      )}
         {scanning && (
        <BarcodeScanner onScan={code => { setScanning(false); scanBarcode(code); }} onClose={() => setScanning(false)} />
      )}
    </>
  );
}