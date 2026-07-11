import { useState, useCallback, useEffect, useRef } from 'react';
import PasswordDisplay from './components/PasswordDisplay';
import PasswordOptions from './components/PasswordOptions';
import StrengthMeter from './components/StrengthMeter';
import { generatePassword } from './utils/generator';
import { calculatePasswordStrength } from './utils/strength';
import { useSecurityWipe } from './utils/useSecurityWipe';

export default function App() {
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(false);

  const timerRef = useRef(null);

  const generate = useCallback(() => {
    setPassword(generatePassword(length, { uppercase, lowercase, numbers, symbols }));
  }, [length, uppercase, lowercase, numbers, symbols]);

  useEffect(() => { generate(); }, [generate]);
  useEffect(() => { setCopied(false); clearTimeout(timerRef.current); }, [password]);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(password);
      clearTimeout(timerRef.current);
      setCopied(true);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  }, [password]);

  useSecurityWipe(
    useCallback(() => {
      setPassword('');
      setCopied(false);
      navigator.clipboard.writeText('').catch(() => {});
    }, [])
  );

  const strength = calculatePasswordStrength(password);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-xl border border-gray-800 p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-gray-100 tracking-tight">
            sirruk
          </h1>
          <p className="text-sm text-gray-500">Secure Password Generator</p>
        </div>

        <PasswordDisplay
          password={password}
          onCopy={handleCopy}
          onRegenerate={generate}
          copied={copied}
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
        />

        <StrengthMeter score={strength.score} />

        <p className="text-[11px] text-gray-600 text-center leading-relaxed">
          Uses <span className="text-gray-500">window.crypto.getRandomValues</span> for
          cryptographically secure generation. All processing happens locally in your browser.
        </p>
      </div>
    </div>
  );
}
