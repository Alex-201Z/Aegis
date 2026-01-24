import { useMemo } from 'react';

interface ScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function ScoreRing({ score, size = 'md', showLabel = true }: ScoreRingProps) {
  const { color, label } = useMemo(() => {
    if (score >= 80) return { color: '#10b981', label: 'Excellent' };
    if (score >= 60) return { color: '#f59e0b', label: 'Good' };
    if (score >= 40) return { color: '#f97316', label: 'Fair' };
    return { color: '#ef4444', label: 'At Risk' };
  }, [score]);

  const dimensions = {
    sm: { size: 80, stroke: 6, fontSize: 'text-lg' },
    md: { size: 120, stroke: 8, fontSize: 'text-2xl' },
    lg: { size: 160, stroke: 10, fontSize: 'text-4xl' },
  };

  const { size: svgSize, stroke, fontSize } = dimensions[size];
  const radius = (svgSize - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={svgSize} height={svgSize} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="none"
          className="text-aegis-border"
        />
        {/* Progress circle */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 6px ${color})`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`${fontSize} font-bold`} style={{ color }}>
          {score}
        </span>
        {showLabel && (
          <span className="text-xs text-gray-400 mt-1">{label}</span>
        )}
      </div>
    </div>
  );
}
