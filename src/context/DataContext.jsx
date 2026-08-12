import { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext(null);
const KEY = 'avad_data_v2';
const read = (k, f) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? f; } catch { return f; } };
const daysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };
const today = () => new Date().toISOString().slice(0, 10);

function seed() {
  return {
    customers: [
      { id: 1, name: 'Sarah Nakato', phone: '0772111222', balance: 150000 },
      { id: 2, name: 'Peter Okello', phone: '0701333444', balance: 0 },
      { id: 3, name: 'Amina Hassan', phone: '0759555666', balance: 80000 },
      { id: 4, name: 'David Mugisha', phone: '0782777888', balance: 0 },
    ],
    suppliers: [
      { id: 1, name: 'Mukwano Wholesale', phone: '0414222333', balance: 250000 },
      { id: 2, name: 'Jumbo Distributors', phone: '0772999888', balance: 0 },
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
    purchases: [
      { id: 1, date: daysAgo(5), supplier: 'Mukwano Wholesale', amount: 500000, paid: 250000, status: 'Partial' },
      { id: 2, date: daysAgo(2), supplier: 'Jumbo Distributors', amount: 180000, paid: 180000, status: 'Paid' },
    ],
    expenses: [
      { id: 1, date: daysAgo(4), category: 'Transport', amount: 30000, note: 'Delivery fuel', method: 'Cash' },
      { id: 2, date: daysAgo(2), category: 'Electricity', amount: 85000, note: 'Yaka top-up', method: 'Mobile Money' },
      { id: 3, date: daysAgo(0), category: 'Repairs', amount: 40000, note: 'Shelf repair', method: 'Cash' },
    ],
    receipts: [],
    supplierPayments: [],
    movements: [],
  };
}

export function DataProvider({ children }) {
    const [data, setData] = useState(() => {
    const seeded = seed();
    const saved = read(KEY, null);
    if (!saved) {
      localStorage.setItem(KEY, JSON.stringify(seeded));
      return seeded;
    }
    
    return { ...seeded, ...saved };
  });
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(data));
  }, [data]);

  function addCustomer(newCustomer) {
    setData(prev => ({
      ...prev,
      customers: [...prev.customers, { ...newCustomer, id: Date.now(), balance: 0 }]
    }));
  }

  function addSupplier(newSupplier) {
    setData(prev => ({
      ...prev,
      suppliers: [...prev.suppliers, { ...newSupplier, id: Date.now(), balance: 0 }]
    }));
  }

  function addSupplierPayment({ supplierId, amount, method }) {
    setData(prev => {
      const sup = prev.suppliers.find(s => s.id === supplierId);
      if (!sup) return prev;
      const suppliers = prev.suppliers.map(s =>
        s.id === supplierId ? { ...s, balance: Math.max((s.balance || 0) - amount, 0) } : s
      );
      const supplierPayments = [...(prev.supplierPayments || []), {
        id: Date.now(),
        number: 'PAY-' + String((prev.supplierPayments || []).length + 1).padStart(4, '0'),
        date: today(),
        supplier: sup.name,
        amount,
        method,
      }];
      return { ...prev, suppliers, supplierPayments };
    });
  }

  function addProduct(p) {
    setData(prev => {
      const movement = (Number(p.stock) || 0) > 0 ? [{
        id: Date.now() + 1, date: today(), product: p.name, change: Number(p.stock), reason: 'Opening stock',
      }] : [];
      return {
        ...prev,
        products: [...prev.products, { ...p, id: Date.now() }],
        movements: [...(prev.movements || []), ...movement],
      };
    });
  }

  function setProductActive(productId, active) {
    setData(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === productId ? { ...p, active } : p),
    }));
  }

  function adjustStock({ productId, change, reason }) {
    setData(prev => {
      const prod = prev.products.find(p => p.id === productId);
      if (!prod) return prev;
      const newStock = Math.max(prod.stock + change, 0);
      const realChange = newStock - prod.stock;
      if (realChange === 0) return prev;
      return {
        ...prev,
        products: prev.products.map(p => p.id === productId ? { ...p, stock: newStock } : p),
        movements: [...(prev.movements || []), { id: Date.now(), date: today(), product: prod.name, change: realChange, reason }],
      };
    });
  }

  function addExpense({ amount, category, note, method }) {
    setData(prev => ({
      ...prev,
      expenses: [...prev.expenses, { id: Date.now(), date: today(), category, amount: Number(amount), note, method }],
    }));
  }

  function addSale({ customerId, customerName, items, total, paid, method }) {
    setData(prev => {
      const products = prev.products.map(p => {
        const line = items.find(i => i.productId === p.id);
        return line ? { ...p, stock: p.stock - line.qty } : p;
      });
      const owed = Math.max(total - paid, 0);
      const customers = prev.customers.map(c =>
        c.id === customerId ? { ...c, balance: (c.balance || 0) + owed } : c
      );
      const sale = {
        id: Date.now(),
        date: today(),
        customer: customerName,
        amount: total,
        paid,
        method,
        status: paid >= total ? 'Paid' : paid > 0 ? 'Partial' : 'Credit',
        items,
      };
      let receipts = prev.receipts || [];
      if (paid > 0) {
        receipts = [...receipts, {
          id: Date.now() + 1,
          number: 'RCP-' + String(receipts.length + 1).padStart(4, '0'),
          date: sale.date,
          customer: customerName,
          amount: paid,
          method,
        }];
      }
      return { ...prev, products, customers, sales: [...prev.sales, sale], receipts };
    });
  }

  function addPayment({ customerId, amount, method }) {
    setData(prev => {
      const customer = prev.customers.find(c => c.id === customerId);
      if (!customer) return prev;
      const customers = prev.customers.map(c =>
        c.id === customerId ? { ...c, balance: Math.max((c.balance || 0) - amount, 0) } : c
      );
      const receipts = [...(prev.receipts || []), {
        id: Date.now(),
        number: 'RCP-' + String((prev.receipts || []).length + 1).padStart(4, '0'),
        date: today(),
        customer: customer.name,
        amount,
        method,
      }];
      return { ...prev, customers, receipts };
    });
  }

  return (
    <DataContext.Provider value={{
      ...data, addCustomer, addSupplier, addSupplierPayment, addProduct,
      setProductActive, adjustStock, addExpense, addSale, addPayment,
    }}>
      {children}
    </DataContext.Provider>
  );
}
export const useData = () => useContext(DataContext);