import { createContext, useContext, useState } from 'react';

const CurrencyContext = createContext(null);
const read = (k, f) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? f; } catch { return f; } };

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => read('avad_business', { currency: 'UGX' }).currency || 'UGX');

  function setCurrency(c) {
    const b = read('avad_business', {});
    b.currency = c;
    localStorage.setItem('avad_business', JSON.stringify(b));
    setCurrencyState(c);
  }

  function format(amount) {
    const n = Number(amount) || 0;
    if (currency === 'USD') return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return 'UGX ' + Math.round(n).toLocaleString('en-US');
  }

  return <CurrencyContext.Provider value={{ currency, setCurrency, format }}>{children}</CurrencyContext.Provider>;
}
export const useCurrency = () => useContext(CurrencyContext);