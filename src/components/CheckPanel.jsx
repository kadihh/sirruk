import { useState, memo } from 'react';
import { Search, CheckCircle, AlertTriangle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { checkPwned } from '../utils/hibp';
import { useTranslation } from '../i18n/useTranslation';

export default memo(function CheckPanel({ password, onPasswordChange }) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleCheck = async () => {
    if (!password) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await checkPwned(password);
      setResult(res);
    } catch {
      setError(t('check.error'));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    onPasswordChange(e.target.value);
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-gray-800/50 border border-gray-700 p-3 text-xs text-gray-400 leading-relaxed">
        <strong className="text-gray-300">{t('check.infoHeading')}</strong>{' '}
        {t('check.infoBody')}{' '}
        <a
          href="https://haveibeenpwned.com/Passwords"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-300"
        >
          Have I Been Pwned
        </a>.
      </div>

      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={handlePasswordChange}
          placeholder={t('check.placeholder')}
          className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 pr-20 text-gray-100 font-mono tracking-wider placeholder:text-gray-500 placeholder:font-sans placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          aria-label={t('check.placeholder')}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 transition cursor-pointer"
            aria-label={showPassword ? 'Hide' : 'Show'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          {password && (
            <button
              type="button"
              onClick={() => { onPasswordChange(''); setResult(null); setError(null); }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 transition cursor-pointer"
              aria-label="Clear"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      <button
        onClick={handleCheck}
        disabled={!password || loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-medium transition cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t('check.loading')}
          </>
        ) : (
          <>
            <Search className="w-4 h-4" />
            {t('check.button')}
          </>
        )}
      </button>

      {error && (
        <div className="rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {result && result.breached && (
        <div className="rounded-lg bg-red-950/50 border border-red-800 px-4 py-3 space-y-2">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-red-300">
                {t('check.breachedTitle', { count: result.count.toLocaleString() })}
              </p>
              <p className="text-red-400 mt-1">
                {t('check.breachedDesc')}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {t('check.attribution')}{' '}
            <a
              href="https://haveibeenpwned.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-400"
            >
              Have I Been Pwned
            </a>.
          </p>
        </div>
      )}

      {result && !result.breached && (
        <div className="rounded-lg bg-emerald-950/50 border border-emerald-800 px-4 py-3 flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-emerald-300">{t('check.safeTitle')}</p>
            <p className="text-emerald-400/80 mt-1">
              {t('check.safeDesc')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
});
