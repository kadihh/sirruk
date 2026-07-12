import { memo } from 'react';
import { LEVELS, getActiveLevel } from '../utils/strength';

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
      <p className="text-sm text-gray-200 font-medium">{label}</p>
    </div>
  );
});
