import { useCurrency } from '../context/CurrencyContext';
import { waLink, smsLink } from '../utils/helpers';

export default function PrintDoc({ doc, onClose, onSignPay, onReject, onFeedback }) {
  const { format } = useCurrency();
  const balance = (doc.total || 0) - (doc.paid || 0);

  const lines = [];
  lines.push(doc.businessName || 'AVAD Systems');
  if (doc.businessAddress) lines.push(doc.businessAddress);
  if (doc.businessPhone) lines.push('Tel: ' + doc.businessPhone);
  lines.push(doc.type + ' ' + doc.number);
  lines.push('Date: ' + doc.date);
  if (doc.dueDate) lines.push('Due: ' + doc.dueDate);
  if (doc.validUntil) lines.push('Valid until: ' + doc.validUntil);
  if (doc.deliveredBy) lines.push('Delivered by: ' + doc.deliveredBy);
  lines.push('Customer: ' + doc.customer);
  if (doc.items && doc.items.length) {
    lines.push('Items:');
    doc.items.forEach(i => lines.push('- ' + i.name + ' x' + i.qty + ' = ' + format(i.qty * (i.price || 0))));
  }
  if (doc.type !== 'QUOTATION' && doc.type !== 'DELIVERY') lines.push('Total: ' + format(doc.total || 0));
  if (doc.type === 'QUOTATION') lines.push('Total: ' + format(doc.total || 0));
  if (doc.type !== 'QUOTATION' && doc.type !== 'DELIVERY') {
    lines.push('Paid: ' + format(doc.paid || 0) + ' (' + (doc.method || '') + ')');
    if (balance > 0) lines.push('Balance: ' + format(balance));
  }
  if (doc.type === 'INVOICE' && doc.warranty) lines.push('Warranty: ' + doc.warranty);
  lines.push(doc.footer || 'Thank you for your business!');
  const text = lines.join('\n');

  return (
    <div className="print-overlay" onClick={onClose}>
      <div className="print-card" onClick={e => e.stopPropagation()}>
        <div className="print-area">
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            {doc.logo && <img src={doc.logo} alt="logo" style={{ width: 56, height: 56, objectFit: 'contain', margin: '0 auto 6px', display: 'block' }} />}
            <div style={{ fontWeight: 800, fontSize: 18 }}>{doc.businessName || 'AVAD Systems'}</div>
            {doc.businessAddress && <div style={{ color: 'var(--muted)', fontSize: 12 }}>{doc.businessAddress}</div>}
            {doc.businessPhone && <div style={{ color: 'var(--muted)', fontSize: 12 }}>Tel: {doc.businessPhone}</div>}
            <div style={{ color: 'var(--muted)', fontSize: 12 }}>{doc.type} • {doc.number}</div>
          </div>
          <div className="total-line"><span>Date</span><span>{doc.date}</span></div>
                    {doc.dueDate && <div className="total-line"><span>Due (expiration)</span><span>{doc.dueDate}</span></div>}
          {doc.validUntil && <div className="total-line"><span>Valid until</span><span>{doc.validUntil}</span></div>}
          {doc.deliveredBy && <div className="total-line"><span>Delivered by</span><span>{doc.deliveredBy}</span></div>}
          <div className="total-line"><span>Customer</span><span>{doc.customer}</span></div>
          {doc.items && doc.items.length > 0 && (
            <table className="table" style={{ margin: '8px 0' }}>
              <thead><tr><th>Item</th><th>Qty</th><th>Amount</th></tr></thead>
              <tbody>
                {doc.items.map((i, idx) => (
                  <tr key={idx}><td>{i.name}</td><td>{i.qty}</td><td>{format(i.qty * (i.price || 0))}</td></tr>
                ))}
              </tbody>
            </table>
          )}
          {(!doc.items || doc.items.length === 0) && (
            <div style={{ color: 'var(--muted)', fontSize: 12, margin: '8px 0' }}>
              {doc.type === 'RECEIPT' ? 'Payment received on account.' : 'Item details were not recorded for this sale.'}
            </div>
          )}
            {doc.type !== 'DELIVERY' && (
            <div className="total-line big"><span>Total</span><span className="amt">{format(doc.total || 0)}</span></div>
          )}
          {doc.type !== 'QUOTATION' && doc.type !== 'DELIVERY' && (
            <>
              <div className="total-line"><span>Paid ({doc.method})</span><span className="amt green">{format(doc.paid || 0)}</span></div>
              {balance > 0 && <div className="total-line"><span>Balance</span><span className="amt red">{format(balance)}</span></div>}
            </>
          )}
          {doc.type === 'INVOICE' && doc.warranty && (
            <div style={{ color: 'var(--muted)', fontSize: 12, margin: '8px 0' }}>Warranty: {doc.warranty}</div>
          )}
          {doc.type === 'INVOICE' && doc.status === 'Rejected' && (
            <div className="alert red" style={{ marginTop: 8 }}>Rejected by customer{doc.rejectReason ? ': ' + doc.rejectReason : ''}</div>
          )}
          {doc.type === 'INVOICE' && doc.feedback && (
            <div style={{ color: 'var(--blue-dark)', fontSize: 12, margin: '8px 0' }}>Customer feedback: {doc.feedback}</div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
            {doc.type === 'INVOICE' && (
              <div style={{ flex: 1, textAlign: 'center' }}>
                {doc.customerSignature
                  ? <img src={doc.customerSignature} alt="signature" style={{ height: 44, margin: '0 auto' }} />
                  : <div style={{ height: 44 }} />}
                <div style={{ borderTop: '1px solid #9CA3AF', paddingTop: 4, fontSize: 11, color: 'var(--muted)' }}>Customer signature</div>
              </div>
            )}
            {doc.type === 'RECEIPT' && (
              <div style={{ flex: 1, textAlign: 'center' }}>
                {doc.ownerSignature
                  ? <img src={doc.ownerSignature} alt="signature" style={{ height: 44, margin: '0 auto' }} />
                  : <div style={{ height: 44 }} />}
                <div style={{ borderTop: '1px solid #9CA3AF', paddingTop: 4, fontSize: 11, color: 'var(--muted)' }}>Owner signature</div>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 12, marginTop: 12 }}>
            {doc.footer || 'Thank you for your business!'}
          </div>
        </div>

        {doc.type === 'INVOICE' && doc.status !== 'Rejected' && (
          <div className="print-actions">
            {balance > 0 && !doc.customerSignature && onSignPay && (
              <button className="btn btn-green" onClick={onSignPay}>Sign & Pay</button>
            )}
            {doc.customerSignature && <span className="badge green">Signed by customer ✓</span>}
            {onFeedback && <button className="btn btn-blue" onClick={onFeedback}>Feedback</button>}
            {onReject && <button className="btn btn-danger" onClick={onReject}>Reject</button>}
          </div>
        )}
        <div className="print-actions">
          <button className="btn btn-green" onClick={() => window.print()}>Print</button>
          <a className="btn btn-blue" target="_blank" rel="noreferrer" href={waLink(doc.customerPhone, text)}>WhatsApp</a>
          <a className="btn btn-outline" href={smsLink(doc.customerPhone, text)}>SMS</a>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}