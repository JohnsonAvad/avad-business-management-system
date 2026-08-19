import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL || '';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const cloudReady = Boolean(url && key);
export const supabase = cloudReady ? createClient(url, key) : null;

export async function cloudPull(businessId) {
  if (!cloudReady || !businessId) return null;
  const { data, error } = await supabase
    .from('business_data').select('data').eq('business_id', businessId).maybeSingle();
  if (error) return null;
  return data?.data || null;
}

export async function cloudPush(businessId, payload) {
  if (!cloudReady || !businessId) return;
  await supabase
    .from('business_data')
    .upsert({ business_id: businessId, data: payload, updated_at: new Date().toISOString() });
}