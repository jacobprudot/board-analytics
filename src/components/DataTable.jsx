import React, { useState } from 'react';
import { Tooltip } from 'monday-ui-react-core';

function DataTable({ data, title, columns, isDarkMode, maxRows = 10, emptyMessage = 'No data' }) {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('desc');

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
        <div className="empty-state">{emptyMessage}</div>
      </div>
    );
  }

  // Sort data
  let sortedData = [...data];
  if (sortColumn) {
    sortedData.sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal || '').toLowerCase();
      const bStr = String(bVal || '').toLowerCase();
      return sortDirection === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }

  const displayData = sortedData.slice(0, maxRows);

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('desc');
    }
  };

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
        <span style={{
          fontSize: 12,
          color: isDarkMode ? '#9699a6' : '#676879',
        }}>
          {data.length} items
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="analytics-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  style={{
                    cursor: col.sortable !== false ? 'pointer' : 'default',
                    userSelect: 'none',
                  }}
                >
                  {col.label}
                  {sortColumn === col.key && (
                    <span style={{ marginLeft: 4 }}>
                      {sortDirection === 'asc' ? '\u2191' : '\u2193'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, rowIndex) => (
              <tr key={row.id || rowIndex}>
                {columns.map(col => (
                  <td
                    key={col.key}
                    style={{
                      color: isDarkMode ? '#c5c7d0' : '#323338',
                    }}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length > maxRows && (
        <div style={{
          marginTop: 12,
          fontSize: 12,
          color: isDarkMode ? '#9699a6' : '#676879',
          textAlign: 'center',
        }}>
          Showing {maxRows} of {data.length}
        </div>
      )}
    </div>
  );
}

export default DataTable;
