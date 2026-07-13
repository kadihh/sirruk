import { useState, useMemo } from 'react';
import { LanguageContext } from './LanguageContext';
import translations from './translations';

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('ar');

  const t = useMemo(() => {
    const dict = translations[lang] || translations.en;
    return (key, vars) => {
      let str = dict[key] || translations.en[key] || key;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          str = str.replace(`{${k}}`, v);
        });
      }
      return str;
    };
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
