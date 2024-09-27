import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Typography, Grid, Box, IconButton, Card, Dialog, DialogContent, Avatar,
  List, ListItem, ListItemAvatar, ListItemText, Tooltip, Checkbox, TextField,
  Badge, Button, Chip, Select, MenuItem, CircularProgress, Alert, useMediaQuery,
  FormControl, InputLabel
} from '@mui/material';
import { useTheme, alpha } from '@mui/system';
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
import { getPropertyStats, getTicketStats, getOccupancyStats, getTickets, getTransactions, getProperties, addTask, getTasks, deleteTask, updateTask, getContacts } from '../../api';

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
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState(null);
  const [timeRange, setTimeRange] = useState('lastSixMonths');
  const [dashboardData, setDashboardData] = useState({
    propertyStats: null,
    ticketStats: null,
    financialData: [],
    occupancyStats: null,
    openTickets: [],
    recentActivities: [],
    properties: [],
    tenants: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const processFinancialData = useCallback((transactions, range) => {
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
          data[key].income += transaction.amount;
        } else {
          data[key].expenses += transaction.amount;
        }
        data[key].profit = data[key].income - data[key].expenses;
      }
    });

    return Object.values(data).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, []);

  const generateRecentActivities = useCallback((transactions, tickets) => {
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

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [propertyData, ticketData, occupancyData, ticketsData, transactionsData, propertiesData, tasksData, contactsData] = await Promise.all([
        getPropertyStats(),
        getTicketStats(),
        getOccupancyStats(),
        getTickets(),
        getTransactions(),
        getProperties(),
        getTasks(),
        getContacts()
      ]);

      setDashboardData({
        propertyStats: propertyData,
        ticketStats: {
          ...ticketData,
          totalTickets: ticketsData.length,
          openTickets: ticketsData.filter(ticket => ticket.status === 'Open').length
        },
        financialData: processFinancialData(transactionsData, timeRange),
        occupancyStats: occupancyData,
        openTickets: ticketsData.filter(ticket => ticket.status === 'Open').slice(0, 3),
        recentActivities: generateRecentActivities(transactionsData, ticketsData),
        properties: propertiesData.filter(p => p.location?.coordinates?.length === 2),
        tenants: contactsData.filter(contact => contact.role.toLowerCase().includes('tenant')),
        transactions: transactionsData
      });
      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [processFinancialData, generateRecentActivities, timeRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleAddTask = useCallback(async () => {
    if (newTask.trim()) {
      try {
        const addedTask = await addTask({ task: newTask, status: 'Pending', dueDate: newTaskDueDate });
        setTasks(prevTasks => [addedTask, ...prevTasks]);
        setNewTask('');
        setNewTaskDueDate(null);
      } catch (error) {
        console.error('Error adding task:', error);
      }
    }
  }, [newTask, newTaskDueDate]);

  const handleDeleteTask = useCallback(async (taskId) => {
    try {
      await deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(t => t._id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }, []);

  const handleToggleTaskStatus = useCallback(async (taskId) => {
    try {
      const taskToUpdate = tasks.find(t => t._id === taskId);
      const updatedTask = await updateTask(taskId, {
        ...taskToUpdate,
        status: taskToUpdate.status === 'Pending' ? 'Completed' : 'Pending'
      });
      setTasks(prevTasks => prevTasks.map(t => t._id === taskId ? updatedTask : t));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }, [tasks]);

  const renderTasks = useCallback((tasksToRender) => tasksToRender.map((task) => (
    <ListItem key={task._id} sx={{ flexWrap: 'wrap', mb: 1, backgroundColor: alpha(theme.palette.background.paper, 0.6), borderRadius: 1 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" flexWrap="wrap">
        <Box display="flex" alignItems="center" flexGrow={1}>
          <Checkbox checked={task.status === 'Completed'} onChange={() => handleToggleTaskStatus(task._id)} />
          <ListItemText 
            primary={task.task} 
            secondary={task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : ''}
            sx={{ textDecoration: task.status === 'Completed' ? 'line-through' : 'none' }}
          />
        </Box>
        <Box display="flex" alignItems="center">
          <Chip label={task.status} color={task.status === 'Completed' ? 'success' : 'warning'} size="small" />
          <IconButton size="small" onClick={() => handleDeleteTask(task._id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </ListItem>
  )), [handleDeleteTask, handleToggleTaskStatus, theme.palette.background.paper]);

  const stats = useMemo(() => [
    { title: 'Properties', value: dashboardData.propertyStats?.totalProperties || 0, icon: <HomeIcon />, color: theme.palette.primary.main, change: dashboardData.propertyStats?.change || '0', trend: dashboardData.propertyStats?.trend || 'up' },
    { title: 'Tenants', value: dashboardData.tenants.length || 0, icon: <PersonIcon />, color: theme.palette.success.main, change: dashboardData.propertyStats?.tenantChange || '0', trend: dashboardData.propertyStats?.tenantTrend || 'up' },
    { title: 'Tickets', value: dashboardData.ticketStats?.totalTickets || 0, icon: <BuildIcon />, color: theme.palette.warning.main, change: dashboardData.ticketStats?.change || '0', trend: dashboardData.ticketStats?.trend || 'down' },
    { title: 'Monthly Profit', value: `$${dashboardData.financialData[dashboardData.financialData.length - 1]?.profit.toLocaleString() || '0'}`, icon: <MonetizationOnIcon />, color: theme.palette.error.main, change: dashboardData.financialData[dashboardData.financialData.length - 1]?.profit - dashboardData.financialData[dashboardData.financialData.length - 2]?.profit || 0, trend: 'up' },
  ], [dashboardData, theme.palette]);

  const occupancyRate = useMemo(() => {
    const occupiedCount = dashboardData.properties.filter(p => !p.availableNow).length;
    const totalCount = dashboardData.properties.length;
    return totalCount > 0 ? Math.round((occupiedCount / totalCount) * 100) : 0;
  }, [dashboardData.properties]);

  const occupancyChartData = {
    labels: ['Occupied', 'Vacant'],
    datasets: [{
      data: [occupancyRate, 100 - occupancyRate],
      backgroundColor: [theme.palette.success.main, theme.palette.error.main],
      hoverOffset: 4
    }]
  };

  const mapBounds = useMemo(() => {
    if (dashboardData.properties.length === 0) return null;
    const latitudes = dashboardData.properties.map(p => p.location.coordinates[1]);
    const longitudes = dashboardData.properties.map(p => p.location.coordinates[0]);
    return [
      [Math.min(...latitudes), Math.min(...longitudes)],
      [Math.max(...latitudes), Math.max(...longitudes)]
    ];
  }, [dashboardData.properties]);

  const chartHeight = isMobile ? 300 : 400;

  const handleTimeRangeChange = (event) => {
    const newTimeRange = event.target.value;
    setTimeRange(newTimeRange);
    setDashboardData(prevData => ({
      ...prevData,
      financialData: processFinancialData(prevData.transactions, newTimeRange)
    }));
  };

  const chartData = useMemo(() => ({
    labels: dashboardData.financialData.map(item => item.date),
    datasets: [
      {
        label: 'Revenue',
        data: dashboardData.financialData.map(item => item.income),
        fill: true,
        backgroundColor: alpha(theme.palette.primary.main, 0.2),
        borderColor: theme.palette.primary.main,
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: dashboardData.financialData.map(item => item.expenses),
        fill: true,
        backgroundColor: alpha(theme.palette.error.main, 0.2),
        borderColor: theme.palette.error.main,
        tension: 0.4,
      },
      {
        label: 'Profit',
        data: dashboardData.financialData.map(item => item.profit),
        fill: true,
        backgroundColor: alpha(theme.palette.success.main, 0.2),
        borderColor: theme.palette.success.main,
        tension: 0.4,
      }
    ]
  }), [dashboardData.financialData, theme.palette]);

  const chartOptions = {
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
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" height="100vh"><CircularProgress /></Box>;
  if (error) return <Box display="flex" justifyContent="center" alignItems="center" height="100vh"><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box sx={{ p: 3, backgroundColor: theme.palette.mode === 'light' ? '#f5f5f5' : '#121212', minHeight: '100vh' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">Dashboard</Typography>
        <Tooltip title="Open Tickets">
          <IconButton color="inherit" onClick={() => setDialogsOpen({ ...dialogsOpen, tickets: true })}>
            <Badge badgeContent={dashboardData.ticketStats?.openTickets || 0} color="error">
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
            {dashboardData.properties.length > 0 ? (
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
                {dashboardData.properties.map((property) => (
                  <Marker key={property._id} position={[property.location.coordinates[1], property.location.coordinates[0]]} icon={propertyIcon}>
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
            <List sx={{ maxHeight: '300px', overflowY: 'auto' }}>{renderTasks(tasks.slice(0, 5))}</List>
            {tasks.length > 5 && (
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
              {dashboardData.recentActivities.map((activity, index) => (
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
            {dashboardData.openTickets.map((ticket) => (
              <ListItem key={ticket._id} sx={{ bgcolor: alpha(theme.palette.background.paper, 0.6), mb: 1, borderRadius: 1 }}>
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
          <List sx={{ maxHeight: '60vh', overflowY: 'auto' }}>{renderTasks(tasks)}</List>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Dashboard;