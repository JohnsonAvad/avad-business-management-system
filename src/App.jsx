import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Sales from './pages/Sales';
import NewSale from './pages/NewSale';
import Inventory from './pages/Inventory';
import Expenses from './pages/Expenses';
import Suppliers from './pages/Suppliers';
import Placeholder from './pages/Placeholder';

function Protected() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Layout />;
}

const coming = {
  purchases: ['Purchases', 'purchases', 'Phase 2 – the next screen we will build.'],
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
              <Route path="/customers" element={<Customers />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/sales/new" element={<NewSale />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/suppliers" element={<Suppliers />} />
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