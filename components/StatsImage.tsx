import React, { useRef, useCallback } from 'react';
import type { GitHubStats, TimeFrame } from '../types';
import StatItem from './StatItem';
import RadarChart from './RadarChart';
import { BackIcon, GitHubIcon } from './icons';

interface StatsImageProps {
  stats: GitHubStats;
  backgroundImageUrl: string;
  onReset: () => void;
  timeFrame: TimeFrame;
  date: Date;
}

const StatsImage: React.FC<StatsImageProps> = ({ stats, backgroundImageUrl, onReset, timeFrame, date }) => {
  const imageRef = useRef<HTMLDivElement>(null);

  const formatNumber = (num: number): string => {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getTitle = () => {
    if (timeFrame === 'daily') {
      return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    if (timeFrame === 'monthly') {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }
    return `${date.getFullYear()} Review`;
  };
  
  const allStats = [
    { label: 'Commits', value: formatNumber(stats.totalCommits) },
    { label: 'Pull Requests', value: formatNumber(stats.totalPRs) },
    { label: 'Issues Opened', value: formatNumber(stats.issuesOpened) },
    { label: 'Stars Earned', value: formatNumber(stats.totalStars) },
    { label: 'Followers', value: formatNumber(stats.followers) },
  ];

  const renderCharts = () => {
    if (timeFrame === 'daily') return null;

    if (timeFrame === 'monthly') {
      return (
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <p className="mb-1 text-xs text-gray-300 uppercase tracking-widest">Contribution Graph</p>
            <div
              className="rounded-md p-2 bg-black/20 inline-block backdrop-blur-sm"
              dangerouslySetInnerHTML={{ __html: stats.contributionGraphSvg }}
            />
          </div>
          <div className="text-center">
            <p className="mb-1 text-xs text-gray-300 uppercase tracking-widest">Contribution Types</p>
            <RadarChart data={stats.contributionDistribution} />
          </div>
        </div>
      );
    }
    
    // Yearly
    return (
      <div className="space-y-6">
        <div className="text-center">
          <p className="mb-1 text-xs text-gray-300 uppercase tracking-widest">Contribution Graph</p>
          <div
            className="w-full rounded-md p-2 bg-black/20 backdrop-blur-sm"
            dangerouslySetInnerHTML={{ __html: stats.contributionGraphSvg }}
          />
        </div>
        <div className="text-center">
          <p className="mb-1 text-xs text-gray-300 uppercase tracking-widest">Contribution Types</p>
          <RadarChart data={stats.contributionDistribution} />
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6">
        <div 
          ref={imageRef} 
          className="relative w-full aspect-[9/16] overflow-hidden rounded-lg bg-gray-900 bg-cover bg-center font-sans" 
          style={{ 
            backgroundImage: `url(${backgroundImageUrl})`,
          }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60"></div>
            
            <div className="absolute inset-0 p-6 flex flex-col text-white" style={{ textShadow: '0 2px 5px rgba(0,0,0,0.5)' }}>
                <header className="flex-shrink-0">
                   <div className="flex items-center gap-3">
                        <img 
                            src={stats.avatarUrl} 
                            alt={`${stats.username}'s avatar`} 
                            className="w-12 h-12 rounded-full border-2 border-white/50 object-cover" 
                        />
                        <div>
                            <h2 className="text-xl font-bold tracking-wide">{stats.username}</h2>
                            <p className="text-xs text-gray-300">{getTitle()}</p>
                        </div>
                    </div>
                </header>
                
                 <main className="flex-grow flex flex-col justify-between py-4">
                  {/* Hero Stat & Secondary Stats */}
                  <div className="flex items-start justify-between">
                    <div className="w-2/3">
                      <p className="text-lg uppercase tracking-widest text-gray-300 font-medium">Contributions</p>
                      <p className="text-8xl font-bold tracking-tighter" style={{color: '#f97316'}}>{formatNumber(stats.totalContributions)}</p>
                    </div>

                    <div className="w-1/3 space-y-3 text-right">
                       {allStats.map(item => (
                        <StatItem key={item.label} label={item.label} value={item.value} align="right" />
                      ))}
                    </div>
                  </div>
                  
                  {/* Middle Content */}
                  <div className="space-y-6">
                      <div className="flex flex-col items-center space-y-4">
                           <div>
                              <p className="text-xs text-center text-gray-300 uppercase tracking-widest mb-2">Top Languages</p>
                              <div className="flex flex-wrap gap-2 justify-center max-w-xs">
                                  {(stats.topLanguages || []).slice(0, 5).map(lang => (
                                      <span key={lang.name} className="bg-black/20 backdrop-blur-sm text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-2">
                                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lang.color }}></span>
                                          {lang.name}
                                      </span>
                                  ))}
                              </div>
                          </div>
                          <div>
                              <p className="text-xs text-center text-gray-300 uppercase tracking-widest mb-2">Top Repositories</p>
                              <div className="space-y-1 w-full max-w-xs">
                                  {(stats.repositoriesContributed || []).slice(0, 3).map(repo => (
                                      <div key={repo.name} className="bg-black/20 backdrop-blur-sm text-xs font-medium px-3 py-1.5 rounded-md flex items-center justify-between">
                                          <span className="truncate pr-2">{repo.name}</span>
                                          <span className="flex items-center gap-1 text-gray-300 flex-shrink-0">
                                              <svg xmlns="http://www.w.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                              </svg>
                                              {formatNumber(repo.stargazerCount)}
                                          </span>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                      {renderCharts()}
                  </div>
                </main>

                <footer className="flex-shrink-0">
                    <div className="pt-4">
                        <GitHubIcon className="w-8 h-8 text-white/80 mx-auto" />
                    </div>
                </footer>
            </div>
        </div>

        <div className="mt-6 flex justify-center">
             <button
                onClick={onReset}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors"
            >
                <BackIcon className="w-5 h-5"/>
                Create New
            </button>
        </div>
    </div>
  );
};

export default StatsImage;