import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Typography, Grid, Box, Card, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, List, ListItem, ListItemText,
  Chip, Snackbar, Alert, useMediaQuery, AppBar, Toolbar, CircularProgress, Tabs, Tab,
  IconButton, Drawer, Tooltip, InputAdornment, Fade
} from '@mui/material';
import {
  Add as AddIcon, Search as SearchIcon, Sort as SortIcon, FilterList as FilterListIcon,
  Close as CloseIcon, Menu as MenuIcon, PriorityHigh as PriorityHighIcon,
  FlagCircle as FlagCircleIcon, AccessTime as AccessTimeIcon, Person as PersonIcon
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import { createTicket, getTickets, updateTicket, deleteTicket, addNoteToTicket } from '../../api';

const PageWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    boxShadow: theme.shadows[10],
    transform: 'translateY(-5px)',
  },
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
}));

const CardHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

const CardContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  flexGrow: 1,
}));

const CardFooter = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const SearchBar = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius * 5,
  },
}));

const Tickets = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [formData, setFormData] = useState({});
  const [noteContent, setNoteContent] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('dateDesc');
  const [currentTab, setCurrentTab] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState('All');

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedTickets = await getTickets();
      setTickets(fetchedTickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setSnackbar({ open: true, message: 'Failed to fetch tickets', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const filteredTickets = useMemo(() => {
    const statusFilter = ['All', 'Open', 'In Progress', 'Closed'][currentTab];
    return tickets
      .filter(ticket => ticket && ticket.title && ticket.description)
      .filter(({ title, description, status, priority }) =>
        (statusFilter === 'All' || status === statusFilter) &&
        (filterPriority === 'All' || priority === filterPriority) &&
        [title, description].some(field =>
          field.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
      .sort((a, b) => {
        switch (sortOrder) {
          case 'dateAsc': return new Date(a.createdAt) - new Date(b.createdAt);
          case 'dateDesc': return new Date(b.createdAt) - new Date(a.createdAt);
          case 'priority': return b.priority.localeCompare(a.priority);
          default: return 0;
        }
      });
  }, [tickets, searchTerm, sortOrder, currentTab, filterPriority]);

  const handleOpenDialog = useCallback((type, ticket = null) => {
    setDialogType(type);
    setSelectedTicket(ticket);
    setFormData(ticket || { status: 'Open', priority: 'Low' });
    setDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setSelectedTicket(null);
    setNoteContent('');
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      if (dialogType === 'add') {
        await createTicket(formData);
      } else if (dialogType === 'edit') {
        await updateTicket(selectedTicket._id, formData);
      }
      setSnackbar({ open: true, message: `Ticket ${dialogType === 'add' ? 'created' : 'updated'} successfully`, severity: 'success' });
      handleCloseDialog();
      fetchTickets();
    } catch (error) {
      console.error('Error submitting ticket:', error);
      setSnackbar({ open: true, message: 'Failed to submit ticket', severity: 'error' });
    }
  }, [dialogType, formData, selectedTicket, handleCloseDialog, fetchTickets]);

  const handleDeleteTicket = useCallback(async () => {
    try {
      await deleteTicket(selectedTicket._id);
      setSnackbar({ open: true, message: 'Ticket deleted successfully', severity: 'success' });
      handleCloseDialog();
      fetchTickets();
    } catch (error) {
      console.error('Error deleting ticket:', error);
      setSnackbar({ open: true, message: 'Failed to delete ticket', severity: 'error' });
    }
  }, [selectedTicket, handleCloseDialog, fetchTickets]);

  const handleAddNote = useCallback(async () => {
    try {
      await addNoteToTicket(selectedTicket._id, noteContent);
      setSnackbar({ open: true, message: 'Note added successfully', severity: 'success' });
      handleCloseDialog();
      fetchTickets();
    } catch (error) {
      console.error('Error adding note:', error);
      setSnackbar({ open: true, message: 'Failed to add note', severity: 'error' });
    }
  }, [selectedTicket, noteContent, handleCloseDialog, fetchTickets]);

  const renderPriorityIcon = useCallback((priority) => {
    switch (priority) {
      case 'High': return <PriorityHighIcon color="error" />;
      case 'Medium': return <FlagCircleIcon color="warning" />;
      case 'Low': return <FlagCircleIcon color="info" />;
      default: return null;
    }
  }, []);

  const renderStatusChip = useCallback((status) => {
    const color = status === 'Open' ? 'error' : status === 'In Progress' ? 'warning' : 'success';
    return <Chip label={status} color={color} size="small" sx={{ fontWeight: 'bold', borderRadius: '16px' }} />;
  }, []);

  const renderTicketCard = useCallback((ticket) => (
    <Grid item xs={12} sm={6} md={4} key={ticket._id}>
      <Fade in={true} timeout={500}>
        <StyledCard onClick={() => handleOpenDialog('view', ticket)}>
          <CardHeader>
            <Typography variant="h6" noWrap sx={{ color: 'white' }}>{ticket.title}</Typography>
          </CardHeader>
          <CardContent>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2, height: '3em', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {ticket.description}
            </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              {renderStatusChip(ticket.status)}
              <Tooltip title={`Priority: ${ticket.priority}`}>
                {renderPriorityIcon(ticket.priority)}
              </Tooltip>
            </Box>
          </CardContent>
          <CardFooter>
            <Tooltip title="Assignee">
              <Box display="flex" alignItems="center">
                <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2">{ticket.assignee || 'Unassigned'}</Typography>
              </Box>
            </Tooltip>
            <Tooltip title="Due Date">
              <Box display="flex" alignItems="center">
                <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2">
                  {ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString() : 'Not set'}
                </Typography>
              </Box>
            </Tooltip>
          </CardFooter>
        </StyledCard>
      </Fade>
    </Grid>
  ), [handleOpenDialog, renderStatusChip, renderPriorityIcon]);

  const dialogContent = useCallback(() => {
    switch (dialogType) {
      case 'view':
        return selectedTicket ? (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>{selectedTicket.title}</Typography>
              <Typography variant="body1" paragraph>{selectedTicket.description}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Status</Typography>
              {renderStatusChip(selectedTicket.status)}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Priority</Typography>
              <Box display="flex" alignItems="center">
                {renderPriorityIcon(selectedTicket.priority)}
                <Typography variant="body2" sx={{ ml: 1 }}>{selectedTicket.priority}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Assignee</Typography>
              <Typography variant="body2">{selectedTicket.assignee || 'Unassigned'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Due Date</Typography>
              <Typography variant="body2">
                {selectedTicket.dueDate ? new Date(selectedTicket.dueDate).toLocaleDateString() : 'Not set'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Notes</Typography>
              <List>
                {selectedTicket.notes && selectedTicket.notes.map((note, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={new Date(note.createdAt).toLocaleString()}
                      secondary={note.content}
                    />
                  </ListItem>
                ))}
              </List>
              <Button
                startIcon={<AddIcon />}
                onClick={() => setDialogType('addNote')}
                sx={{ mt: 2 }}
                variant="outlined"
              >
                Add Note
              </Button>
            </Grid>
          </Grid>
        ) : null;
      case 'add':
      case 'edit':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                name="title"
                label="Title"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.title || ''}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="description"
                label="Description"
                type="text"
                fullWidth
                variant="outlined"
                multiline
                rows={4}
                value={formData.description || ''}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status || 'Open'}
                  onChange={handleInputChange}
                  label="Status"
                >
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority || 'Low'}
                  onChange={handleInputChange}
                  label="Priority"
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="assignee"
                label="Assignee"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.assignee || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="dueDate"
                label="Due Date"
                type="date"
                fullWidth
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                value={formData.dueDate || ''}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        );
      case 'delete':
        return (
          <Typography>
            Are you sure you want to delete this ticket? This action cannot be undone.
          </Typography>
        );
      case 'addNote':
        return (
          <TextField
          autoFocus
          margin="dense"
          name="noteContent"
          label="Note Content"
          type="text"
          fullWidth
          variant="outlined"
          multiline
          rows={4}
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
        />
      );
    default:
      return null;
  }
}, [dialogType, selectedTicket, formData, handleInputChange, noteContent, renderStatusChip, renderPriorityIcon]);

return (
  <PageWrapper>
    <AppBar position="static" color="primary" elevation={0}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={() => setDrawerOpen(true)}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: 'white' }}>
          Ticket Management
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('add')}
        >
          New Ticket
        </Button>
      </Toolbar>
    </AppBar>

    <Drawer
      anchor="left"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
    >
      <Box
        sx={{ width: 250 }}
        role="presentation"
        onClick={() => setDrawerOpen(false)}
        onKeyDown={() => setDrawerOpen(false)}
      >
        <List>
          {['All Tickets', 'Open Tickets', 'In Progress Tickets', 'Closed Tickets'].map((text, index) => (
            <ListItem button key={text} onClick={() => setCurrentTab(index)}>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>

    <Box sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12} md={4}>
          <SearchBar
            fullWidth
            variant="outlined"
            placeholder="Search Tickets"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Sort</InputLabel>
            <Select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              label="Sort"
              startAdornment={
                <InputAdornment position="start">
                  <SortIcon />
                </InputAdornment>
              }
            >
              <MenuItem value="dateDesc">Newest First</MenuItem>
              <MenuItem value="dateAsc">Oldest First</MenuItem>
              <MenuItem value="priority">Priority</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Filter Priority</InputLabel>
            <Select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              label="Filter Priority"
              startAdornment={
                <InputAdornment position="start">
                  <FilterListIcon />
                </InputAdornment>
              }
            >
              <MenuItem value="All">All Priorities</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>

    <Tabs
      value={currentTab}
      onChange={(e, newValue) => setCurrentTab(newValue)}
      indicatorColor="primary"
      textColor="primary"
      centered={!isMobile}
      variant={isMobile ? "scrollable" : "standard"}
      sx={{ 
        mb: 4,
        backgroundColor: theme.palette.background.paper,
        borderRadius: '16px',
        '& .MuiTab-root': {
          minWidth: 'auto',
          px: 3,
          py: 2,
        }
      }}
    >
      <Tab label="All" />
      <Tab label="Open" />
      <Tab label="In Progress" />
      <Tab label="Closed" />
    </Tabs>

    {loading ? (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    ) : (
      <>
        {filteredTickets.length === 0 ? (
          <Typography variant="h6" align="center" sx={{ mt: 4 }}>
            No tickets found. Try adjusting your filters or create a new ticket.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredTickets.map(renderTicketCard)}
          </Grid>
        )}
      </>
    )}

    <Dialog
      open={dialogOpen}
      onClose={handleCloseDialog}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: '16px',
          overflow: 'hidden',
        }
      }}
    >
      <DialogTitle sx={{ backgroundColor: theme.palette.primary.main, color: 'white' }}>
        {dialogType === 'add'
          ? 'Create New Ticket'
          : dialogType === 'edit'
          ? 'Edit Ticket'
          : dialogType === 'view'
          ? selectedTicket?.title
          : dialogType === 'addNote'
          ? 'Add Note'
          : 'Confirm Delete'}
        <IconButton
          aria-label="close"
          onClick={handleCloseDialog}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>{dialogContent()}</DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog} color="primary" variant="outlined">Cancel</Button>
        {dialogType === 'add' || dialogType === 'edit' ? (
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {dialogType === 'add' ? 'Create Ticket' : 'Save Changes'}
          </Button>
        ) : dialogType === 'delete' ? (
          <Button onClick={handleDeleteTicket} color="error" variant="contained">
            Delete
          </Button>
        ) : dialogType === 'addNote' ? (
          <Button onClick={handleAddNote} color="primary" variant="contained">
            Add Note
          </Button>
        ) : dialogType === 'view' ? (
          <>
            <Button onClick={() => handleOpenDialog('edit', selectedTicket)} color="primary" variant="contained">
              Edit Ticket
            </Button>
            <Button onClick={() => handleOpenDialog('delete', selectedTicket)} color="error" variant="contained">
              Delete Ticket
            </Button>
          </>
        ) : null}
      </DialogActions>
    </Dialog>

    <Snackbar
      open={snackbar.open}
      autoHideDuration={6000}
      onClose={() => setSnackbar({ ...snackbar, open: false })}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        severity={snackbar.severity}
        sx={{ width: '100%' }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  </PageWrapper>
);
};

export default Tickets;