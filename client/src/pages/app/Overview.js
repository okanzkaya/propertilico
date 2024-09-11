import React, { useState, useEffect, useMemo } from 'react';
import {
  Typography, Grid, Box, IconButton, Card, Dialog, DialogContent, Avatar,
  List, ListItem, ListItemAvatar, ListItemText, Tooltip, Checkbox, TextField,
  Badge, Button, Chip, useMediaQuery, Select, MenuItem, Divider
} from '@mui/material';
import { styled, useTheme, alpha } from '@mui/system';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, Title,
  Tooltip as ChartTooltip, Legend, Filler, ArcElement
} from 'chart.js';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  Close as CloseIcon, Home as HomeIcon, Person as PersonIcon, Build as BuildIcon,
  MonetizationOn as MonetizationOnIcon, Assignment as AssignmentIcon, Add as AddIcon,
  Delete as DeleteIcon, MoreVert as MoreVertIcon, ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon, AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title,
  ChartTooltip, Legend, Filler, ArcElement
);

const PageWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.mode === 'light' ? '#f5f5f5' : '#121212',
  minHeight: '100vh',
}));

const StatsCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  transition: '0.3s',
  '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 6px 12px rgba(0,0,0,0.15)' },
  backgroundColor: theme.palette.background.paper,
  height: '100%',
}));

const GraphContainer = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '350px',
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
}));

const TaskContainer = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  backgroundColor: theme.palette.background.paper,
  marginBottom: theme.spacing(3),
  height: '100%',
}));

const TaskStatus = styled(Chip)(({ status, theme }) => ({
  fontWeight: 'bold',
  backgroundColor: status === 'Completed' ? theme.palette.success.main : theme.palette.warning.main,
  color: theme.palette.getContrastText(status === 'Completed' ? theme.palette.success.main : theme.palette.warning.main),
}));

const ShowMoreButton = styled(Button)(({ theme }) => ({
  color: theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.primary.light,
  textTransform: 'none',
  fontSize: '0.875rem',
  fontWeight: 'bold',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
}));

const propertyIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

const propertyLocations = [
  { id: 1, position: [51.505, -0.09], name: 'Property 1', info: '2 Bed, 1 Bath, $1500/mo' },
  { id: 2, position: [51.51, -0.1], name: 'Property 2', info: '3 Bed, 2 Bath, $2200/mo' },
  { id: 3, position: [51.515, -0.08], name: 'Property 3', info: '1 Bed, 1 Bath, $1200/mo' },
  { id: 4, position: [51.52, -0.12], name: 'Property 4', info: '4 Bed, 3 Bath, $3000/mo' },
  { id: 5, position: [51.525, -0.11], name: 'Property 5', info: '2 Bed, 2 Bath, $2000/mo' },
];

const openTickets = [
  { id: 1, title: 'Leaky faucet in apartment 4B', time: '3 hours ago', status: 'Open', priority: 'Medium' },
  { id: 2, title: 'Broken window in common area', time: '6 hours ago', status: 'Open', priority: 'High' },
  { id: 3, title: 'Heating issue in apartment 2A', time: '1 day ago', status: 'Pending', priority: 'High' },
];

const financialData = {
  revenue: [65000, 72000, 68000, 70000, 75000, 82000],
  expenses: [45000, 48000, 46000, 49000, 52000, 55000],
  profit: [20000, 24000, 22000, 21000, 23000, 27000],
};

const chartData = (data, colors) => ({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: Object.keys(data).map((key, index) => ({
    label: key.charAt(0).toUpperCase() + key.slice(1),
    data: data[key],
    fill: index === 0,
    backgroundColor: colors[key] + '33',
    borderColor: colors[key],
    tension: 0.4,
  }))
});

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

const FitBoundsMap = ({ locations }) => {
  const map = useMap();
  useEffect(() => { map.fitBounds(locations.map(loc => loc.position)); }, [locations, map]);
  return null;
};

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [dialogsOpen, setDialogsOpen] = useState({ tickets: false, allTasks: false });
  const [tasks, setTasks] = useState([
    { id: 1, task: 'Schedule property inspection', status: 'Pending', dueDate: '2023-09-15' },
    { id: 2, task: 'Follow up on maintenance request', status: 'Pending', dueDate: '2023-09-10' },
    { id: 3, task: 'Review tenant applications', status: 'Completed', dueDate: '2023-09-05' },
    { id: 4, task: 'Prepare monthly financial report', status: 'Pending', dueDate: '2023-09-30' },
  ]);
  const [newTask, setNewTask] = useState('');
  const [timeRange, setTimeRange] = useState('lastSixMonths');

  const handleAddTask = () => {
    if (newTask.trim()) {
      const today = new Date();
      const dueDate = new Date(today.setDate(today.getDate() + 7)).toISOString().split('T')[0];
      setTasks(prevTasks => [
        {
          id: prevTasks.length + 1,
          task: newTask,
          status: 'Pending',
          dueDate
        },
        ...prevTasks
      ]);
      setNewTask('');
    }
  };

  const handleDeleteTask = (taskId) => setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));

  const handleToggleTaskStatus = (taskId) => setTasks(prevTasks => prevTasks.map(t =>
    t.id === taskId ? { ...t, status: t.status === 'Pending' ? 'Completed' : 'Pending' } : t
  ));

  const renderTasks = (tasksToRender) => tasksToRender.map((task) => (
    <ListItem key={task.id} sx={{ flexWrap: 'wrap', mb: 1, backgroundColor: alpha(theme.palette.background.paper, 0.6), borderRadius: 1 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" flexWrap="wrap">
        <Box display="flex" alignItems="center" flexGrow={1}>
          <Checkbox checked={task.status === 'Completed'} onChange={() => handleToggleTaskStatus(task.id)} />
          <ListItemText 
            primary={task.task} 
            secondary={`Due: ${task.dueDate}`}
            sx={{ textDecoration: task.status === 'Completed' ? 'line-through' : 'none' }}
          />
        </Box>
        <Box display="flex" alignItems="center">
          <TaskStatus label={task.status} status={task.status} size="small" />
          <IconButton size="small" onClick={() => handleDeleteTask(task.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </ListItem>
  ));

  const stats = useMemo(() => [
    { title: 'Properties', value: 15, icon: <HomeIcon />, color: theme.palette.primary.main, change: '+2', trend: 'up' },
    { title: 'Tenants', value: 45, icon: <PersonIcon />, color: theme.palette.success.main, change: '+5', trend: 'up' },
    { title: 'Maintenance', value: 8, icon: <BuildIcon />, color: theme.palette.warning.main, change: '-3', trend: 'down' },
    { title: 'Monthly Profit', value: '$27,000', icon: <MonetizationOnIcon />, color: theme.palette.error.main, change: '+$5,000', trend: 'up' },
  ], [theme.palette]);

  const occupancyRate = 85;
  const occupancyChartData = {
    labels: ['Occupied', 'Vacant'],
    datasets: [{
      data: [occupancyRate, 100 - occupancyRate],
      backgroundColor: [theme.palette.success.main, theme.palette.error.main],
      hoverOffset: 4
    }]
  };

  return (
    <PageWrapper>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">Dashboard</Typography>
        <Tooltip title="Open Tickets">
          <IconButton color="inherit" onClick={() => setDialogsOpen({ ...dialogsOpen, tickets: true })}>
            <Badge badgeContent={openTickets.length} color="error">
              <AssignmentIcon />
            </Badge>
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {stats.map((stat, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <StatsCard>
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
                    {stat.change}
                  </span> vs last month
                </Typography>
              </Box>
            </StatsCard>
          </Grid>
        ))}

        <Grid item xs={12} md={8}>
          <GraphContainer>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Financial Overview</Typography>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                size="small"
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="lastSixMonths">Last 6 Months</MenuItem>
                <MenuItem value="thisYear">This Year</MenuItem>
                <MenuItem value="lastYear">Last Year</MenuItem>
              </Select>
            </Box>
            <Line 
              data={chartData(financialData, {
                revenue: theme.palette.primary.main,
                expenses: theme.palette.error.main,
                profit: theme.palette.success.main
              })}
              options={chartOptions} 
            />
          </GraphContainer>
        </Grid>

        <Grid item xs={12} md={4}>
          <GraphContainer>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Occupancy Rate</Typography>
              <Typography variant="h4" fontWeight="bold" color={theme.palette.success.main}>{occupancyRate}%</Typography>
            </Box>
            <Box height="200px">
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
          </GraphContainer>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ p: 2, borderRadius: 2, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" mb={2}>Property Locations</Typography>
            <MapContainer
              center={[51.505, -0.09]} zoom={13} style={{ height: '400px', width: '100%', borderRadius: '8px' }}
              whenCreated={(map) => {
                map.on('baselayerchange', (e) => {
                  if (theme.palette.mode === 'dark') {
                    e.layer.setUrl('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png');
                  }
                });
              }}
            >
              <TileLayer
                url={theme.palette.mode === 'dark' 
                  ? 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
                  : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                }
              />
              <FitBoundsMap locations={propertyLocations} />
              {propertyLocations.map((property) => (
                <Marker key={property.id} position={property.position} icon={propertyIcon}>
                  <Popup>
                    <Typography variant="subtitle1"><strong>{property.name}</strong></Typography>
                    <Typography variant="body2">{property.info}</Typography>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <TaskContainer>
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
              <IconButton color="primary" onClick={handleAddTask}>
                <AddIcon />
              </IconButton>
            </Box>
            <List sx={{ maxHeight: '300px', overflowY: 'auto' }}>{renderTasks(tasks.slice(0, 5))}</List>
            {tasks.length > 5 && (
              <Box display="flex" justifyContent="center" mt={2}>
                <ShowMoreButton 
                  onClick={() => setDialogsOpen({ ...dialogsOpen, allTasks: true })}
                  startIcon={<MoreVertIcon />}
                >
                  View All Tasks
                </ShowMoreButton>
              </Box>
            )}
          </TaskContainer>
        </Grid>

        <Grid item xs={12} md={6}>
          <TaskContainer>
            <Typography variant="h6" mb={2}>Recent Activities</Typography>
            <List>
              {[
                { action: 'New tenant moved in', property: 'Property 2', time: '2 hours ago', icon: <PersonIcon /> },
                { action: 'Rent collected', property: 'Property 1', time: '5 hours ago', icon: <AttachMoneyIcon /> },
                { action: 'Maintenance completed', property: 'Property 3', time: '1 day ago', icon: <BuildIcon /> },
                { action: 'Lease agreement signed', property: 'Property 5', time: '2 days ago', icon: <AssignmentIcon /> },
              ].map((activity, index) => (
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
          </TaskContainer>
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
            {openTickets.map((ticket) => (
              <ListItem key={ticket.id} sx={{ bgcolor: alpha(theme.palette.background.paper, 0.6), mb: 1, borderRadius: 1 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: ticket.priority === 'High' ? theme.palette.error.main : theme.palette.warning.main }}>
                    <AssignmentIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={ticket.title}
                  secondary={`${ticket.time} • Priority: ${ticket.priority}`}
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
    </PageWrapper>
  );
};

export default Dashboard;