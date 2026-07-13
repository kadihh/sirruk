export const LEVELS = [
  { label: 'Weak', color: 'bg-red-500', min: 0 },
  { label: 'Medium', color: 'bg-yellow-500', min: 29 },
  { label: 'Strong', color: 'bg-lime-500', min: 36 },
  { label: 'Very Strong', color: 'bg-emerald-500', min: 60 },
];

export function getActiveLevel(score) {
  return LEVELS.reduce((last, lv, i) => (score >= lv.min ? i : last), -1);
}

function calculatePasswordEntropy(password) {
  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^A-Za-z0-9]/.test(password)) poolSize += 30;
  if (poolSize === 0 || password.length === 0) return 0;
  return password.length * Math.log2(poolSize);
}

export function calculatePasswordStrength(password) {
  const entropy = calculatePasswordEntropy(password);
  const active = getActiveLevel(entropy);
  return { entropy: Math.round(entropy), label: active >= 0 ? LEVELS[active].label : 'N/A' };
}

export function estimateCrackTime(entropy) {
  const guessesPerSec = 1e10;
  const combinations = Math.pow(2, entropy);
  const seconds = combinations / guessesPerSec / 2;
  if (seconds < 1) return 'instant';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  const years = seconds / 31536000;
  if (years < 1e3) return `${Math.round(years)} years`;
  if (years < 1e6) return `${Math.round(years / 1e3)}k years`;
  if (years < 1e9) return `${Math.round(years / 1e6)}M years`;
  if (years < 1e12) return `${Math.round(years / 1e9)}B years`;
  return `${years.toExponential(0)} years`;
}
