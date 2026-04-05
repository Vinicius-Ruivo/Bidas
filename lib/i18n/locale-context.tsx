"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  BIDAS_LOCALE_STORAGE_KEY,
  type Locale,
  type MessageKey,
  STRINGS,
} from "@/lib/i18n/strings";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, params?: Record<string, string>) => string;
  speechLang: string;
  dateLocale: string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function interpolate(template: string, params?: Record<string, string>): string {
  const base = template ?? "";
  if (!params) return base;
  let out = base;
  for (const [k, v] of Object.entries(params)) {
    out = out.replaceAll(`{{${k}}}`, v);
  }
  return out;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("pt-BR");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(BIDAS_LOCALE_STORAGE_KEY);
      if (raw === "en" || raw === "pt-BR") setLocaleState(raw);
    } catch {
      /* private mode */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = locale === "pt-BR" ? "pt-BR" : "en";
  }, [locale, ready]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(BIDAS_LOCALE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const dict = STRINGS[locale];
    return {
      locale,
      setLocale,
      t: (key: MessageKey, params?: Record<string, string>) =>
        interpolate(dict[key] ?? String(key), params),
      speechLang: locale === "pt-BR" ? "pt-BR" : "en-US",
      dateLocale: locale === "pt-BR" ? "pt-BR" : "en-US",
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within LocaleProvider");
  }
  return ctx;
}
