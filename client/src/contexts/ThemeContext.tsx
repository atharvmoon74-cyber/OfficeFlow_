/** Quiet Ledger theme system: semantic light, dark, and system choices persist without brittle color inversion. */
import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";
type ThemeContextValue = { theme: Theme; resolvedTheme: "light" | "dark"; setTheme: (theme: Theme) => void; toggleTheme: () => void; };
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children, defaultTheme = "light" }: { children: React.ReactNode; defaultTheme?: Theme; switchable?: boolean }) {
  const [theme, setThemeState] = useState<Theme>(() => (localStorage.getItem("officeflow.theme") as Theme) || defaultTheme);
  const [systemDark, setSystemDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);
  const resolvedTheme = theme === "system" ? (systemDark ? "dark" : "light") : theme;
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const change = () => setSystemDark(query.matches); query.addEventListener("change", change); return () => query.removeEventListener("change", change);
  }, []);
  useEffect(() => { document.documentElement.classList.toggle("dark", resolvedTheme === "dark"); document.documentElement.style.colorScheme = resolvedTheme; }, [resolvedTheme]);
  const setTheme = (next: Theme) => { localStorage.setItem("officeflow.theme", next); setThemeState(next); };
  return <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme: () => setTheme(resolvedTheme === "dark" ? "light" : "dark") }}>{children}</ThemeContext.Provider>;
}

export function useTheme() { const context = useContext(ThemeContext); if (!context) throw new Error("useTheme must be used inside ThemeProvider"); return context; }
