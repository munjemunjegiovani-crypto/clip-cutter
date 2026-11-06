import Icon from "./Icon";
import { useTheme } from "../hooks/useTheme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className="flex h-9 items-center justify-center gap-1 rounded-full bg-surface-container-low/80 px-space-sm text-on-surface-variant shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-md transition-colors hover:bg-surface-container hover:text-on-surface"
    >
      <Icon name="light_mode" className={`text-[18px] ${isDark ? "opacity-40" : "text-secondary"}`} />
      <Icon name="dark_mode" className={`text-[18px] ${isDark ? "text-secondary" : "opacity-40"}`} />
    </button>
  );
}
