import { LEVELS } from '../utils/strength';

export default function StrengthMeter({ score }) {
  const activeIndex = LEVELS.reduce((last, lv, i) => (score >= lv.min ? i : last), -1);

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        {LEVELS.map((lv, i) => (
          <div
            key={lv.label}
            className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
              i <= activeIndex ? lv.color : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
      <p className="text-sm text-gray-400">
        Strength:{' '}
        <span className="text-gray-200 font-medium">{activeIndex >= 0 ? LEVELS[activeIndex].label : 'N/A'}</span>
      </p>
    </div>
  );
}
