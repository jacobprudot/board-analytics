import React, { useState, useEffect, useMemo } from 'react';
import { useMonday } from './hooks/useMonday';
import { getBoardItems, getBoardColumns, getBoardInfo } from './services/mondayService';
import {
  calculateBoardStats,
  calculateStatusDistribution,
  calculateGroupDistribution,
  calculateCreationTimeline,
  findOverdueItems,
  getStaleItems,
  findStatusColumn,
  findDateColumns,
} from './utils/analyticsEngine';
import {
  Loader,
  Heading,
  Flex,
  Box,
  Dropdown,
  Button,
  TabList,
  Tab,
  TabsContext,
  TabPanel,
  TabPanels,
} from 'monday-ui-react-core';
import { Update } from 'monday-ui-react-core/icons';
import MetricCard from './components/MetricCard';
import BarChart from './components/BarChart';
import LineChart from './components/LineChart';
import DonutChart from './components/DonutChart';
import DataTable from './components/DataTable';

function App() {
  const { monday, context, loading: sdkLoading } = useMonday();
  const [theme, setTheme] = useState('light');

  // Data state
  const [items, setItems] = useState([]);
  const [columns, setColumns] = useState([]);
  const [boardInfo, setBoardInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Settings state
  const [selectedStatusColumn, setSelectedStatusColumn] = useState(null);
  const [selectedDateColumn, setSelectedDateColumn] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Theme handling
  useEffect(() => {
    if (monday) {
      monday.listen('context', (res) => {
        if (res?.data?.theme) {
          setTheme(res.data.theme);
        }
      });
      monday.get('context').then((res) => {
        if (res?.data?.theme) {
          setTheme(res.data.theme);
        }
      });
    }
  }, [monday]);

  // Apply theme
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    if (theme === 'dark' || theme === 'black') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [theme]);

  const isDarkMode = theme === 'dark' || theme === 'black';

  // Load board data
  useEffect(() => {
    if (context?.boardId) {
      loadBoardData();
    }
  }, [context?.boardId]);

  const loadBoardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [itemsData, columnsData, infoData] = await Promise.all([
        getBoardItems(context.boardId),
        getBoardColumns(context.boardId),
        getBoardInfo(context.boardId),
      ]);

      setItems(itemsData);
      setColumns(columnsData);
      setBoardInfo(infoData);

      // Auto-select status column
      const statusCol = findStatusColumn(columnsData);
      if (statusCol) {
        setSelectedStatusColumn(statusCol);
      }

      // Auto-select first date column
      const dateColumns = findDateColumns(columnsData);
      if (dateColumns.length > 0) {
        setSelectedDateColumn(dateColumns[0].id);
      }
    } catch (err) {
      console.error('Error loading board data:', err);
      setError('Failed to load board data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics
  const stats = useMemo(() => calculateBoardStats(items, columns), [items, columns]);

  const statusDistribution = useMemo(() => {
    if (!selectedStatusColumn) return [];
    return calculateStatusDistribution(items, selectedStatusColumn, columns);
  }, [items, selectedStatusColumn, columns]);

  const groupDistribution = useMemo(() => calculateGroupDistribution(items), [items]);

  const creationTimeline = useMemo(() => calculateCreationTimeline(items, 30), [items]);

  const overdueItems = useMemo(() => {
    if (!selectedDateColumn) return [];
    return findOverdueItems(items, selectedDateColumn, selectedStatusColumn, ['done', 'completed', 'closed']);
  }, [items, selectedDateColumn, selectedStatusColumn]);

  const staleItems = useMemo(() => getStaleItems(items, 10), [items]);

  // Column options for dropdowns
  const statusColumnOptions = useMemo(() => {
    return columns
      .filter(col => col.type === 'status' || col.type === 'color')
      .map(col => ({ value: col.id, label: col.title }));
  }, [columns]);

  const dateColumnOptions = useMemo(() => {
    return columns
      .filter(col => col.type === 'date')
      .map(col => ({ value: col.id, label: col.title }));
  }, [columns]);

  // Loading state
  if (sdkLoading || loading) {
    return (
      <Flex
        justify={Flex.justify.CENTER}
        align={Flex.align.CENTER}
        style={{ minHeight: '100vh' }}
      >
        <Loader size={Loader.sizes.LARGE} />
      </Flex>
    );
  }

  // Error state
  if (error) {
    return (
      <Flex
        direction={Flex.directions.COLUMN}
        justify={Flex.justify.CENTER}
        align={Flex.align.CENTER}
        gap={Flex.gaps.MEDIUM}
        style={{ minHeight: '100vh' }}
      >
        <Heading type={Heading.types.H2} value="Error loading data" />
        <p style={{ color: isDarkMode ? '#c5c7d0' : '#676879' }}>{error}</p>
        <Button onClick={loadBoardData}>Try Again</Button>
      </Flex>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <Flex
        justify={Flex.justify.SPACE_BETWEEN}
        align={Flex.align.CENTER}
        style={{ marginBottom: 24 }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src="/logo.png"
              alt="Board Analytics"
              style={{ width: 32, height: 32 }}
            />
            <h1 style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 600,
              color: isDarkMode ? '#ffffff' : '#323338',
            }}>
              Board Analytics
            </h1>
          </div>
          <p style={{
            margin: '4px 0 0 44px',
            color: isDarkMode ? '#c5c7d0' : '#676879',
            fontSize: 14,
          }}>
            {boardInfo?.name || 'Loading...'}
          </p>
        </div>

        <Button
          kind={Button.kinds.TERTIARY}
          leftIcon={Update}
          onClick={loadBoardData}
        >
          Refresh
        </Button>
      </Flex>

      {/* Key Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}>
        <MetricCard
          title="Total Items"
          value={stats.totalItems}
          icon="📋"
          isDarkMode={isDarkMode}
        />
        <MetricCard
          title="Created This Week"
          value={stats.itemsThisWeek}
          subtitle="Last 7 days"
          icon="✨"
          isDarkMode={isDarkMode}
          color="#00c875"
        />
        <MetricCard
          title="Updated This Week"
          value={stats.updatedThisWeek}
          subtitle="Active items"
          icon="📝"
          isDarkMode={isDarkMode}
          color="#0073ea"
        />
        <MetricCard
          title="Stale Items"
          value={stats.staleItems}
          subtitle={`${stats.stalePercentage}% of total`}
          icon="⚠️"
          isDarkMode={isDarkMode}
          color={stats.stalePercentage > 30 ? '#e2445c' : '#fdab3d'}
        />
        {overdueItems.length > 0 && (
          <MetricCard
            title="Overdue"
            value={overdueItems.length}
            subtitle="Past due date"
            icon="🚨"
            isDarkMode={isDarkMode}
            color="#e2445c"
          />
        )}
      </div>

      {/* Column Selectors */}
      <div style={{
        display: 'flex',
        gap: 16,
        marginBottom: 24,
        flexWrap: 'wrap',
      }}>
        {statusColumnOptions.length > 0 && (
          <div style={{ minWidth: 200 }}>
            <label style={{
              display: 'block',
              marginBottom: 4,
              fontSize: 12,
              fontWeight: 500,
              color: isDarkMode ? '#c5c7d0' : '#676879',
            }}>
              Status Column
            </label>
            <Dropdown
              placeholder="Select status column"
              options={statusColumnOptions}
              value={statusColumnOptions.find(o => o.value === selectedStatusColumn)}
              onChange={(option) => setSelectedStatusColumn(option?.value)}
              size={Dropdown.sizes.SMALL}
            />
          </div>
        )}

        {dateColumnOptions.length > 0 && (
          <div style={{ minWidth: 200 }}>
            <label style={{
              display: 'block',
              marginBottom: 4,
              fontSize: 12,
              fontWeight: 500,
              color: isDarkMode ? '#c5c7d0' : '#676879',
            }}>
              Date Column (for overdue)
            </label>
            <Dropdown
              placeholder="Select date column"
              options={dateColumnOptions}
              value={dateColumnOptions.find(o => o.value === selectedDateColumn)}
              onChange={(option) => setSelectedDateColumn(option?.value)}
              size={Dropdown.sizes.SMALL}
            />
          </div>
        )}
      </div>

      {/* Tabs */}
      <TabsContext activeTabId={activeTab}>
        <TabList onTabChange={setActiveTab}>
          <Tab>Overview</Tab>
          <Tab>Distribution</Tab>
          <Tab>Timeline</Tab>
          <Tab>Issues</Tab>
        </TabList>

        <TabPanels>
          {/* Overview Tab */}
          <TabPanel>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: 16,
              marginTop: 16,
            }}>
              {selectedStatusColumn && (
                <DonutChart
                  data={statusDistribution}
                  title="Status Distribution"
                  isDarkMode={isDarkMode}
                />
              )}
              <BarChart
                data={groupDistribution}
                title="Items by Group"
                isDarkMode={isDarkMode}
              />
            </div>
          </TabPanel>

          {/* Distribution Tab */}
          <TabPanel>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: 16,
              marginTop: 16,
            }}>
              {selectedStatusColumn && (
                <BarChart
                  data={statusDistribution}
                  title="Status Breakdown"
                  isDarkMode={isDarkMode}
                  maxBars={15}
                />
              )}
              <BarChart
                data={groupDistribution}
                title="Group Breakdown"
                isDarkMode={isDarkMode}
                maxBars={15}
              />
            </div>
          </TabPanel>

          {/* Timeline Tab */}
          <TabPanel>
            <div style={{ marginTop: 16 }}>
              <LineChart
                data={creationTimeline}
                title="Items Created (Last 30 Days)"
                isDarkMode={isDarkMode}
                height={250}
              />
            </div>
          </TabPanel>

          {/* Issues Tab */}
          <TabPanel>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: 16,
              marginTop: 16,
            }}>
              <DataTable
                data={overdueItems}
                title="Overdue Items"
                columns={[
                  { key: 'name', label: 'Item', sortable: true },
                  { key: 'group', label: 'Group', sortable: true },
                  {
                    key: 'daysOverdue',
                    label: 'Days Overdue',
                    sortable: true,
                    render: (val) => (
                      <span style={{
                        color: val > 7 ? '#e2445c' : '#fdab3d',
                        fontWeight: 600,
                      }}>
                        {val} days
                      </span>
                    ),
                  },
                ]}
                isDarkMode={isDarkMode}
                emptyMessage="No overdue items found"
              />

              <DataTable
                data={staleItems}
                title="Stale Items (Not Updated)"
                columns={[
                  { key: 'name', label: 'Item', sortable: true },
                  { key: 'group', label: 'Group', sortable: true },
                  {
                    key: 'daysSinceUpdate',
                    label: 'Days Stale',
                    sortable: true,
                    render: (val) => (
                      <span style={{
                        color: val > 30 ? '#e2445c' : val > 14 ? '#fdab3d' : '#676879',
                        fontWeight: 600,
                      }}>
                        {val} days
                      </span>
                    ),
                  },
                ]}
                isDarkMode={isDarkMode}
                emptyMessage="No stale items found"
              />
            </div>
          </TabPanel>
        </TabPanels>
      </TabsContext>

      {/* Footer */}
      <div style={{
        marginTop: 40,
        paddingTop: 16,
        borderTop: `1px solid ${isDarkMode ? '#3d4066' : '#e6e9ef'}`,
        textAlign: 'center',
        fontSize: 12,
        color: isDarkMode ? '#9699a6' : '#676879',
      }}>
        Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
}

export default App;
