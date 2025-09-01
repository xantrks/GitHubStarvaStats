import React, { useState, useCallback } from 'react';
import type { GitHubStats } from './types';
import { fetchRealGitHubStats } from './services/githubService';
import GitHubInputForm from './components/GitHubInputForm';
import StatsImage from './components/StatsImage';
import { LoaderIcon } from './components/icons';

const App: React.FC = () => {
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async (githubUrl: string, imageFile: File, githubToken: string) => {
    setIsLoading(true);
    setError(null);
    setStats(null);
    setBackgroundImage(null);

    const usernameMatch = githubUrl.match(/github\.com\/([^\/]+)/);
    if (!usernameMatch) {
      setError('Invalid GitHub profile URL. Please use a format like https://github.com/username');
      setIsLoading(false);
      return;
    }
    const username = usernameMatch[1];

    try {
      const statsData = await fetchRealGitHubStats(username, githubToken);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setStats(statsData);
        setBackgroundImage(reader.result as string);
        setIsLoading(false);
      };
      reader.onerror = () => {
        setError('Failed to read the image file.');
        setIsLoading(false);
      };
      reader.readAsDataURL(imageFile);

    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Could not generate stats. ${errorMessage}`);
      setIsLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setStats(null);
    setBackgroundImage(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 h-96">
          <LoaderIcon className="w-16 h-16 animate-spin text-indigo-400" />
          <p className="mt-4 text-lg text-gray-300">Fetching real GitHub data...</p>
          <p className="text-sm text-gray-500">This may take a moment.</p>
        </div>
      );
    }

    if (stats && backgroundImage) {
      return <StatsImage stats={stats} backgroundImageUrl={backgroundImage} onReset={handleReset} />;
    }

    return <GitHubInputForm onGenerate={handleGenerate} error={error} />;
  };

  return (
    <main className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
                GitHub Year in Review
            </h1>
            <p className="text-gray-400 mt-2">Generate your Strava-like coding summary.</p>
        </header>
        <div className="bg-gray-800 rounded-2xl shadow-2xl shadow-indigo-900/20 overflow-hidden border border-gray-700">
            {renderContent()}
        </div>
        <footer className="text-center mt-8 text-gray-500 text-sm space-y-1">
            <p>Stats generated using the official GitHub API.</p>
        </footer>
      </div>
    </main>
  );
};

export default App;