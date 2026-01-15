import mondaySdk from 'monday-sdk-js';

const monday = mondaySdk();
monday.setApiVersion('2024-10');

/**
 * Get all items from a board with their column values and activity
 */
export async function getBoardItems(boardId) {
  const query = `query ($boardId: [ID!]) {
    boards(ids: $boardId) {
      items_page(limit: 500) {
        items {
          id
          name
          created_at
          updated_at
          group {
            id
            title
            color
          }
          column_values {
            id
            type
            text
            value
          }
        }
      }
    }
  }`;

  try {
    const response = await monday.api(query, { variables: { boardId: [boardId] } });
    return response.data.boards[0]?.items_page?.items || [];
  } catch (error) {
    console.error('Error fetching board items:', error);
    throw error;
  }
}

/**
 * Get board columns configuration
 */
export async function getBoardColumns(boardId) {
  const query = `query ($boardId: [ID!]) {
    boards(ids: $boardId) {
      columns {
        id
        title
        type
        settings_str
      }
    }
  }`;

  try {
    const response = await monday.api(query, { variables: { boardId: [boardId] } });
    return response.data.boards[0]?.columns || [];
  } catch (error) {
    console.error('Error fetching board columns:', error);
    throw error;
  }
}

/**
 * Get board activity log
 */
export async function getBoardActivity(boardId, limit = 100) {
  const query = `query ($boardId: [ID!], $limit: Int) {
    boards(ids: $boardId) {
      activity_logs(limit: $limit) {
        id
        event
        data
        created_at
        user_id
      }
    }
  }`;

  try {
    const response = await monday.api(query, { variables: { boardId: [boardId], limit } });
    return response.data.boards[0]?.activity_logs || [];
  } catch (error) {
    console.error('Error fetching board activity:', error);
    return []; // Return empty array on error (activity might require higher permissions)
  }
}

/**
 * Get board info (name, groups, etc.)
 */
export async function getBoardInfo(boardId) {
  const query = `query ($boardId: [ID!]) {
    boards(ids: $boardId) {
      id
      name
      description
      groups {
        id
        title
        color
      }
    }
  }`;

  try {
    const response = await monday.api(query, { variables: { boardId: [boardId] } });
    return response.data.boards[0] || null;
  } catch (error) {
    console.error('Error fetching board info:', error);
    throw error;
  }
}

/**
 * Show a toast notification
 */
export function showNotice(message, type = 'success', timeout = 3000) {
  monday.execute('notice', {
    message,
    type, // success, error, info, warning
    timeout,
  });
}
