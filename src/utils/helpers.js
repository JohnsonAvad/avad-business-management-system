// Shared helper functions for AVAD Systems

// Valid phone = 9 to 13 digits (covers 07xx mobiles, 04xx landlines, and +256 format)
export function isValidPhone(value) {
  const digits = String(value).replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 13;
}

// While typing: keep only digits, spaces and + (letters simply don't appear)
export function cleanPhoneInput(value) {
  return value.replace(/[^\d\s+]/g, '');
}