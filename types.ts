export interface ContributionDistribution {
  commits: number;
  issues: number;
  pullRequests: number;
  codeReviews: number;
}

export interface GitHubStats {
  username: string;
  avatarUrl: string;
  totalContributions: number;
  totalPRs: number;
  totalCommits: number;
  followers: number;
  totalStars: number;
  issuesOpened: number;
  topLanguages: { name: string; color: string }[];
  repositoriesContributed: {
    name: string;
    stargazerCount: number;
  }[];
  contributionGraphSvg: string;
  contributionDistribution: ContributionDistribution;
}

export type TimeFrame = 'daily' | 'monthly' | 'yearly';
