import { useRepasaStore } from '@/store/useStore';
import es from '@/locales/es.json';
import tr from '@/locales/tr.json';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : string;
};

const locales: Record<string, DeepPartial<typeof es>> = { es, tr };

/**
 * Hook de traducción ligero.
 * Uso: const { t } = useTranslation();
 *      t('home.subtitle')
 *      t('vuelta.method', { completed: 5 })
 */
export function useTranslation() {
  const locale = useRepasaStore((state) => state.locale);
  const dict = locales[locale] ?? locales['es'];

  function t(key: string, vars?: Record<string, string | number>): string {
    const keys = key.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = dict;
    for (const k of keys) {
      value = value?.[k];
    }
    if (typeof value !== 'string') {
      // Fallback al español si la clave no existe
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let fallback: any = locales['es'];
      for (const k of keys) {
        fallback = fallback?.[k];
      }
      value = typeof fallback === 'string' ? fallback : key;
    }
    if (vars) {
      return Object.entries(vars).reduce(
        (str, [varKey, varVal]) => str.replace(`{${varKey}}`, String(varVal)),
        value as string
      );
    }
    return value as string;
  }

  return { t, locale };
}
