import { memo } from 'react';
import { LEVELS, getActiveLevel, estimateCrackTime } from '../utils/strength';

export default memo(function StrengthMeter({ entropy, label }) {
  const activeIndex = getActiveLevel(entropy);

  return (
    <div className="space-y-2">
      {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role — div groups bars into single image for screen readers */}
      <div className="flex gap-1.5" role="img" aria-label={`Password strength: ${label}`}>
        {LEVELS.map((lv, i) => (
          <div
            key={lv.label}
            className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
              i <= activeIndex ? lv.color : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>
          Strength:{' '}
          <span className="text-gray-200 font-medium">{label}</span>
        </span>
        {entropy > 0 && (
          <span className="text-xs text-gray-500">
            {Math.round(entropy)} bits &middot; {estimateCrackTime(entropy)} to crack
          </span>
        )}
      </div>
    </div>
  );
});
