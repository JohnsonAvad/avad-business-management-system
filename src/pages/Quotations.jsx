import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useCurrency } from '../context/CurrencyContext';
import PrintDoc from '../components/PrintDoc';

export default function Quotations() {
  const { quotations, customers, updateQuotation, convertQuotation } = useData();
  const { format } = useCurrency();
  const [doc, setDoc] = useState(null);
  const business = JSON.parse(localStorage.getItem('avad_business') || '{}');
  const phoneOf = name => (customers || []).find(c => c.name === name)?.phone || '';
  const list = [...(quotations || [])].reverse();
  const badge = st => ({ Draft: 'grey', Sent: 'blue', Accepted: 'green', Rejected: 'red', Converted: 'amber' }[st] || 'grey');

  function open(q) {
    setDoc({
      type: 'QUOTATION', number: q.number, date: q.date, validUntil: q.validUntil, customer: q.customer,
      customerPhone: phoneOf(q.customer), items: q.items || [], total: q.total, paid: q.total, method: '',
      businessName: business.name, logo: business.logo, businessPhone: business.phone,
      businessAddress: business.address, footer: business.footer,
    });
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Quotations</h1>
          <div className="page-sub">Price estimates for customers.</div>
        </div>
        <Link to="/quotations/new" className="btn btn-green btn-lg">+ New Quotation</Link>
      </div>

      <div className="panel">
        {list.length === 0 ? <div className="empty-state">No quotations yet.</div> : (
          <table className="table">
            <thead><tr><th>No.</th><th>Date</th><th>Valid until</th><th>Customer</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {list.map(q => (
                <tr key={q.id}>
                  <td style={{ fontWeight: 700 }}>{q.number}</td>
                  <td>{q.date}</td>
                  <td>{q.validUntil}</td>
                  <td>{q.customer}</td>
                  <td>{format(q.total)}</td>
                  <td><span className={'badge ' + badge(q.status)}>{q.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button className="btn btn-outline" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => open(q)}>View</button>
                      {q.status === 'Draft' && <button className="btn btn-outline" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => updateQuotation(q.id, { status: 'Sent' })}>Mark Sent</button>}
                      {q.status === 'Sent' && (
                        <>
                          <button className="btn btn-outline" style={{ padding: '6px 10px', fontSize: 12, color: 'var(--green-deep)' }} onClick={() => updateQuotation(q.id, { status: 'Accepted' })}>Accept</button>
                          <button className="btn btn-outline" style={{ padding: '6px 10px', fontSize: 12, color: 'var(--red)' }} onClick={() => updateQuotation(q.id, { status: 'Rejected' })}>Reject</button>
                        </>
                      )}
                      {q.status === 'Accepted' && <button className="btn btn-green" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => convertQuotation(q.id)}>Convert to Invoice</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {doc && <PrintDoc doc={doc} onClose={() => setDoc(null)} />}
    </>
  );
}