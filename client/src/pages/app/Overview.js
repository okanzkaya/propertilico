import React, { useState, useMemo, useCallback } from 'react';
import { useQuery } from 'react-query';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useTheme } from '@mui/material/styles';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
  ArcElement
} from 'chart.js';
import {
  Typography,
  Grid,
  Box,
  IconButton,
  Card,
  Dialog,
  DialogContent,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tooltip,
  Checkbox,
  TextField,
  Badge,
  Button,
  Chip,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel
} from '@mui/material';
import * as Icons from '@mui/icons-material';
import {
  reportApi,
  ticketApi,
  financeApi,
  propertyApi,
  taskApi,
  contactApi
} from '../../api';
import styles from './Overview.module.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler,
  ArcElement
);

// Constants
const PROPERTY_ICON = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

const TIME_RANGES = [
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'lastSixMonths', label: 'Last 6 Months' },
  { value: 'thisYear', label: 'This Year' },
  { value: 'lastYear', label: 'Last Year' }
];

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' },
    tooltip: { mode: 'index', intersect: false }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => `$${value / 1000}k`
      }
    }
  }
};

// Helper Functions
const formatCurrency = (value, options = {}) => {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  });
};

const calculateDateRange = (range) => {
  const now = new Date();
  const startDate = new Date(now);

  switch (range) {
    case 'thisMonth':
      startDate.setDate(1);
      break;
    case 'lastMonth':
      startDate.setMonth(startDate.getMonth() - 1, 1);
      break;
    case 'lastSixMonths':
      startDate.setMonth(now.getMonth() - 6);
      break;
    case 'thisYear':
      startDate.setMonth(0, 1);
      break;
    case 'lastYear':
      startDate.setFullYear(now.getFullYear() - 1, 0, 1);
      break;
    default:
      startDate.setMonth(now.getMonth() - 6);
  }

  return { startDate, endDate: now };
};

const Dashboard = () => {
  // State
  const [dialogsOpen, setDialogsOpen] = useState({ tickets: false, allTasks: false });
  const [newTask, setNewTask] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState(null);
  const [timeRange, setTimeRange] = useState('lastSixMonths');

  // Hooks
  const theme = useTheme();

  // Queries
  const {
    data: propertyStats,
    isLoading: propertyStatsLoading,
    error: propertyStatsError
  } = useQuery(['propertyStats'], reportApi.getPropertyStats, {
    staleTime: 5 * 60 * 1000
  });

  const {
    data: ticketStats,
    isLoading: ticketStatsLoading,
    error: ticketStatsError
  } = useQuery(['ticketStats'], reportApi.getTicketStats, {
    staleTime: 5 * 60 * 1000
  });

  const {
    data: occupancyStats,
    isLoading: occupancyStatsLoading,
    error: occupancyStatsError
  } = useQuery(['occupancyStats'], reportApi.getOccupancyStats, {
    staleTime: 5 * 60 * 1000
  });

  const {
    data: tickets,
    isLoading: ticketsLoading,
    error: ticketsError
  } = useQuery(['tickets'], ticketApi.getTickets, {
    staleTime: 5 * 60 * 1000
  });

  const {
    data: transactions,
    isLoading: transactionsLoading,
    error: transactionsError
  } = useQuery(['transactions'], financeApi.getTransactions, {
    staleTime: 5 * 60 * 1000
  });

  const {
    data: properties,
    isLoading: propertiesLoading,
    error: propertiesError
  } = useQuery(['properties'], propertyApi.getProperties, {
    staleTime: 5 * 60 * 1000
  });

  const {
    data: tasks,
    isLoading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks
  } = useQuery(['tasks'], taskApi.getTasks, {
    staleTime: 5 * 60 * 1000
  });

  const {
    data: contacts,
    isLoading: contactsLoading,
    error: contactsError
  } = useQuery(['contacts'], contactApi.getContacts, {
    staleTime: 5 * 60 * 1000
  });

  // Loading and Error States
  const isLoading = [
    propertyStatsLoading,
    ticketStatsLoading,
    occupancyStatsLoading,
    ticketsLoading,
    transactionsLoading,
    propertiesLoading,
    tasksLoading,
    contactsLoading
  ].some(Boolean);

  const hasError = [
    propertyStatsError,
    ticketStatsError,
    occupancyStatsError,
    ticketsError,
    transactionsError,
    propertiesError,
    tasksError,
    contactsError
  ].some(Boolean);

  // ... continuing in next message due to length limits ...
  // Memoized Data Processing
  const processFinancialData = useCallback((transactions = [], range) => {
    if (!transactions.length) return [];
    const { startDate, endDate } = calculateDateRange(range);
    const data = {};

    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      if (date >= startDate && date <= endDate) {
        const key = date.toISOString().split('T')[0];
        if (!data[key]) {
          data[key] = { date: key, income: 0, expenses: 0, profit: 0 };
        }
        const amount = parseFloat(transaction.amount) || 0;
        if (transaction.type === 'income') {
          data[key].income += amount;
        } else {
          data[key].expenses += amount;
        }
        data[key].profit = data[key].income - data[key].expenses;
      }
    });

    return Object.values(data).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, []);

  const financialData = useMemo(() => 
    processFinancialData(transactions, timeRange),
    [transactions, timeRange, processFinancialData]
  );

  const { currentProfit, change } = useMemo(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const currentMonthData = financialData.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate.getFullYear() === currentYear && 
             itemDate.getMonth() === currentMonth;
    });

    const lastMonthData = financialData.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate.getFullYear() === currentYear && 
             itemDate.getMonth() === currentMonth - 1;
    });

    const currentProfit = currentMonthData.reduce((sum, item) => sum + item.profit, 0);
    const lastMonthProfit = lastMonthData.reduce((sum, item) => sum + item.profit, 0);

    return {
      currentProfit,
      change: currentProfit - lastMonthProfit
    };
  }, [financialData]);

  const stats = useMemo(() => [
    {
      title: 'Properties',
      value: propertyStats?.totalProperties || 0,
      icon: <Icons.Home />,
      color: theme.palette.primary.main,
      change: propertyStats?.change || '0',
      trend: propertyStats?.trend || 'up'
    },
    {
      title: 'Tenants',
      value: contacts?.filter(c => c.role.toLowerCase().includes('tenant')).length || 0,
      icon: <Icons.Person />,
      color: theme.palette.success.main,
      change: propertyStats?.tenantChange || '0',
      trend: propertyStats?.tenantTrend || 'up'
    },
    {
      title: 'Tickets',
      value: ticketStats?.totalTickets || 0,
      icon: <Icons.Build />,
      color: theme.palette.warning.main,
      change: ticketStats?.change || '0',
      trend: ticketStats?.trend || 'down'
    },
    {
      title: 'Monthly Profit',
      value: `$${formatCurrency(currentProfit)}`,
      icon: <Icons.MonetizationOn />,
      color: theme.palette.error.main,
      change: formatCurrency(change, { signDisplay: 'always' }),
      trend: change >= 0 ? 'up' : 'down'
    }
  ], [propertyStats, contacts, ticketStats, currentProfit, change, theme.palette]);

  const chartData = useMemo(() => ({
    labels: financialData.map(item => item.date),
    datasets: [
      {
        label: 'Revenue',
        data: financialData.map(item => item.income),
        fill: true,
        backgroundColor: `${theme.palette.primary.main}20`,
        borderColor: theme.palette.primary.main,
        tension: 0.4
      },
      {
        label: 'Expenses',
        data: financialData.map(item => item.expenses),
        fill: true,
        backgroundColor: `${theme.palette.error.main}20`,
        borderColor: theme.palette.error.main,
        tension: 0.4
      },
      {
        label: 'Profit',
        data: financialData.map(item => item.profit),
        fill: true,
        backgroundColor: `${theme.palette.success.main}20`,
        borderColor: theme.palette.success.main,
        tension: 0.4
      }
    ]
  }), [financialData, theme.palette]);

  const occupancyRate = useMemo(() => {
    if (!occupancyStats?.length) return 0;
    const occupied = occupancyStats.find(stat => stat.name === 'Occupied')?.value || 0;
    const total = occupancyStats.reduce((sum, stat) => sum + stat.value, 0);
    return total > 0 ? Math.round((occupied / total) * 100) : 0;
  }, [occupancyStats]);

  const occupancyChartData = useMemo(() => ({
    labels: occupancyStats?.map(stat => stat.name) || [],
    datasets: [{
      data: occupancyStats?.map(stat => stat.value) || [],
      backgroundColor: [theme.palette.success.main, theme.palette.error.main],
      hoverOffset: 4
    }]
  }), [occupancyStats, theme.palette]);

  const mapBounds = useMemo(() => {
    if (!properties?.length) return null;
    const validProperties = properties.filter(p => p.latitude && p.longitude);
    if (!validProperties.length) return null;
    
    const latitudes = validProperties.map(p => parseFloat(p.latitude));
    const longitudes = validProperties.map(p => parseFloat(p.longitude));
    
    return [
      [Math.min(...latitudes), Math.min(...longitudes)],
      [Math.max(...latitudes), Math.max(...longitudes)]
    ];
  }, [properties]);

  const recentActivities = useMemo(() => {
    if (!transactions || !tickets) return [];
    
    const activities = [
      ...transactions.map(t => ({
        action: `${t.type === 'income' ? 'Rent collected' : 'Expense paid'}`,
        property: `Property ${t.propertyId}`,
        time: new Date(t.date).toLocaleString(),
        icon: t.type === 'income' ? <Icons.AttachMoney /> : <Icons.MonetizationOn />
      })),
      ...tickets.map(t => ({
        action: `New ticket: ${t.title}`,
        property: `Property ${t.propertyId}`,
        time: new Date(t.createdAt).toLocaleString(),
        icon: <Icons.Assignment />
      }))
    ];

    return activities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 4);
  }, [transactions, tickets]);

  // Event Handlers
  const handleAddTask = useCallback(async () => {
    if (!newTask.trim()) return;
    
    try {
      await taskApi.addTask({
        task: newTask,
        status: 'Pending',
        dueDate: newTaskDueDate
      });
      setNewTask('');
      setNewTaskDueDate(null);
      refetchTasks();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }, [newTask, newTaskDueDate, refetchTasks]);

  const handleDeleteTask = useCallback(async (taskId) => {
    try {
      await taskApi.deleteTask(taskId);
      refetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }, [refetchTasks]);

  const handleToggleTaskStatus = useCallback(async (taskId) => {
    try {
      const taskToUpdate = tasks?.find(t => t.id === taskId);
      if (!taskToUpdate) return;

      await taskApi.updateTask(taskId, {
        ...taskToUpdate,
        status: taskToUpdate.status === 'Pending' ? 'Completed' : 'Pending'
      });
      refetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }, [tasks, refetchTasks]);

  // Continue in next message...
  // Render Helpers
  const renderTasks = useCallback((tasksToRender) => {
    if (!tasksToRender?.length) return null;
    
    return tasksToRender.map((task) => (
      <ListItem key={task.id} className={styles.taskItem}>
        <Box className={styles.taskContent}>
          <Box display="flex" alignItems="center" flexGrow={1}>
            <Checkbox
              checked={task.status === 'Completed'}
              onChange={() => handleToggleTaskStatus(task.id)}
            />
            <ListItemText
              primary={task.task}
              secondary={task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : ''}
              className={task.status === 'Completed' ? styles.completedTask : ''}
            />
          </Box>
          <Box className={styles.taskActions}>
            <Chip
              label={task.status}
              color={task.status === 'Completed' ? 'success' : 'warning'}
              size="small"
              className={styles.statusChip}
            />
            <IconButton size="small" onClick={() => handleDeleteTask(task.id)}>
              <Icons.Delete fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </ListItem>
    ));
  }, [handleToggleTaskStatus, handleDeleteTask]);

  const renderStats = useCallback(() => (
    stats.map((stat, index) => (
      <Grid item xs={12} sm={6} md={3} key={index}>
        <Card className={styles.statCard}>
          <Box className={styles.statContent}>
            <Box className={styles.statInfo}>
              <Typography variant="subtitle2" className={styles.statTitle}>{stat.title}</Typography>
              <Typography variant="h4" className={styles.statValue}>{stat.value}</Typography>
            </Box>
            <Avatar className={styles.statIcon} sx={{ bgcolor: stat.color }}>{stat.icon}</Avatar>
          </Box>
          <Box className={styles.statTrend}>
            {stat.trend === 'up' ? (
              <Icons.ArrowUpward sx={{ color: 'var(--success-color)' }} fontSize="small" />
            ) : (
              <Icons.ArrowDownward sx={{ color: 'var(--error-color)' }} fontSize="small" />
            )}
            <Typography variant="body2" color="textSecondary">
              <span style={{
                color: stat.trend === 'up' ? 'var(--success-color)' : 'var(--error-color)',
                fontWeight: 'bold'
              }}>
                {stat.change}
              </span> vs last month
            </Typography>
          </Box>
        </Card>
      </Grid>
    ))
  ), [stats]);

  if (isLoading) {
    return (
      <Box className={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (hasError) {
    return (
      <Box className={styles.errorContainer}>
        <Alert severity="error">An error occurred while fetching data. Please try again later.</Alert>
      </Box>
    );
  }

  return (
    <Box className={styles.dashboardContainer}>
      {/* Header */}
      <Box className={styles.dashboardHeader}>
        <Typography variant="h4" className={styles.dashboardTitle}>Dashboard</Typography>
        <Tooltip title="Open Tickets">
          <IconButton
            color="inherit"
            onClick={() => setDialogsOpen(prev => ({ ...prev, tickets: true }))}
          >
            <Badge badgeContent={ticketStats?.openTickets || 0} color="error">
              <Icons.Assignment />
            </Badge>
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Section */}
        {renderStats()}

        {/* Financial Overview */}
        <Grid item xs={12} md={8}>
          <Card className={styles.chartCard}>
            <Box className={styles.chartHeader}>
              <Typography variant="h6">Financial Overview</Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={timeRange}
                  label="Time Range"
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  {TIME_RANGES.map(range => (
                    <MenuItem key={range.value} value={range.value}>
                      {range.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box className={styles.chartContainer}>
              <Line data={chartData} options={CHART_OPTIONS} />
            </Box>
          </Card>
        </Grid>

        {/* Occupancy Rate */}
        <Grid item xs={12} md={4}>
          <Card className={styles.chartCard}>
            <Box className={styles.chartHeader}>
              <Typography variant="h6">Occupancy Rate</Typography>
              <Typography variant="h4" className="success-text">
                {occupancyRate}%
              </Typography>
            </Box>
            <Box className={styles.chartContainer}>
              <Doughnut
                data={occupancyChartData}
                options={{
                  ...CHART_OPTIONS,
                  cutout: '70%'
                }}
              />
            </Box>
          </Card>
        </Grid>

        {/* Property Map */}
        <Grid item xs={12}>
          <Card className={styles.chartCard}>
            <Typography variant="h6" gutterBottom>Property Locations</Typography>
            {properties?.length && mapBounds ? (
              <MapContainer
                bounds={mapBounds}
                className={styles.mapContainer}
                zoomControl={true}
                attributionControl={true}
              >
                <TileLayer
                  url={theme.palette.mode === 'dark'
                    ? 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
                    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                  }
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {properties.map((property) => (
                  property.latitude && property.longitude && (
                    <Marker
                      key={property.id}
                      position={[parseFloat(property.latitude), parseFloat(property.longitude)]}
                      icon={PROPERTY_ICON}
                    >
                      <Popup>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {property.name}
                        </Typography>
                        <Typography variant="body2">{property.address}</Typography>
                      </Popup>
                    </Marker>
                  )
                ))}
              </MapContainer>
            ) : (
              <Box className="empty-state">
                <Typography color="textSecondary">
                  No property location data available
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Tasks */}
        <Grid item xs={12} md={6}>
          <Card className={styles.chartCard}>
            <Box className={styles.chartHeader}>
              <Typography variant="h6">Tasks</Typography>
              <Tooltip title="View All Tasks">
                <IconButton
                  size="small"
                  onClick={() => setDialogsOpen(prev => ({ ...prev, allTasks: true }))}
                >
                  <Icons.MoreVert />
                </IconButton>
              </Tooltip>
            </Box>
            <Box className={styles.addTaskForm}>
              <TextField
                label="New Task"
                variant="outlined"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                fullWidth
                size="small"
                className={styles.taskInput}
              />
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Due Date"
                  value={newTaskDueDate}
                  onChange={setNewTaskDueDate}
                  renderInput={(params) => (
                    <TextField {...params} size="small" className={styles.datePicker} />
                  )}
                />
              </LocalizationProvider>
              <IconButton color="primary" onClick={handleAddTask}>
                <Icons.Add />
              </IconButton>
            </Box>
            <List className={styles.taskList}>
              {renderTasks(tasks?.slice(0, 5))}
            </List>
            {tasks?.length > 5 && (
              <Box className="view-all-button">
                <Button
                  onClick={() => setDialogsOpen(prev => ({ ...prev, allTasks: true }))}
                  startIcon={<Icons.MoreVert />}
                >
                  View All Tasks
                </Button>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Card className={styles.chartCard}>
            <Typography variant="h6" gutterBottom>Recent Activities</Typography>
            <List>
              {recentActivities.map((activity, index) => (
                <ListItem key={index} className={styles.activityItem}>
                  <ListItemAvatar>
                    <Avatar className={styles.activityIcon}>
                      {activity.icon}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.action}
                    secondary={`${activity.property} • ${activity.time}`}
                  />
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>
      </Grid>

      {/* Dialogs */}
      <Dialog
        open={dialogsOpen.tickets}
        onClose={() => setDialogsOpen(prev => ({ ...prev, tickets: false }))}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent className={styles.dialogContent}>
          <Box className={styles.dialogHeader}>
            <Typography variant="h6">Open Tickets</Typography>
            <IconButton 
              onClick={() => setDialogsOpen(prev => ({ ...prev, tickets: false }))}
            >
              <Icons.Close />
            </IconButton>
          </Box>
          <List>
            {tickets?.filter(ticket => ticket.status === 'Open')
              .slice(0, 5)
              .map((ticket) => (
                <ListItem key={ticket.id} className={styles.ticketItem}>
                  <ListItemAvatar>
                    <Avatar sx={{
                      bgcolor: ticket.priority === 'High'
                        ? 'var(--error-color)'
                        : 'var(--warning-color)'
                    }}>
                      <Icons.Assignment />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={ticket.title}
                    secondary={`${new Date(ticket.createdAt).toLocaleString()} • Priority: ${ticket.priority}`}
                  />
                  <Chip
                    label={ticket.status}
                    color={ticket.status === 'Open' ? 'error' : 'warning'}
                    size="small"
                    className={styles.statusChip}
                  />
                </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialogsOpen.allTasks}
        onClose={() => setDialogsOpen(prev => ({ ...prev, allTasks: false }))}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent className={styles.dialogContent}>
          <Box className={styles.dialogHeader}>
            <Typography variant="h6">All Tasks</Typography>
            <IconButton 
              onClick={() => setDialogsOpen(prev => ({ ...prev, allTasks: false }))}
            >
              <Icons.Close />
            </IconButton>
          </Box>
          <List className={styles.dialogList}>
            {renderTasks(tasks)}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Dashboard;