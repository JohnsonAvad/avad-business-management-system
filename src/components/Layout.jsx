import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import Icon from './Icon';

const menu = [
  { to: '/', icon: 'home', label: 'Today' },
  { to: '/analytics', icon: 'reports', label: 'Analytics' },
  { to: '/sales', icon: 'sales', label: 'Sales' },
  { to: '/customers', icon: 'customers', label: 'Customers' },
  { to: '/crm', icon: 'crm', label: 'CRM' },
  { to: '/inventory', icon: 'inventory', label: 'Inventory' },
  { to: '/purchases', icon: 'purchases', label: 'Purchases' },
  { to: '/suppliers', icon: 'suppliers', label: 'Suppliers' },
  { to: '/expenses', icon: 'expenses', label: 'Expenses' },
  { to: '/invoices', icon: 'invoices', label: 'Invoices & Receipts' },
  { to: '/quotations', icon: 'invoices', label: 'Quotations' },
  { to: '/delivery-notes', icon: 'inventory', label: 'Delivery Notes' },
  { to: '/accounting', icon: 'accounting', label: 'Accounting' },
  { to: '/banks', icon: 'banks', label: 'Banks' },
  { to: '/hr', icon: 'hr', label: 'HR & Payroll' },
  { to: '/marketing', icon: 'marketing', label: 'Marketing' },
  { to: '/reports', icon: 'reports', label: 'Reports' },
  { to: '/settings', icon: 'settings', label: 'Settings' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const nav = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const business = JSON.parse(localStorage.getItem('avad_business') || '{}');

  return (
    <div className="shell">
      {menuOpen && <div className="side-overlay" onClick={() => setMenuOpen(false)} />}
      <aside className={'sidebar' + (menuOpen ? ' open' : '')}>
        <div className="brand">
          <div className="brand-logo">A</div>
          <div>
            <div className="brand-name">AVAD Systems</div>
            <div className="brand-sub">{business.name || 'Business Suite'}</div>
          </div>
        </div>
        <nav>
          {menu.map(m => (
            <NavLink key={m.to} to={m.to} end={m.to === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
              <Icon name={m.icon} size={19} /> {m.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="icon-btn menu-btn" title="Menu" onClick={() => setMenuOpen(true)}>
              <Icon name="menu" size={20} />
            </button>
            <div className="topbar-title">Welcome, {business.ownerName || user?.name}</div>
            <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 13, marginLeft: 'auto' }} onClick={logout}>
              Log Out
            </button>
          </div>
          <div className="topbar-right">
            <div className="search"><Icon name="search" size={16} /><input placeholder="Search…" /></div>
            <select className="currency-select" value={currency} onChange={e => setCurrency(e.target.value)} title="Currency">
              <option value="UGX">UGX</option>
              <option value="USD">USD $</option>
            </select>
            <button className="icon-btn" title="Notifications"><Icon name="bell" size={18} /></button>
            <button className="icon-btn" title="Log out" onClick={() => { logout(); nav('/login'); }}><Icon name="logout" size={18} /></button>
          </div>
        </header>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
}