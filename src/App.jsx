import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Placeholder from './pages/Placeholder';

function Protected() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Layout />;
}

const coming = {
  sales: ['Sales', 'sales', 'Phase 1 – the next screen we will build together.'],
  customers: ['Customers', 'customers', 'Phase 1 – coming right after Sales.'],
  inventory: ['Inventory', 'inventory', 'Phase 1 – products and stock.'],
  purchases: ['Purchases', 'purchases', 'Phase 2 – suppliers and buying.'],
  expenses: ['Expenses', 'expenses', 'Phase 1 – record money out.'],
  invoices: ['Invoices & Receipts', 'invoices', 'Phase 2 – billing and payments.'],
  accounting: ['Accounting', 'accounting', 'Phase 3 – ledgers and reports.'],
  banks: ['Banks', 'banks', 'Phase 3 – bank and cash accounts.'],
  hr: ['HR & Payroll', 'hr', 'Phase 5 – employees and salaries.'],
  marketing: ['Marketing', 'marketing', 'Phase 4 – campaigns and content.'],
  reports: ['Reports', 'reports', 'Phase 1 – printable business reports.'],
  settings: ['Settings', 'settings', 'Phase 1 – business profile, users and currency.'],
};

export default function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <DataProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<Protected />}>
              <Route path="/" element={<Dashboard />} />
              {Object.entries(coming).map(([key, [title, icon, note]]) => (
                <Route key={key} path={'/' + key} element={<Placeholder title={title} icon={icon} note={note} />} />
              ))}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </DataProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}