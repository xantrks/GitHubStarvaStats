import React from 'react';
import type { ContributionDistribution } from '../types';

interface RadarChartProps {
  data: ContributionDistribution;
}

const RadarChart: React.FC<RadarChartProps> = ({ data }) => {
  const size = 200;
  const center = size / 2;
  const maxRadius = size / 2 - 35; // leave space for labels

  const getPoint = (axis: keyof ContributionDistribution, percentage: number): { x: number; y: number } => {
    const value = (percentage / 100) * maxRadius;
    switch (axis) {
      case 'codeReviews': return { x: center, y: center - value }; // Top
      case 'issues': return { x: center + value, y: center };      // Right
      case 'pullRequests': return { x: center, y: center + value }; // Bottom
      case 'commits': return { x: center - value, y: center };     // Left
      default: return { x: center, y: center };
    }
  };

  const points = {
    codeReviews: getPoint('codeReviews', data.codeReviews),
    issues: getPoint('issues', data.issues),
    pullRequests: getPoint('pullRequests', data.pullRequests),
    commits: getPoint('commits', data.commits),
  };

  const polygonPoints = `${points.codeReviews.x},${points.codeReviews.y} ${points.issues.x},${points.issues.y} ${points.pullRequests.x},${points.pullRequests.y} ${points.commits.x},${points.commits.y}`;

  const orangeColor = "#F97316"; // A vibrant orange
  const axisColor = "rgba(249, 115, 22, 0.4)";
  const polygonFillColor = "rgba(249, 115, 22, 0.2)";
  const polygonStrokeColor = orangeColor;
  const pointFillColor = orangeColor;
  const pointStrokeColor = orangeColor;

  return (
    <div className="w-full max-w-[200px] mx-auto">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto">
            {/* Axes */}
            <line x1={center} y1={15} x2={center} y2={size - 15} stroke={axisColor} strokeWidth="1.5" />
            <line x1={15} y1={center} x2={size - 15} y2={center} stroke={axisColor} strokeWidth="1.5" />

            {/* Polygon */}
            <polygon points={polygonPoints} fill={polygonFillColor} stroke={polygonStrokeColor} strokeWidth="2" />

            {/* Points */}
            {Object.values(points).map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="4" fill={pointFillColor} stroke={pointStrokeColor} strokeWidth="1.5" />
            ))}

            {/* Labels */}
            <text x={center} y="15" textAnchor="middle" fill="white" fontSize="11" className="font-semibold">
                {data.codeReviews}%
                <tspan x={center} dy="1.2em" fontSize="10" className="font-normal opacity-80">Code review</tspan>
            </text>
            <text x={size - 15} y={center + 4} textAnchor="end" fill="white" fontSize="11" className="font-semibold">
                {data.issues}%
                <tspan x={size - 15} dy="1.2em" fontSize="10" className="font-normal opacity-80">Issues</tspan>
            </text>
            <text x={center} y={size - 15} textAnchor="middle" fill="white" fontSize="11" className="font-semibold">
                {data.pullRequests}%
                <tspan x={center} dy="1.2em" fontSize="10" className="font-normal opacity-80">Pull requests</tspan>
            </text>
            <text x="15" y={center + 4} textAnchor="start" fill="white" fontSize="11" className="font-semibold">
                {data.commits}%
                <tspan x="15" dy="1.2em" fontSize="10" className="font-normal opacity-80">Commits</tspan>
            </text>
        </svg>
    </div>
  );
};

export default RadarChart;
