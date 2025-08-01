'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';

export default function NotFound() {
  const router = useRouter();
  
  // Use the same theme hook as privacy page
  const { toggleTheme, isDarkMode, isReady } = useTheme();

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <main className="max-w-4xl mx-auto p-6 theme-container" suppressHydrationWarning>
      <div className="flex justify-between items-center mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-blue-500 hover:text-blue-700"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
              clipRule="evenodd" 
            />
          </svg>
          Back to Game
        </Link>
        
        {isReady && (
          <button
            onClick={toggleTheme}
            className="w-12 h-12 flex items-center justify-center text-2xl rounded-full theme-button"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        )}
      </div>

      <h1 className="text-3xl font-bold mb-6">Page Not Found</h1>
      
      <section className="mb-8 theme-panel p-8 rounded-lg text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-semibold mb-4">404 Error</h2>
        <p className="mb-6">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        
        <button
          onClick={handleGoHome}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md transition duration-300"
        >
          Return to Stackmoji Game
        </button>
      </section>
    </main>
  );
} 