import { Copy, Check, RefreshCw } from 'lucide-react';

export default function PasswordDisplay({ password, onCopy, onRegenerate, copied }) {
  return (
    <div className="relative bg-gray-800/50 border border-gray-700 rounded-xl p-4">
      <div className="flex items-center gap-3 min-h-[3rem]">
        <span className="flex-1 text-xl sm:text-2xl font-mono tracking-wider text-gray-100 break-all select-all">
          {password || (
            <span className="text-gray-500 italic font-sans text-base tracking-normal select-none">
              No password generated
            </span>
          )}
        </span>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={onCopy}
            disabled={!password}
            className="p-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="w-5 h-5 text-emerald-400" />
            ) : (
              <Copy className="w-5 h-5 text-gray-400" />
            )}
          </button>
          <button
            onClick={onRegenerate}
            disabled={!password}
            className="p-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            title="Regenerate"
          >
            <RefreshCw className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
      {copied && (
        <p className="absolute -bottom-6 right-0 text-xs text-emerald-400 font-medium">
          Copied!
        </p>
      )}
    </div>
  );
}
