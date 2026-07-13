import { useTranslation } from '../i18n/useTranslation';

export default function AccessDenied({ onGoBack }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-xl border border-gray-800 p-6 sm:p-8 space-y-5 text-center">
        <div className="text-4xl">⛔</div>

        <h2 className="text-xl font-bold text-gray-100">
          {t('disclaimer.deniedTitle')}
        </h2>

        <p dir="rtl" className="text-sm text-gray-400 leading-relaxed">
          يجب قبول إخلاء المسؤولية لاستخدام هذا التطبيق
        </p>
        <p className="text-sm text-gray-400 leading-relaxed">
          You must accept the disclaimer to use this app.
        </p>

        <button
          onClick={onGoBack}
          className="w-full px-4 py-3 text-sm font-semibold rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
        >
          {t('disclaimer.goBack')}
        </button>
      </div>
    </div>
  );
}
