import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useCurrency } from '../context/CurrencyContext';
import Icon from '../components/Icon';
import BarcodeScanner from '../components/BarcodeScanner';

const REASONS = ['Delivery Received', 'Stock Count Correction', 'Damaged / Expired', 'Theft / Loss', 'Other'];

export default function Inventory() {
  const { products, movements, addProduct, adjustStock, setProductActive } = useData();
  const { format } = useCurrency();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [adjustId, setAdjustId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [form, setForm] = useState({ name: '', barcode: '', price: '', cost: '', stock: '', minStock: '' });
  const [adj, setAdj] = useState({ type: 'In', qty: '', reason: REASONS[0] });
  const [error, setError] = useState('');

  const moves = movements || [];
  const activeProducts = products.filter(p => p.active !== false);
  const deletedCount = products.length - activeProducts.length;
  const pool = showDeleted ? products : activeProducts;
  const filtered = pool.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || (p.barcode || '').includes(search)
  );
  const low = activeProducts.filter(p => p.stock <= p.minStock);
  const stockValue = activeProducts.reduce((a, p) => a + p.stock * (p.cost || 0), 0);
  const adjustProduct = products.find(p => p.id === adjustId);
  const deleteProduct = products.find(p => p.id === deleteId);

  const statusOf = p =>
    p.active === false ? ['Deleted', 'grey']
      : p.stock <= 0 ? ['Out of Stock', 'red']
        : p.stock <= p.minStock ? ['Low Stock', 'amber']
          : ['In Stock', 'green'];

  function handleScan(code) {
    setScanning(false);
    const clean = String(code).trim();
    if (!clean) return;
    const prod = (products || []).find(p => p.active !== false && p.barcode === clean);
    if (prod) {
      setError('');
      setAdj({ type: 'In', qty: '', reason: REASONS[0] });
      setAdjustId(prod.id);
    } else {
      setError('');
      setForm({ name: '', barcode: clean, price: '', cost: '', stock: '', minStock: '' });
      setShowAdd(true);
    }
  }

  function saveProduct(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Please enter the product name.');
    const price = Number(form.price);
    if (!price || price <= 0) return setError('Please enter a valid selling price.');
    if (form.barcode.trim() && (products || []).some(p => p.active !== false && p.barcode === form.barcode.trim()))
      return setError('Another product already uses this barcode.');
    addProduct({
      name: form.name.trim(),
      barcode: form.barcode.trim(),
      price,
      cost: Number(form.cost) || 0,
      stock: Number(form.stock) || 0,
      minStock: Number(form.minStock) || 0,
    });
    setForm({ name: '', barcode: '', price: '', cost: '', stock: '', minStock: '' });
    setShowAdd(false);
  }

  function saveAdjust(e) {
    e.preventDefault();
    setError('');
    const q = Number(adj.qty);
    if (!q || q <= 0) return setError('Please enter a quantity.');
    if (adj.type === 'Out' && q > adjustProduct.stock) return setError('You only have ' + adjustProduct.stock + ' in stock.');
    adjustStock({ productId: adjustProduct.id, change: adj.type === 'In' ? q : -q, reason: adj.reason });
    setAdj({ type: 'In', qty: '', reason: REASONS[0] });
    setAdjustId(null);
  }

  const previewQty = Number(adj.qty) || 0;
  const previewStock = adjustProduct
    ? Math.max(adjustProduct.stock + (adj.type === 'In' ? previewQty : -previewQty), 0)
    : 0;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory</h1>
          <div className="page-sub">Your products and stock levels.</div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-blue btn-lg" onClick={() => { setError(''); setScanning(true); }}>📷 Scan Barcode</button>
          <button className="btn btn-green btn-lg" onClick={() => { setError(''); setShowAdd(true); }}>
            <Icon name="plus" size={18} /> Add Product
          </button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div><div className="stat-label">Total Products</div><div className="stat-value blue">{activeProducts.length}</div></div>
          <div className="stat-icon blue"><Icon name="inventory" /></div>
        </div>
        <div className="stat-card">
          <div><div className="stat-label">Low / Out of Stock</div><div className="stat-value red">{low.length}</div>
            <div className="stat-hint">{low.map(p => p.name).join(', ') || 'All stock is okay'}</div></div>
          <div className="stat-icon amber"><Icon name="bell" /></div>
        </div>
        <div className="stat-card">
          <div><div className="stat-label">Stock Value (buying price)</div><div className="stat-value green">{format(stockValue)}</div></div>
          <div className="stat-icon green"><Icon name="reports" /></div>
        </div>
      </div>

      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ marginBottom: 0 }}>
            <Icon name="search" size={18} />
            <input placeholder="Search product or barcode..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {deletedCount > 0 && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: 'var(--muted)', cursor: 'pointer' }}>
              <input type="checkbox" checked={showDeleted} onChange={e => setShowDeleted(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--green)' }} />
              Show deleted products ({deletedCount})
            </label>
          )}
        </div>

        <table className="table">
          <thead>
            <tr><th>Product</th><th>Selling Price</th><th>In Stock</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const [label, color] = statusOf(p);
              const isDeleted = p.active === false;
              return (
                <tr key={p.id} className={isDeleted ? 'row-deleted' : ''}>
                  <td style={{ fontWeight: 700 }}>
                    {p.name}
                    {p.barcode && <div className="choice-sub">{p.barcode}</div>}
                  </td>
                  <td>{format(p.price)}</td>
                  <td style={{ fontWeight: 800 }}>{p.stock}</td>
                  <td><span className={'badge ' + color}>{label}</span></td>
                  <td>
                    {isDeleted ? (
                      <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 13 }}
                        onClick={() => setProductActive(p.id, true)}>
                        Restore
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 13 }}
                          onClick={() => { setError(''); setAdj({ type: 'In', qty: '', reason: REASONS[0] }); setAdjustId(p.id); }}>
                          Adjust
                        </button>
                        <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: 13 }}
                          onClick={() => setDeleteId(p.id)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <div className="panel-title">Recent Stock Movements</div>
        {moves.length === 0 ? (
          <div className="empty-state">No adjustments yet. Stock changes will appear here.</div>
        ) : (
          <table className="table">
            <thead><tr><th>Date</th><th>Product</th><th>Change</th><th>Reason</th></tr></thead>
            <tbody>
              {[...moves].reverse().slice(0, 6).map(m => (
                <tr key={m.id}>
                  <td>{m.date}</td>
                  <td style={{ fontWeight: 600 }}>{m.product}</td>
                  <td style={{ fontWeight: 800, color: m.change > 0 ? 'var(--green-deep)' : 'var(--red)' }}>
                    {m.change > 0 ? '+' + m.change : m.change}
                  </td>
                  <td>{m.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <form className="modal-card" onClick={e => e.stopPropagation()} onSubmit={saveProduct}>
            <div className="modal-title">Add Product</div>
            <div className="form-group">
              <label>Product Name</label>
              <input placeholder="e.g. Beans 1kg" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
            </div>
            <div className="form-group">
              <label>Barcode (scan or type — optional)</label>
              <input placeholder="e.g. 6291041500213" value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Selling Price (what the customer pays)</label>
              <input inputMode="numeric" placeholder="e.g. 8000" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Buying Price (what you pay)</label>
              <input inputMode="numeric" placeholder="e.g. 6500" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Opening Stock (how many you have now)</label>
              <input inputMode="numeric" placeholder="e.g. 20" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Minimum Stock (warn me below this)</label>
              <input inputMode="numeric" placeholder="e.g. 5" value={form.minStock} onChange={e => setForm({ ...form, minStock: e.target.value })} />
            </div>
            {error && <div className="alert red" style={{ marginTop: 0 }}>{error}</div>}
            <div className="form-actions">
              <button type="button" className="btn btn-outline btn-lg" style={{ flex: 1 }} onClick={() => setShowAdd(false)}>Cancel</button>
              <button type="submit" className="btn btn-green btn-lg" style={{ flex: 1 }}>Save Product</button>
            </div>
          </form>
        </div>
      )}

      {adjustProduct && (
        <div className="modal-overlay" onClick={() => setAdjustId(null)}>
          <form className="modal-card" onClick={e => e.stopPropagation()} onSubmit={saveAdjust}>
            <div className="modal-title">Adjust Stock – {adjustProduct.name}</div>
            <div className="total-line"><span>Current stock</span><span className="amt blue">{adjustProduct.stock}</span></div>

            <div className="label" style={{ margin: '12px 0 6px' }}>What happened?</div>
            <div className="pay-methods">
              <button type="button" className={'pay-btn' + (adj.type === 'In' ? ' selected' : '')}
                onClick={() => setAdj({ ...adj, type: 'In' })}>Stock In (+)</button>
              <button type="button" className={'pay-btn' + (adj.type === 'Out' ? ' selected-red' : '')}
                onClick={() => setAdj({ ...adj, type: 'Out' })}>Stock Out (−)</button>
            </div>

            <div className="form-group">
              <label>Quantity</label>
              <input inputMode="numeric" placeholder="e.g. 10" value={adj.qty} onChange={e => setAdj({ ...adj, qty: e.target.value })} />
            </div>

            <div className="form-group">
              <label>Reason</label>
              <select value={adj.reason} onChange={e => setAdj({ ...adj, reason: e.target.value })}>
                {REASONS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>

            {previewQty > 0 && (
              <div className={'alert ' + (adj.type === 'In' ? 'green' : 'red')} style={{ marginTop: 0 }}>
                New stock will be: {previewStock}
              </div>
            )}

            {error && <div className="alert red" style={{ marginTop: 8 }}>{error}</div>}

            <div className="form-actions">
              <button type="button" className="btn btn-outline btn-lg" style={{ flex: 1 }} onClick={() => setAdjustId(null)}>Cancel</button>
              <button type="submit" className="btn btn-green btn-lg" style={{ flex: 1 }}>Save Change</button>
            </div>
          </form>
        </div>
      )}

      {deleteProduct && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Delete {deleteProduct.name}?</div>
            <p style={{ color: 'var(--muted)', fontSize: 14, margin: '8px 0 0' }}>
              It will be hidden from Inventory and New Sale. Old sales and reports stay safe.
            </p>
            {deleteProduct.stock > 0 && (
              <div className="alert red">Careful — you still have {deleteProduct.stock} in stock!</div>
            )}
            <div className="form-actions">
              <button className="btn btn-outline btn-lg" style={{ flex: 1 }} onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger btn-lg" style={{ flex: 1 }}
                onClick={() => { setProductActive(deleteProduct.id, false); setDeleteId(null); }}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {scanning && <BarcodeScanner onScan={handleScan} onClose={() => setScanning(false)} />}
    </>
  );
}