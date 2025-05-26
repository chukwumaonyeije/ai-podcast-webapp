import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false); // ✅ Key fix

  // On mount, read theme and set flags
  useEffect(() => {
    setMounted(true);
    const theme = localStorage.theme || 'light';
    const isDarkMode = theme === 'dark';
    setIsDark(isDarkMode);
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, []);

  const toggleTheme = () => {
    const nextMode = !isDark;
    setIsDark(nextMode);
    document.documentElement.classList.toggle('dark', nextMode);
    localStorage.theme = nextMode ? 'dark' : 'light';
  };

  // ✅ Prevent hydration mismatch
  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-black dark:text-white transition"
    >
      {isDark ? '🌞 Light Mode' : '🌙 Dark Mode'}
    </button>
  );
}
