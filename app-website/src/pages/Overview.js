import React, { useState } from 'react';
import { Typography, Grid, Box, IconButton, Card, Dialog, DialogContent, Avatar, Badge, List, ListItem, ListItemAvatar, ListItemText, Divider, Tooltip, Checkbox, TextField } from '@mui/material';
import { styled } from '@mui/system';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Chart from 'react-apexcharts';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import BuildIcon from '@mui/icons-material/Build';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import PaymentIcon from '@mui/icons-material/Payment';
import ApartmentIcon from '@mui/icons-material/Apartment';

const PageWrapper = styled(Box)(({ theme }) => ({
  padding: '2rem',
  backgroundColor: '#f4f6f8',
  minHeight: '100vh',
}));

const StatsCard = styled(Card)({
  padding: '1rem',
  textAlign: 'center',
  marginBottom: '1rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.2s',
  cursor: 'pointer',
  '&:hover': {
    transform: 'scale(1.05)',
  },
});

const GraphContainer = styled(Card)({
  padding: '1rem',
  height: 300,
  textAlign: 'center',
  cursor: 'pointer',
  marginBottom: '1rem',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.05)',
  },
});

const MapContainerStyled = styled(Box)({
  height: 400,
  width: '100%',
  marginBottom: '1rem',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
});

const DialogContentStyled = styled(DialogContent)({
  padding: '2rem',
  width: '100%',
  maxWidth: '1000px',
  backgroundColor: 'white',
  boxShadow: 24,
  borderRadius: '8px',
});

const DetailedStats = styled(Box)({
  padding: '1rem',
  height: '100%',
  overflowY: 'auto',
});

const markerIcon = new L.Icon({
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const commonChartOptions = {
  chart: {
    type: 'line',
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
  },
  stroke: {
    curve: 'smooth',
  },
  xaxis: {
    categories: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ],
    labels: {
      style: {
        fontSize: '12px',
      },
      rotate: -45,
    },
  },
  tooltip: {
    x: {
      format: 'dd/MM/yy HH:mm',
    },
  },
  dataLabels: {
    enabled: false,
  },
  grid: {
    padding: {
      bottom: 10,
    },
  },
};

const revenueSeries = [
  {
    name: 'Revenues',
    data: [65, 59, 80, 81, 56, 55, 40, 70, 60, 75, 85, 90],
  },
];

const expensesSeries = [
  {
    name: 'Expenses',
    data: [28, 48, 40, 19, 86, 27, 90, 45, 55, 65, 30, 50],
  },
];

const occupancyRateSeries = [
  {
    name: 'Occupancy Rate',
    data: [95, 90, 85, 80, 88, 92, 85, 89, 90, 94, 93, 91],
  },
];

const CustomAttribution = () => {
  useMap();
  return null;
};

const openTickets = [
  { id: 1, title: 'Leaky faucet in apartment 4B', time: '3 hours ago', status: 'Open' },
  { id: 2, title: 'Broken window in common area', time: '6 hours ago', status: 'Open' },
  { id: 3, title: 'Heating issue in apartment 2A', time: '1 day ago', status: 'In Progress' },
];

const overdueRentPayments = [
  { id: 1, property: 'Apt 2A', daysOverdue: 3 },
  { id: 2, property: 'Apt 5B', daysOverdue: 7 },
];

const upcomingTaxes = [
  { id: 1, description: 'Property Tax for Apt 1A', daysLeft: 60 },
  { id: 2, description: 'Property Tax for Apt 3C', daysLeft: 90 },
];

const propertyOccupancy = [
  { id: 1, property: 'Apt 2A', occupancyRate: '95%' },
  { id: 2, property: 'Apt 5B', occupancyRate: '80%' },
  { id: 3, property: 'Apt 3C', occupancyRate: '100%' },
];

const randomLocations = [
  { id: 1, position: [51.505, -0.09], popup: 'Property 1' },
  { id: 2, position: [51.515, -0.1], popup: 'Property 2' },
  { id: 3, position: [51.52, -0.12], popup: 'Property 3' },
  { id: 4, position: [51.49, -0.08], popup: 'Property 4' },
  { id: 5, position: [51.50, -0.1], popup: 'Property 5' },
  { id: 6, position: [40.7128, -74.0060], popup: 'Property 6, New York' },
  { id: 7, position: [34.0522, -118.2437], popup: 'Property 7, Los Angeles' },
  { id: 8, position: [48.8566, 2.3522], popup: 'Property 8, Paris' },
  { id: 9, position: [37.7749, -122.4194], popup: 'Property 10, San Francisco' },
  { id: 10, position: [41.0082, 28.9784], popup: 'Property 11, Istanbul' },
  { id: 11, position: [39.9334, 32.8597], popup: 'Property 12, Ankara' }
];

const Dashboard = () => {
  const [revenueDialogOpen, setRevenueDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [occupancyDialogOpen, setOccupancyDialogOpen] = useState(false);
  const [ticketsOpen, setTicketsOpen] = useState(false);
  const [taxesDialogOpen, setTaxesDialogOpen] = useState(false);
  const [overdueDialogOpen, setOverdueDialogOpen] = useState(false);
  const [tasksDialogOpen, setTasksDialogOpen] = useState(false);
  const [tasks, setTasks] = useState([
    { id: 1, task: 'Schedule property inspection', status: 'Pending' },
    { id: 2, task: 'Follow up on maintenance request', status: 'In Progress' },
    { id: 3, task: 'Review tenant applications', status: 'Pending' },
    { id: 4, task: 'Prepare financial report', status: 'Pending' },
    { id: 5, task: 'Organize tenant meeting', status: 'In Progress' },
  ]);
  const [newTask, setNewTask] = useState('');

  const handleRevenueClick = () => setRevenueDialogOpen(true);
  const handleExpenseClick = () => setExpenseDialogOpen(true);
  const handleOccupancyClick = () => setOccupancyDialogOpen(true);
  const handleTicketsClick = () => setTicketsOpen(true);
  const handleTaxesClick = () => setTaxesDialogOpen(true);
  const handleOverdueClick = () => setOverdueDialogOpen(true);
  const handleTasksClick = () => setTasksDialogOpen(true);
  const handleClose = () => {
    setRevenueDialogOpen(false);
    setExpenseDialogOpen(false);
    setOccupancyDialogOpen(false);
    setTicketsOpen(false);
    setTaxesDialogOpen(false);
    setOverdueDialogOpen(false);
    setTasksDialogOpen(false);
  };

  const handleAddTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { id: tasks.length + 1, task: newTask, status: 'Pending' }]);
      setNewTask('');
    }
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const handleToggleTaskStatus = (taskId) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: task.status === 'Pending' ? 'Completed' : 'Pending' } : task)));
  };

  const mapBounds = randomLocations.map((location) => location.position);

  return (
    <PageWrapper>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Overview</Typography>
        <Tooltip title="Open Tickets">
          <IconButton color="inherit" onClick={handleTicketsClick}>
            <Badge badgeContent={openTickets.length} color="secondary">
              <AssignmentIcon />
            </Badge>
          </IconButton>
        </Tooltip>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <Avatar style={{ backgroundColor: '#4caf50' }}>
              <HomeIcon />
            </Avatar>
            <Box mt={1}>
              <Typography variant="h6">Properties</Typography>
              <Typography variant="body1">15</Typography>
            </Box>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <Avatar style={{ backgroundColor: '#f44336' }}>
              <PersonIcon />
            </Avatar>
            <Box mt={1}>
              <Typography variant="h6">Tenants</Typography>
              <Typography variant="body1">45</Typography>
            </Box>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <Avatar style={{ backgroundColor: '#ff9800' }}>
              <BuildIcon />
            </Avatar>
            <Box mt={1}>
              <Typography variant="h6">Maintenance</Typography>
              <Typography variant="body1">8</Typography>
            </Box>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <Avatar style={{ backgroundColor: '#2196f3' }}>
              <MonetizationOnIcon />
            </Avatar>
            <Box mt={1}>
              <Typography variant="h6">Monthly Profit</Typography>
              <Typography variant="body1">$10,000</Typography>
            </Box>
          </StatsCard>
        </Grid>
        <Grid item xs={12}>
          <MapContainerStyled>
            <MapContainer
              bounds={mapBounds}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
              attributionControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {randomLocations.map((location) => (
                <Marker key={location.id} position={location.position} icon={markerIcon}>
                  <Popup>{location.popup}</Popup>
                </Marker>
              ))}
              <CustomAttribution />
            </MapContainer>
          </MapContainerStyled>
        </Grid>
        <Grid item xs={12} md={4}>
          <GraphContainer onClick={handleRevenueClick}>
            <Typography variant="h6">Revenues</Typography>
            <Chart options={commonChartOptions} series={revenueSeries} type="line" height={300} />
          </GraphContainer>
        </Grid>
        <Grid item xs={12} md={4}>
          <GraphContainer onClick={handleExpenseClick}>
            <Typography variant="h6">Expenses</Typography>
            <Chart options={commonChartOptions} series={expensesSeries} type="line" height={300} />
          </GraphContainer>
        </Grid>
        <Grid item xs={12} md={4}>
          <GraphContainer onClick={handleOccupancyClick}>
            <Typography variant="h6">Occupancy Rate</Typography>
            <Chart options={commonChartOptions} series={occupancyRateSeries} type="line" height={300} />
          </GraphContainer>
        </Grid>
        <Grid item xs={12} md={6}>
          <StatsCard onClick={handleTaxesClick}>
            <Avatar style={{ backgroundColor: '#ff9800' }}>
              <EventIcon />
            </Avatar>
            <Box mt={1}>
              <Typography variant="h6">Upcoming Taxes</Typography>
              <Typography variant="body1">Your taxes are approaching</Typography>
            </Box>
          </StatsCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <StatsCard onClick={handleOverdueClick}>
            <Avatar style={{ backgroundColor: '#4caf50' }}>
              <PaymentIcon />
            </Avatar>
            <Box mt={1}>
              <Typography variant="h6">Overdue Rent Payments</Typography>
              <Typography variant="body1">You have overdue rent payments</Typography>
            </Box>
          </StatsCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <StatsCard>
            <Typography variant="h6">Recent Activity</Typography>
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <HomeIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary="New property added: Apt 5A" secondary="2 hours ago" />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary="New tenant signed lease" secondary="5 hours ago" />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <BuildIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary="Maintenance completed: HVAC" secondary="1 day ago" />
              </ListItem>
            </List>
          </StatsCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <StatsCard>
            <Typography variant="h6">Upcoming Events</Typography>
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <AssignmentIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary="Annual property inspection" secondary="Next week" />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <AssignmentIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary="Tenant meeting" secondary="Tomorrow" />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <AssignmentIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary="Maintenance review" secondary="Next month" />
              </ListItem>
            </List>
          </StatsCard>
        </Grid>
        <Grid item xs={12}>
          <StatsCard>
            <Typography variant="h6" gutterBottom>Tasks</Typography>
            <Box display="flex" alignItems="center" mb={2}>
              <TextField
                label="New Task"
                variant="outlined"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                fullWidth
              />
              <IconButton color="primary" onClick={handleAddTask}>
                <AddIcon />
              </IconButton>
            </Box>
            <List>
              {tasks.slice(0, 3).map((task) => (
                <ListItem key={task.id}>
                  <Checkbox
                    checked={task.status === 'Completed'}
                    onChange={() => handleToggleTaskStatus(task.id)}
                  />
                  <ListItemText primary={task.task} secondary={task.status} />
                  <IconButton edge="end" color="secondary" onClick={() => handleDeleteTask(task.id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
              {tasks.length > 3 && (
                <ListItem button onClick={handleTasksClick}>
                  <ListItemText primary="See more tasks" />
                </ListItem>
              )}
            </List>
          </StatsCard>
        </Grid>
        <Grid item xs={12}>
          <StatsCard onClick={handleOccupancyClick}>
            <Avatar style={{ backgroundColor: '#3f51b5' }}>
              <ApartmentIcon />
            </Avatar>
            <Box mt={1}>
              <Typography variant="h6">Property Occupancy</Typography>
              <Typography variant="body1">Click to see occupancy details</Typography>
            </Box>
          </StatsCard>
        </Grid>
      </Grid>

      <Dialog open={revenueDialogOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContentStyled>
          <IconButton style={{ position: 'absolute', top: '10px', right: '10px' }} onClick={handleClose}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" gutterBottom>
            Detailed Revenues
          </Typography>
          <Chart options={{ ...commonChartOptions, chart: { ...commonChartOptions.chart, toolbar: { show: true, tools: { download: true } } } }} series={revenueSeries} type="line" height={500} />
          <DetailedStats>
            <Typography variant="body1" gutterBottom>
              Detailed revenue information goes here. You can add more statistics, graphs, or any other relevant information.
            </Typography>
          </DetailedStats>
        </DialogContentStyled>
      </Dialog>

      <Dialog open={expenseDialogOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContentStyled>
          <IconButton style={{ position: 'absolute', top: '10px', right: '10px' }} onClick={handleClose}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" gutterBottom>
            Detailed Expenses
          </Typography>
          <Chart options={{ ...commonChartOptions, chart: { ...commonChartOptions.chart, toolbar: { show: true, tools: { download: true } } } }} series={expensesSeries} type="line" height={500} />
          <DetailedStats>
            <Typography variant="body1" gutterBottom>
              Detailed expense information goes here. You can add more statistics, graphs, or any other relevant information.
            </Typography>
          </DetailedStats>
        </DialogContentStyled>
      </Dialog>

      <Dialog open={occupancyDialogOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContentStyled>
          <IconButton style={{ position: 'absolute', top: '10px', right: '10px' }} onClick={handleClose}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" gutterBottom>
            Detailed Occupancy Rate
          </Typography>
          <Chart options={{ ...commonChartOptions, chart: { ...commonChartOptions.chart, toolbar: { show: true, tools: { download: true } } } }} series={occupancyRateSeries} type="line" height={500} />
          <DetailedStats>
            <Typography variant="body1" gutterBottom>
              Detailed occupancy rate information goes here. You can add more statistics, graphs, or any other relevant information.
            </Typography>
          </DetailedStats>
        </DialogContentStyled>
      </Dialog>

      <Dialog open={ticketsOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogContentStyled>
          <IconButton style={{ position: 'absolute', top: '10px', right: '10px' }} onClick={handleClose}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" gutterBottom>
            Open Tickets
          </Typography>
          <List>
            {openTickets.map((ticket) => (
              <ListItem key={ticket.id}>
                <ListItemAvatar>
                  <Avatar>
                    <AssignmentIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={ticket.title} secondary={ticket.time} />
                <Typography variant="body2" color="textSecondary">{ticket.status}</Typography>
              </ListItem>
            ))}
          </List>
        </DialogContentStyled>
      </Dialog>

      <Dialog open={taxesDialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogContentStyled>
          <IconButton style={{ position: 'absolute', top: '10px', right: '10px' }} onClick={handleClose}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" gutterBottom>
            Approaching Taxes
          </Typography>
          <List>
            {upcomingTaxes.map((tax) => (
              <ListItem key={tax.id}>
                <ListItemText primary={tax.description} secondary={`Days Left: ${tax.daysLeft}`} />
              </ListItem>
            ))}
          </List>
        </DialogContentStyled>
      </Dialog>

      <Dialog open={overdueDialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogContentStyled>
          <IconButton style={{ position: 'absolute', top: '10px', right: '10px' }} onClick={handleClose}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" gutterBottom>
            Overdue Rent Payments
          </Typography>
          <List>
            {overdueRentPayments.map((payment) => (
              <ListItem key={payment.id}>
                <ListItemText primary={`Property: ${payment.property}`} secondary={`Days Overdue: ${payment.daysOverdue}`} />
              </ListItem>
            ))}
          </List>
        </DialogContentStyled>
      </Dialog>

      <Dialog open={tasksDialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogContentStyled>
          <IconButton style={{ position: 'absolute', top: '10px', right: '10px' }} onClick={handleClose}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" gutterBottom>
            All Tasks
          </Typography>
          <List>
            {tasks.map((task) => (
              <ListItem key={task.id}>
                <Checkbox
                  checked={task.status === 'Completed'}
                  onChange={() => handleToggleTaskStatus(task.id)}
                />
                <ListItemText primary={task.task} secondary={task.status} />
                <IconButton edge="end" color="secondary" onClick={() => handleDeleteTask(task.id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </DialogContentStyled>
      </Dialog>

      <Dialog open={occupancyDialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogContentStyled>
          <IconButton style={{ position: 'absolute', top: '10px', right: '10px' }} onClick={handleClose}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" gutterBottom>
            Property Occupancy
          </Typography>
          <List>
            {propertyOccupancy.map((occupancy) => (
              <ListItem key={occupancy.id}>
                <ListItemText primary={occupancy.property} secondary={`Occupancy Rate: ${occupancy.occupancyRate}`} />
              </ListItem>
            ))}
          </List>
        </DialogContentStyled>
      </Dialog>
    </PageWrapper>
  );
};

export default Dashboard;
