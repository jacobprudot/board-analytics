import React, { useState } from 'react';
import { Tooltip } from 'monday-ui-react-core';

function DonutChart({ data, title, isDarkMode, size = 180 }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

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

  const total = data.reduce((sum, d) => sum + d.count, 0);
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 10;
  const innerRadius = radius * 0.6;

  // Calculate arcs
  let currentAngle = -90; // Start from top
  const arcs = data.map((item, index) => {
    const percentage = item.count / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    // Calculate arc path
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const x3 = centerX + innerRadius * Math.cos(endRad);
    const y3 = centerY + innerRadius * Math.sin(endRad);
    const x4 = centerX + innerRadius * Math.cos(startRad);
    const y4 = centerY + innerRadius * Math.sin(startRad);

    const largeArc = angle > 180 ? 1 : 0;

    const path = `
      M ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `;

    return {
      ...item,
      path,
      percentage: Math.round(percentage * 100),
    };
  });

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

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        flexWrap: 'wrap',
      }}>
        {/* Chart */}
        <div style={{ position: 'relative' }}>
          <svg width={size} height={size}>
            {arcs.map((arc, index) => (
              <Tooltip
                key={index}
                content={`${arc.label}: ${arc.count} (${arc.percentage}%)`}
              >
                <path
                  d={arc.path}
                  fill={arc.color || '#0073ea'}
                  stroke={isDarkMode ? '#272a4a' : '#ffffff'}
                  strokeWidth="2"
                  style={{
                    cursor: 'pointer',
                    opacity: hoveredIndex !== null && hoveredIndex !== index ? 0.5 : 1,
                    transition: 'opacity 0.2s ease',
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </Tooltip>
            ))}
          </svg>

          {/* Center text */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: 24,
              fontWeight: 700,
              color: isDarkMode ? '#ffffff' : '#323338',
            }}>
              {total}
            </div>
            <div style={{
              fontSize: 11,
              color: isDarkMode ? '#9699a6' : '#676879',
            }}>
              Total
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          flex: 1,
          minWidth: 120,
        }}>
          {arcs.slice(0, 6).map((arc, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                opacity: hoveredIndex !== null && hoveredIndex !== index ? 0.5 : 1,
                transition: 'opacity 0.2s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                backgroundColor: arc.color || '#0073ea',
                flexShrink: 0,
              }} />
              <span style={{
                fontSize: 12,
                color: isDarkMode ? '#c5c7d0' : '#323338',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
              }}>
                {arc.label}
              </span>
              <span style={{
                fontSize: 12,
                fontWeight: 600,
                color: isDarkMode ? '#ffffff' : '#323338',
              }}>
                {arc.percentage}%
              </span>
            </div>
          ))}
          {arcs.length > 6 && (
            <div style={{
              fontSize: 11,
              color: isDarkMode ? '#9699a6' : '#676879',
            }}>
              +{arcs.length - 6} more
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DonutChart;
