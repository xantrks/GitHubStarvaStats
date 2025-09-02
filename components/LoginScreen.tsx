import React, { useState } from 'react';

interface LoginScreenProps {
  onLogin: (url: string, token: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [githubUrl, setGithubUrl] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl) {
      setError("Please enter a GitHub profile URL.");
      return;
    }
    const usernameMatch = githubUrl.match(/github\.com\/([^\/]+)/);
    if (!usernameMatch) {
      setError('Invalid GitHub profile URL. Please use a format like https://github.com/username');
      return;
    }
    if (!githubToken) {
      setError("Please enter your GitHub Personal Access Token.");
      return;
    }
    setError(null);
    onLogin(githubUrl, githubToken);
  };

  return (
    <>
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
          GitHub Year in Review
        </h1>
        <p className="text-gray-400 mt-2">Generate your Strava-like coding summary.</p>
      </header>
      <div className="bg-gray-800 rounded-2xl shadow-2xl shadow-indigo-900/20 overflow-hidden border border-gray-700">
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label htmlFor="github-url" className="block text-sm font-medium text-gray-300 mb-2">
              GitHub Profile URL
            </label>
            <input
              id="github-url"
              type="text"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username"
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="github-token" className="block text-sm font-medium text-gray-300 mb-2">
              GitHub Personal Access Token
            </label>
            <input
              id="github-token"
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_..."
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-2 text-xs text-gray-500">
              A token with <code className="bg-gray-900 px-1 rounded">read:user</code> and <code className="bg-gray-900 px-1 rounded">public_repo</code> scopes is required. Your token is not stored.
            </p>
          </div>
          
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-transform transform hover:scale-105"
          >
            Continue
          </button>
        </form>
      </div>
      <footer className="text-center mt-8 text-gray-500 text-sm space-y-1">
          <p>Stats generated using the official GitHub API.</p>
      </footer>
    </>
  );
};

export default LoginScreen;
