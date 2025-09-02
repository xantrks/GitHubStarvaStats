import type { GitHubStats, ContributionDistribution, TimeFrame } from '../types';

const GITHUB_API_URL = 'https://api.github.com/graphql';

const GITHUB_COLOR_MAP: { [key: string]: string } = {
    '#ebedf0': 'rgba(255, 255, 255, 0.15)',
    '#9be9a8': 'rgba(255, 255, 255, 0.4)',
    '#40c463': 'rgba(255, 255, 255, 0.6)',
    '#30a14e': 'rgba(255, 255, 255, 0.8)',
    '#216e39': 'rgba(255, 255, 255, 1.0)',
};

const generateContributionGraph = (weeks: any[]): string => {
    if (!weeks || weeks.length === 0) return '<svg width="0" height="0"></svg>';
    
    // Smaller rects and adjusted spacing for a more compact graph
    const rectSize = 8;
    const rectGap = 2;
    const textHeight = 20; // Space for month labels

    const cellWidth = rectSize + rectGap;
    const width = cellWidth * weeks.length - rectGap;
    const height = cellWidth * 7 - rectGap + textHeight;
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthLabels: { x: number; label: string }[] = [];
    let lastMonth = -1;

    // Identify where each month starts
    weeks.forEach((week, weekIndex) => {
        const firstDay = new Date(week.firstDay);
        const month = firstDay.getUTCMonth();
        if (month !== lastMonth) {
            monthLabels.push({
                x: weekIndex * cellWidth,
                label: monthNames[month],
            });
            lastMonth = month;
        }
    });

    const monthLabelSvg = monthLabels.map(item => 
        `<text x="${item.x}" y="${textHeight - 8}" fill="rgba(255, 255, 255, 0.7)" font-size="10">${item.label}</text>`
    ).join('');

    const rects = weeks.flatMap((week, weekIndex) =>
        week.contributionDays.map((day: any, dayIndex: number) => {
            const x = weekIndex * cellWidth;
            const y = dayIndex * cellWidth + textHeight; // Offset by textHeight
            const color = GITHUB_COLOR_MAP[day.color.toLowerCase()] || 'rgba(255, 255, 255, 0.15)';
            return `<rect x="${x}" y="${y}" width="${rectSize}" height="${rectSize}" fill="${color}" rx="2" ry="2" />`;
        })
    ).join('');

    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${monthLabelSvg}${rects}</svg>`;
};


export const fetchRealGitHubStats = async (username: string, token: string, options: { timeFrame: TimeFrame; date: Date }): Promise<GitHubStats> => {
    if (!token) {
        throw new Error("A GitHub Personal Access Token is required for accurate stats.");
    }
    
    const { timeFrame, date } = options;
    let from: string, to: string;
    
    const selectedDate = new Date(date); // Make a copy to avoid mutation

    if (timeFrame === 'daily') {
        from = new Date(selectedDate.setUTCHours(0, 0, 0, 0)).toISOString();
        to = new Date(selectedDate.setUTCHours(23, 59, 59, 999)).toISOString();
    } else if (timeFrame === 'monthly') {
        const year = selectedDate.getUTCFullYear();
        const month = selectedDate.getUTCMonth();
        from = new Date(Date.UTC(year, month, 1)).toISOString();
        to = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999)).toISOString();
    } else { // yearly
        const year = selectedDate.getUTCFullYear();
        from = new Date(Date.UTC(year, 0, 1)).toISOString();
        to = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)).toISOString();
    }

    const query = `
        query($username: String!, $from: DateTime!, $to: DateTime!) {
          user(login: $username) {
            login
            avatarUrl
            followers {
              totalCount
            }
            issues(first: 1, filterBy: {since: $from}, states: [OPEN, CLOSED]) {
              totalCount
            }
            contributionsCollection(from: $from, to: $to) {
              totalCommitContributions
              totalPullRequestContributions
              totalIssueContributions
              totalPullRequestReviewContributions
              contributionCalendar {
                totalContributions
                weeks {
                  firstDay
                  contributionDays {
                    color
                  }
                }
              }
              commitContributionsByRepository(maxRepositories: 5) {
                repository {
                  nameWithOwner
                  stargazerCount
                  primaryLanguage {
                    name
                    color
                  }
                }
              }
            }
            repositoriesContributedTo(first: 3, contributionTypes: [COMMIT, PULL_REQUEST, REPOSITORY], orderBy: {field: STARGAZERS, direction: DESC}) {
              nodes {
                nameWithOwner
                stargazerCount
              }
            }
            repositories(first: 100, ownerAffiliations: [OWNER], orderBy: {field: STARGAZERS, direction: DESC}) {
              nodes {
                stargazerCount
              }
            }
            topRepositories(first: 5, orderBy: {field: STARGAZERS, direction: DESC}) {
               nodes {
                 primaryLanguage {
                   name
                   color
                 }
               }
            }
          }
        }
    `;

    const response = await fetch(GITHUB_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `bearer ${token}`
        },
        body: JSON.stringify({
            query,
            variables: {
                username,
                from,
                to,
            },
        }),
    });

    const json = await response.json();

    if (json.errors) {
        console.error("GitHub API Errors:", json.errors);
        throw new Error(json.errors[0].message || 'Failed to fetch data from GitHub API.');
    }

    const userData = json.data.user;

    if (!userData) {
        throw new Error(`User "${username}" not found on GitHub.`);
    }
    
    let repositoriesContributed;
    let topLanguages;

    if (timeFrame === 'daily') {
        const dailyRepos = userData.contributionsCollection?.commitContributionsByRepository ?? [];
        repositoriesContributed = dailyRepos.map((contrib: any) => ({
            name: contrib.repository.nameWithOwner,
            stargazerCount: contrib.repository.stargazerCount,
        }));
        
        const dailyLangsMap = new Map<string, { count: number; color: string }>();
        dailyRepos.forEach((contrib: any) => {
            const repo = contrib.repository;
            if (repo?.primaryLanguage) {
                const lang = repo.primaryLanguage.name;
                const existing = dailyLangsMap.get(lang) || { count: 0, color: repo.primaryLanguage.color };
                dailyLangsMap.set(lang, { count: existing.count + 1, color: existing.color });
            }
        });

        topLanguages = Array.from(dailyLangsMap.entries())
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5)
            .map(([name, { color }]) => ({ name, color }));

    } else {
         repositoriesContributed = (userData.repositoriesContributedTo?.nodes ?? []).map((repo:any) => ({
            name: repo?.nameWithOwner,
            stargazerCount: repo?.stargazerCount ?? 0
        }));

        const topLanguagesMap = new Map<string, { count: number; color: string }>();
        (userData.topRepositories?.nodes ?? []).forEach((repo: any) => {
            if (repo?.primaryLanguage) {
                const lang = repo.primaryLanguage.name;
                const existing = topLanguagesMap.get(lang) || { count: 0, color: repo.primaryLanguage.color };
                topLanguagesMap.set(lang, { count: existing.count + 1, color: existing.color });
            }
        });

        topLanguages = Array.from(topLanguagesMap.entries())
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5)
            .map(([name, { color }]) => ({ name, color }));
    }


    const totalStars = (userData.repositories?.nodes ?? []).reduce((acc: number, repo: { stargazerCount: number }) => acc + (repo?.stargazerCount ?? 0), 0);

    const commits = userData.contributionsCollection?.totalCommitContributions ?? 0;
    const issues = userData.contributionsCollection?.totalIssueContributions ?? 0;
    const pullRequests = userData.contributionsCollection?.totalPullRequestContributions ?? 0;
    const codeReviews = userData.contributionsCollection?.totalPullRequestReviewContributions ?? 0;

    const totalDistribution = commits + issues + pullRequests + codeReviews;

    const roundTo100 = (nums: number[]): number[] => {
        let sum = nums.reduce((acc, val) => acc + val, 0);
        if (sum === 0) return nums;
        const diff = 100 - sum;
        const sortedIndices = nums.map((val, index) => index).sort((a, b) => (nums[b] % 1) - (nums[a] % 1));
        for (let i = 0; i < diff; i++) {
            nums[sortedIndices[i]]++;
        }
        for (let i = 0; i < -diff; i++) {
            nums[sortedIndices[nums.length - 1 - i]]--;
        }
        return nums.map(Math.round);
    };
    
    let percentages = [
        totalDistribution > 0 ? (commits / totalDistribution) * 100 : 0,
        totalDistribution > 0 ? (issues / totalDistribution) * 100 : 0,
        totalDistribution > 0 ? (pullRequests / totalDistribution) * 100 : 0,
        totalDistribution > 0 ? (codeReviews / totalDistribution) * 100 : 0,
    ];

    const roundedPercentages = roundTo100(percentages.map(p => Math.floor(p)));

    const contributionDistribution: ContributionDistribution = {
        commits: roundedPercentages[0],
        issues: roundedPercentages[1],
        pullRequests: roundedPercentages[2],
        codeReviews: roundedPercentages[3],
    };


    const stats: GitHubStats = {
        username: userData.login,
        avatarUrl: userData.avatarUrl,
        totalContributions: userData.contributionsCollection?.contributionCalendar?.totalContributions ?? 0,
        totalPRs: userData.contributionsCollection?.totalPullRequestContributions ?? 0,
        totalCommits: userData.contributionsCollection?.totalCommitContributions ?? 0,
        followers: userData.followers?.totalCount ?? 0,
        issuesOpened: userData.issues?.totalCount ?? 0,
        totalStars,
        repositoriesContributed,
        topLanguages,
        contributionGraphSvg: generateContributionGraph(userData.contributionsCollection?.contributionCalendar?.weeks ?? []),
        contributionDistribution,
    };

    return stats;
};