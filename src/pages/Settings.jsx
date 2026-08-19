import { useState } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { isValidPhone, cleanPhoneInput } from '../utils/helpers';

const ROLES = ['Manager', 'Sales', 'Cashier', 'Accountant', 'Storekeeper'];

export default function Settings() {
  const { currency, setCurrency } = useCurrency();
  const { user, getUsers, addUser, setUserActive, usersVersion } = useAuth();
  const [business, setBusiness] = useState(() => JSON.parse(localStorage.getItem('avad_business') || '{}'));
  const [msg, setMsg] = useState('');
  const [uForm, setUForm] = useState({ name: '', phone: '', pin: '', role: 'Sales' });
  const [uError, setUError] = useState('');
  const users = getUsers();
  void usersVersion;

  const flash = t => { setMsg(t); setTimeout(() => setMsg(''), 2500); };

  function onLogoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBusiness(b => ({ ...b, logo: reader.result }));
    reader.readAsDataURL(file);
  }

  function save(e) {
    e.preventDefault();
    localStorage.setItem('avad_business', JSON.stringify(business));
    flash('Settings saved!');
  }

  function saveUser(e) {
    e.preventDefault();
    setUError('');
    if (!uForm.name.trim()) return setUError('Please enter the user name.');
    if (!isValidPhone(uForm.phone)) return setUError('Please enter a valid phone number (10 digits).');
    if (!/^\d{4}$/.test(uForm.pin)) return setUError('PIN must be exactly 4 digits.');
    const err = addUser({ name: uForm.name.trim(), phone: uForm.phone.trim(), pin: uForm.pin, role: uForm.role });
    if (err) return setUError(err);
    setUForm({ name: '', phone: '', pin: '', role: 'Sales' });
    flash('User added! They can now log in with their phone and PIN.');
  }

  function downloadBackup() {
    const backup = {
      business: JSON.parse(localStorage.getItem('avad_business') || '{}'),
      users: JSON.parse(localStorage.getItem('avad_users') || '[]'),
      data: JSON.parse(localStorage.getItem('avad_data_v2') || 'null'),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'avad-backup-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
    flash('Backup downloaded. Keep it somewhere safe!');
  }

  function restoreBackup(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const b = JSON.parse(reader.result);
        if (b.business) localStorage.setItem('avad_business', JSON.stringify(b.business));
        if (b.users) localStorage.setItem('avad_users', JSON.stringify(b.users));
        if (b.data) localStorage.setItem('avad_data_v2', JSON.stringify(b.data));
        setMsg('Backup restored! Reloading...');
        setTimeout(() => window.location.reload(), 1200);
      } catch {
        setMsg('That file is not a valid AVAD backup.');
      }
    };
    reader.readAsText(file);
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <div className="page-sub">Business profile, staff, and safety.</div>
        </div>
      </div>

      {msg && <div className="alert green" style={{ marginBottom: 14 }}>{msg}</div>}

      <form className="panel" style={{ maxWidth: 620, marginBottom: 18 }} onSubmit={save}>
        <div className="panel-title">Business Profile (printed on documents)</div>
        <div className="form-group">
          <label>Your name (used in greetings)</label>
          <input className="input" value={business.ownerName || ''} placeholder="e.g. Johnson Byaruhanga"
            onChange={e => setBusiness({ ...business, ownerName: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Business name</label>
          <input className="input" value={business.name || ''} placeholder="e.g. AVAD Traders"
            onChange={e => setBusiness({ ...business, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Business type</label>
          <select className="input" value={business.type || 'Product'} onChange={e => setBusiness({ ...business, type: e.target.value })}>
            <option value="Product">Products (shop / retail)</option>
            <option value="Service">Services (salon, garage, consulting…)</option>
            <option value="Both">Both products & services</option>
          </select>
        </div>

        <div className="form-group">
          <label>Phone number</label>
          <input className="input" value={business.phone || ''} placeholder="e.g. 0772 000 000"
            onChange={e => setBusiness({ ...business, phone: cleanPhoneInput(e.target.value) })} />
        </div>
        <div className="form-group">
          <label>Address</label>
          <input className="input" value={business.address || ''} placeholder="e.g. Shop 12, Kampala Road"
            onChange={e => setBusiness({ ...business, address: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Footer message on invoices & receipts</label>
          <input className="input" value={business.footer || ''} placeholder="e.g. Thank you for your business!"
            onChange={e => setBusiness({ ...business, footer: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Warranty / guarantee note (printed on invoices)</label>
          <input className="input" value={business.warranty || ''} placeholder="e.g. Goods are warranted for 7 days with this receipt."
            onChange={e => setBusiness({ ...business, warranty: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Logo</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {business.logo ? (
              <img src={business.logo} alt="logo"
                style={{ width: 56, height: 56, objectFit: 'contain', border: '1px solid var(--border)', borderRadius: 10, background: '#fff' }} />
            ) : (
              <div className="brand-logo">A</div>
            )}
            <input type="file" accept="image/*" onChange={onLogoChange} />
          </div>
          {business.logo && (
            <button type="button" className="btn btn-outline" style={{ marginTop: 8, padding: '6px 12px', fontSize: 13 }}
              onClick={() => setBusiness(b => ({ ...b, logo: null }))}>
              Remove logo
            </button>
          )}
        </div>
        <div className="form-group">
          <label>Owner signature (printed on receipts)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {business.ownerSignature ? (
              <img src={business.ownerSignature} alt="signature" style={{ height: 48, background: '#fff', border: '1px solid var(--border)', borderRadius: 10 }} />
            ) : (
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>No signature yet</span>
            )}
            <input type="file" accept="image/*" onChange={e => {
              const file = e.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => setBusiness(b => ({ ...b, ownerSignature: reader.result }));
              reader.readAsDataURL(file);
            }} />
          </div>
          {business.ownerSignature && (
            <button type="button" className="btn btn-outline" style={{ marginTop: 8, padding: '6px 12px', fontSize: 13 }}
              onClick={() => setBusiness(b => ({ ...b, ownerSignature: null }))}>
              Remove signature
            </button>
          )}
        </div>
        <div className="form-group">
          <label>Default currency</label>
          <select className="input" value={currency} onChange={e => setCurrency(e.target.value)}>
            <option value="UGX">UGX</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <button className="btn btn-green btn-lg" style={{ width: '100%' }} type="submit">Save Settings</button>
      </form>

      <div className="panel" style={{ maxWidth: 620, marginBottom: 18 }}>
        <div className="panel-title">Staff Users & Roles</div>
        <table className="table">
          <thead><tr><th>Name</th><th>Phone</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.phone}>
                <td style={{ fontWeight: 700 }}>{u.name}</td>
                <td>{u.phone}</td>
                <td><span className="badge blue">{u.role}</span></td>
                <td><span className={'badge ' + (u.active !== false ? 'green' : 'red')}>{u.active !== false ? 'Active' : 'Disabled'}</span></td>
                <td>
                  {u.phone !== user.phone && (
                    <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 13 }}
                      onClick={() => setUserActive(u.phone, u.active === false)}>
                      {u.active !== false ? 'Disable' : 'Enable'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <form onSubmit={saveUser} style={{ marginTop: 16 }}>
          <div className="panel-title" style={{ fontSize: 14 }}>Add Staff User</div>
          <div className="form-group">
            <label>Name</label>
            <input className="input" value={uForm.name} placeholder="e.g. Mary the Cashier"
              onChange={e => setUForm({ ...uForm, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Phone (their login)</label>
            <input className="input" value={uForm.phone} placeholder="e.g. 0701 000 000"
              onChange={e => setUForm({ ...uForm, phone: cleanPhoneInput(e.target.value) })} />
          </div>
          <div className="form-group">
            <label>Their PIN (4 digits)</label>
            <input className="input" type="password" inputMode="numeric" maxLength={4} value={uForm.pin}
              onChange={e => setUForm({ ...uForm, pin: e.target.value.replace(/\D/g, '') })} />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select className="input" value={uForm.role} onChange={e => setUForm({ ...uForm, role: e.target.value })}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          {uError && <div className="alert red" style={{ marginTop: 0 }}>{uError}</div>}
          <button className="btn btn-green" style={{ width: '100%' }} type="submit">Add User</button>
        </form>
      </div>

      <div className="panel" style={{ maxWidth: 620 }}>
        <div className="panel-title">Backup & Restore (your safety net)</div>
        <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 14px' }}>
          Download a backup file regularly and keep it on a flash drive or WhatsApp chat.
          If a phone is lost or breaks, restore everything on a new phone in seconds.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-blue" onClick={downloadBackup}>Download Backup</button>
          <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
            Restore from File
            <input type="file" accept="application/json" style={{ display: 'none' }} onChange={restoreBackup} />
          </label>
        </div>
      </div>
    </>
  );
}