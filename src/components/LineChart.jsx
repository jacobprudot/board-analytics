import React from 'react';
import { Tooltip } from 'monday-ui-react-core';

function LineChart({ data, title, isDarkMode, height = 200 }) {
  if (!data || data.length === 0) {
    return (
      <div className="analytics-card">
        <h3 style={{
          fontSize: 14,
          fontWeight: 600,
          color: isDarkMode ? '#ffffff' : '#323338',
          marginBottom: 16,
        }}>
          {title}
        </h3>
        <div className="empty-state">No data available</div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.count), 1);
  const totalItems = data.reduce((sum, d) => sum + d.count, 0);
  const avgPerDay = (totalItems / data.length).toFixed(1);

  // SVG dimensions
  const padding = { top: 10, right: 10, bottom: 30, left: 40 };
  const chartWidth = 100; // percentage
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate points
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = chartHeight - (d.count / maxValue) * chartHeight;
    return { x, y, ...d };
  });

  // Create path
  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x}% ${p.y + padding.top}`)
    .join(' ');

  // Create area path
  const areaPath = `${linePath} L 100% ${chartHeight + padding.top} L 0% ${chartHeight + padding.top} Z`;

  return (
    <div className="analytics-card">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}>
        <h3 style={{
          fontSize: 14,
          fontWeight: 600,
          color: isDarkMode ? '#ffffff' : '#323338',
          margin: 0,
        }}>
          {title}
        </h3>
        <div style={{
          fontSize: 12,
          color: isDarkMode ? '#9699a6' : '#676879',
        }}>
          Total: {totalItems} | Avg: {avgPerDay}/day
        </div>
      </div>

      <div style={{ position: 'relative', height }}>
        <svg
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
          style={{ width: '100%', height: '100%' }}
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(pct => (
            <line
              key={pct}
              x1="0%"
              y1={padding.top + (chartHeight * (100 - pct) / 100)}
              x2="100%"
              y2={padding.top + (chartHeight * (100 - pct) / 100)}
              stroke={isDarkMode ? '#3d4066' : '#e6e9ef'}
              strokeWidth="0.5"
            />
          ))}

          {/* Area fill */}
          <path
            d={areaPath}
            fill="url(#areaGradient)"
            opacity="0.3"
          />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#0073ea"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />

          {/* Data points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={`${p.x}%`}
              cy={p.y + padding.top}
              r="3"
              fill="#0073ea"
              stroke="#ffffff"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0073ea" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0073ea" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* X-axis labels */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0 || i === data.length - 1).map((d, i) => (
            <span
              key={i}
              style={{
                fontSize: 10,
                color: isDarkMode ? '#9699a6' : '#676879',
              }}
            >
              {d.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LineChart;
