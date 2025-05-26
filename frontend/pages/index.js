import ThemeToggle from '../components/ThemeToggle';
import TextSummarizer from '../components/TextSummarizer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-gray-900 dark:to-gray-800 py-10 px-4 text-black dark:text-white transition-colors duration-300">
      <div className="mb-4 flex justify-end">
        <ThemeToggle />
      </div>
      <TextSummarizer />
    </div>
  );
}

