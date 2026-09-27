import {useI18n} from '~/lib/i18n';
import type {Locale} from './locale';

/**
 * Text written in the config files (app/config/*): either one string used in
 * every language, or one string per site language.
 */
export type Localized = string | Partial<Record<Locale, string>>;

export function localize(value: Localized | undefined, locale: Locale): string {
  if (value === undefined) return '';
  if (typeof value === 'string') return value;
  return value[locale] ?? value.en ?? Object.values(value)[0] ?? '';
}

/** `const l = useLocalized(); l(section.title)` */
export function useLocalized() {
  const {locale} = useI18n();
  return (value: Localized | undefined) => localize(value, locale);
}
