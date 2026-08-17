import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useCurrency } from '../context/CurrencyContext';
import { saveMedia, getMedia } from '../utils/mediaStore';

const CHANNELS = ['WhatsApp', 'SMS', 'Facebook', 'Instagram', 'Radio', 'Flyers'];
const PLATFORMS = ['WhatsApp Status', 'Facebook', 'Instagram', 'SMS', 'Radio'];

export default function Marketing() {
  const { campaigns, posts, addCampaign, updateCampaign, addPost, updatePost } = useData();
  const { format } = useCurrency();
  const [tab, setTab] = useState('campaigns');
  const [modal, setModal] = useState(null);
  const [cForm, setCForm] = useState({ name: '', channel: CHANNELS[0], budget: '', startDate: '' });
  const [pForm, setPForm] = useState({ title: '', platform: PLATFORMS[0], date: '', mediaId: null, mediaType: null });
  const [error, setError] = useState('');
  const [viewMedia, setViewMedia] = useState(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const activeCampaigns = (campaigns || []).filter(c => c.status === 'Running').length;
  const spentTotal = (campaigns || []).reduce((a, c) => a + (c.spent || 0), 0);
  const plannedPosts = (posts || []).filter(p => p.status === 'Planned').length;
  const camBadge = st => ({ Planned: 'blue', Running: 'green', Done: 'grey' }[st] || 'grey');

  async function onMediaPick(e) {
    setError('');
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 200 * 1024 * 1024) return setError('That file is too large. Please use a smaller clip.');
    const id = 'm-' + Date.now();
    await saveMedia(id, file);
    setPForm(f => ({ ...f, mediaId: id, mediaType: file.type.startsWith('video') ? 'video' : 'image' }));
    e.target.value = '';
  }

  async function openViewer(p) {
    const blob = await getMedia(p.mediaId);
    if (!blob) return;
    setViewMedia({ type: p.mediaType, url: URL.createObjectURL(blob), title: p.title });
  }

  function saveCampaign(e) {
    e.preventDefault(); setError('');
    if (!cForm.name.trim()) return setError('Please give the campaign a name.');
    addCampaign({ name: cForm.name.trim(), channel: cForm.channel, budget: Number(cForm.budget) || 0, spent: 0, startDate: cForm.startDate || todayStr });
    setModal(null); setCForm({ name: '', channel: CHANNELS[0], budget: '', startDate: '' });
  }

  function savePost(e) {
    e.preventDefault(); setError('');
    if (!pForm.title.trim()) return setError('Please write the post title.');
    if (!pForm.date) return setError('Please pick a date.');
    addPost({ title: pForm.title.trim(), platform: pForm.platform, date: pForm.date, mediaId: pForm.mediaId, mediaType: pForm.mediaType });
    setModal(null); setPForm({ title: '', platform: PLATFORMS[0], date: '', mediaId: null, mediaType: null });
  }

  function logSpend(c) {
    const amt = Number(window.prompt('How much did you spend on ' + c.name + '?'));
    if (!amt || amt <= 0) return;
    updateCampaign(c.id, { spent: (c.spent || 0) + amt });
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Marketing</h1>
          <div className="page-sub">Promote your business and plan your content.</div>
        </div>
        <div className="pay-methods" style={{ margin: 0 }}>
          <button className={'pay-btn' + (tab === 'campaigns' ? ' selected' : '')} onClick={() => setTab('campaigns')}>Campaigns</button>
          <button className={'pay-btn' + (tab === 'planner' ? ' selected' : '')} onClick={() => setTab('planner')}>Content Planner</button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div><div className="stat-label">Running Campaigns</div><div className="stat-value green">{activeCampaigns}</div></div>
        </div>
        <div className="stat-card">
          <div><div className="stat-label">Total Marketing Spend</div><div className="stat-value red">{format(spentTotal)}</div></div>
        </div>
        <div className="stat-card">
          <div><div className="stat-label">Posts Waiting</div><div className="stat-value blue">{plannedPosts}</div></div>
        </div>
      </div>

      {tab === 'campaigns' && (
        <>
          <div className="page-header" style={{ marginBottom: 12 }}>
            <div />
            <button className="btn btn-green" onClick={() => { setError(''); setModal('campaign'); }}>+ New Campaign</button>
          </div>
          <div className="panel">
            {(campaigns || []).length === 0 ? <div className="empty-state">No campaigns yet.</div> : (
              <table className="table">
                <thead><tr><th>Campaign</th><th>Channel</th><th>Budget</th><th>Spent</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {(campaigns || []).map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 700 }}>{c.name}</td>
                      <td><span className="badge blue">{c.channel}</span></td>
                      <td>{format(c.budget)}</td>
                      <td style={{ color: c.spent > c.budget ? 'var(--red)' : 'inherit', fontWeight: 700 }}>{format(c.spent)}</td>
                      <td><span className={'badge ' + camBadge(c.status)}>{c.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {c.status === 'Planned' && <button className="btn btn-green" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => updateCampaign(c.id, { status: 'Running' })}>Start</button>}
                          {c.status === 'Running' && (
                            <>
                              <button className="btn btn-outline" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => logSpend(c)}>Log Spend</button>
                              <button className="btn btn-outline" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => updateCampaign(c.id, { status: 'Done' })}>Finish</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {tab === 'planner' && (
        <>
          <div className="page-header" style={{ marginBottom: 12 }}>
            <div />
            <button className="btn btn-green" onClick={() => { setError(''); setModal('post'); }}>+ Plan Post</button>
          </div>
          <div className="panel">
            {(posts || []).length === 0 ? <div className="empty-state">Nothing planned yet.</div> : (
              [...(posts || [])].sort((a, b) => a.date.localeCompare(b.date)).map(p => (
                <div key={p.id} className="cart-row">
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontWeight: 700 }}>{p.title}</div>
                    <div className="choice-sub">{p.platform} • {p.date}</div>
                  </div>
                  {p.mediaId && (
                    <button className="btn btn-blue" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => openViewer(p)}>
                      {p.mediaType === 'video' ? '▶ Video' : '🖼 Photo'}
                    </button>
                  )}
                  <span className={'badge ' + (p.status === 'Posted' ? 'green' : p.date < todayStr ? 'red' : 'blue')}>
                    {p.status === 'Posted' ? 'Posted' : p.date < todayStr ? 'Overdue' : 'Planned'}
                  </span>
                  {p.status === 'Planned' && (
                    <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => updatePost(p.id, { status: 'Posted' })}>
                      Mark Posted
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}

      {modal === 'campaign' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <form className="modal-card" onClick={e => e.stopPropagation()} onSubmit={saveCampaign}>
            <div className="modal-title">New Campaign</div>
            <div className="form-group">
              <label>Campaign name</label>
              <input className="input" placeholder="e.g. December Promo" value={cForm.name} onChange={e => setCForm({ ...cForm, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Channel</label>
              <select className="input" value={cForm.channel} onChange={e => setCForm({ ...cForm, channel: e.target.value })}>
                {CHANNELS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Budget</label>
              <input className="input" inputMode="numeric" value={cForm.budget} onChange={e => setCForm({ ...cForm, budget: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Start date</label>
              <input className="input" type="date" value={cForm.startDate} onChange={e => setCForm({ ...cForm, startDate: e.target.value })} />
            </div>
            {error && <div className="alert red" style={{ marginTop: 0 }}>{error}</div>}
            <div className="form-actions">
              <button type="button" className="btn btn-outline btn-lg" style={{ flex: 1 }} onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-green btn-lg" style={{ flex: 1 }}>Save Campaign</button>
            </div>
          </form>
        </div>
      )}

      {modal === 'post' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <form className="modal-card" onClick={e => e.stopPropagation()} onSubmit={savePost}>
            <div className="modal-title">Plan a Post</div>
            <div className="form-group">
              <label>Post title / idea</label>
              <input className="input" placeholder="e.g. Friday oil discount" value={pForm.title} onChange={e => setPForm({ ...pForm, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Platform</label>
              <select className="input" value={pForm.platform} onChange={e => setPForm({ ...pForm, platform: e.target.value })}>
                {PLATFORMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input className="input" type="date" value={pForm.date} onChange={e => setPForm({ ...pForm, date: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Photo / Video</label>
              {pForm.mediaId ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="badge green" style={{ fontSize: 13 }}>{pForm.mediaType === 'video' ? '✓ Video attached' : '✓ Photo attached'}</span>
                  <button type="button" className="btn btn-outline" style={{ padding: '4px 10px', fontSize: 12 }}
                    onClick={() => setPForm(f => ({ ...f, mediaId: null, mediaType: null }))}>Remove</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
                    Upload File
                    <input type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={onMediaPick} />
                  </label>
                  <label className="btn btn-blue" style={{ cursor: 'pointer' }}>
                    Record with Camera
                    <input type="file" accept="video/*" capture="environment" style={{ display: 'none' }} onChange={onMediaPick} />
                  </label>
                </div>
              )}
            </div>
            {error && <div className="alert red" style={{ marginTop: 0 }}>{error}</div>}
            <div className="form-actions">
              <button type="button" className="btn btn-outline btn-lg" style={{ flex: 1 }} onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-green btn-lg" style={{ flex: 1 }}>Save Post</button>
            </div>
          </form>
        </div>
      )}

      {viewMedia && (
        <div className="modal-overlay" onClick={() => { URL.revokeObjectURL(viewMedia.url); setViewMedia(null); }}>
          <div className="print-card" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-title">{viewMedia.title}</div>
            {viewMedia.type === 'video'
              ? <video src={viewMedia.url} controls playsInline style={{ width: '100%', borderRadius: 10 }} />
              : <img src={viewMedia.url} alt="post media" style={{ width: '100%', borderRadius: 10 }} />}
            <div className="print-actions">
              <button className="btn btn-outline" onClick={() => { URL.revokeObjectURL(viewMedia.url); setViewMedia(null); }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}