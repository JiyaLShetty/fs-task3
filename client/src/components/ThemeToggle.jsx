import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({ withLabel = false, className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`flex items-center gap-3 rounded-lg text-sm text-muted hover:text-fg hover:bg-hover transition-colors ${
        withLabel ? "w-full px-4 py-2.5" : "p-2.5"
      } ${className}`}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
      {withLabel && (isDark ? "Light mode" : "Dark mode")}
    </button>
  );
}
