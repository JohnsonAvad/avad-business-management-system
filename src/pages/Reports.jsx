import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useCurrency } from '../context/CurrencyContext';
import { waLink } from '../utils/helpers';

export default function Reports() {
  const { sales, expenses, products, customers, suppliers, receipts, purchases, journal, supplierPayments } = useData();
  const { format } = useCurrency();
  const [tab, setTab] = useState('sales');
  const [period, setPeriod] = useState('7');
  const [plMonth, setPlMonth] = useState(new Date().toISOString().slice(0, 7));
  const [stmtType, setStmtType] = useState('customer');
  const [stmtName, setStmtName] = useState('');

  const todayStr = new Date().toISOString().slice(0, 10);
  const business = JSON.parse(localStorage.getItem('avad_business') || '{}');
  const paidOf = s => (s.paid !== undefined ? s.paid : s.status === 'Paid' ? s.amount : 0);

  function inPeriod(date) {
    if (period === 'all') return true;
    if (period === '0') return date === todayStr;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - Number(period));
    return date >= cutoff.toISOString().slice(0, 10);
  }

  const salesIn = (sales || []).filter(s => inPeriod(s.date));
  const totalSales = salesIn.reduce((a, s) => a + s.amount, 0);
  const totalPaid = salesIn.reduce((a, s) => a + paidOf(s), 0);

  const prodTotals = {};
  salesIn.forEach(s => (s.items || []).forEach(i => { prodTotals[i.name] = (prodTotals[i.name] || 0) + i.qty * i.price; }));
  const topProducts = Object.entries(prodTotals).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const custTotals = {};
  salesIn.forEach(s => { custTotals[s.customer] = (custTotals[s.customer] || 0) + s.amount; });
  const byCustomer = Object.entries(custTotals).sort((a, b) => b[1] - a[1]);

  let revenue = 0, expTotal = 0;
  (journal || []).forEach(e => {
    if (!e.date.startsWith(plMonth)) return;
    e.lines.forEach(l => {
      if (l.account === '4000') revenue += (l.credit || 0) - (l.debit || 0);
      if (l.account === '6000') expTotal += (l.debit || 0) - (l.credit || 0);
    });
  });
  const profit = revenue - expTotal;

  const catTotals = {};
  (expenses || []).filter(e => e.date.startsWith(plMonth)).forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount; });

  const activeProducts = (products || []).filter(p => p.active !== false);
  const stockValue = activeProducts.reduce((a, p) => a + p.stock * (p.cost || 0), 0);
  const retailValue = activeProducts.reduce((a, p) => a + p.stock * p.price, 0);
  const low = activeProducts.filter(p => p.stock <= p.minStock);

  const stmtOptions = stmtType === 'customer' ? (customers || []).map(c => c.name) : (suppliers || []).map(s => s.name);
  let stmtRows = [];
  if (stmtName) {
    const raw = stmtType === 'customer' ? [
      ...(sales || []).filter(s => s.customer === stmtName).map(s => ({ date: s.date, type: 'Invoice ' + (s.number || ''), debit: s.amount, credit: 0 })),
      ...(receipts || []).filter(r => r.customer === stmtName).map(r => ({ date: r.date, type: 'Receipt ' + r.number, debit: 0, credit: r.amount })),
    ] : [
      ...(purchases || []).filter(p => p.supplier === stmtName).map(p => ({ date: p.date, type: 'Purchase', debit: p.amount, credit: 0 })),
      ...(supplierPayments || []).filter(p => p.supplier === stmtName).map(p => ({ date: p.date, type: 'Payment ' + p.number, debit: 0, credit: p.amount })),
    ];
    let bal = 0;
    stmtRows = raw.sort((a, b) => a.date.localeCompare(b.date)).map(r => { bal += r.debit - r.credit; return { ...r, balance: bal }; });
  }

  function downloadCSV(filename, rows) {
    const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  function stmtWhatsAppLink() {
    const lines = [business.name || 'AVAD Systems', (stmtType === 'customer' ? 'Customer' : 'Supplier') + ' Statement', stmtName, ''];
    stmtRows.forEach(r => lines.push(r.date + ' | ' + r.type + ' | ' + (r.debit ? 'DR ' + format(r.debit) : 'CR ' + format(r.credit)) + ' | Balance ' + format(r.balance)));
    return waLink('', lines.join('\n'));
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <div className="page-sub">Know exactly how your business is doing.</div>
        </div>
        <div className="pay-methods" style={{ margin: 0 }}>
          {[['sales', 'Sales'], ['pl', 'Profit & Loss'], ['inventory', 'Inventory'], ['statements', 'Statements']].map(([k, label]) => (
            <button key={k} className={'pay-btn' + (tab === k ? ' selected' : '')} onClick={() => setTab(k)}>{label}</button>
          ))}
        </div>
      </div>

      {tab === 'sales' && (
        <div className="panel print-area">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
            <select className="input" style={{ maxWidth: 180 }} value={period} onChange={e => setPeriod(e.target.value)}>
              <option value="0">Today</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="all">All time</option>
            </select>
            <button className="btn btn-blue" onClick={() => window.print()}>Print</button>
            <button className="btn btn-outline" onClick={() => downloadCSV('sales-report.csv', [['Date', 'Invoice', 'Customer', 'Amount', 'Paid', 'Status'], ...salesIn.map(s => [s.date, s.number || '', s.customer, s.amount, paidOf(s), s.status])])}>
              Download CSV
            </button>
          </div>
          <div className="stat-grid">
            <div className="stat-card"><div><div className="stat-label">Total Sales</div><div className="stat-value blue">{format(totalSales)}</div></div></div>
            <div className="stat-card"><div><div className="stat-label">Money Collected</div><div className="stat-value green">{format(totalPaid)}</div></div></div>
            <div className="stat-card"><div><div className="stat-label">Still Owed</div><div className="stat-value red">{format(totalSales - totalPaid)}</div></div></div>
          </div>
          <div className="panel-title" style={{ marginTop: 16 }}>Top Products</div>
          {topProducts.length === 0 ? <div className="empty-state">No item data in this period.</div> : (
            <table className="table">
              <thead><tr><th>Product</th><th>Revenue</th></tr></thead>
              <tbody>{topProducts.map(([name, amt]) => <tr key={name}><td style={{ fontWeight: 600 }}>{name}</td><td style={{ fontWeight: 700 }}>{format(amt)}</td></tr>)}</tbody>
            </table>
          )}
          <div className="panel-title" style={{ marginTop: 16 }}>Sales by Customer</div>
          <table className="table">
            <thead><tr><th>Customer</th><th>Total Bought</th></tr></thead>
            <tbody>
              {byCustomer.length === 0 ? <tr><td colSpan="2"><div className="empty-state">No sales in this period.</div></td></tr> :
                byCustomer.map(([name, amt]) => <tr key={name}><td style={{ fontWeight: 600 }}>{name}</td><td style={{ fontWeight: 700 }}>{format(amt)}</td></tr>)}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'pl' && (
        <div className="panel print-area">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
            <input className="input" type="month" style={{ maxWidth: 180 }} value={plMonth} onChange={e => setPlMonth(e.target.value)} />
            <button className="btn btn-blue" onClick={() => window.print()}>Print</button>
            <div className="choice-sub">Calculated automatically from your accounting books.</div>
          </div>
          <div className="stat-grid">
            <div className="stat-card"><div><div className="stat-label">Revenue (Sales)</div><div className="stat-value blue">{format(revenue)}</div></div></div>
            <div className="stat-card"><div><div className="stat-label">Expenses</div><div className="stat-value red">{format(expTotal)}</div></div></div>
            <div className="stat-card"><div><div className="stat-label">Net Profit</div><div className={profit >= 0 ? 'stat-value green' : 'stat-value red'}>{format(profit)}</div></div></div>
          </div>
          <div className="panel-title" style={{ marginTop: 16 }}>Expense Breakdown</div>
          <table className="table">
            <thead><tr><th>Category</th><th>Amount</th></tr></thead>
            <tbody>
              {Object.keys(catTotals).length === 0 ? <tr><td colSpan="2"><div className="empty-state">No expenses recorded this month.</div></td></tr> :
                Object.entries(catTotals).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
                  <tr key={cat}><td style={{ fontWeight: 600 }}>{cat}</td><td style={{ fontWeight: 700, color: 'var(--red)' }}>{format(amt)}</td></tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'inventory' && (
        <div className="panel print-area">
          <div style={{ marginBottom: 14 }}>
            <button className="btn btn-blue" onClick={() => window.print()}>Print</button>
          </div>
          <div className="stat-grid">
            <div className="stat-card"><div><div className="stat-label">Stock Value (buying price)</div><div className="stat-value blue">{format(stockValue)}</div></div></div>
            <div className="stat-card"><div><div className="stat-label">Retail Value (selling price)</div><div className="stat-value green">{format(retailValue)}</div></div></div>
            <div className="stat-card"><div><div className="stat-label">Potential Profit in Stock</div><div className="stat-value green">{format(retailValue - stockValue)}</div></div></div>
          </div>
          <div className="panel-title" style={{ marginTop: 16 }}>Low / Out of Stock ({low.length})</div>
          <table className="table">
            <thead><tr><th>Product</th><th>In Stock</th><th>Minimum</th><th>Status</th></tr></thead>
            <tbody>
              {low.length === 0 ? <tr><td colSpan="4"><div className="empty-state">All stock levels are healthy.</div></td></tr> :
                low.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td style={{ fontWeight: 800 }}>{p.stock}</td>
                    <td>{p.minStock}</td>
                    <td><span className={'badge ' + (p.stock <= 0 ? 'red' : 'amber')}>{p.stock <= 0 ? 'Out of Stock' : 'Low Stock'}</span></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'statements' && (
        <div className="panel print-area">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
            <select className="input" style={{ maxWidth: 140 }} value={stmtType} onChange={e => { setStmtType(e.target.value); setStmtName(''); }}>
              <option value="customer">Customer</option>
              <option value="supplier">Supplier</option>
            </select>
            <select className="input" style={{ maxWidth: 220 }} value={stmtName} onChange={e => setStmtName(e.target.value)}>
              <option value="">-- Choose {stmtType} --</option>
              {stmtOptions.map(n => <option key={n}>{n}</option>)}
            </select>
            {stmtName && (
              <>
                <button className="btn btn-blue" onClick={() => window.print()}>Print</button>
                <a className="btn btn-green" target="_blank" rel="noreferrer" href={stmtWhatsAppLink()}>WhatsApp</a>
                <button className="btn btn-outline" onClick={() => downloadCSV('statement-' + stmtName + '.csv', [['Date', 'Document', 'Debit', 'Credit', 'Balance'], ...stmtRows.map(r => [r.date, r.type, r.debit, r.credit, r.balance])])}>
                  CSV
                </button>
              </>
            )}
          </div>
          {!stmtName ? <div className="empty-state">Choose a {stmtType} to see their full statement.</div> : (
            <table className="table">
              <thead><tr><th>Date</th><th>Document</th><th>Debit</th><th>Credit</th><th>Balance</th></tr></thead>
              <tbody>
                {stmtRows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.date}</td>
                    <td>{r.type}</td>
                    <td>{r.debit ? format(r.debit) : '—'}</td>
                    <td>{r.credit ? format(r.credit) : '—'}</td>
                    <td style={{ fontWeight: 800 }}>{format(r.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </>
  );
}