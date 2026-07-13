import { useTranslation } from '../i18n/useTranslation';

export default function DisclaimerModal({ onAccept, onDecline }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-xl border border-gray-800 p-6 sm:p-8 space-y-5">
        <h2 className="text-xl font-bold text-gray-100 text-center">
          {t('disclaimer.title')}
        </h2>

        <div className="space-y-4">
          <p dir="rtl" className="text-right text-sm text-gray-300 leading-relaxed">
            هذا التطبيق مخصص لتوليد كلمات مرور قوية فقط. لا نتحمل أي مسؤولية عن أي أضرار أو خسائر ناتجة عن استخدام كلمات المرور المولّدة أو المُدخَلة. استخدم على مسؤوليتك الخاصة.
          </p>

          <hr className="border-gray-700" />

          <p className="text-sm text-gray-300 leading-relaxed">
            This app is for generating strong passwords only. We are not responsible for any damages or losses resulting from the use of generated or entered passwords. Use at your own risk.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onDecline}
            className="flex-1 px-4 py-3 text-sm font-semibold rounded-lg bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
          >
            {t('disclaimer.decline')}
          </button>
          <button
            onClick={onAccept}
            className="flex-1 px-4 py-3 text-sm font-semibold rounded-lg bg-green-600 text-green-50 hover:bg-green-500 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:outline-none"
          >
            {t('disclaimer.accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
