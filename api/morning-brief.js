import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const fmt = (n, currency) =>
  (currency === 'USD' ? '$' : 'UGX ') + Number(n || 0).toLocaleString('en-US');

function toIntl(phone) {
  const d = String(phone).replace(/\D/g, '');
  return d.startsWith('0') ? '256' + d.slice(1) : d;
}

function buildBrief(data, profile, ownerName) {
  const sales = data.sales || [];
  const expenses = data.expenses || [];
  const customers = data.customers || [];
  const products = data.products || [];
  const currency = profile.currency || 'UGX';
  const isService = profile.type === 'Service';
  const bizName = profile.name || 'your business';

  const yest = new Date(); yest.setDate(yest.getDate() - 1);
  const yestStr = yest.toISOString().slice(0, 10);

  const ySales = sales.filter(s => s.date === yestStr);
  const yRevenue = ySales.reduce((a, s) => a + s.amount, 0);
  const yExp = expenses.filter(e => e.date === yestStr).reduce((a, e) => a + e.amount, 0);
  const yProfit = yRevenue - yExp;

  const debtors = customers.filter(c => c.balance > 0);
  const totalOwed = debtors.reduce((a, c) => a + c.balance, 0);

  const start = new Date(); start.setDate(start.getDate() - 14);
  const startStr = start.toISOString().slice(0, 10);
  const soldBy = {};
  sales.filter(s => s.date >= startStr).forEach(s =>
    (s.items || []).forEach(i => { soldBy[i.productId] = (soldBy[i.productId] || 0) + i.qty; })
  );
  const restocks = products.filter(p => p.active !== false).map(p => {
    const v = (soldBy[p.id] || 0) / 14;
    return { name: p.name, v, daysLeft: v > 0 ? p.stock / v : Infinity };
  }).filter(p => p.v > 0 && p.daysLeft <= 7).sort((a, b) => a.daysLeft - b.daysLeft);

  const lines = [
    '☀️ Good morning, ' + (ownerName || 'Boss') + '!',
    'Here is how ' + bizName + ' performed yesterday:',
    '',
    '💰 ' + fmt(yRevenue, currency) + (isService ? ' earned' : ' sold') + ' • ' + fmt(yProfit, currency) + ' profit',
  ];
  if (totalOwed > 0) lines.push('🔴 Owed to you: ' + fmt(totalOwed, currency) + ' (' + debtors.length + ' customer' + (debtors.length > 1 ? 's' : '') + ')');
  if (!isService && restocks.length) lines.push('📦 Restock soon: ' + restocks.slice(0, 3).map(p => p.name).join(', '));
  lines.push('', 'Open AVAD Systems to see your actions for today. Have a great day! 🚀');
  return lines.join('\n');
}

async function sendWhatsApp(to, body) {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) return { skipped: true };
  const res = await fetch('https://graph.facebook.com/v18.0/' + WHATSAPP_PHONE_ID + '/messages', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + WHATSAPP_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body } }),
  });
  const json = await res.json();
  return { ok: res.ok, json };
}

export default async function handler(req, res) {
  if (!SERVICE_KEY) return res.status(500).json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' });

  const { data: { users }, error: usersErr } = await supabase.auth.admin.listUsers();
  if (usersErr) return res.status(500).json({ error: usersErr.message });

  const results = [];
  for (const user of users || []) {
    const ownerPhone = (user.email || '').split('@')[0];
    const ownerName = user.user_metadata?.name || 'Boss';

    const { data: bizRow } = await supabase
      .from('business_data').select('data').eq('business_id', user.id).maybeSingle();
    if (!bizRow) { results.push({ ownerPhone, status: 'no-data' }); continue; }

    const data = bizRow.data?.data || {};
    const profile = bizRow.data?.business || {};
    const brief = buildBrief(data, profile, ownerName);

    await supabase.from('briefs').insert({ business_id: user.id, message: brief });

    const wa = await sendWhatsApp(toIntl(ownerPhone), brief);
    results.push({ ownerPhone, status: wa.skipped ? 'stored-only' : (wa.ok ? 'sent' : 'failed') });
  }

  res.status(200).json({ processed: results.length, results });
}