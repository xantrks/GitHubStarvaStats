import React, { useState, useCallback } from 'react';
import type { GitHubStats, TimeFrame } from '../types';
import { fetchRealGitHubStats } from '../services/githubService';
import GitHubInputForm from './GitHubInputForm';
import StatsImage from './StatsImage';
import { LoaderIcon } from './icons';

interface GeneratorScreenProps {
  githubUrl: string;
  githubToken: string;
  onLogout: () => void;
}

const GeneratorScreen: React.FC<GeneratorScreenProps> = ({ githubUrl, githubToken, onLogout }) => {
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('yearly');
  const [date, setDate] = useState<Date>(new Date());

  const handleGenerate = useCallback(async (
    imageFile: File, 
    options: { timeFrame: TimeFrame; date: Date }
  ) => {
    setIsLoading(true);
    setError(null);
    setStats(null);
    setBackgroundImage(null);
    setTimeFrame(options.timeFrame);
    setDate(options.date);

    const usernameMatch = githubUrl.match(/github\.com\/([^\/]+)/);
    if (!usernameMatch) { // Should not happen due to previous validation
      setError('Invalid GitHub profile URL.');
      setIsLoading(false);
      return;
    }
    const username = usernameMatch[1];

    try {
      const statsData = await fetchRealGitHubStats(username, githubToken, options);
      
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
  }, [githubUrl, githubToken]);

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
      return <StatsImage stats={stats} backgroundImageUrl={backgroundImage} onReset={handleReset} timeFrame={timeFrame} date={date} />;
    }

    return <GitHubInputForm onGenerate={handleGenerate} error={error} onLogout={onLogout} />;
  };
  
  const username = githubUrl.match(/github\.com\/([^\/]+)/)?.[1];

  return (
    <>
      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">
          Generate Your Review
        </h1>
        <p className="text-gray-400 mt-2">
            Logged in as <code className="bg-gray-900 text-indigo-300 px-2 py-1 rounded-md">{username}</code>.
        </p>
      </header>
      <div className="bg-gray-800 rounded-2xl shadow-2xl shadow-indigo-900/20 overflow-hidden border border-gray-700">
        {renderContent()}
      </div>
    </>
  );
};

export default GeneratorScreen;
