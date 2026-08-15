import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useCurrency } from '../context/CurrencyContext';
import PrintDoc from '../components/PrintDoc';

export default function InvoicesReceipts() {
  const { sales, receipts, customers } = useData();
  const { format } = useCurrency();
  const [tab, setTab] = useState('invoices');
  const [doc, setDoc] = useState(null);
  const business = JSON.parse(localStorage.getItem('avad_business') || '{}');

  const invNo = s => s.number || ('INV-' + String(s.id).slice(-4));
  const paidOf = s => (s.paid !== undefined ? s.paid : s.status === 'Paid' ? s.amount : 0);
  const phoneOf = name => (customers || []).find(c => c.name === name)?.phone || '';

  function openInvoice(s) {
    setDoc({
      type: 'INVOICE', number: invNo(s), date: s.date, customer: s.customer,
      customerPhone: phoneOf(s.customer), items: s.items || [],
      total: s.amount, paid: paidOf(s), method: s.method || 'Cash',
      businessName: business.name, logo: business.logo,
      businessName: business.name,
    });
  }

  function openReceipt(r) {
    setDoc({
      type: 'RECEIPT', number: r.number, date: r.date, customer: r.customer,
      customerPhone: phoneOf(r.customer), items: r.items || [],
      total: r.amount, paid: r.amount, method: r.method,
      businessName: business.name, logo: business.logo,
      businessName: business.name,
    });
  }

  const saleList = [...(sales || [])].reverse();
  const receiptList = [...(receipts || [])].reverse();

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices & Receipts</h1>
          <div className="page-sub">View, print, and share your documents.</div>
        </div>
        <div className="pay-methods" style={{ margin: 0 }}>
          <button className={'pay-btn' + (tab === 'invoices' ? ' selected' : '')} onClick={() => setTab('invoices')}>Invoices</button>
          <button className={'pay-btn' + (tab === 'receipts' ? ' selected' : '')} onClick={() => setTab('receipts')}>Receipts</button>
        </div>
      </div>

      <div className="panel">
        {tab === 'invoices' ? (
          saleList.length === 0 ? <div className="empty-state">No invoices yet. Make a sale first.</div> : (
            <table className="table">
              <thead>
                <tr><th>No.</th><th>Date</th><th>Customer</th><th>Total</th><th>Balance</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {saleList.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700 }}>{invNo(s)}</td>
                    <td>{s.date}</td>
                    <td>{s.customer}</td>
                    <td>{format(s.amount)}</td>
                    <td>{format(Math.max(s.amount - paidOf(s), 0))}</td>
                    <td>
                      <span className={'badge ' + (s.status === 'Paid' ? 'green' : s.status === 'Partial' ? 'amber' : 'red')}>
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => openInvoice(s)}>
                        View / Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          receiptList.length === 0 ? <div className="empty-state">No receipts yet. Receive a payment first.</div> : (
            <table className="table">
              <thead>
                <tr><th>No.</th><th>Date</th><th>Customer</th><th>Amount</th><th>Method</th><th>Action</th></tr>
              </thead>
              <tbody>
                {receiptList.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 700 }}>{r.number}</td>
                    <td>{r.date}</td>
                    <td>{r.customer}</td>
                    <td>{format(r.amount)}</td>
                    <td><span className="badge blue">{r.method}</span></td>
                    <td>
                      <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => openReceipt(r)}>
                        View / Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>

      {doc && <PrintDoc doc={doc} onClose={() => setDoc(null)} />}
    </>
  );
}