import React, { useState, useEffect, useMemo } from 'react';
import {
  Typography, Grid, Box, IconButton, Card, Dialog, DialogContent, Avatar,
  List, ListItem, ListItemAvatar, ListItemText, Tooltip, Checkbox, TextField, Badge, Button
} from '@mui/material';
import { styled, useTheme } from '@mui/system';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend, Filler
} from 'chart.js';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  Close as CloseIcon, Home as HomeIcon, Person as PersonIcon, Build as BuildIcon,
  MonetizationOn as MonetizationOnIcon, Assignment as AssignmentIcon, Add as AddIcon,
  CheckCircle as CheckCircleIcon, Delete as DeleteIcon
} from '@mui/icons-material';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend, Filler);

const PageWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh'
}));

const StatsCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[2],
  transition: '0.3s',
  '&:hover': { transform: 'scale(1.05)' },
  backgroundColor: theme.palette.background.paper,
  marginBottom: theme.spacing(3)
}));

const GraphContainer = styled(Card)(({ theme }) => ({
  padding: theme.spacing(1),
  height: '260px',
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[2],
  marginBottom: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}));

const TaskContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[2],
  backgroundColor: theme.palette.background.paper,
  marginBottom: theme.spacing(3)
}));

const TaskStatus = styled(Typography)(({ status, theme }) => ({
  fontWeight: 'bold',
  color: status === 'Completed' ? theme.palette.success.main : theme.palette.warning.main,
  marginLeft: theme.spacing(1)
}));

const ShowMoreButton = styled(Button)(({ theme }) => ({
  color: theme.palette.mode === 'dark' ? '#ccc' : theme.palette.primary.main,
  textTransform: 'none',
  fontSize: '0.875rem',
  display: 'block',
  margin: '0 auto',
  '&:hover': { backgroundColor: 'transparent' }
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
  { id: 1, title: 'Leaky faucet in apartment 4B', time: '3 hours ago', status: 'Open' },
  { id: 2, title: 'Broken window in common area', time: '6 hours ago', status: 'Open' },
  { id: 3, title: 'Heating issue in apartment 2A', time: '1 day ago', status: 'Pending' },
];

const chartData = (title, data) => ({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [{
    label: title,
    data,
    fill: true,
    backgroundColor: 'rgba(75,192,192,0.2)',
    borderColor: 'rgba(75,192,192,1)',
    borderWidth: 2
  }]
});

const FitBoundsMap = ({ locations }) => {
  const map = useMap();
  useEffect(() => { map.fitBounds(locations.map(loc => loc.position)); }, [locations, map]);
  return null;
};

const Dashboard = () => {
  const theme = useTheme();
  const [dialogsOpen, setDialogsOpen] = useState({ tickets: false, allTasks: false });
  const [tasks, setTasks] = useState([
    { id: 1, task: 'Schedule property inspection', status: 'Pending' },
    { id: 2, task: 'Follow up on maintenance request', status: 'Pending' },
    { id: 3, task: 'Review tenant applications', status: 'Pending' }
  ]);
  const [newTask, setNewTask] = useState('');

  const handleAddTask = () => {
    if (newTask.trim()) {
      setTasks((prevTasks) => [...prevTasks, { id: prevTasks.length + 1, task: newTask, status: 'Pending' }]);
      setNewTask('');
    }
  };

  const handleDeleteTask = (taskId) => setTasks((prevTasks) => prevTasks.filter(t => t.id !== taskId));

  const handleToggleTaskStatus = (taskId) => setTasks((prevTasks) => prevTasks.map(t =>
    t.id === taskId ? { ...t, status: t.status === 'Pending' ? 'Completed' : 'Pending' } : t
  ));

  const renderTasks = (tasksToRender) => tasksToRender.map((task) => (
    <ListItem key={task.id} button sx={{ flexWrap: 'wrap' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
        <Checkbox
          checked={task.status === 'Completed'}
          onChange={() => handleToggleTaskStatus(task.id)}
        />
        <ListItemText primary={task.task} sx={{ flex: 1, mr: 1 }} />
        <TaskStatus status={task.status}>{task.status}</TaskStatus>
      </Box>
      <Box display="flex" alignItems="center" justifyContent="flex-end" sx={{ width: '100%' }}>
        <IconButton edge="end" color="primary" onClick={() => handleToggleTaskStatus(task.id)}>
          <CheckCircleIcon />
        </IconButton>
        <IconButton edge="end" color="secondary" onClick={() => handleDeleteTask(task.id)}>
          <DeleteIcon />
        </IconButton>
      </Box>
    </ListItem>
  ));

  return (
    <PageWrapper>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">Overview</Typography>
        <Tooltip title="Open Tickets">
          <IconButton color="inherit" onClick={() => setDialogsOpen({ ...dialogsOpen, tickets: true })}>
            <Badge badgeContent={openTickets.length} color="secondary">
              <AssignmentIcon style={{ color: theme.palette.mode === 'light' ? theme.palette.text.primary : 'white' }} />
            </Badge>
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {[
          { title: 'Properties', value: 15, icon: <HomeIcon />, color: theme.palette.info.main },
          { title: 'Tenants', value: 45, icon: <PersonIcon />, color: theme.palette.success.main },
          { title: 'Maintenance', value: 8, icon: <BuildIcon />, color: theme.palette.warning.main },
          { title: 'Monthly Profit', value: '$10,000', icon: <MonetizationOnIcon />, color: theme.palette.error.main },
        ].map((stat, i) => (
          <Grid item xs={12} md={3} key={i}>
            <StatsCard>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: stat.color }}>{stat.icon}</Avatar>
                <Box ml={2}>
                  <Typography variant="h6">{stat.title}</Typography>
                  <Typography variant="h4">{stat.value}</Typography>
                </Box>
              </Box>
            </StatsCard>
          </Grid>
        ))}

        {[
          { title: 'Revenues', data: [65, 59, 80, 81, 56, 55, 40] },
          { title: 'Expenses', data: [28, 48, 40, 19, 86, 27, 90] },
          { title: 'Occupancy Rate', data: [95, 90, 85, 80, 88, 92, 85] },
        ].map((chart, i) => (
          <Grid item xs={12} md={4} key={i}>
            <GraphContainer>
              <Line data={chartData(chart.title, chart.data)} options={{ maintainAspectRatio: false }} />
            </GraphContainer>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Typography variant="h6" mb={2}>Property Locations</Typography>
          <MapContainer
            center={[51.505, -0.09]} zoom={13} style={{ height: '300px', width: '100%' }} attributionControl={false}
          >
            <TileLayer
              url={
                theme.palette.mode === 'dark'
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
        </Grid>

        <Grid item xs={12} md={6}>
          <TaskContainer>
            <Typography variant="h6">Tasks</Typography>
            <Box display="flex" alignItems="center" mb={2}>
              <TextField
                label="New Task"
                variant="outlined"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                fullWidth
                size="small"
                sx={{ mr: 2 }}
              />
              <IconButton color="primary" onClick={handleAddTask}><AddIcon /></IconButton>
            </Box>
            <List>{renderTasks(tasks.slice(0, 3))}</List>
            {tasks.length > 3 && <ShowMoreButton onClick={() => setDialogsOpen({ ...dialogsOpen, allTasks: true })}>Show More</ShowMoreButton>}
          </TaskContainer>
        </Grid>

        <Grid item xs={12} md={6}>
          <TaskContainer>
            <Typography variant="h6">New Feature</Typography>
            <Typography variant="body1">This is a new feature box. Add your content here.</Typography>
          </TaskContainer>
        </Grid>
      </Grid>

      <Dialog open={dialogsOpen.tickets} onClose={() => setDialogsOpen({ ...dialogsOpen, tickets: false })} maxWidth="sm" fullWidth>
        <DialogContent>
          <IconButton style={{ position: 'absolute', top: '10px', right: '10px' }} onClick={() => setDialogsOpen({ ...dialogsOpen, tickets: false })}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6">Tickets</Typography>
          <List>
            {openTickets.map((ticket) => (
              <ListItem key={ticket.id}>
                <ListItemAvatar><Avatar><AssignmentIcon /></Avatar></ListItemAvatar>
                <ListItemText primary={ticket.title} secondary={ticket.time} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogsOpen.allTasks} onClose={() => setDialogsOpen({ ...dialogsOpen, allTasks: false })} maxWidth="sm" fullWidth>
        <DialogContent>
          <IconButton style={{ position: 'absolute', top: '10px', right: '10px' }} onClick={() => setDialogsOpen({ ...dialogsOpen, allTasks: false })}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6">All Tasks</Typography>
          <List>{renderTasks(tasks)}</List>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
};

export default Dashboard;
