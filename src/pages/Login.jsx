import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cleanPhoneInput } from '../utils/helpers';
import { cloudReady } from '../services/cloud';

export default function Login() {
  const { login, setupOwner, busy } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ ownerName: '', businessName: '', phone: '', pin: '', pin2: '' });
  const [error, setError] = useState('');
  const set = k => e => setForm({ ...form, [k]: e.target.value });

  function switchMode(m) { setMode(m); setError(''); }

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (mode === 'signup') {
      if (!form.ownerName.trim()) return setError('Please enter your full name.');
      if (!form.businessName.trim()) return setError('Please enter the business name.');
      if (form.phone.replace(/\D/g, '').length < 10) return setError('Please enter a valid phone number (10 digits).');
      if (!/^\d{4}$/.test(form.pin)) return setError('PIN must be exactly 4 digits.');
      if (form.pin !== form.pin2) return setError('PINs do not match.');
      await setupOwner({ ownerName: form.ownerName.trim(), businessName: form.businessName.trim(), phone: form.phone.trim(), pin: form.pin });
      nav('/');
    } else {
      if (form.phone.replace(/\D/g, '').length < 10) return setError('Please enter your phone number.');
      if (!/^\d{4}$/.test(form.pin)) return setError('PIN must be exactly 4 digits.');
      const ok = await login(form.phone.trim(), form.pin);
      if (!ok) setError('Phone number or PIN is not correct. Please try again.');
      else nav('/');
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <div className="login-logo">A</div>
        <div className="login-title">AVAD Systems</div>
        <div className="login-sub">
          {mode === 'signup' ? 'Create your business account to begin.' : 'Welcome back! Sign in to continue.'}
        </div>

        <div className="auth-tabs">
          <button type="button" className={'auth-tab' + (mode === 'login' ? ' active' : '')} onClick={() => switchMode('login')}>
            Log In
          </button>
          <button type="button" className={'auth-tab' + (mode === 'signup' ? ' active' : '')} onClick={() => switchMode('signup')}>
            Create Account
          </button>
        </div>

        {mode === 'signup' && (
          <>
            <label className="label">Your full name</label>
            <input className="input" value={form.ownerName} onChange={set('ownerName')} placeholder="e.g. Johnson Byaruhanga" />
            <label className="label">Business name</label>
            <input className="input" value={form.businessName} onChange={set('businessName')} placeholder="e.g. AVAD Traders" />
          </>
        )}

        <label className="label">Phone number</label>
        <input className="input" inputMode="numeric" value={form.phone}
          onChange={e => setForm({ ...form, phone: cleanPhoneInput(e.target.value) })} placeholder="e.g. 0772 000 000" />

        <label className="label">PIN (4 digits)</label>
        <input className="input" type="password" inputMode="numeric" maxLength={4} value={form.pin} onChange={set('pin')} placeholder="••••" />

        {mode === 'signup' && (
          <>
            <label className="label">Confirm PIN</label>
            <input className="input" type="password" inputMode="numeric" maxLength={4} value={form.pin2} onChange={set('pin2')} placeholder="••••" />
          </>
        )}

        {error && <div className="alert red">{error}</div>}

        <button className="btn btn-green btn-lg" style={{ width: '100%', marginTop: 16 }} type="submit" disabled={busy}>
          {busy ? 'Please wait…' : (mode === 'signup' ? 'Create my account' : 'Log In')}
        </button>

        <div className="hint">
          {cloudReady ? '☁️ AVAD Cloud connected — Think Different!!!' : '📴 Local mode — Think Different!!!'}
        </div>
      </form>
    </div>
  );
}