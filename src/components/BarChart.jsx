import React from 'react';
import { Tooltip } from 'monday-ui-react-core';

function BarChart({ data, title, isDarkMode, maxBars = 8, showValues = true }) {
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

  const displayData = data.slice(0, maxBars);
  const maxValue = Math.max(...displayData.map(d => d.count));
  const total = data.reduce((sum, d) => sum + d.count, 0);

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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {displayData.map((item, index) => {
          const percentage = maxValue > 0 ? (item.count / maxValue) * 100 : 0;
          const percentOfTotal = total > 0 ? Math.round((item.count / total) * 100) : 0;

          return (
            <div key={index}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 4,
              }}>
                <Tooltip content={`${percentOfTotal}% of total`}>
                  <span style={{
                    fontSize: 13,
                    color: isDarkMode ? '#c5c7d0' : '#323338',
                    fontWeight: 500,
                    maxWidth: '60%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {item.label}
                  </span>
                </Tooltip>
                {showValues && (
                  <span style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: isDarkMode ? '#ffffff' : '#323338',
                  }}>
                    {item.count}
                  </span>
                )}
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: item.color || '#0073ea',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {data.length > maxBars && (
        <div style={{
          marginTop: 12,
          fontSize: 12,
          color: isDarkMode ? '#9699a6' : '#676879',
          textAlign: 'center',
        }}>
          +{data.length - maxBars} more
        </div>
      )}
    </div>
  );
}

export default BarChart;
