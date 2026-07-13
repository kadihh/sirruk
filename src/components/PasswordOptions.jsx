import LengthSlider from './LengthSlider';
import ToggleGroup from './ToggleGroup';
import { useTranslation } from '../i18n/useTranslation';

export default function PasswordOptions({
  length,
  onLengthChange,
  uppercase,
  onUppercaseChange,
  lowercase,
  onLowercaseChange,
  numbers,
  onNumbersChange,
  symbols,
  onSymbolsChange,
  excludeAmbiguous,
  onExcludeAmbiguousChange,
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      <LengthSlider value={length} onChange={onLengthChange} min={8} max={64} label={t('options.length')} />
      <ToggleGroup
        toggles={[
          { key: 'uppercase', label: 'A–Z', checked: uppercase, onChange: onUppercaseChange },
          { key: 'lowercase', label: 'a–z', checked: lowercase, onChange: onLowercaseChange },
          { key: 'numbers', label: '0–9', checked: numbers, onChange: onNumbersChange },
          { key: 'symbols', label: '!@#$', checked: symbols, onChange: onSymbolsChange },
        ]}
      />
      {symbols && (
        <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={excludeAmbiguous}
            onChange={(e) => onExcludeAmbiguousChange(e.target.checked)}
            className="rounded border-gray-600 bg-gray-700 text-indigo-500 focus:ring-indigo-500"
          />
          {t('options.excludeAmbiguous')}
        </label>
      )}
    </div>
  );
}
