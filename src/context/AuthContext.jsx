import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);
const read = (k, f) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? f; } catch { return f; } };
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => read('avad_session', null));
  const [usersVersion, setUsersVersion] = useState(0);
  const hasOwner = read('avad_users', []).length > 0;

  function setupOwner({ businessName, ownerName, phone, pin }) {
    const displayName = (ownerName || '').trim() || 'Owner';
    write('avad_users', [{ id: 1, name: displayName, phone, pin, role: 'Owner', active: true }]);
    write('avad_business', { name: businessName, ownerName: displayName, currency: 'UGX' });
    const u = { name: displayName, phone, role: 'Owner' };

    function login(phone, pin) {
      const u = read('avad_users', []).find(x => x.phone === phone && x.pin === pin && x.active !== false);
      if (!u) return false;
      const s = { name: u.name, phone: u.phone, role: u.role };
      write('avad_session', s);
      setUser(s);
      return true;
    }

    function logout() { localStorage.removeItem('avad_session'); setUser(null); }

    function addUser({ name, phone, pin, role }) {
      const users = read('avad_users', []);
      if (users.some(x => x.phone === phone)) return 'A user with this phone already exists.';
      users.push({ id: Date.now(), name, phone, pin, role, active: true });
      write('avad_users', users);
      setUsersVersion(v => v + 1);
      return '';
    }

    function setUserActive(phone, active) {
      write('avad_users', read('avad_users', []).map(u => u.phone === phone ? { ...u, active } : u));
      setUsersVersion(v => v + 1);
    }

    const getUsers = () => read('avad_users', []);

    return (
      <AuthContext.Provider value={{ user, hasOwner, usersVersion, setupOwner, login, logout, addUser, setUserActive, getUsers }}>
        {children}
      </AuthContext.Provider>
    );
  }
  export const useAuth = () => useContext(AuthContext);