export const LEVELS = [
  { label: 'Weak', color: 'bg-red-500', min: 0 },
  { label: 'Medium', color: 'bg-yellow-500', min: 3 },
  { label: 'Strong', color: 'bg-lime-500', min: 5 },
  { label: 'Very Strong', color: 'bg-emerald-500', min: 7 },
];

export function calculatePasswordStrength(password) {
  let score = 0;
  const len = password.length;

  if (len >= 8) score += 1;
  if (len >= 12) score += 1;
  if (len >= 16) score += 1;
  if (len >= 24) score += 1;
  if (len >= 32) score += 1;

  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  score = Math.min(score, 8);

  const active = LEVELS.reduce((last, lv, i) => (score >= lv.min ? i : last), -1);

  return { score, label: active >= 0 ? LEVELS[active].label : 'N/A' };
}
