import React from 'react';
import { Tooltip } from 'monday-ui-react-core';

function MetricCard({ title, value, subtitle, icon, trend, trendLabel, isDarkMode, color }) {
  const getTrendColor = () => {
    if (!trend) return 'inherit';
    if (trend > 0) return '#00c875'; // Green
    if (trend < 0) return '#e2445c'; // Red
    return '#676879';
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend > 0) return '\u2191'; // Up arrow
    if (trend < 0) return '\u2193'; // Down arrow
    return '\u2192'; // Right arrow
  };

  return (
    <div className="analytics-card" style={{ height: '100%' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
      }}>
        <span style={{
          fontSize: 13,
          fontWeight: 500,
          color: isDarkMode ? '#c5c7d0' : '#676879',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {title}
        </span>
        {icon && (
          <span style={{ fontSize: 20 }}>{icon}</span>
        )}
      </div>

      <div style={{
        fontSize: 36,
        fontWeight: 700,
        color: color || (isDarkMode ? '#ffffff' : '#323338'),
        lineHeight: 1,
        marginBottom: 8,
      }}>
        {value}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        {subtitle && (
          <span style={{
            fontSize: 13,
            color: isDarkMode ? '#9699a6' : '#676879',
          }}>
            {subtitle}
          </span>
        )}

        {trend !== undefined && (
          <Tooltip content={trendLabel || `${trend > 0 ? '+' : ''}${trend}% vs last period`}>
            <span style={{
              fontSize: 12,
              fontWeight: 600,
              color: getTrendColor(),
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}>
              {getTrendIcon()} {Math.abs(trend)}%
            </span>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

export default MetricCard;
