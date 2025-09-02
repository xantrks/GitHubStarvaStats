import React, { useState, useRef, useCallback } from 'react';
import type { TimeFrame } from '../types';
import { UploadIcon, BackIcon } from './icons';

interface GitHubInputFormProps {
  onGenerate: (imageFile: File, options: { timeFrame: TimeFrame; date: Date }) => void;
  error: string | null;
  onLogout: () => void;
}

const GitHubInputForm: React.FC<GitHubInputFormProps> = ({ onGenerate, error, onLogout }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('yearly');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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
    if (!imageFile) {
        setLocalError("Please upload a background image.");
        return;
    }
    setLocalError(null);
    onGenerate(imageFile, { timeFrame, date: selectedDate });
  };

  const renderDateSelector = () => {
    const currentYear = new Date().getFullYear();

    if (timeFrame === 'daily') {
      const today = new Date();
      const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      return (
         <input
          type="date"
          value={selectedDate.toISOString().split('T')[0]}
          max={dateString}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      );
    }

    if (timeFrame === 'monthly') {
      const years = Array.from({ length: 4 }, (_, i) => currentYear - i);
      const months = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('default', { month: 'long' }));
      
      return (
        <div className="flex gap-2">
           <select 
             value={selectedDate.getMonth()} 
             onChange={(e) => setSelectedDate(new Date(selectedDate.getFullYear(), parseInt(e.target.value), 1))}
             className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {months.map((month, index) => <option key={month} value={index}>{month}</option>)}
           </select>
           <select 
             value={selectedDate.getFullYear()} 
             onChange={(e) => setSelectedDate(new Date(parseInt(e.target.value), selectedDate.getMonth(), 1))}
             className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {years.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
        </div>
      );
    }
    
    // Yearly
    const years = Array.from({ length: 4 }, (_, i) => currentYear - i);
    return (
      <div className="flex space-x-2">
        {years.map(year => (
          <button
            key={year}
            type="button"
            onClick={() => setSelectedDate(new Date(year, 0, 1))}
            className={`flex-1 px-4 py-2 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              selectedDate.getFullYear() === year
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            {year}
          </button>
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-6">
       <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Time Frame
        </label>
        <div className="flex space-x-2">
            {(['daily', 'monthly', 'yearly'] as TimeFrame[]).map(tf => (
                 <button
                    key={tf}
                    type="button"
                    onClick={() => setTimeFrame(tf)}
                    className={`flex-1 px-4 py-2 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize ${
                        timeFrame === tf
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                >
                    {tf}
                </button>
            ))}
        </div>
      </div>
      
       <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select Period
        </label>
        {renderDateSelector()}
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

      <div className="flex flex-col sm:flex-row gap-4">
        <button
            onClick={onLogout}
            type="button"
            className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors"
        >
            <BackIcon className="w-5 h-5"/>
            Change User
        </button>
        <button
            type="submit"
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-transform transform hover:scale-105"
        >
            Generate Review
        </button>
      </div>
    </form>
  );
};

export default GitHubInputForm;