import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import PasswordDisplay from './components/PasswordDisplay';
import PasswordOptions from './components/PasswordOptions';
import CheckPanel from './components/CheckPanel';
import StrengthMeter from './components/StrengthMeter';
import DisclaimerModal from './components/DisclaimerModal';
import AccessDenied from './components/AccessDenied';
import { generatePassword } from './utils/generator';
import { calculatePasswordStrength } from './utils/strength';
import { useSecurityWipe } from './utils/useSecurityWipe';
import { useTranslation } from './i18n/useTranslation';

export default function App() {
  const { lang, setLang, t } = useTranslation();
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [insecure, setInsecure] = useState(false);
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(false);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [mode, setMode] = useState('generate');
  const [manualPassword, setManualPassword] = useState('');
  const [disclaimerStatus, setDisclaimerStatus] = useState(
    () => sessionStorage.getItem('disclaimerAccepted') === '1' ? 'accepted' : 'pending'
  );

  const noCharsets = !uppercase && !lowercase && !numbers && !symbols;

  const timerRef = useRef(null);

  const generate = useCallback(() => {
    setPassword(generatePassword(length, { uppercase, lowercase, numbers, symbols, excludeAmbiguous }));
    }, [length, uppercase, lowercase, numbers, symbols, excludeAmbiguous]);

  useEffect(() => { generate(); }, [generate]);
  useEffect(() => { setCopied(false); setCopyFailed(false); clearTimeout(timerRef.current); }, [password]);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  useEffect(() => {
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') setInsecure(true);
  }, []);

  useEffect(() => {
    const wipe = () => navigator.clipboard.writeText('').catch(() => {});
    window.addEventListener('beforeunload', wipe);
    return () => window.removeEventListener('beforeunload', wipe);
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(password);
      clearTimeout(timerRef.current);
      setCopied(true);
      setCopyFailed(false);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      setCopyFailed(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopyFailed(false), 3000);
    }
  }, [password]);

  useSecurityWipe(
    useCallback(() => {
      setPassword('');
      setCopied(false);
      setCopyFailed(false);
      navigator.clipboard.writeText('').catch(() => {});
    }, [])
  );

  useEffect(() => {
    const handle = () => { if (!document.hidden) generate(); };
    document.addEventListener('visibilitychange', handle);
    return () => document.removeEventListener('visibilitychange', handle);
  }, [generate]);

  const displayPassword = mode === 'check' ? manualPassword : password;
  const strength = useMemo(() => calculatePasswordStrength(displayPassword), [displayPassword]);

  if (disclaimerStatus === 'pending') {
    return (
      <DisclaimerModal
        onAccept={() => {
          sessionStorage.setItem('disclaimerAccepted', '1');
          setDisclaimerStatus('accepted');
        }}
        onDecline={() => setDisclaimerStatus('declined')}
      />
    );
  }

  if (disclaimerStatus === 'declined') {
    return <AccessDenied onGoBack={() => setDisclaimerStatus('pending')} />;
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <main className="w-full max-w-md bg-gray-900 rounded-2xl shadow-xl border border-gray-800 p-6 sm:p-8 space-y-6">
        {insecure && (
          <div className="rounded-lg bg-red-950 border border-red-800 px-3 py-2 text-xs text-red-300 text-center">
            {t('https.warning')}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setMode('generate')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                mode === 'generate'
                  ? 'bg-gray-700 text-gray-100'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {t('tab.generate')}
            </button>
            <button
              onClick={() => setMode('check')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                mode === 'check'
                  ? 'bg-gray-700 text-gray-100'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {t('tab.check')}
            </button>
          </div>

          <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setLang('ar')}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                lang === 'ar'
                  ? 'bg-gray-700 text-gray-100'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              ع
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                lang === 'en'
                  ? 'bg-gray-700 text-gray-100'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-100 tracking-tight text-center">
          {t('app.title')}
        </h1>

        {mode === 'generate' ? (
          <>
            <PasswordDisplay
              password={password}
              onCopy={handleCopy}
              onRegenerate={generate}
              copied={copied}
              copyFailed={copyFailed}
              emptyMessage={noCharsets ? t('display.emptyNoCharset') : t('display.empty')}
            />

            <PasswordOptions
              length={length}
              onLengthChange={setLength}
              uppercase={uppercase}
              onUppercaseChange={setUppercase}
              lowercase={lowercase}
              onLowercaseChange={setLowercase}
              numbers={numbers}
              onNumbersChange={setNumbers}
              symbols={symbols}
              onSymbolsChange={setSymbols}
              excludeAmbiguous={excludeAmbiguous}
              onExcludeAmbiguousChange={setExcludeAmbiguous}
            />
          </>
        ) : (
          <CheckPanel
            password={manualPassword}
            onPasswordChange={setManualPassword}
          />
        )}

        <StrengthMeter entropy={strength.entropy} />

        <a
          href="https://kadihh.pages.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          {t('link.anotherProject')}
        </a>

      </main>
    </div>
  );
}
