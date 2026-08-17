import { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext(null);
const KEY = 'avad_data_v2';
const read = (k, f) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? f; } catch { return f; } };
const daysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };
const today = () => new Date().toISOString().slice(0, 10);
const methodAcc = m => (m === 'Cash' ? '1000' : m === 'Mobile Money' ? '1010' : '1020');

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
    receipts: [], supplierPayments: [], movements: [], quotations: [], deliveryNotes: [],
    accounts: [
      { code: '1000', name: 'Cash', type: 'Asset', bank: true },
      { code: '1010', name: 'Mobile Money', type: 'Asset', bank: true },
      { code: '1020', name: 'Bank Account', type: 'Asset', bank: true },
      { code: '1100', name: 'Customer Debtors (Receivable)', type: 'Asset' },
      { code: '1200', name: 'Inventory', type: 'Asset' },
      { code: '2000', name: 'Supplier Creditors (Payable)', type: 'Liability' },
      { code: '3000', name: "Owner's Capital", type: 'Equity' },
      { code: '4000', name: 'Sales Revenue', type: 'Income' },
      { code: '6000', name: 'Operating Expenses', type: 'Expense' },
    ],
    journal: [],
    deals: [
      { id: 1, customer: 'David Mugisha', stage: 'Contacted', value: 400000, note: 'Wants monthly rice supply', date: daysAgo(3), updatedAt: daysAgo(1) },
      { id: 2, customer: 'Amina Hassan', stage: 'Quotation Sent', value: 250000, note: 'Quoted for cooking oil', date: daysAgo(2), updatedAt: daysAgo(0) },
    ],
    followups: [
      { id: 1, customer: 'Sarah Nakato', dueDate: daysAgo(1), note: 'Call about outstanding balance', done: false },
      { id: 2, customer: 'Peter Okello', dueDate: daysAgo(-2), note: 'Thank-you message after purchase', done: false },
    ],
    feedbacks: [
      { id: 1, customer: 'Peter Okello', rating: 5, comment: 'Fast service!', date: daysAgo(4) },
    ],
    campaigns: [
      { id: 1, name: 'Back-to-School Promo', channel: 'WhatsApp', budget: 100000, spent: 40000, status: 'Running', startDate: daysAgo(5) },
      { id: 2, name: 'Christmas Hamper Flyers', channel: 'Flyers', budget: 150000, spent: 150000, status: 'Done', startDate: daysAgo(30) },
    ],
    posts: [
      { id: 1, title: 'New rice stock arrived!', platform: 'WhatsApp Status', date: daysAgo(1), status: 'Posted' },
      { id: 2, title: 'Weekend sugar discount', platform: 'Facebook', date: daysAgo(-2), status: 'Planned' },
    ],
    employees: [
      { id: 1, name: 'Mary Atim', phone: '0701111222', role: 'Cashier', salary: 400000, active: true, joinDate: daysAgo(90) },
      { id: 2, name: 'John Bosco', phone: '0782333444', role: 'Sales', salary: 350000, active: true, joinDate: daysAgo(60) },
    ],
    attendance: [
      { id: 1, date: daysAgo(1), employeeId: 1, status: 'Present' },
      { id: 2, date: daysAgo(1), employeeId: 2, status: 'Half' },
      { id: 3, date: daysAgo(0), employeeId: 1, status: 'Present' },
    ],
    leaves: [
      { id: 1, employeeId: 2, fromDate: daysAgo(-3), toDate: daysAgo(-4), reason: 'Family event', status: 'Pending' },
    ],
    payrolls: [],
  };
}

export function DataProvider({ children }) {
  const [data, setData] = useState(() => {
    const seeded = seed();
    const saved = read(KEY, null);
    if (!saved) { localStorage.setItem(KEY, JSON.stringify(seeded)); return seeded; }
    return { ...seeded, ...saved };
  });
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(data)); }, [data]);

  function addCustomer(c) { setData(prev => ({ ...prev, customers: [...prev.customers, { ...c, id: Date.now(), balance: 0 }] })); }
  function addSupplier(s) { setData(prev => ({ ...prev, suppliers: [...prev.suppliers, { ...s, id: Date.now(), balance: 0 }] })); }
  function addSupplierPayment({ supplierId, amount, method }) {
    setData(prev => {
      const sup = prev.suppliers.find(s => s.id === supplierId);
      if (!sup) return prev;
      return {
        ...prev,
        suppliers: prev.suppliers.map(s => s.id === supplierId ? { ...s, balance: Math.max((s.balance || 0) - amount, 0) } : s),
        supplierPayments: [...(prev.supplierPayments || []), { id: Date.now(), number: 'PAY-' + String((prev.supplierPayments || []).length + 1).padStart(4, '0'), date: today(), supplier: sup.name, amount, method }],
        journal: [...(prev.journal || []), { id: Date.now() + 1, date: today(), ref: 'PAY', memo: 'Payment to ' + sup.name, lines: [{ account: '2000', debit: amount, credit: 0 }, { account: methodAcc(method), debit: 0, credit: amount }] }],
      };
    });
  }
  function addProduct(p) {
    setData(prev => {
      const movement = (Number(p.stock) || 0) > 0 ? [{ id: Date.now() + 1, date: today(), product: p.name, change: Number(p.stock), reason: 'Opening stock' }] : [];
      return { ...prev, products: [...prev.products, { ...p, id: Date.now() }], movements: [...(prev.movements || []), ...movement] };
    });
  }
  function setProductActive(productId, active) { setData(prev => ({ ...prev, products: prev.products.map(p => p.id === productId ? { ...p, active } : p) })); }
  function adjustStock({ productId, change, reason }) {
    setData(prev => {
      const prod = prev.products.find(p => p.id === productId);
      if (!prod) return prev;
      const newStock = Math.max(prod.stock + change, 0);
      const realChange = newStock - prod.stock;
      if (realChange === 0) return prev;
      return { ...prev, products: prev.products.map(p => p.id === productId ? { ...p, stock: newStock } : p), movements: [...(prev.movements || []), { id: Date.now(), date: today(), product: prod.name, change: realChange, reason }] };
    });
  }
  function addPurchase({ supplierId, supplierName, items, total, paid, method }) {
    setData(prev => {
      const products = prev.products.map(p => { const line = items.find(i => i.productId === p.id); return line ? { ...p, stock: p.stock + line.qty, cost: line.cost } : p; });
      const owed = Math.max(total - paid, 0);
      const newMoves = items.map((line, idx) => ({ id: Date.now() + 2 + idx, date: today(), product: line.name, change: line.qty, reason: 'Purchase from ' + supplierName }));
      let supplierPayments = prev.supplierPayments || [];
      if (paid > 0) supplierPayments = [...supplierPayments, { id: Date.now() + 1, number: 'PAY-' + String(supplierPayments.length + 1).padStart(4, '0'), date: today(), supplier: supplierName, amount: paid, method }];
      const lines = [{ account: '1200', debit: total, credit: 0 }];
      if (paid > 0) lines.push({ account: methodAcc(method), debit: 0, credit: paid });
      if (owed > 0) lines.push({ account: '2000', debit: 0, credit: owed });
      return {
        ...prev, products, supplierPayments,
        suppliers: prev.suppliers.map(s => s.id === supplierId ? { ...s, balance: (s.balance || 0) + owed } : s),
        purchases: [...(prev.purchases || []), { id: Date.now(), date: today(), supplier: supplierName, amount: total, paid, method, status: paid >= total ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid', items }],
        movements: [...(prev.movements || []), ...newMoves],
        journal: [...(prev.journal || []), { id: Date.now() + 3, date: today(), ref: 'PUR', memo: 'Purchase from ' + supplierName, lines }],
      };
    });
  }
  function addExpense(e) {
    setData(prev => ({
      ...prev,
      expenses: [...prev.expenses, { id: Date.now(), date: today(), category: e.category, amount: Number(e.amount), note: e.note, method: e.method }],
      journal: [...(prev.journal || []), { id: Date.now() + 1, date: today(), ref: 'EXP', memo: e.category + ' – ' + e.note, lines: [{ account: '6000', debit: Number(e.amount), credit: 0 }, { account: methodAcc(e.method), debit: 0, credit: Number(e.amount) }] }],
    }));
  }
  function addSale({ customerId, customerName, items, total, paid, method, dueDate }) {
    setData(prev => {
      const products = prev.products.map(p => { const line = items.find(i => i.productId === p.id); return line ? { ...p, stock: p.stock - line.qty } : p; });
      const owed = Math.max(total - paid, 0);
      const sale = { id: Date.now(), number: 'INV-' + String((prev.sales || []).length + 1).padStart(4, '0'), date: today(), dueDate, customer: customerName, amount: total, paid, method, status: paid >= total ? 'Paid' : paid > 0 ? 'Partial' : 'Credit', items };
      let receipts = prev.receipts || [];
      if (paid > 0) receipts = [...receipts, { id: Date.now() + 1, number: 'RCP-' + String(receipts.length + 1).padStart(4, '0'), date: sale.date, customer: customerName, amount: paid, method, items }];
      const lines = [];
      if (paid > 0) lines.push({ account: methodAcc(method), debit: paid, credit: 0 });
      if (owed > 0) lines.push({ account: '1100', debit: owed, credit: 0 });
      lines.push({ account: '4000', debit: 0, credit: total });
      return { ...prev, products, receipts, customers: prev.customers.map(c => c.id === customerId ? { ...c, balance: (c.balance || 0) + owed } : c), sales: [...prev.sales, sale], journal: [...(prev.journal || []), { id: Date.now() + 2, date: today(), ref: sale.number, memo: 'Sale to ' + customerName, lines }] };
    });
  }
  function addPayment({ customerId, amount, method }) {
    setData(prev => {
      const customer = prev.customers.find(c => c.id === customerId);
      if (!customer) return prev;
      return {
        ...prev,
        customers: prev.customers.map(c => c.id === customerId ? { ...c, balance: Math.max((c.balance || 0) - amount, 0) } : c),
        receipts: [...(prev.receipts || []), { id: Date.now(), number: 'RCP-' + String((prev.receipts || []).length + 1).padStart(4, '0'), date: today(), customer: customer.name, amount, method }],
        journal: [...(prev.journal || []), { id: Date.now() + 1, date: today(), ref: 'RCP', memo: 'Payment from ' + customer.name, lines: [{ account: methodAcc(method), debit: amount, credit: 0 }, { account: '1100', debit: 0, credit: amount }] }],
      };
    });
  }
  function updateSale(id, patch) { setData(prev => ({ ...prev, sales: prev.sales.map(s => s.id === id ? { ...s, ...patch } : s) })); }
  function recordSalePayment({ saleId, amount, method }) {
    setData(prev => {
      const sale = prev.sales.find(s => s.id === saleId);
      if (!sale) return prev;
      const newPaid = Math.min((sale.paid || 0) + amount, sale.amount);
      const cust = prev.customers.find(c => c.name === sale.customer);
      return {
        ...prev,
        sales: prev.sales.map(s => s.id === saleId ? { ...s, paid: newPaid, status: newPaid >= s.amount ? 'Paid' : 'Partial' } : s),
        customers: cust ? prev.customers.map(c => c.id === cust.id ? { ...c, balance: Math.max((c.balance || 0) - amount, 0) } : c) : prev.customers,
        receipts: [...(prev.receipts || []), { id: Date.now(), number: 'RCP-' + String((prev.receipts || []).length + 1).padStart(4, '0'), date: today(), customer: sale.customer, amount, method, items: sale.items || [] }],
        journal: [...(prev.journal || []), { id: Date.now() + 1, date: today(), ref: sale.number || 'RCP', memo: 'Payment from ' + sale.customer, lines: [{ account: methodAcc(method), debit: amount, credit: 0 }, { account: '1100', debit: 0, credit: amount }] }],
      };
    });
  }
  function addQuotation(q) { setData(prev => ({ ...prev, quotations: [...(prev.quotations || []), { id: Date.now(), number: 'QUO-' + String((prev.quotations || []).length + 1).padStart(4, '0'), date: today(), validUntil: q.validUntil, customerId: q.customerId, customer: q.customerName, items: q.items, total: q.total, status: 'Draft' }] })); }
  function updateQuotation(id, patch) { setData(prev => ({ ...prev, quotations: (prev.quotations || []).map(q => q.id === id ? { ...q, ...patch } : q) })); }
  function convertQuotation(id) {
    setData(prev => {
      const q = (prev.quotations || []).find(x => x.id === id);
      if (!q || q.status === 'Converted') return prev;
      const products = prev.products.map(p => { const line = q.items.find(i => i.productId === p.id); return line ? { ...p, stock: Math.max(p.stock - line.qty, 0) } : p; });
      const cust = prev.customers.find(c => c.id === q.customerId);
      const dd = new Date(); dd.setDate(dd.getDate() + 7);
      const sale = { id: Date.now(), number: 'INV-' + String(prev.sales.length + 1).padStart(4, '0'), date: today(), dueDate: dd.toISOString().slice(0, 10), customer: q.customer, amount: q.total, paid: 0, method: 'Credit', status: 'Credit', items: q.items, fromQuotation: q.number };
      return {
        ...prev, products, sales: [...prev.sales, sale],
        customers: cust ? prev.customers.map(c => c.id === cust.id ? { ...c, balance: (c.balance || 0) + q.total } : c) : prev.customers,
        quotations: prev.quotations.map(x => x.id === id ? { ...x, status: 'Converted' } : x),
        journal: [...(prev.journal || []), { id: Date.now() + 1, date: today(), ref: sale.number, memo: 'Sale to ' + q.customer + ' (from ' + q.number + ')', lines: [{ account: '1100', debit: q.total, credit: 0 }, { account: '4000', debit: 0, credit: q.total }] }],
      };
    });
  }
  function addDeliveryNote(d) { setData(prev => ({ ...prev, deliveryNotes: [...(prev.deliveryNotes || []), { id: Date.now(), number: 'DN-' + String((prev.deliveryNotes || []).length + 1).padStart(4, '0'), date: today(), customer: d.customerName, items: d.items, deliveredBy: d.deliveredBy, status: 'Pending' }] })); }
  function updateDeliveryNote(id, patch) { setData(prev => ({ ...prev, deliveryNotes: (prev.deliveryNotes || []).map(d => d.id === id ? { ...d, ...patch } : d) })); }
  function addAccount(a) { setData(prev => ({ ...prev, accounts: [...(prev.accounts || []), a] })); }
  function addJournal({ memo, debitAccount, creditAccount, amount, ref }) {
    setData(prev => {
      const amt = Number(amount);
      if (!amt || amt <= 0 || debitAccount === creditAccount) return prev;
      return { ...prev, journal: [...(prev.journal || []), { id: Date.now(), date: today(), ref: ref || 'MANUAL', memo: memo || '', lines: [{ account: debitAccount, debit: amt, credit: 0 }, { account: creditAccount, debit: 0, credit: amt }] }] };
    });
  }
  function addDeal(d) { setData(prev => ({ ...prev, deals: [...(prev.deals || []), { ...d, id: Date.now(), date: today(), updatedAt: today() }] })); }
  function updateDeal(id, patch) { setData(prev => ({ ...prev, deals: (prev.deals || []).map(x => x.id === id ? { ...x, ...patch, updatedAt: today() } : x) })); }
  function addFollowup(f) { setData(prev => ({ ...prev, followups: [...(prev.followups || []), { ...f, id: Date.now(), done: false }] })); }
  function updateFollowup(id, patch) { setData(prev => ({ ...prev, followups: (prev.followups || []).map(x => x.id === id ? { ...x, ...patch } : x) })); }
  function addFeedback(f) { setData(prev => ({ ...prev, feedbacks: [...(prev.feedbacks || []), { ...f, id: Date.now(), date: today() }] })); }
  function addCampaign(c) { setData(prev => ({ ...prev, campaigns: [...(prev.campaigns || []), { ...c, id: Date.now(), status: 'Planned' }] })); }
  function updateCampaign(id, patch) { setData(prev => ({ ...prev, campaigns: (prev.campaigns || []).map(x => x.id === id ? { ...x, ...patch } : x) })); }
  function addPost(p) { setData(prev => ({ ...prev, posts: [...(prev.posts || []), { ...p, id: Date.now(), status: 'Planned' }] })); }
  function updatePost(id, patch) { setData(prev => ({ ...prev, posts: (prev.posts || []).map(x => x.id === id ? { ...x, ...patch } : x) })); }
  function addEmployee(e) { setData(prev => ({ ...prev, employees: [...(prev.employees || []), { ...e, id: Date.now(), active: true, joinDate: today() }] })); }
  function updateEmployee(id, patch) { setData(prev => ({ ...prev, employees: prev.employees.map(x => x.id === id ? { ...x, ...patch } : x) })); }
  function markAttendance({ date, employeeId, status }) {
    setData(prev => {
      const existing = (prev.attendance || []).find(a => a.date === date && a.employeeId === employeeId);
      if (existing) return { ...prev, attendance: prev.attendance.map(a => a.id === existing.id ? { ...a, status } : a) };
      return { ...prev, attendance: [...(prev.attendance || []), { id: Date.now(), date, employeeId, status }] };
    });
  }
  function addLeave(l) { setData(prev => ({ ...prev, leaves: [...(prev.leaves || []), { ...l, id: Date.now(), status: 'Pending' }] })); }
  function updateLeave(id, patch) { setData(prev => ({ ...prev, leaves: (prev.leaves || []).map(x => x.id === id ? { ...x, ...patch } : x) })); }
  function generatePayroll(month) {
    setData(prev => {
      const existing = (prev.payrolls || []).filter(p => p.month === month).map(p => p.employeeId);
      const active = prev.employees.filter(e => e.active !== false && !existing.includes(e.id));
      const newRecords = active.map((emp, i) => {
        const days = (prev.attendance || []).filter(a => a.employeeId === emp.id && a.date.startsWith(month));
        const absent = days.filter(a => a.status === 'Absent').length;
        const half = days.filter(a => a.status === 'Half').length;
        const dailyRate = emp.salary / 30;
        const deductions = Math.round(dailyRate * (absent + half * 0.5));
        return { id: Date.now() + i, month, employeeId: emp.id, base: emp.salary, deductions, net: Math.max(emp.salary - deductions, 0), status: 'Calculated', date: null };
      });
      return { ...prev, payrolls: [...(prev.payrolls || []), ...newRecords] };
    });
  }
  function payPayroll({ id, method }) {
    setData(prev => {
      const pr = (prev.payrolls || []).find(x => x.id === id);
      if (!pr || pr.status === 'Paid') return prev;
      const emp = prev.employees.find(e => e.id === pr.employeeId);
      return {
        ...prev,
        payrolls: prev.payrolls.map(x => x.id === id ? { ...x, status: 'Paid', date: today(), method } : x),
        journal: [...(prev.journal || []), { id: Date.now(), date: today(), ref: 'PAYROLL', memo: 'Salary for ' + (emp ? emp.name : 'staff'), lines: [{ account: '6000', debit: pr.net, credit: 0 }, { account: methodAcc(method), debit: 0, credit: pr.net }] }],
      };
    });
  }

  return (
    <DataContext.Provider value={{
      ...data, addCustomer, addSupplier, addSupplierPayment, addProduct, setProductActive, adjustStock,
      addPurchase, addExpense, addSale, addPayment, updateSale, recordSalePayment,
      addQuotation, updateQuotation, convertQuotation, addDeliveryNote, updateDeliveryNote,
      addAccount, addJournal, addDeal, updateDeal, addFollowup, updateFollowup, addFeedback,
      addCampaign, updateCampaign, addPost, updatePost,
      addEmployee, updateEmployee, markAttendance, addLeave, updateLeave, generatePayroll, payPayroll,
    }}>
      {children}
    </DataContext.Provider>
  );
}
export const useData = () => useContext(DataContext);