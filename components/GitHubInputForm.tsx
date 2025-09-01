import React, { useState, useRef, useCallback } from 'react';
import { UploadIcon } from './icons';

interface GitHubInputFormProps {
  onGenerate: (githubUrl: string, imageFile: File, githubToken: string) => void;
  error: string | null;
}

const GitHubInputForm: React.FC<GitHubInputFormProps> = ({ onGenerate, error }) => {
  const [githubUrl, setGithubUrl] = useState<string>('');
  const [githubToken, setGithubToken] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setLocalError("Image size cannot exceed 5MB.");
        return;
      }
      setImageFile(file);
      setLocalError(null);
    }
  };

  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl) {
        setLocalError("Please enter a GitHub profile URL.");
        return;
    }
     if (!githubToken) {
        setLocalError("Please enter your GitHub Personal Access Token.");
        return;
    }
    if (!imageFile) {
        setLocalError("Please upload a background image.");
        return;
    }
    setLocalError(null);
    onGenerate(githubUrl, imageFile, githubToken);
  };

  return (
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

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Background Image
        </label>
        <div 
          onClick={triggerFileSelect}
          className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md cursor-pointer hover:border-indigo-500 transition-colors"
        >
          <div className="space-y-1 text-center">
            <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-400">
              <p className="pl-1">
                {imageFile ? imageFile.name : 'Upload a file or drag and drop'}
              </p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          id="file-upload"
          name="file-upload"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleImageUpload}
        />
      </div>

      {(error || localError) && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-2 rounded-md text-sm">
          {error || localError}
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-transform transform hover:scale-105"
      >
        Generate Review
      </button>
    </form>
  );
};

export default GitHubInputForm;