import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useCurrency } from '../context/CurrencyContext';
import Icon from '../components/Icon';

const today = () => new Date().toISOString().slice(0, 10);

export default function Dashboard() {
  const { sales, expenses, customers, products } = useData();
  const { format } = useCurrency();

  const t = today();
  const todaySalesList = sales.filter(s => s.date === t);
  const todaySales = todaySalesList.reduce((a, s) => a + s.amount, 0);
  const moneyOut = expenses.filter(x => x.date === t).reduce((a, x) => a + x.amount, 0);
  const owed = customers.reduce((a, c) => a + (c.balance || 0), 0);
  const low = products.filter(p => p.stock <= p.minStock);
  const profit = todaySales - moneyOut;

  const days = [...Array(7)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    return {
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      total: sales.filter(s => s.date === key).reduce((a, s) => a + s.amount, 0),
    };
  });
  const max = Math.max(...days.map(d => d.total), 1);
  const badge = st => (st === 'Paid' ? 'green' : st === 'Credit' ? 'amber' : 'blue');

  return (
    <>
      <h1 className="page-title">Business Dashboard</h1>
      <div className="page-sub">Here is how your business is doing today.</div>

      <div className="stat-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Today's Sales</div>
            <div className="stat-value green">{format(todaySales)}</div>
            <div className="stat-hint">{todaySalesList.length} sale(s) today</div>
          </div>
          <div className="stat-icon green"><Icon name="sales" /></div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-label">Money Out Today</div>
            <div className="stat-value red">{format(moneyOut)}</div>
            <div className="stat-hint">Expenses today</div>
          </div>
          <div className="stat-icon amber"><Icon name="expenses" /></div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-label">Profit Today</div>
            <div className={profit >= 0 ? 'stat-value green' : 'stat-value red'}>{format(profit)}</div>
            <div className="stat-hint">Sales minus expenses</div>
          </div>
          <div className="stat-icon green"><Icon name="reports" /></div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-label">Customers Owed</div>
            <div className="stat-value blue">{format(owed)}</div>
            <div className="stat-hint">{customers.filter(c => c.balance > 0).length} customer(s) owing</div>
          </div>
          <div className="stat-icon blue"><Icon name="customers" /></div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-label">Low Stock</div>
            <div className="stat-value red">{low.length} item(s)</div>
            <div className="stat-hint">{low.map(p => p.name).join(', ') || 'All stock is okay'}</div>
          </div>
          <div className="stat-icon amber"><Icon name="inventory" /></div>
        </div>
      </div>

      <div className="quick-actions">
        <Link to="/sales" className="btn btn-green btn-lg"><Icon name="plus" size={16} /> New Sale</Link>
        <Link to="/customers" className="btn btn-green btn-lg"><Icon name="plus" size={16} /> New Customer</Link>
        <Link to="/expenses" className="btn btn-green btn-lg"><Icon name="plus" size={16} /> Add Expense</Link>
        <Link to="/inventory" className="btn btn-green btn-lg"><Icon name="plus" size={16} /> Add Product</Link>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-title">Sales – Last 7 Days</div>
          <div className="bars">
            {days.map((d, i) => (
              <div className="bar-wrap" key={i}>
                <div className="bar" style={{ height: `${Math.max((d.total / max) * 100, 4)}%` }} title={format(d.total)} />
                <div className="bar-label">{d.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="panel-title">Recent Sales</div>
          <table className="table">
            <thead><tr><th>Date</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {sales.slice(-5).reverse().map(s => (
                <tr key={s.id}>
                  <td>{s.date.slice(5)}</td>
                  <td>{s.customer}</td>
                  <td>{format(s.amount)}</td>
                  <td><span className={'badge ' + badge(s.status)}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}