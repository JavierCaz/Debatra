"use client";

import * as React from "react";
import i18n from "@/lib/i18n/config";

type Language = "en" | "es";

type LanguageProviderProps = {
  children: React.ReactNode;
};

type LanguageProviderState = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const initialState: LanguageProviderState = {
  language: "en",
  setLanguage: () => null,
};

const LanguageProviderContext =
  React.createContext<LanguageProviderState>(initialState);

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = React.useState<Language>("en");

  React.useEffect(() => {
    const stored = localStorage.getItem("debatra-ui-lang") as Language | null;
    if (stored && (stored === "en" || stored === "es")) {
      setLanguageState(stored);
      i18n.changeLanguage(stored);
      document.documentElement.lang = stored;
    }
  }, []);

  const setLanguage = React.useCallback((lang: Language) => {
    localStorage.setItem("debatra-ui-lang", lang);
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
  }, []);

  return (
    <LanguageProviderContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageProviderContext.Provider>
  );
}

export const useLanguage = () => {
  const context = React.useContext(LanguageProviderContext);
  if (context === undefined)
    throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};
