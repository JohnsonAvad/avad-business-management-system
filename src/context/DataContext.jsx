import { createContext, useContext, useState } from 'react';

const DataContext = createContext(null);
const KEY = 'avad_data_v1';
const read = (k, f) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? f; } catch { return f; } };
const daysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };

function seed() {
  return {
    customers: [
      { id: 1, name: 'Sarah Nakato', phone: '0772111222', balance: 150000 },
      { id: 2, name: 'Peter Okello', phone: '0701333444', balance: 0 },
      { id: 3, name: 'Amina Hassan', phone: '0759555666', balance: 80000 },
      { id: 4, name: 'David Mugisha', phone: '0782777888', balance: 0 },
    ],
    products: [
      { id: 1, name: 'Rice 5kg', stock: 24, minStock: 10, price: 45000, cost: 38000 },
      { id: 2, name: 'Sugar 1kg', stock: 6, minStock: 15, price: 5000, cost: 4200 },
      { id: 3, name: 'Cooking Oil 1L', stock: 3, minStock: 10, price: 12000, cost: 10000 },
      { id: 4, name: 'Maize Flour 2kg', stock: 40, minStock: 12, price: 9000, cost: 7500 },
    ],
    sales: [
      { id: 1, date: daysAgo(6), customer: 'Peter Okello', amount: 120000, status: 'Paid' },
      { id: 2, date: daysAgo(5), customer: 'Sarah Nakato', amount: 95000, status: 'Paid' },
      { id: 3, date: daysAgo(4), customer: 'Walk-in', amount: 60000, status: 'Paid' },
      { id: 4, date: daysAgo(3), customer: 'Amina Hassan', amount: 230000, status: 'Credit' },
      { id: 5, date: daysAgo(2), customer: 'David Mugisha', amount: 150000, status: 'Paid' },
      { id: 6, date: daysAgo(1), customer: 'Walk-in', amount: 85000, status: 'Paid' },
      { id: 7, date: daysAgo(0), customer: 'Sarah Nakato', amount: 175000, status: 'Paid' },
      { id: 8, date: daysAgo(0), customer: 'Walk-in', amount: 64000, status: 'Credit' },
    ],
    expenses: [
      { id: 1, date: daysAgo(4), category: 'Transport', amount: 30000, note: 'Delivery fuel' },
      { id: 2, date: daysAgo(2), category: 'Electricity', amount: 85000, note: 'Yaka top-up' },
      { id: 3, date: daysAgo(0), category: 'Repairs', amount: 40000, note: 'Shelf repair' },
    ],
  };
}

export function DataProvider({ children }) {
  const [data] = useState(() => {
    let d = read(KEY, null);
    if (!d) { d = seed(); localStorage.setItem(KEY, JSON.stringify(d)); }
    return d;
  });
  return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
}
export const useData = () => useContext(DataContext);