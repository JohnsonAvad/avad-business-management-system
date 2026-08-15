import { useState } from 'react';
import { useCurrency } from '../context/CurrencyContext';

export default function Settings() {
  const { currency, setCurrency } = useCurrency();
  const [business, setBusiness] = useState(() => JSON.parse(localStorage.getItem('avad_business') || '{}'));
  const [saved, setSaved] = useState('');

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
    setSaved('Settings saved!');
    setTimeout(() => setSaved(''), 2500);
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <div className="page-sub">Your business profile and documents.</div>
        </div>
      </div>

      <form className="panel" style={{ maxWidth: 560 }} onSubmit={save}>
        <div className="panel-title">Business Profile</div>

        <div className="form-group">
          <label>Business name (printed on invoices & receipts)</label>
          <input className="input" value={business.name || ''} placeholder="e.g. AVAD Traders"
            onChange={e => setBusiness({ ...business, name: e.target.value })} />
        </div>

        <div className="form-group">
          <label>Business logo (printed on invoices & receipts)</label>
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
          <label>Default currency</label>
          <select className="input" value={currency} onChange={e => setCurrency(e.target.value)}>
            <option value="UGX">UGX</option>
            <option value="USD">USD</option>
          </select>
        </div>

        {saved && <div className="alert green" style={{ marginTop: 0 }}>{saved}</div>}

        <button className="btn btn-green btn-lg" style={{ width: '100%', marginTop: 16 }} type="submit">
          Save Settings
        </button>
      </form>
    </>
  );
}