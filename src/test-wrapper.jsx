import { LanguageProvider } from '../i18n/LanguageProvider';

export function withLang(ui) {
  return <LanguageProvider>{ui}</LanguageProvider>;
}
