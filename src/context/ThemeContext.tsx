import { createContext, useContext } from "react";

export type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const defaultContext: ThemeContextValue = {
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
};

const ThemeContext = createContext<ThemeContextValue>(defaultContext);

export const ThemeProvider = ThemeContext.Provider;

export const useTheme = () => useContext(ThemeContext);
