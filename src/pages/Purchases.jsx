import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useCurrency } from '../context/CurrencyContext';
import Icon from '../components/Icon';

export default function Purchases() {
  const { purchases } = useData();
  const { format } = useCurrency();
  const badge = st => (st === 'Paid' ? 'green' : st === 'Partial' ? 'amber' : 'red');
  const list = [...(purchases || [])].reverse();

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Purchases</h1>
          <div className="page-sub">Goods you have bought.</div>
        </div>
        <Link to="/purchases/new" className="btn btn-green btn-lg"><Icon name="plus" size={18} /> New Purchase</Link>
      </div>

      <div className="panel">
        {list.length === 0 ? (
          <div className="empty-state">No purchases yet. Tap New Purchase to buy stock.</div>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Date</th><th>Supplier</th><th>Items</th><th>Total</th><th>Paid</th><th>Status</th></tr>
            </thead>
            <tbody>
              {list.map(p => (
                <tr key={p.id}>
                  <td>{p.date}</td>
                  <td style={{ fontWeight: 600 }}>{p.supplier}</td>
                  <td>{p.items ? p.items.length : '—'}</td>
                  <td style={{ fontWeight: 700 }}>{format(p.amount)}</td>
                  <td>{format(p.paid || 0)}</td>
                  <td><span className={'badge ' + badge(p.status)}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}