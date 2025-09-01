import React, { useRef, useCallback, useState } from 'react';
import type { GitHubStats } from '../types';
import StatItem from './StatItem';
import RadarChart from './RadarChart';
import { DownloadIcon, BackIcon, LoaderIcon, GitHubIcon } from './icons';

interface StatsImageProps {
  stats: GitHubStats;
  backgroundImageUrl: string;
  onReset: () => void;
}

const StatsImage: React.FC<StatsImageProps> = ({ stats, backgroundImageUrl, onReset }) => {
  const imageRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const handleDownload = useCallback(() => {
    if (imageRef.current === null) {
      return;
    }
    setIsDownloading(true);
    (window as any).htmlToImage.toPng(imageRef.current, { 
      cacheBust: true, 
      pixelRatio: 2.5, // for better resolution
    })
      .then((dataUrl: string) => {
        const link = document.createElement('a');
        link.download = `github-review-${stats.username}-yearly.png`;
        link.href = dataUrl;
        link.click();
        setIsDownloading(false);
      })
      .catch((err: Error) => {
        console.error('oops, something went wrong!', err);
        setIsDownloading(false);
      });
  }, [stats.username]);

  const statsGrid = [
    { label: 'Contributions', value: formatNumber(stats.totalContributions) },
    { label: 'Followers', value: formatNumber(stats.followers) },
    { label: 'Commits', value: formatNumber(stats.totalCommits) },
    { label: 'Stars Earned', value: formatNumber(stats.totalStars) },
    { label: 'Pull Requests', value: formatNumber(stats.totalPRs) },
    { label: 'Issues Opened', value: formatNumber(stats.issuesOpened) },
  ];

  const getTitle = () => {
    return `${new Date().getFullYear()} Year in Review`;
  }

  return (
    <div className="p-4 md:p-6">
        <div 
          ref={imageRef} 
          className="relative w-full aspect-[9/16] overflow-hidden rounded-lg bg-gray-900 bg-cover bg-center font-sans" 
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}>
            <div className="absolute inset-0 bg-black/70 p-6 flex flex-col text-white">
                <header className="flex justify-between items-center">
                    <div className="flex flex-col">
                        <GitHubIcon className="w-10 h-10 text-white" />
                        <p className="font-bold text-lg tracking-wider">GitHub</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <h2 className="text-2xl font-bold tracking-wide">{stats.username}</h2>
                            <p className="text-sm text-gray-300">{getTitle()}</p>
                        </div>
                        <img 
                            src={stats.avatarUrl} 
                            alt={`${stats.username}'s avatar`} 
                            className="w-14 h-14 rounded-full border-2 border-white/50 object-cover" 
                        />
                    </div>
                </header>
                
                <div className="flex-grow flex flex-col justify-center py-2 space-y-3">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                      {statsGrid.map(item => (
                        <StatItem key={item.label} label={item.label} value={item.value} />
                      ))}
                  </div>

                  <div className="text-center">
                     <div className="mb-1">
                         <p className="text-xs text-gray-400 uppercase tracking-widest">Contribution Graph</p>
                     </div>
                     <div
                        className="w-full text-white [&>svg]:w-full [&>svg]:h-auto border border-white/10 rounded-md p-2 bg-white/5"
                        dangerouslySetInnerHTML={{ __html: stats.contributionGraphSvg }}
                    />
                  </div>
                  
                  <div className="text-center">
                     <div className="mb-1">
                         <p className="text-xs text-gray-400 uppercase tracking-widest">Contribution Types</p>
                     </div>
                     <RadarChart data={stats.contributionDistribution} />
                  </div>
                </div>

                <footer className="space-y-3">
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Top Languages</p>
                        <div className="flex flex-wrap gap-2">
                            {(stats.topLanguages || []).slice(0, 5).map(lang => (
                                <span key={lang.name} className="bg-white/10 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lang.color }}></span>
                                    {lang.name}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Top Repositories</p>
                        <div className="space-y-1">
                            {(stats.repositoriesContributed || []).slice(0, 3).map(repo => (
                                <div key={repo.name} className="bg-white/10 text-xs font-medium px-3 py-1.5 rounded-md flex items-center justify-between">
                                    <span className="truncate pr-2">{repo.name}</span>
                                    <span className="flex items-center gap-1 text-gray-300 flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        {formatNumber(repo.stargazerCount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </footer>
            </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-4">
             <button
                onClick={onReset}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors"
            >
                <BackIcon className="w-5 h-5"/>
                Create New
            </button>
            <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors disabled:bg-indigo-800 disabled:cursor-not-allowed"
            >
                {isDownloading ? (
                    <>
                        <LoaderIcon className="w-5 h-5 animate-spin"/>
                        <span>Downloading...</span>
                    </>
                ) : (
                    <>
                        <DownloadIcon className="w-5 h-5"/>
                        <span>Download Image</span>
                    </>
                )}
            </button>
        </div>
    </div>
  );
};

export default StatsImage;