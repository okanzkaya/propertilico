import React, { useState, useMemo, useCallback } from 'react';
import { useQuery } from 'react-query';
import {
  Typography, Grid, Box, IconButton, Card, Dialog, DialogContent, Avatar,
  List, ListItem, ListItemAvatar, ListItemText, Tooltip, Checkbox, TextField,
  Badge, Button, Chip, Select, MenuItem, CircularProgress, Alert, useMediaQuery,
  FormControl, InputLabel
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, Title,
  Tooltip as ChartTooltip, Legend, Filler, ArcElement
} from 'chart.js';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  Close as CloseIcon, Home as HomeIcon, Person as PersonIcon, Build as BuildIcon,
  MonetizationOn as MonetizationOnIcon, Assignment as AssignmentIcon, Add as AddIcon,
  Delete as DeleteIcon, MoreVert as MoreVertIcon, ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon, AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  reportApi, ticketApi, financeApi, propertyApi, taskApi, contactApi
} from '../../api';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title,
  ChartTooltip, Legend, Filler, ArcElement
);

const propertyIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [dialogsOpen, setDialogsOpen] = useState({ tickets: false, allTasks: false });
  const [newTask, setNewTask] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState(null);
  const [timeRange, setTimeRange] = useState('lastSixMonths');

  const { data: propertyStats, isLoading: propertyStatsLoading, error: propertyStatsError } = useQuery(
    ['propertyStats'],
    reportApi.getPropertyStats,
    {
      retry: 2,
      retryDelay: 1000,
      onError: (error) => console.error('Error fetching property stats:', error),
      staleTime: 5 * 60 * 1000
    }
  );

  const { data: ticketStats, isLoading: ticketStatsLoading, error: ticketStatsError } = useQuery(
    ['ticketStats'],
    reportApi.getTicketStats,
    {
      retry: 2,
      retryDelay: 1000,
      onError: (error) => console.error('Error fetching ticket stats:', error),
      staleTime: 5 * 60 * 1000
    }
  );

  const { data: occupancyStats, isLoading: occupancyStatsLoading, error: occupancyStatsError } = useQuery(
    ['occupancyStats'],
    reportApi.getOccupancyStats,
    {
      retry: 2,
      retryDelay: 1000,
      onError: (error) => console.error('Error fetching occupancy stats:', error),
      staleTime: 5 * 60 * 1000
    }
  );

  const { data: tickets, isLoading: ticketsLoading, error: ticketsError } = useQuery(
    ['tickets'],
    ticketApi.getTickets,
    {
      retry: 2,
      retryDelay: 1000,
      onError: (error) => console.error('Error fetching tickets:', error),
      staleTime: 5 * 60 * 1000
    }
  );

  const { data: transactions, isLoading: transactionsLoading, error: transactionsError } = useQuery(
    ['transactions'],
    financeApi.getTransactions,
    {
      retry: 2,
      retryDelay: 1000,
      onError: (error) => console.error('Error fetching transactions:', error),
      staleTime: 5 * 60 * 1000
    }
  );

  const { data: properties, isLoading: propertiesLoading, error: propertiesError } = useQuery(
    ['properties'],
    propertyApi.getProperties,
    {
      retry: 2,
      retryDelay: 1000,
      onError: (error) => console.error('Error fetching properties:', error),
      staleTime: 5 * 60 * 1000
    }
  );

  const { data: tasks, isLoading: tasksLoading, error: tasksError, refetch: refetchTasks } = useQuery(
    ['tasks'],
    taskApi.getTasks,
    {
      retry: 2,
      retryDelay: 1000,
      onError: (error) => console.error('Error fetching tasks:', error),
      staleTime: 5 * 60 * 1000
    }
  );

  const { data: contacts, isLoading: contactsLoading, error: contactsError } = useQuery(
    ['contacts'],
    contactApi.getContacts,
    {
      retry: 2,
      retryDelay: 1000,
      onError: (error) => console.error('Error fetching contacts:', error),
      staleTime: 5 * 60 * 1000
    }
  );

  const isLoading = propertyStatsLoading || ticketStatsLoading || occupancyStatsLoading ||
    ticketsLoading || transactionsLoading || propertiesLoading ||
    tasksLoading || contactsLoading;

  const hasError = propertyStatsError || ticketStatsError || occupancyStatsError ||
    ticketsError || transactionsError || propertiesError ||
    tasksError || contactsError;

  const processFinancialData = useCallback((transactions, range) => {
    if (!transactions || transactions.length === 0) return [];
    const data = {};
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

    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      if (date >= startDate && date <= now) {
        const key = date.toISOString().split('T')[0];
        if (!data[key]) {
          data[key] = { date: key, income: 0, expenses: 0, profit: 0 };
        }
        if (transaction.type === 'income') {
          data[key].income += parseFloat(transaction.amount) || 0;
        } else {
          data[key].expenses += parseFloat(transaction.amount) || 0;
        }
        data[key].profit = data[key].income - data[key].expenses;
      }
    });

    return Object.values(data).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, []);

  const financialData = useMemo(() => processFinancialData(transactions, timeRange), [transactions, timeRange, processFinancialData]);

  const calculateMonthlyProfit = useCallback(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);

    const currentMonthData = financialData.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate.getFullYear() === currentYear && itemDate.getMonth() === currentMonth;
    });

    const lastMonthData = financialData.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate.getFullYear() === lastMonthDate.getFullYear() && itemDate.getMonth() === lastMonthDate.getMonth();
    });

    const currentMonthProfit = currentMonthData.reduce((sum, item) => sum + item.profit, 0);
    const lastMonthProfit = lastMonthData.reduce((sum, item) => sum + item.profit, 0);
    const change = currentMonthProfit - lastMonthProfit;

    return {
      currentProfit: currentMonthProfit,
      change: change
    };
  }, [financialData]);

  const { currentProfit, change } = useMemo(() => calculateMonthlyProfit(), [calculateMonthlyProfit]);

  const generateRecentActivities = useCallback((transactions, tickets) => {
    if (!transactions || !tickets) return [];
    const activities = [
      ...transactions.map(t => ({
        action: `${t.type === 'income' ? 'Rent collected' : 'Expense paid'}`,
        property: `Property ${t.propertyId}`,
        time: new Date(t.date).toLocaleString(),
        icon: t.type === 'income' ? <AttachMoneyIcon /> : <MonetizationOnIcon />
      })),
      ...tickets.map(t => ({
        action: `New ticket: ${t.title}`,
        property: `Property ${t.propertyId}`,
        time: new Date(t.createdAt).toLocaleString(),
        icon: <AssignmentIcon />
      }))
    ];
    return activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 4);
  }, []);

  const recentActivities = useMemo(() => generateRecentActivities(transactions, tickets), [transactions, tickets, generateRecentActivities]);

  const handleAddTask = useCallback(async () => {
    if (newTask.trim()) {
      try {
        await taskApi.addTask({ task: newTask, status: 'Pending', dueDate: newTaskDueDate });
        setNewTask('');
        setNewTaskDueDate(null);
        refetchTasks();
      } catch (error) {
        console.error('Error adding task:', error);
      }
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
      const taskToUpdate = tasks.find(t => t.id === taskId);
      await taskApi.updateTask(taskId, {
        ...taskToUpdate,
        status: taskToUpdate.status === 'Pending' ? 'Completed' : 'Pending'
      });
      refetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }, [tasks, refetchTasks]);

  const renderTasks = useCallback((tasksToRender) => tasksToRender.map((task) => (
    <ListItem key={task.id} sx={{ flexWrap: 'wrap', mb: 1, backgroundColor: alpha(theme.palette.background.paper, 0.6), borderRadius: 1 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" flexWrap="wrap">
        <Box display="flex" alignItems="center" flexGrow={1}>
          <Checkbox checked={task.status === 'Completed'} onChange={() => handleToggleTaskStatus(task.id)} />
          <ListItemText
            primary={task.task}
            secondary={task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : ''}
            sx={{ textDecoration: task.status === 'Completed' ? 'line-through' : 'none' }}
          />
        </Box>
        <Box display="flex" alignItems="center">
          <Chip label={task.status} color={task.status === 'Completed' ? 'success' : 'warning'} size="small" />
          <IconButton size="small" onClick={() => handleDeleteTask(task.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </ListItem>
  )), [theme.palette.background.paper, handleToggleTaskStatus, handleDeleteTask]);

  const stats = useMemo(() => [
    { title: 'Properties', value: propertyStats?.totalProperties || 0, icon: <HomeIcon />, color: theme.palette.primary.main, change: propertyStats?.change || '0', trend: propertyStats?.trend || 'up' },
    { title: 'Tenants', value: contacts?.filter(c => c.role.toLowerCase().includes('tenant')).length || 0, icon: <PersonIcon />, color: theme.palette.success.main, change: propertyStats?.tenantChange || '0', trend: propertyStats?.tenantTrend || 'up' },
    { title: 'Tickets', value: ticketStats?.totalTickets || 0, icon: <BuildIcon />, color: theme.palette.warning.main, change: ticketStats?.change || '0', trend: ticketStats?.trend || 'down' },
    { 
      title: 'Monthly Profit', 
      value: `$${currentProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      icon: <MonetizationOnIcon />, 
      color: theme.palette.error.main, 
      change: change.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: 'always' }), 
      trend: change >= 0 ? 'up' : 'down' 
    },
  ], [propertyStats, contacts, ticketStats, currentProfit, change, theme.palette]);


  const occupancyRate = useMemo(() => {
    if (!occupancyStats || occupancyStats.length === 0) return 0;
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
  }), [occupancyStats, theme.palette.success.main, theme.palette.error.main]);

  const mapBounds = useMemo(() => {
    if (!properties || properties.length === 0) return null;
    const latitudes = properties.map(p => p.location.coordinates[1]);
    const longitudes = properties.map(p => p.location.coordinates[0]);
    return [
      [Math.min(...latitudes), Math.min(...longitudes)],
      [Math.max(...latitudes), Math.max(...longitudes)]
    ];
  }, [properties]);

  const chartHeight = isMobile ? 300 : 400;

  const handleTimeRangeChange = useCallback((event) => {
    setTimeRange(event.target.value);
  }, []);

  const chartData = useMemo(() => ({
    labels: financialData.map(item => item.date),
    datasets: [
      {
        label: 'Revenue',
        data: financialData.map(item => item.income),
        fill: true,
        backgroundColor: alpha(theme.palette.primary.main, 0.2),
        borderColor: theme.palette.primary.main,
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: financialData.map(item => item.expenses),
        fill: true,
        backgroundColor: alpha(theme.palette.error.main, 0.2),
        borderColor: theme.palette.error.main,
        tension: 0.4,
      },
      {
        label: 'Profit',
        data: financialData.map(item => item.profit),
        fill: true,
        backgroundColor: alpha(theme.palette.success.main, 0.2),
        borderColor: theme.palette.success.main,
        tension: 0.4,
      }
    ]
  }), [financialData, theme.palette]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value / 1000}k`
        }
      },
    },
  }), []);

  if (isLoading) return <Box display="flex" justifyContent="center" alignItems="center" height="100vh"><CircularProgress /></Box>;

  if (hasError) return <Box p={3}><Alert severity="error">An error occurred while fetching data. Please try again later.</Alert></Box>;

  return (
    <Box sx={{ p: 3, backgroundColor: theme.palette.mode === 'light' ? '#f5f5f5' : '#121212', minHeight: '100vh' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">Dashboard</Typography>
        <Tooltip title="Open Tickets">
          <IconButton color="inherit" onClick={() => setDialogsOpen({ ...dialogsOpen, tickets: true })}>
            <Badge badgeContent={ticketStats?.openTickets || 0} color="error">
              <AssignmentIcon />
            </Badge>
          </IconButton>
        </Tooltip>
      </Box>
      <Grid container spacing={3}>
        {stats.map((stat, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card sx={{ p: 2, borderRadius: 2, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', height: '100%' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">{stat.title}</Typography>
                  <Typography variant="h4" fontWeight="bold">{stat.value}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: stat.color, width: 56, height: 56 }}>{stat.icon}</Avatar>
              </Box>
              <Box mt={2} display="flex" alignItems="center">
                {stat.trend === 'up' ? (
                  <ArrowUpwardIcon sx={{ color: theme.palette.success.main, mr: 1 }} fontSize="small" />
                ) : (
                  <ArrowDownwardIcon sx={{ color: theme.palette.error.main, mr: 1 }} fontSize="small" />
                )}
                <Typography variant="body2" color="textSecondary">
                  <span style={{ color: stat.trend === 'up' ? theme.palette.success.main : theme.palette.error.main, fontWeight: 'bold' }}>
                    {stat.change > 0 ? `+${stat.change}` : stat.change}
                  </span> vs last month
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12} md={8}>
          <Card sx={{ p: 2, borderRadius: 2, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Financial Overview</Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="time-range-select-label">Time Range</InputLabel>
                <Select
                  labelId="time-range-select-label"
                  id="time-range-select"
                  value={timeRange}
                  label="Time Range"
                  onChange={handleTimeRangeChange}
                >
                  <MenuItem value="thisMonth">This Month</MenuItem>
                  <MenuItem value="lastMonth">Last Month</MenuItem>
                  <MenuItem value="lastSixMonths">Last 6 Months</MenuItem>
                  <MenuItem value="thisYear">This Year</MenuItem>
                  <MenuItem value="lastYear">Last Year</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box height={chartHeight}>
              <Line data={chartData} options={chartOptions} />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, borderRadius: 2, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Occupancy Rate</Typography>
              <Typography variant="h4" fontWeight="bold" color={theme.palette.success.main}>{occupancyRate}%</Typography>
            </Box>
            <Box height={chartHeight}>
              <Doughnut
                data={occupancyChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: '70%',
                  plugins: {
                    legend: { position: 'bottom' }
                  }
                }}
              />
            </Box>
            <Box mt={2} textAlign="center">
              <Typography variant="body2" color="textSecondary">Current Occupancy Rate</Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ p: 2, borderRadius: 2, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" mb={2}>Property Locations</Typography>
            {properties && properties.length > 0 ? (
              <MapContainer
                bounds={mapBounds}
                style={{ height: '400px', width: '100%', borderRadius: '8px' }}
                zoomControl={false}
                attributionControl={false}
              >
                <TileLayer
                  url={theme.palette.mode === 'dark'
                    ? 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
                    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                  }
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {properties.map((property) => (
                  <Marker key={property.id} position={[property.location.coordinates[1], property.location.coordinates[0]]} icon={propertyIcon}>
                    <Popup>
                      <Typography variant="subtitle1"><strong>{property.name}</strong></Typography>
                      <Typography variant="body2">{property.address}</Typography>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <Box height="400px" display="flex" justifyContent="center" alignItems="center">
                <Typography variant="body1" color="textSecondary">No property data available</Typography>
              </Box>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, borderRadius: 2, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Tasks</Typography>
              <Tooltip title="View All Tasks">
                <IconButton size="small" onClick={() => setDialogsOpen({ ...dialogsOpen, allTasks: true })}>
                  <MoreVertIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Box display="flex" alignItems="center" mb={2}>
              <TextField
                label="New Task"
                variant="outlined"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                fullWidth
                size="small"
                sx={{ mr: 2 }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTask();
                  }
                }}
              />
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Due Date"
                  value={newTaskDueDate}
                  onChange={(newValue) => setNewTaskDueDate(newValue)}
                  renderInput={(params) => <TextField {...params} size="small" sx={{ mr: 2 }} />}
                />
              </LocalizationProvider>
              <IconButton color="primary" onClick={handleAddTask}>
                <AddIcon />
              </IconButton>
            </Box>
            <List sx={{ maxHeight: '300px', overflowY: 'auto' }}>{renderTasks(tasks?.slice(0, 5) || [])}</List>
            {tasks && tasks.length > 5 && (
              <Box display="flex" justifyContent="center" mt={2}>
                <Button
                  onClick={() => setDialogsOpen({ ...dialogsOpen, allTasks: true })}
                  startIcon={<MoreVertIcon />}
                >
                  View All Tasks
                </Button>
              </Box>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, borderRadius: 2, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', height: '100%' }}>
            <Typography variant="h6" mb={2}>Recent Activities</Typography>
            <List>
              {recentActivities.map((activity, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
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

      <Dialog
        open={dialogsOpen.tickets}
        onClose={() => setDialogsOpen({ ...dialogsOpen, tickets: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Open Tickets</Typography>
            <IconButton onClick={() => setDialogsOpen({ ...dialogsOpen, tickets: false })}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List>
            {tickets && tickets.filter(ticket => ticket.status === 'Open').slice(0, 5).map((ticket) => (
              <ListItem key={ticket.id} sx={{ bgcolor: alpha(theme.palette.background.paper, 0.6), mb: 1, borderRadius: 1 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: ticket.priority === 'High' ? theme.palette.error.main : theme.palette.warning.main }}>
                    <AssignmentIcon />
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
                  sx={{ fontWeight: 'bold' }}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialogsOpen.allTasks}
        onClose={() => setDialogsOpen({ ...dialogsOpen, allTasks: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">All Tasks</Typography>
            <IconButton onClick={() => setDialogsOpen({ ...dialogsOpen, allTasks: false })}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List sx={{ maxHeight: '60vh', overflowY: 'auto' }}>{renderTasks(tasks || [])}</List>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Dashboard;