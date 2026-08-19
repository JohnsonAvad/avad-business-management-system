import { createContext, useContext, useState } from 'react';
import { supabase, cloudReady } from '../services/cloud';

const AuthContext = createContext(null);
const read = (k, f) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? f; } catch { return f; } };
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const emailOf = phone => String(phone).replace(/\D/g, '') + '@avad.app';
const passOf = pin => String(pin) + '00';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => read('avad_session', null));
  const [usersVersion, setUsersVersion] = useState(0);
  const [busy, setBusy] = useState(false);
  const hasOwner = read('avad_users', []).length > 0;

  const announce = () => window.dispatchEvent(new Event('avad-cloud-login'));

  async function setupOwner({ businessName, ownerName, phone, pin }) {
    const displayName = (ownerName || '').trim() || 'Owner';
    write('avad_users', [{ id: 1, name: displayName, phone, pin, role: 'Owner', active: true }]);
    write('avad_business', { name: businessName, ownerName: displayName, currency: 'UGX', type: 'Product' });
    const u = { name: displayName, phone, role: 'Owner' };
    write('avad_session', u);
    setUser(u);
    if (cloudReady) {
      setBusy(true);
      try {
        let { data, error } = await supabase.auth.signUp({
          email: emailOf(phone), password: passOf(pin),
          options: { data: { name: displayName, business: businessName } },
        });
        if (error && /already/i.test(error.message || '')) {
          const res = await supabase.auth.signInWithPassword({ email: emailOf(phone), password: passOf(pin) });
          data = res.data; error = res.error;
        }
        if (!error && data?.user) { localStorage.setItem('avad_business_id', data.user.id); announce(); }
      } catch { }
      setBusy(false);
    }
  }

  async function login(phone, pin) {
    const u = read('avad_users', []).find(x => x.phone === phone && x.pin === pin && x.active !== false);
    if (u) {
      const s = { name: u.name, phone: u.phone, role: u.role };
      write('avad_session', s);
      setUser(s);
      if (cloudReady) {
        setBusy(true);
        try {
          let { data, error } = await supabase.auth.signInWithPassword({ email: emailOf(phone), password: passOf(pin) });
          if (error && !data?.user) {
            const up = await supabase.auth.signUp({
              email: emailOf(phone), password: passOf(pin),
              options: { data: { name: u.name } },
            });
            data = up.data; error = up.error;
          }
          if (!error && data?.user) { localStorage.setItem('avad_business_id', data.user.id); announce(); }
        } catch { }
        setBusy(false);
      }
      return true;
    }
    if (cloudReady) {
      setBusy(true);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email: emailOf(phone), password: passOf(pin) });
        if (!error && data?.user) {
          localStorage.setItem('avad_business_id', data.user.id);
          const name = data.user.user_metadata?.name || 'Owner';
          write('avad_users', [{ id: 1, name, phone, pin, role: 'Owner', active: true }]);
          const s = { name, phone, role: 'Owner' };
          write('avad_session', s);
          setUser(s);
          announce();
          setBusy(false);
          return true;
        }
      } catch { }
      setBusy(false);
    }
    return false;
  }

  function logout() {
    localStorage.removeItem('avad_session');
    setUser(null);
    if (cloudReady) supabase.auth.signOut().catch(() => { });
  }

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
    <AuthContext.Provider value={{ user, hasOwner, busy, usersVersion, setupOwner, login, logout, addUser, setUserActive, getUsers }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);