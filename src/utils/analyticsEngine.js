/**
 * Analytics Engine - Calculate metrics from board data
 */

// Status colors from Monday.com palette
const STATUS_COLORS = {
  0: '#c4c4c4',   // Grey
  1: '#fdab3d',   // Orange
  2: '#00c875',   // Green
  3: '#e2445c',   // Red
  4: '#0086c0',   // Blue
  5: '#a25ddc',   // Purple
  6: '#037f4c',   // Dark Green
  7: '#579bfc',   // Light Blue
  8: '#caa35e',   // Gold
  9: '#9cd326',   // Lime
  10: '#cab641',  // Yellow
  11: '#ff158a',  // Pink
  12: '#ff5ac4',  // Light Pink
  13: '#bb3354',  // Dark Red
  14: '#225091',  // Navy
};

/**
 * Calculate basic board statistics
 */
export function calculateBoardStats(items, columns) {
  const now = new Date();
  const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  // Total items
  const totalItems = items.length;

  // Items created this week
  const itemsThisWeek = items.filter(item => {
    const createdAt = new Date(item.created_at);
    return createdAt >= oneWeekAgo;
  }).length;

  // Items created this month
  const itemsThisMonth = items.filter(item => {
    const createdAt = new Date(item.created_at);
    return createdAt >= oneMonthAgo;
  }).length;

  // Items updated this week
  const updatedThisWeek = items.filter(item => {
    const updatedAt = new Date(item.updated_at);
    return updatedAt >= oneWeekAgo;
  }).length;

  // Stale items (not updated in 14+ days)
  const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);
  const staleItems = items.filter(item => {
    const updatedAt = new Date(item.updated_at);
    return updatedAt < twoWeeksAgo;
  }).length;

  return {
    totalItems,
    itemsThisWeek,
    itemsThisMonth,
    updatedThisWeek,
    staleItems,
    stalePercentage: totalItems > 0 ? Math.round((staleItems / totalItems) * 100) : 0,
  };
}

/**
 * Calculate status distribution from a status column
 */
export function calculateStatusDistribution(items, statusColumnId, columns) {
  const statusColumn = columns.find(col => col.id === statusColumnId);
  if (!statusColumn) return [];

  // Parse status labels from settings
  let statusLabels = {};
  try {
    const settings = JSON.parse(statusColumn.settings_str || '{}');
    statusLabels = settings.labels || {};
  } catch (e) {}

  // Count items per status
  const distribution = {};

  items.forEach(item => {
    const statusValue = item.column_values.find(cv => cv.id === statusColumnId);
    const statusText = statusValue?.text || 'No Status';

    if (!distribution[statusText]) {
      // Try to get color from value
      let color = '#c4c4c4';
      try {
        const parsed = JSON.parse(statusValue?.value || '{}');
        if (parsed.index !== undefined) {
          color = STATUS_COLORS[parsed.index % Object.keys(STATUS_COLORS).length] || '#c4c4c4';
        }
      } catch (e) {}

      distribution[statusText] = {
        label: statusText,
        count: 0,
        color,
      };
    }
    distribution[statusText].count++;
  });

  // Convert to array and sort by count
  return Object.values(distribution).sort((a, b) => b.count - a.count);
}

/**
 * Calculate items by group
 */
export function calculateGroupDistribution(items) {
  const distribution = {};

  items.forEach(item => {
    const groupTitle = item.group?.title || 'No Group';
    const groupColor = item.group?.color || '#c4c4c4';

    if (!distribution[groupTitle]) {
      distribution[groupTitle] = {
        label: groupTitle,
        count: 0,
        color: groupColor,
      };
    }
    distribution[groupTitle].count++;
  });

  return Object.values(distribution).sort((a, b) => b.count - a.count);
}

/**
 * Calculate items created per day (last 30 days)
 */
export function calculateCreationTimeline(items, days = 30) {
  const now = new Date();
  const timeline = [];

  // Initialize all days with 0
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    timeline.push({
      date: dateStr,
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: 0,
    });
  }

  // Count items per day
  items.forEach(item => {
    const createdDate = new Date(item.created_at).toISOString().split('T')[0];
    const dayEntry = timeline.find(d => d.date === createdDate);
    if (dayEntry) {
      dayEntry.count++;
    }
  });

  return timeline;
}

/**
 * Find overdue items (date column in the past with incomplete status)
 */
export function findOverdueItems(items, dateColumnId, statusColumnId, completedStatuses = []) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return items.filter(item => {
    // Get date value
    const dateValue = item.column_values.find(cv => cv.id === dateColumnId);
    if (!dateValue?.text) return false;

    const itemDate = new Date(dateValue.text);
    if (isNaN(itemDate.getTime())) return false;
    if (itemDate >= now) return false; // Not overdue

    // Check if completed
    if (statusColumnId && completedStatuses.length > 0) {
      const statusValue = item.column_values.find(cv => cv.id === statusColumnId);
      const statusText = statusValue?.text || '';
      if (completedStatuses.includes(statusText.toLowerCase())) {
        return false; // Is completed
      }
    }

    return true;
  }).map(item => {
    const dateValue = item.column_values.find(cv => cv.id === dateColumnId);
    const dueDate = new Date(dateValue.text);
    const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));

    return {
      id: item.id,
      name: item.name,
      dueDate: dateValue.text,
      daysOverdue,
      group: item.group?.title || 'No Group',
    };
  }).sort((a, b) => b.daysOverdue - a.daysOverdue);
}

/**
 * Calculate average time in each status
 */
export function calculateAverageTimeInStatus(items, statusColumnId) {
  // Note: This is a simplified version that estimates based on updated_at
  // For accurate tracking, would need activity log access
  const statusTimes = {};

  items.forEach(item => {
    const statusValue = item.column_values.find(cv => cv.id === statusColumnId);
    const statusText = statusValue?.text || 'No Status';

    const createdAt = new Date(item.created_at);
    const updatedAt = new Date(item.updated_at);
    const timeInStatus = updatedAt - createdAt;

    if (!statusTimes[statusText]) {
      statusTimes[statusText] = {
        label: statusText,
        totalTime: 0,
        count: 0,
      };
    }
    statusTimes[statusText].totalTime += timeInStatus;
    statusTimes[statusText].count++;
  });

  // Calculate averages
  return Object.values(statusTimes).map(status => ({
    label: status.label,
    averageDays: status.count > 0
      ? Math.round(status.totalTime / status.count / (1000 * 60 * 60 * 24) * 10) / 10
      : 0,
    count: status.count,
  })).sort((a, b) => b.averageDays - a.averageDays);
}

/**
 * Get top stale items (not updated longest)
 */
export function getStaleItems(items, limit = 10) {
  const now = new Date();

  return items
    .map(item => {
      const updatedAt = new Date(item.updated_at);
      const daysSinceUpdate = Math.floor((now - updatedAt) / (1000 * 60 * 60 * 24));

      return {
        id: item.id,
        name: item.name,
        daysSinceUpdate,
        lastUpdated: item.updated_at,
        group: item.group?.title || 'No Group',
      };
    })
    .sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate)
    .slice(0, limit);
}

/**
 * Find the primary status column
 */
export function findStatusColumn(columns) {
  // Look for columns named status, Status, or of type status/color
  const statusColumn = columns.find(col =>
    col.type === 'status' ||
    col.type === 'color' ||
    col.title.toLowerCase() === 'status'
  );
  return statusColumn?.id || null;
}

/**
 * Find date columns
 */
export function findDateColumns(columns) {
  return columns.filter(col => col.type === 'date');
}
