import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import PasswordDisplay from './components/PasswordDisplay';
import PasswordOptions from './components/PasswordOptions';
import StrengthMeter from './components/StrengthMeter';
import { generatePassword } from './utils/generator';
import { calculatePasswordStrength } from './utils/strength';
import { useSecurityWipe } from './utils/useSecurityWipe';

export default function App() {
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

  const strength = useMemo(() => calculatePasswordStrength(password), [password]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <main className="w-full max-w-md bg-gray-900 rounded-2xl shadow-xl border border-gray-800 p-6 sm:p-8 space-y-6">
        {insecure && (
          <div className="rounded-lg bg-red-950 border border-red-800 px-3 py-2 text-xs text-red-300 text-center">
            Not running over HTTPS — clipboard API may not work.
          </div>
        )}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-gray-100 tracking-tight">
            sirruk
          </h1>
          <p className="text-sm text-gray-400">Secure Password Generator</p>
        </div>

        <PasswordDisplay
          password={password}
          onCopy={handleCopy}
          onRegenerate={generate}
          copied={copied}
          copyFailed={copyFailed}
          emptyMessage={noCharsets ? 'Enable at least one character set' : undefined}
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

        <StrengthMeter entropy={strength.entropy} label={strength.label} />

        <p className="text-xs text-gray-400 text-center leading-relaxed">
          Uses <span className="text-gray-400">window.crypto.getRandomValues</span> for
          cryptographically secure generation. All processing happens locally in your browser.
        </p>
      </main>
    </div>
  );
}
