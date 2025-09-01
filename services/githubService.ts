import type { GitHubStats, ContributionDistribution } from '../types';

const GITHUB_API_URL = 'https://api.github.com/graphql';

const GITHUB_COLOR_MAP: { [key: string]: string } = {
    '#ebedf0': 'rgba(255, 255, 255, 0.05)', // No contributions
    '#9be9a8': 'rgba(255, 255, 255, 0.2)',
    '#40c463': 'rgba(255, 255, 255, 0.4)',
    '#30a14e': 'rgba(255, 255, 255, 0.7)',
    '#216e39': 'rgba(255, 255, 255, 1.0)',
};

const generateContributionGraph = (weeks: any[]): string => {
    const rectSize = 10;
    const rectGap = 3;
    const width = (rectSize + rectGap) * 53;
    const height = (rectSize + rectGap) * 7;

    const rects = weeks.flatMap((week, weekIndex) =>
        week.contributionDays.map((day: any, dayIndex: number) => {
            const x = weekIndex * (rectSize + rectGap);
            const y = dayIndex * (rectSize + rectGap);
            const color = GITHUB_COLOR_MAP[day.color.toLowerCase()] || 'rgba(255, 255, 255, 0.05)';
            return `<rect x="${x}" y="${y}" width="${rectSize}" height="${rectSize}" fill="${color}" rx="2" ry="2" />`;
        })
    ).join('');

    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${rects}</svg>`;
};


export const fetchRealGitHubStats = async (username: string, token: string): Promise<GitHubStats> => {
    if (!token) {
        throw new Error("A GitHub Personal Access Token is required for accurate stats.");
    }
    const to = new Date();
    const from = new Date();
    from.setFullYear(to.getFullYear() - 1);

    const query = `
        query($username: String!, $from: DateTime!, $to: DateTime!) {
          user(login: $username) {
            login
            avatarUrl
            followers {
              totalCount
            }
            issues(first: 1) {
              totalCount
            }
            contributionsCollection(from: $from, to: $to) {
              totalCommitContributions
              totalPullRequestContributions
              totalPullRequestReviewContributions
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
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
                from: from.toISOString(),
                to: to.toISOString(),
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

    const topLanguagesMap = new Map<string, { count: number; color: string }>();
    (userData.topRepositories?.nodes ?? []).forEach((repo: any) => {
        if (repo?.primaryLanguage) {
            const lang = repo.primaryLanguage.name;
            const existing = topLanguagesMap.get(lang) || { count: 0, color: repo.primaryLanguage.color };
            topLanguagesMap.set(lang, { count: existing.count + 1, color: existing.color });
        }
    });

    const topLanguages = Array.from(topLanguagesMap.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5)
        .map(([name, { color }]) => ({ name, color }));

    const totalStars = (userData.repositories?.nodes ?? []).reduce((acc: number, repo: { stargazerCount: number }) => acc + (repo?.stargazerCount ?? 0), 0);

    const commits = userData.contributionsCollection?.totalCommitContributions ?? 0;
    const issues = userData.issues?.totalCount ?? 0;
    const pullRequests = userData.contributionsCollection?.totalPullRequestContributions ?? 0;
    const codeReviews = userData.contributionsCollection?.totalPullRequestReviewContributions ?? 0;

    const totalDistribution = commits + issues + pullRequests + codeReviews;

    // A simple rounding function to ensure percentages sum to 100
    const roundTo100 = (nums: number[]): number[] => {
        let sum = nums.reduce((acc, val) => acc + val, 0);
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
        repositoriesContributed: (userData.repositoriesContributedTo?.nodes ?? []).map((repo:any) => ({
            name: repo?.nameWithOwner,
            stargazerCount: repo?.stargazerCount ?? 0
        })),
        topLanguages,
        contributionGraphSvg: generateContributionGraph(userData.contributionsCollection?.contributionCalendar?.weeks ?? []),
        contributionDistribution,
    };

    return stats;
};