import { memo } from 'react';

export default memo(function ToggleGroup({ toggles }) {
  return (
    <fieldset className="space-y-2 border-0 p-0 m-0">
      <div className="grid grid-cols-2 gap-3">
        {toggles.map(({ key, label, checked, onChange }) => (
          <label
            key={key}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-800 border border-gray-700 hover:border-gray-600 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition cursor-pointer"
          >
            <span className="text-sm font-medium text-gray-200">{label}</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-600 rounded-full peer-checked:bg-indigo-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-4" />
            </div>
          </label>
        ))}
      </div>
    </fieldset>
  );
});
