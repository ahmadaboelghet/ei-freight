/**
 * @file src/contexts/LanguageContext.tsx
 * @description Global Internationalization (i18n) Context supporting Arabic (RTL) & English (LTR).
 *              Automatically toggles document.documentElement.dir and language fonts.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export type Language = "en" | "ar";

interface LanguageContextValue {
  lang: Language;
  dir: "ltr" | "rtl";
  isArabic: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (en: string, ar: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem("ei_freight_lang");
    return saved === "ar" || saved === "en" ? saved : "ar"; // Default to Arabic for MENA platform, or English
  });

  const dir = lang === "ar" ? "rtl" : "ltr";
  const isArabic = lang === "ar";

  useEffect(() => {
    localStorage.setItem("ei_freight_lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLanguage = useCallback((newLang: Language) => {
    setLangState(newLang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLangState((prev) => (prev === "en" ? "ar" : "en"));
  }, []);

  // Simple, expressive bilingual translator helper
  const t = useCallback(
    (en: string, ar: string) => {
      return lang === "ar" ? ar : en;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider
      value={{
        lang,
        dir,
        isArabic,
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}
