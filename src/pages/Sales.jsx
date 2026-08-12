import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useCurrency } from '../context/CurrencyContext';
import Icon from '../components/Icon';

export default function Sales() {
  const { sales } = useData();
  const { format } = useCurrency();
  const badge = st => (st === 'Paid' ? 'green' : st === 'Partial' ? 'amber' : st === 'Credit' ? 'red' : 'blue');
  const list = [...sales].reverse();

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales</h1>
          <div className="page-sub">Everything you have sold.</div>
        </div>
        <Link to="/sales/new" className="btn btn-green btn-lg"><Icon name="plus" size={18} /> New Sale</Link>
      </div>

      <div className="panel">
        <table className="table">
          <thead>
            <tr><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr>
          </thead>
          <tbody>
            {list.map(s => (
              <tr key={s.id}>
                <td>{s.date}</td>
                <td style={{ fontWeight: 600 }}>{s.customer}</td>
                <td>{s.items ? s.items.length : '—'}</td>
                <td style={{ fontWeight: 700 }}>{format(s.amount)}</td>
                <td><span className={'badge ' + badge(s.status)}>{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}