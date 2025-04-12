import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Custom404() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <Head>
        <title>404 - Page Not Found | Stackmoji</title>
        <meta name="description" content="The page you were looking for doesn't exist" />
      </Head>
      
      <div className="text-center max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
        <p className="text-gray-600 mb-6">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        
        <button
          onClick={handleGoHome}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md transition duration-300"
        >
          Return to Stackmoji Game
        </button>
      </div>
    </div>
  );
} 