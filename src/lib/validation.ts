/** Shared validation — phone FR, postal 45500, card demo. */

export function normalizeFrPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("0")) return digits;
  if (digits.length === 11 && digits.startsWith("33")) return `0${digits.slice(2)}`;
  if (digits.length === 12 && digits.startsWith("330")) return `0${digits.slice(3)}`;
  return null;
}

export function formatFrPhone(digits: string): string {
  if (digits.length !== 10) return digits;
  return digits.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
}

export function isGienAddress(address: string): boolean {
  const a = address.trim().toLowerCase();
  return /\b45500\b/.test(a) || a.includes("gien");
}

export function isDemoCardValid(card: string): boolean {
  const digits = card.replace(/\D/g, "");
  return digits.length >= 13 && digits.length <= 19;
}
