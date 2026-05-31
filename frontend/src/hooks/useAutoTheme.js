import { useEffect, useState } from "react";

// Auto-switch between light and dark based on current time.
// Light mode: 09:40 (inclusive) → 18:00 (exclusive)
// Otherwise: Dark mode.

const isLightWindow = (d = new Date()) => {
  const m = d.getHours() * 60 + d.getMinutes();
  return m >= 9 * 60 + 40 && m < 18 * 60;
};

export const useAutoTheme = () => {
  const [theme, setTheme] = useState(() => (isLightWindow() ? "light" : "dark"));

  useEffect(() => {
    const apply = () => {
      const next = isLightWindow() ? "light" : "dark";
      setTheme((cur) => (cur === next ? cur : next));
    };
    apply();
    const id = setInterval(apply, 30 * 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("theme-light");
      root.classList.remove("theme-dark");
    } else {
      root.classList.add("theme-dark");
      root.classList.remove("theme-light");
    }
  }, [theme]);

  return theme;
};
