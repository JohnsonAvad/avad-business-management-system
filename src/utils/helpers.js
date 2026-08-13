// Shared helper functions for AVAD Systems

export function isValidPhone(value) {
  const digits = String(value).replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 13;
}

export function cleanPhoneInput(value) {
  return value.replace(/[^\d\s+]/g, '');
}

// Convert local phone (07xx...) to international format without + (2567xx...)
export function toIntlPhone(phone) {
  const d = String(phone).replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('0')) return '256' + d.slice(1);
  return d;
}

export function waLink(phone, text) {
  const t = encodeURIComponent(text);
  const p = toIntlPhone(phone);
  return p ? `https://wa.me/${p}?text=${t}` : `https://wa.me/?text=${t}`;
}

export function smsLink(phone, text) {
  const t = encodeURIComponent(text);
  const p = toIntlPhone(phone);
  return p ? `sms:+${p}?&body=${t}` : `sms:?&body=${t}`;
}