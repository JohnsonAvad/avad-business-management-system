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
import Purchases from './pages/Purchases';
import NewPurchase from './pages/NewPurchase';
import InvoicesReceipts from './pages/InvoicesReceipts';
import Quotations from './pages/Quotations';
import NewQuotation from './pages/NewQuotation';
import DeliveryNotes from './pages/DeliveryNotes';
import Settings from './pages/Settings';
import Placeholder from './pages/Placeholder';

function Protected() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Layout />;
}

const coming = {
  accounting: ['Accounting', 'accounting', 'Phase 3 – ledgers and reports.'],
  banks: ['Banks', 'banks', 'Phase 3 – bank and cash accounts.'],
  hr: ['HR & Payroll', 'hr', 'Phase 5 – employees and salaries.'],
  marketing: ['Marketing', 'marketing', 'Phase 4 – campaigns and content.'],
  reports: ['Reports', 'reports', 'Phase 1 – printable business reports.'],
  
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
              <Route path="/purchases" element={<Purchases />} />
              <Route path="/purchases/new" element={<NewPurchase />} />
              <Route path="/invoices" element={<InvoicesReceipts />} />
              <Route path="/quotations" element={<Quotations />} />
              <Route path="/quotations/new" element={<NewQuotation />} />
              <Route path="/delivery-notes" element={<DeliveryNotes />} />
              <Route path="/settings" element={<Settings />} />
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