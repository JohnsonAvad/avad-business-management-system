import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { waLink } from '../utils/helpers';

export default function Today() {
    const { sales, expenses, products, customers, updateProduct } = useData();
    const { format } = useCurrency();
    const { user } = useAuth();
    const nav = useNavigate();

    const todayStr = new Date().toISOString().slice(0, 10);
    const yest = new Date(); yest.setDate(yest.getDate() - 1);
    const yestStr = yest.toISOString().slice(0, 10);
    const business = JSON.parse(localStorage.getItem('avad_business') || '{}');
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const displayName = business.ownerName || user?.name || 'Owner';
    const isService = business.type === 'Service';

    const paidOf = s => (s.paid !== undefined ? s.paid : s.status === 'Paid' ? s.amount : 0);

    const ySales = (sales || []).filter(s => s.date === yestStr);
    const yRevenue = ySales.reduce((a, s) => a + s.amount, 0);
    const yExpenses = (expenses || []).filter(e => e.date === yestStr).reduce((a, e) => a + e.amount, 0);
    const yProfit = yRevenue - yExpenses;

    const debtors = (customers || []).filter(c => c.balance > 0).map(c => {
        const unpaid = (sales || []).filter(s => s.customer === c.name && s.status !== 'Paid' && s.status !== 'Rejected' && s.dueDate);
        const due = unpaid.length ? unpaid.map(s => s.dueDate).sort()[0] : null;
        const overdueDays = due && due < todayStr ? Math.ceil((new Date(todayStr) - new Date(due)) / 86400000) : 0;
        return { ...c, due, overdueDays };
    }).sort((a, b) => b.overdueDays - a.overdueDays || b.balance - a.balance);
    const totalOwed = debtors.reduce((a, d) => a + d.balance, 0);

    const start = new Date(); start.setDate(start.getDate() - 14);
    const startStr = start.toISOString().slice(0, 10);
    const soldByProduct = {};
    (sales || []).filter(s => s.date >= startStr).forEach(s => (s.items || []).forEach(i => {
        soldByProduct[i.productId] = (soldByProduct[i.productId] || 0) + i.qty;
    }));
    const restocks = (products || []).filter(p => p.active !== false).map(p => {
        const sold = soldByProduct[p.id] || 0;
        const velocity = sold / 14;
        const daysLeft = velocity > 0 ? p.stock / velocity : Infinity;
        return { ...p, velocity, daysLeft };
    }).filter(p => p.velocity > 0 && p.daysLeft <= 7).sort((a, b) => a.daysLeft - b.daysLeft);

    const priceAlerts = (products || []).filter(p => p.active !== false && p.price <= p.cost);
    const lowCount = (products || []).filter(p => p.active !== false && p.stock <= p.minStock).length;

    const briefLines = [
        '☀️ ' + greeting + ', ' + displayName + '!',
        'Here is how ' + (business.name || 'your business') + ' performed yesterday:',
        new Date().toDateString(),
        '',
        '💰 ' + format(yRevenue) + (isService ? ' earned' : ' sold') + ' • ' + format(yProfit) + ' profit',
        '🔴 Owed to you: ' + format(totalOwed) + (debtors.length ? ' (' + debtors.length + ' customer' + (debtors.length > 1 ? 's' : '') + ')' : ''),
    ];
    if (!isService && restocks.length) briefLines.push('📦 Restock soon: ' + restocks.slice(0, 3).map(p => p.name).join(', '));
    if (priceAlerts.length) briefLines.push('⚠️ Priced below cost: ' + priceAlerts.slice(0, 3).map(p => p.name).join(', '));
    briefLines.push('', 'Open the app to see your actions for today.');
    const briefText = briefLines.join('\n');

    function sendReminder(d) {
        const text = 'Hello ' + d.name + ', a friendly reminder from ' + (business.name || 'our shop') + '. You have a balance of ' + format(d.balance) + (d.due ? ' (due ' + d.due + ')' : '') + '. Please pay when you can. Thank you!';
        window.open(waLink(d.phone, text), '_blank');
    }

    function orderNow(p) {
        const qty = Math.max(Math.ceil(p.velocity * 14), 1);
        sessionStorage.setItem('avad_prefill', JSON.stringify([{ productId: p.id, name: p.name, cost: p.cost, qty }]));
        nav('/purchases/new');
    }

    function fixPrice(p) {
        const suggested = p.cost + Math.round(p.cost * 0.2);
        const input = window.prompt('New selling price for ' + p.name + ' (it costs ' + format(p.cost) + '):', String(suggested));
        if (input === null) return;
        const newPrice = Number(input);
        if (!newPrice || newPrice <= 0) return;
        updateProduct(p.id, { price: newPrice });
    }

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">{greeting}, {displayName} 👋</h1>
                    <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginTop: 4 }}>
                        Here is how <span style={{ color: 'var(--blue-deep)' }}>{business.name || 'your business'}</span> performed yesterday.
                    </div>
                    <div className="choice-sub" style={{ marginTop: 4 }}>
                        {new Date().toLocaleDateString('en-UG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                </div>
            </div>

            <div className="stat-grid">
                <div className="stat-card"><div><div className="stat-label">{isService ? "Yesterday's Earnings" : "Yesterday's Sales"}</div><div className="stat-value blue">{format(yRevenue)}</div></div></div>
                <div className="stat-card"><div><div className="stat-label">Yesterday's Profit</div><div className={yProfit >= 0 ? 'stat-value green' : 'stat-value red'}>{format(yProfit)}</div></div></div>
                <div className="stat-card"><div><div className="stat-label">Money Owed to You</div><div className="stat-value red">{format(totalOwed)}</div></div></div>
                {!isService && (
                    <div className="stat-card"><div><div className="stat-label">Low Stock Items</div><div className="stat-value red">{lowCount}</div></div></div>
                )}
            </div>

            {debtors.length === 0 && restocks.length === 0 && priceAlerts.length === 0 && (
                <div className="panel" style={{ marginBottom: 14, textAlign: 'center' }}>
                    <div style={{ fontSize: 34 }}>✅</div>
                    <div className="panel-title">All clear!</div>
                    <div className="choice-sub">No urgent actions today. Great job running your business.</div>
                </div>
            )}

            {debtors.length > 0 && (
                <div className="panel" style={{ marginBottom: 14 }}>
                    <div className="panel-title">🔴 Collect Money Owed ({format(totalOwed)})</div>
                    {debtors.slice(0, 3).map(d => (
                        <div key={d.id} className="cart-row">
                            <div style={{ flex: 1, minWidth: 160 }}>
                                <div style={{ fontWeight: 700 }}>{d.name}</div>
                                <div className="choice-sub">{d.overdueDays > 0 ? d.overdueDays + ' days overdue' : d.due ? 'Due ' + d.due : 'Owed'}</div>
                            </div>
                            <div style={{ fontWeight: 800, color: 'var(--red)' }}>{format(d.balance)}</div>
                            <button className="btn btn-green" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => sendReminder(d)}>
                                WhatsApp Reminder
                            </button>
                        </div>
                    ))}
                    {debtors.length > 3 && <Link to="/customers" className="choice-sub" style={{ display: 'inline-block', marginTop: 8 }}>See all {debtors.length} debtors →</Link>}
                </div>
            )}

            {!isService && restocks.length > 0 && (
                <div className="panel" style={{ marginBottom: 14 }}>
                    <div className="panel-title">📦 Restock Soon</div>
                    {restocks.slice(0, 3).map(p => (
                        <div key={p.id} className="cart-row">
                            <div style={{ flex: 1, minWidth: 160 }}>
                                <div style={{ fontWeight: 700 }}>{p.name}</div>
                                <div className="choice-sub">
                                    {p.stock <= 0 ? 'Out of stock!' : 'Runs out in ~' + Math.max(Math.ceil(p.daysLeft), 1) + ' day(s) • ' + p.stock + ' left'}
                                </div>
                            </div>
                            <button className="btn btn-blue" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => orderNow(p)}>
                                Order {Math.max(Math.ceil(p.velocity * 14), 1)}
                            </button>
                        </div>
                    ))}
                    {restocks.length > 3 && <Link to="/inventory" className="choice-sub" style={{ display: 'inline-block', marginTop: 8 }}>See all {restocks.length} →</Link>}
                </div>
            )}

            {priceAlerts.length > 0 && (
                <div className="panel" style={{ marginBottom: 14 }}>
                    <div className="panel-title">⚠️ Priced Below Cost (losing money!)</div>
                    {priceAlerts.slice(0, 3).map(p => (
                        <div key={p.id} className="cart-row">
                            <div style={{ flex: 1, minWidth: 160 }}>
                                <div style={{ fontWeight: 700 }}>{p.name}</div>
                                <div className="choice-sub">Sells at {format(p.price)} but costs {format(p.cost)}</div>
                            </div>
                            <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => fixPrice(p)}>Fix Price</button>
                        </div>
                    ))}
                </div>
            )}

            <div className="panel">
                <div className="panel-title">📲 Your Morning Brief</div>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 14, color: '#374151', margin: 0 }}>{briefText}</pre>
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                    <a className="btn btn-green" target="_blank" rel="noreferrer" href={waLink(user?.phone, briefText)}>Send to my WhatsApp</a>
                    <Link to="/analytics" className="btn btn-outline">See Full Analytics</Link>
                </div>
            </div>
        </>
    );
}