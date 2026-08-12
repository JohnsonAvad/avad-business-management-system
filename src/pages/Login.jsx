import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cleanPhoneInput } from '../utils/helpers';

export default function Login() {
  const { hasOwner, login, setupOwner } = useAuth();
  const nav = useNavigate();
  const [mode] = useState(hasOwner ? 'login' : 'setup');
  const [form, setForm] = useState({ businessName: '', phone: '', pin: '', pin2: '' });
  const [error, setError] = useState('');
  const set = k => e => setForm({ ...form, [k]: e.target.value });

  function submit(e) {
    e.preventDefault();
    setError('');
    if (mode === 'setup') {
      if (!form.businessName.trim()) return setError('Please enter your business name.');
      if (form.phone.replace(/\D/g, '').length < 10) return setError('Please enter a valid phone number (10 digits).');
      if (!/^\d{4}$/.test(form.pin)) return setError('PIN must be exactly 4 digits.');
      if (form.pin !== form.pin2) return setError('PINs do not match.');
      setupOwner({ businessName: form.businessName.trim(), phone: form.phone.trim(), pin: form.pin });
      nav('/');
    } else {
      if (!login(form.phone.trim(), form.pin)) setError('Phone number or PIN is not correct. Please try again.');
      else nav('/');
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <div className="login-logo">A</div>
        <div className="login-title">AVAD Systems</div>
        <div className="login-sub">
          {mode === 'setup' ? 'Set up your business to begin.' : 'Sign in with your phone number and PIN.'}
        </div>

        {mode === 'setup' && (
          <>
            <label className="label">Business name</label>
            <input className="input" value={form.businessName} onChange={set('businessName')} placeholder="e.g. AVAD Traders" />
          </>
        )}

        <label className="label">Phone number</label>
        <input className="input" inputMode="numeric" value={form.phone} onChange={e => setForm({ ...form, phone: cleanPhoneInput(e.target.value) })} placeholder="e.g. 0772 000 000" />

        <label className="label">PIN (4 digits)</label>
        <input className="input" type="password" inputMode="numeric" maxLength={4} value={form.pin} onChange={set('pin')} placeholder="••••" />

        {mode === 'setup' && (
          <>
            <label className="label">Confirm PIN</label>
            <input className="input" type="password" inputMode="numeric" maxLength={4} value={form.pin2} onChange={set('pin2')} placeholder="••••" />
          </>
        )}

        {error && <div className="alert red">{error}</div>}

        <button className="btn btn-green btn-lg" style={{ width: '100%', marginTop: 16 }} type="submit">
          {mode === 'setup' ? 'Create my account' : 'Sign in'}
        </button>
        <div className="hint">Green. Blue. Simple. — AVAD Systems</div>
      </form>
    </div>
  );
}