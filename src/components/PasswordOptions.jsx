import LengthSlider from './LengthSlider';
import ToggleGroup from './ToggleGroup';

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
}) {
  return (
    <div className="space-y-5">
      <LengthSlider value={length} onChange={onLengthChange} min={8} max={64} label="Length" />
      <ToggleGroup
        toggles={[
          { key: 'uppercase', label: 'A–Z', checked: uppercase, onChange: onUppercaseChange },
          { key: 'lowercase', label: 'a–z', checked: lowercase, onChange: onLowercaseChange },
          { key: 'numbers', label: '0–9', checked: numbers, onChange: onNumbersChange },
          { key: 'symbols', label: '!@#$', checked: symbols, onChange: onSymbolsChange },
        ]}
      />
    </div>
  );
}
