import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useCurrency } from '../context/CurrencyContext';
import PrintDoc from '../components/PrintDoc';
import SignaturePad from '../components/SignaturePad';

export default function InvoicesReceipts() {
  const { sales, receipts, customers, updateSale, recordSalePayment } = useData();
  const { format } = useCurrency();
  const [tab, setTab] = useState('invoices');
  const [doc, setDoc] = useState(null);
  const [signing, setSigning] = useState(false);
  const [payFor, setPayFor] = useState(null);
  const [payForm, setPayForm] = useState({ amount: '', method: 'Cash' });
  const business = JSON.parse(localStorage.getItem('avad_business') || '{}');
  const todayStr = new Date().toISOString().slice(0, 10);

  const invNo = s => s.number || ('INV-' + String(s.id).slice(-4));
  const paidOf = s => (s.paid !== undefined ? s.paid : s.status === 'Paid' ? s.amount : 0);
  const phoneOf = name => (customers || []).find(c => c.name === name)?.phone || '';

  const bizFields = {
    businessName: business.name, logo: business.logo, businessPhone: business.phone,
    businessAddress: business.address, footer: business.footer,
    warranty: business.warranty, ownerSignature: business.ownerSignature,
  };

  function showStatus(s) {
    if (s.status === 'Rejected') return ['Rejected', 'grey'];
    if (paidOf(s) >= s.amount) return ['Paid', 'green'];
    if (s.dueDate && s.dueDate < todayStr) return ['Overdue', 'red'];
    if (s.status === 'Partial') return ['Partial', 'amber'];
    return [s.status || 'Unpaid', 'red'];
  }

  function openInvoice(s) {
    setDoc({
      type: 'INVOICE', number: invNo(s), date: s.date, dueDate: s.dueDate, customer: s.customer,
      customerPhone: phoneOf(s.customer), items: s.items || [],
      total: s.amount, paid: paidOf(s), method: s.method || 'Cash',
      status: s.status, feedback: s.feedback, rejectReason: s.rejectReason,
      customerSignature: s.customerSignature, saleId: s.id,
      ...bizFields,
    });
  }

  function openReceipt(r) {
    setDoc({
      type: 'RECEIPT', number: r.number, date: r.date, customer: r.customer,
      customerPhone: phoneOf(r.customer), items: r.items || [],
      total: r.amount, paid: r.amount, method: r.method,
      ...bizFields,
    });
  }

  function handleSignSave(dataUrl) {
    updateSale(doc.saleId, { customerSignature: dataUrl });
    setDoc(d => ({ ...d, customerSignature: dataUrl }));
    setSigning(false);
    const bal = doc.total - doc.paid;
    if (bal > 0) { setPayFor(doc); setPayForm({ amount: String(bal), method: 'Cash' }); }
  }

  function handlePaySave(e) {
    e.preventDefault();
    const amt = Number(payForm.amount);
    if (!amt || amt <= 0) return;
    recordSalePayment({ saleId: payFor.saleId, amount: amt, method: payForm.method });
    setPayFor(null);
    setDoc(null);
  }

  function handleReject() {
    const reason = window.prompt('Why is the customer rejecting this invoice?');
    if (reason === null) return;
    updateSale(doc.saleId, { status: 'Rejected', rejectReason: reason });
    setDoc(null);
  }

  function handleFeedback() {
    const fb = window.prompt('Customer feedback:');
    if (fb === null || !fb.trim()) return;
    updateSale(doc.saleId, { feedback: fb.trim() });
    setDoc(d => ({ ...d, feedback: fb.trim() }));
  }

  const saleList = [...(sales || [])].reverse();
  const receiptList = [...(receipts || [])].reverse();

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices & Receipts</h1>
          <div className="page-sub">View, sign, print, and share your documents.</div>
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
              <thead><tr><th>No.</th><th>Date</th><th>Due</th><th>Customer</th><th>Balance</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {saleList.map(s => {
                  const [label, color] = showStatus(s);
                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 700 }}>{invNo(s)}</td>
                      <td>{s.date}</td>
                      <td>{s.dueDate || '—'}</td>
                      <td>{s.customer}</td>
                      <td>{format(Math.max(s.amount - paidOf(s), 0))}</td>
                      <td><span className={'badge ' + color}>{label}</span></td>
                      <td>
                        <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => openInvoice(s)}>
                          View / Print
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        ) : (
          receiptList.length === 0 ? <div className="empty-state">No receipts yet. Receive a payment first.</div> : (
            <table className="table">
              <thead><tr><th>No.</th><th>Date</th><th>Customer</th><th>Amount</th><th>Method</th><th>Action</th></tr></thead>
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

      {doc && (
        <PrintDoc doc={doc} onClose={() => setDoc(null)}
          onSignPay={doc.type === 'INVOICE' ? () => setSigning(true) : undefined}
          onReject={doc.type === 'INVOICE' ? handleReject : undefined}
          onFeedback={doc.type === 'INVOICE' ? handleFeedback : undefined} />
      )}

      {signing && (
        <SignaturePad title="Customer signature" onSave={handleSignSave} onClose={() => setSigning(false)} />
      )}

      {payFor && (
        <div className="print-overlay" onClick={() => setPayFor(null)}>
          <form className="print-card" onClick={e => e.stopPropagation()} onSubmit={handlePaySave}>
            <div className="modal-title">Receive Payment – {payFor.customer}</div>
            <div className="form-group">
              <label>Amount</label>
              <input className="input" inputMode="numeric" value={payForm.amount}
                onChange={e => setPayForm({ ...payForm, amount: e.target.value })} />
            </div>
            <div className="pay-methods">
              {['Cash', 'Mobile Money', 'Bank'].map(m => (
                <button type="button" key={m} className={'pay-btn' + (payForm.method === m ? ' selected' : '')}
                  onClick={() => setPayForm({ ...payForm, method: m })}>{m}</button>
              ))}
            </div>
            <div className="print-actions">
              <button type="button" className="btn btn-outline" onClick={() => setPayFor(null)}>Later</button>
              <button type="submit" className="btn btn-green">Save Payment</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}