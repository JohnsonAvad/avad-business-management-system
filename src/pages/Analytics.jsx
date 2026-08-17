import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useCurrency } from '../context/CurrencyContext';

function AreaChart({ data, height = 130, color }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const w = 100;
  const step = data.length > 1 ? w / (data.length - 1) : w;
  const pts = data.map((d, i) => [i * step, height - (d.value / max) * (height - 14) - 6]);
  const line = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const area = line + ' L' + w + ',' + height + ' L0,' + height + ' Z';
  return (
    <div>
      <svg viewBox={'0 0 ' + w + ' ' + height} style={{ width: '100%', height }} preserveAspectRatio="none">
        <path d={area} fill={color} opacity="0.15" />
        <path d={line} fill="none" stroke={color} strokeWidth="2" />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)' }}>
        <span>{data[0]?.label}</span><span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}

function Donut({ segments, size = 130 }) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const r = 40, c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
      <circle cx="50" cy="50" r={r} fill="none" stroke="var(--border)" strokeWidth="14" />
      {segments.map((s, i) => {
        const len = (s.value / total) * c;
        const el = (
          <circle key={i} cx="50" cy="50" r={r} fill="none" stroke={s.color} strokeWidth="14"
            strokeDasharray={len + ' ' + (c - len)} strokeDashoffset={-offset} transform="rotate(-90 50 50)" />
        );
        offset += len;
        return el;
      })}
    </svg>
  );
}

function Legend({ segments }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
      {segments.map(s => (
        <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, display: 'inline-block' }} />
          <span style={{ flex: 1 }}>{s.label}</span>
          <span>{s.text}</span>
        </div>
      ))}
    </div>
  );
}

function HBars({ items, color }) {
  const max = Math.max(...items.map(i => i.value), 1);
  if (items.length === 0) return <div className="empty-state">No data in this period.</div>;
  return (
    <div>
      {items.map(i => (
        <div key={i.label} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700 }}>
            <span>{i.label}</span><span>{i.text}</span>
          </div>
          <div style={{ background: 'var(--bg)', borderRadius: 999, height: 8, marginTop: 3 }}>
            <div style={{ width: (i.value / max) * 100 + '%', background: color, height: 8, borderRadius: 999 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const { sales, expenses, products, customers } = useData();
  const { format } = useCurrency();
  const [period, setPeriod] = useState('30');

  const days = Number(period);
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  const startStr = start.toISOString().slice(0, 10);

  const salesIn = (sales || []).filter(s => s.date >= startStr);
  const expensesIn = (expenses || []).filter(e => e.date >= startStr);
  const paidOf = s => (s.paid !== undefined ? s.paid : s.status === 'Paid' ? s.amount : 0);

  const totalSales = salesIn.reduce((a, s) => a + s.amount, 0);
  const totalPaid = salesIn.reduce((a, s) => a + paidOf(s), 0);
  const totalExp = expensesIn.reduce((a, e) => a + e.amount, 0);
  const avgSale = salesIn.length ? Math.round(totalSales / salesIn.length) : 0;
  const collectionRate = totalSales ? Math.round((totalPaid / totalSales) * 100) : 0;

  const series = [];
  const expSeries = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const ds = d.toISOString().slice(0, 10);
    series.push({ label: ds, value: salesIn.filter(s => s.date === ds).reduce((a, s) => a + s.amount, 0) });
    expSeries.push({ label: ds, value: expensesIn.filter(e => e.date === ds).reduce((a, e) => a + e.amount, 0) });
  }

  const methodTotals = {};
  salesIn.forEach(s => { methodTotals[s.method || 'Cash'] = (methodTotals[s.method || 'Cash'] || 0) + s.amount; });
  const methodColors = { Cash: 'var(--green)', 'Mobile Money': 'var(--blue)', Bank: 'var(--amber)', Credit: 'var(--red)' };
  const methodSegments = Object.entries(methodTotals).map(([label, value]) => ({
    label, value, color: methodColors[label] || 'var(--blue)', text: format(value),
  }));

  const prodTotals = {};
  salesIn.forEach(s => (s.items || []).forEach(i => { prodTotals[i.name] = (prodTotals[i.name] || 0) + i.qty * i.price; }));
  const topProducts = Object.entries(prodTotals).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([label, value]) => ({ label, value, text: format(value) }));

  const custTotals = {};
  salesIn.forEach(s => { custTotals[s.customer] = (custTotals[s.customer] || 0) + s.amount; });
  const topCustomers = Object.entries(custTotals).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([label, value]) => ({ label, value, text: format(value) }));

  const activeProducts = (products || []).filter(p => p.active !== false);
  const okCount = activeProducts.filter(p => p.stock > p.minStock).length;
  const lowCount = activeProducts.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
  const outCount = activeProducts.filter(p => p.stock <= 0).length;
  const stockSegments = [
    { label: 'Healthy', value: okCount, color: 'var(--green)', text: okCount + ' items' },
    { label: 'Low', value: lowCount, color: 'var(--amber)', text: lowCount + ' items' },
    { label: 'Out', value: outCount, color: 'var(--red)', text: outCount + ' items' },
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayTotals = [0, 0, 0, 0, 0, 0, 0];
  salesIn.forEach(s => { dayTotals[new Date(s.date).getDay()] += s.amount; });
  const bestDay = dayNames[dayTotals.indexOf(Math.max(...dayTotals))];

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Data Analysis</h1>
          <div className="page-sub">See your business visually.</div>
        </div>
        <select className="input" style={{ maxWidth: 160 }} value={period} onChange={e => setPeriod(e.target.value)}>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      <div className="stat-grid">
        <div className="stat-card"><div><div className="stat-label">Total Sales</div><div className="stat-value green">{format(totalSales)}</div></div></div>
        <div className="stat-card"><div><div className="stat-label">Transactions</div><div className="stat-value blue">{salesIn.length}</div></div></div>
        <div className="stat-card"><div><div className="stat-label">Average Sale</div><div className="stat-value blue">{format(avgSale)}</div></div></div>
        <div className="stat-card"><div><div className="stat-label">Collection Rate</div><div className={collectionRate >= 80 ? 'stat-value green' : 'stat-value red'}>{collectionRate}%</div></div></div>
        <div className="stat-card"><div><div className="stat-label">Best Day</div><div className="stat-value green">{bestDay}</div></div></div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-title">Sales Trend</div>
          <AreaChart data={series} color="var(--green)" />
        </div>
        <div className="panel">
          <div className="panel-title">Money Out Trend</div>
          <AreaChart data={expSeries} color="var(--red)" />
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-title">How Customers Pay</div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Donut segments={methodSegments} />
            <Legend segments={methodSegments} />
          </div>
        </div>
        <div className="panel">
          <div className="panel-title">Stock Health</div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Donut segments={stockSegments} />
            <Legend segments={stockSegments} />
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-title">Top Products</div>
          <HBars items={topProducts} color="var(--green)" />
        </div>
        <div className="panel">
          <div className="panel-title">Top Customers</div>
          <HBars items={topCustomers} color="var(--blue)" />
        </div>
      </div>
    </>
  );
}