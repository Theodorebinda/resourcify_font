/**
 * Theme Provider
 * 
 * Integrates Zustand UI store with Next.js theme system.
 * 
 * CRITICAL RULE:
 * =============
 * The theme is a LOCAL UI PREFERENCE.
 * - It is NOT tied to authentication
 * - It is NOT stored on the backend
 * - It works for visitors and authenticated users alike
 * - Theme state is completely decoupled from auth state
 * 
 * Theme values:
 * - "light": Force light mode
 * - "dark": Force dark mode
 * - "system": Follow prefers-color-scheme and react to system changes
 * 
 * Default: "system"
 * Persistence: localStorage (via Zustand persist middleware)
 */

"use client";

import { useEffect } from "react";
import { useUIStore } from "../stores/use-ui-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUIStore((state) => state.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    const applyTheme = (themeToApply: "light" | "dark") => {
      root.classList.add(themeToApply);
    };

    if (theme === "system") {
      // Get initial system theme
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const systemTheme = mediaQuery.matches ? "dark" : "light";
      applyTheme(systemTheme);

      // Listen for system theme changes
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? "dark" : "light");
      };

      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", handleSystemThemeChange);
        return () => {
          mediaQuery.removeEventListener("change", handleSystemThemeChange);
        };
      }
      // Fallback for older browsers
      else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleSystemThemeChange);
        return () => {
          mediaQuery.removeListener(handleSystemThemeChange);
        };
      }
    } else {
      applyTheme(theme);
    }
  }, [theme]);

  return <>{children}</>;
}
