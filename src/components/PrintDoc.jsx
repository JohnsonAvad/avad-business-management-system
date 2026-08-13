import { useCurrency } from '../context/CurrencyContext';
import { waLink, smsLink } from '../utils/helpers';

export default function PrintDoc({ doc, onClose }) {
  const { format } = useCurrency();
  const balance = (doc.total || 0) - (doc.paid || 0);

  const lines = [];
  lines.push(doc.businessName || 'AVAD Systems');
  lines.push(doc.type + ' ' + doc.number);
  lines.push('Date: ' + doc.date);
  lines.push('Customer: ' + doc.customer);
  if (doc.items && doc.items.length) {
    lines.push('Items:');
    doc.items.forEach(i => lines.push('- ' + i.name + ' x' + i.qty + ' = ' + format(i.qty * (i.price || 0))));
  }
  lines.push('Total: ' + format(doc.total || 0));
  lines.push('Paid: ' + format(doc.paid || 0) + ' (' + (doc.method || '') + ')');
  if (balance > 0) lines.push('Balance: ' + format(balance));
  lines.push('Thank you for your business!');
  const text = lines.join('\n');

  return (
    <div className="print-overlay" onClick={onClose}>
      <div className="print-card" onClick={e => e.stopPropagation()}>
        <div className="print-area">
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{doc.businessName || 'AVAD Systems'}</div>
            <div style={{ color: 'var(--muted)', fontSize: 12 }}>{doc.type} • {doc.number}</div>
          </div>
          <div className="total-line"><span>Date</span><span>{doc.date}</span></div>
          <div className="total-line"><span>Customer</span><span>{doc.customer}</span></div>
          {doc.items && doc.items.length > 0 && (
            <table className="table" style={{ margin: '8px 0' }}>
              <thead><tr><th>Item</th><th>Qty</th><th>Amount</th></tr></thead>
              <tbody>
                {doc.items.map((i, idx) => (
                  <tr key={idx}>
                    <td>{i.name}</td>
                    <td>{i.qty}</td>
                    <td>{format(i.qty * (i.price || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {(!doc.items || doc.items.length === 0) && (
            <div style={{ color: 'var(--muted)', fontSize: 12, margin: '8px 0' }}>
              Item details were not recorded for this sale.
            </div>
          )}
          <div className="total-line big"><span>Total</span><span className="amt">{format(doc.total || 0)}</span></div>
          <div className="total-line"><span>Paid ({doc.method})</span><span className="amt green">{format(doc.paid || 0)}</span></div>
          {balance > 0 && <div className="total-line"><span>Balance</span><span className="amt red">{format(balance)}</span></div>}
          <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 12, marginTop: 12 }}>
            Thank you for your business!
          </div>
        </div>
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