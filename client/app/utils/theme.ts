import { createContext, use, useCallback, useMemo, useState } from "react";
import { z } from "zod";
import { getCookie, setCookie } from "./cookie";

const THEME_COOKIE_NAME = "theme";

const ThemeSchema = z.enum(["light", "dark", "system"]);
export type Theme = z.infer<typeof ThemeSchema>;

export const getThemeFromCookie = () => ThemeSchema.catch("system").parse(getCookie(THEME_COOKIE_NAME));

export const setThemeCookie = (theme: Theme) => setCookie(THEME_COOKIE_NAME, theme);

export const useThemeProvider = () => {
  const [theme, setTheme] = useState<Theme>(() => getThemeFromCookie());

  const setThemeAndCookie = useCallback((theme: Theme) => {
    setTheme(theme);
    setThemeCookie(theme);
  }, []);

  return useMemo(() => ({ theme, setTheme: setThemeAndCookie }), [theme, setThemeAndCookie]);
};

export const ThemeContext = createContext<ReturnType<typeof useThemeProvider> | null>(null);
export const useTheme = () => {
  const context = use(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeContext");
  }
  return context;
};
