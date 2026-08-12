import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);
const read = (k, f) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? f; } catch { return f; } };
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => read('avad_session', null));
  const hasOwner = read('avad_users', []).length > 0;

  function setupOwner({ businessName, phone, pin }) {
    write('avad_users', [{ id: 1, name: 'Owner', phone, pin, role: 'Owner' }]);
    write('avad_business', { name: businessName, currency: 'UGX' });
    const u = { name: 'Owner', phone, role: 'Owner' };
    write('avad_session', u);
    setUser(u);
  }

  function login(phone, pin) {
    const u = read('avad_users', []).find(x => x.phone === phone && x.pin === pin);
    if (!u) return false;
    const s = { name: u.name, phone: u.phone, role: u.role };
    write('avad_session', s);
    setUser(s);
    return true;
  }

  function logout() { localStorage.removeItem('avad_session'); setUser(null); }

  return <AuthContext.Provider value={{ user, hasOwner, setupOwner, login, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);