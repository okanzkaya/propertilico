import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Typography, Grid, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, List, ListItem, ListItemText,
  Chip, Snackbar, Alert, useMediaQuery, AppBar, Toolbar, CircularProgress, Tabs, Tab,
  IconButton, Drawer, Tooltip, InputAdornment, Fade, Paper, Avatar, Divider, FormHelperText
} from '@mui/material';
import {
  Add as AddIcon, Search as SearchIcon, Sort as SortIcon, FilterList as FilterListIcon,
  Close as CloseIcon, Menu as MenuIcon, PriorityHigh as PriorityHighIcon,
  FlagCircle as FlagCircleIcon, AccessTime as AccessTimeIcon, Person as PersonIcon,
  Warning as WarningIcon, Dashboard as DashboardIcon, Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { styled, useTheme, alpha } from '@mui/material/styles';
import { createTicket, getTickets, updateTicket, deleteTicket, addNoteToTicket } from '../../api';

const PageWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh',
}));

const StyledCard = styled(Paper)(({ theme }) => ({
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
  background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
}));

const CardHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
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
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    '& fieldset': {
      borderColor: 'transparent',
    },
    '&:hover fieldset': {
      borderColor: 'transparent',
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  borderRadius: theme.shape.borderRadius * 2,
  '& .MuiTab-root': {
    minWidth: 'auto',
    padding: theme.spacing(1, 2),
    fontWeight: theme.typography.fontWeightMedium,
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  '&.Mui-selected': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    borderRadius: theme.shape.borderRadius,
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
  const [formErrors, setFormErrors] = useState({});
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

  const isTicketExpired = useCallback((dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  }, []);

  const filteredTickets = useMemo(() => {
    const statusFilter = ['All', 'Open', 'In Progress', 'Closed', 'Expired'][currentTab];
    return tickets
      .filter(ticket => ticket && ticket.title && ticket.description)
      .filter(({ title, description, status, priority, dueDate }) => {
        const isExpired = isTicketExpired(dueDate);
        return (
          (statusFilter === 'All' ||
            (statusFilter === 'Expired' ? isExpired : status === statusFilter)) &&
          (filterPriority === 'All' || priority === filterPriority) &&
          [title, description].some(field =>
            field.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      })
      .sort((a, b) => {
        switch (sortOrder) {
          case 'dateAsc': return new Date(a.createdAt) - new Date(b.createdAt);
          case 'dateDesc': return new Date(b.createdAt) - new Date(a.createdAt);
          case 'priority': return b.priority.localeCompare(a.priority);
          default: return 0;
        }
      });
  }, [tickets, searchTerm, sortOrder, currentTab, filterPriority, isTicketExpired]);

  const handleOpenDialog = useCallback((type, ticket = null) => {
    setDialogType(type);
    setSelectedTicket(ticket);
    if (type === 'edit' && ticket) {
      setFormData({
        ...ticket,
        dueDate: ticket.dueDate ? new Date(ticket.dueDate).toISOString().split('T')[0] : ''
      });
    } else {
      setFormData({ status: 'Open', priority: 'Low' });
    }
    setFormErrors({});
    setDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setSelectedTicket(null);
    setNoteContent('');
    setFormErrors({});
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  }, []);

  const handleSubmit = useCallback(async () => {
    const validateForm = () => {
      const errors = {};
      if (!formData.title) errors.title = 'Title is required';
      if (!formData.description) errors.description = 'Description is required';
      if (!formData.status) errors.status = 'Status is required';
      if (!formData.priority) errors.priority = 'Priority is required';
      setFormErrors(errors);
      return Object.keys(errors).length === 0;
    };

    if (!validateForm()) return;

    try {
      if (dialogType === 'add') {
        await createTicket(formData);
      } else if (dialogType === 'edit') {
        await updateTicket(selectedTicket.id, formData);
      }
      setSnackbar({ open: true, message: `Ticket ${dialogType === 'add' ? 'created' : 'updated'} successfully`, severity: 'success' });
      handleCloseDialog();
      fetchTickets();
    } catch (error) {
      console.error('Error submitting ticket:', error);
      let errorMessage = 'Failed to submit ticket';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  }, [dialogType, formData, selectedTicket, handleCloseDialog, fetchTickets]);

  const handleDeleteTicket = useCallback(async () => {
    if (!selectedTicket || !selectedTicket.id) {
      setSnackbar({ open: true, message: 'Invalid ticket selected', severity: 'error' });
      handleCloseDialog();
      return;
    }

    try {
      await deleteTicket(selectedTicket.id);
      setSnackbar({ open: true, message: 'Ticket deleted successfully', severity: 'success' });
      handleCloseDialog();
      fetchTickets();
    } catch (error) {
      console.error('Error deleting ticket:', error);
      setSnackbar({ open: true, message: 'Failed to delete ticket', severity: 'error' });
    }
  }, [selectedTicket, handleCloseDialog, fetchTickets]);

  const handleAddNote = useCallback(async () => {
    if (!noteContent.trim()) {
      setSnackbar({ open: true, message: 'Note content cannot be empty', severity: 'error' });
      return;
    }

    try {
      await addNoteToTicket(selectedTicket.id, noteContent);
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

  const renderStatusChip = useCallback((status, dueDate) => {
    let color = status === 'Open' ? 'error' : status === 'In Progress' ? 'warning' : 'success';
    let label = status;

    if (isTicketExpired(dueDate)) {
      color = 'default';
      label = 'Expired';
    }

    return (
      <Chip
        label={label}
        color={color}
        size="small"
        sx={{
          fontWeight: 'bold',
          borderRadius: '16px',
          boxShadow: `0 0 8px ${alpha(theme.palette[color]?.main || theme.palette.grey[300], 0.5)}`,
        }}
      />
    );
  }, [isTicketExpired, theme]);

  const renderTicketCard = useCallback((ticket) => (
    <Grid item xs={12} sm={6} md={4} key={ticket.id}>
      <Fade in={true} timeout={500}>
        <StyledCard onClick={() => handleOpenDialog('view', ticket)} elevation={3}>
          <CardHeader>
            <Typography variant="h6" noWrap sx={{ color: 'white', fontWeight: 'bold' }}>{ticket.title}</Typography>
          </CardHeader>
          <CardContent>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2, height: '3em', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {ticket.description}
            </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              {renderStatusChip(ticket.status, ticket.dueDate)}
              <Tooltip title={`Priority: ${ticket.priority}`}>
                {renderPriorityIcon(ticket.priority)}
              </Tooltip>
            </Box>
          </CardContent>
          <CardFooter>
            <Tooltip title="Assignee">
              <Box display="flex" alignItems="center">
                <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: theme.palette.primary.main }}>
                  <PersonIcon fontSize="small" />
                </Avatar>
                <Typography variant="body2">{ticket.assignee || 'Unassigned'}</Typography>
              </Box>
            </Tooltip>
            <Tooltip title="Due Date">
              <Box display="flex" alignItems="center">
                <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color={isTicketExpired(ticket.dueDate) ? 'error.main' : 'inherit'}>
                  {ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString() : 'Not set'}
                </Typography>
                {isTicketExpired(ticket.dueDate) && <WarningIcon color="error" fontSize="small" sx={{ ml: 0.5 }} />}
              </Box>
            </Tooltip>
          </CardFooter>
        </StyledCard>
      </Fade>
    </Grid>
  ), [handleOpenDialog, renderStatusChip, renderPriorityIcon, isTicketExpired, theme]);

  const dialogContent = useCallback(() => {
    switch (dialogType) {
      case 'view':
        return selectedTicket ? (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                {selectedTicket.title}
              </Typography>
              <Typography variant="body1" paragraph>{selectedTicket.description}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Status</Typography>
              {renderStatusChip(selectedTicket.status, selectedTicket.dueDate)}
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
              <Typography variant="body2" color={isTicketExpired(selectedTicket.dueDate) ? 'error.main' : 'inherit'}>
                {selectedTicket.dueDate ? new Date(selectedTicket.dueDate).toLocaleDateString() : 'Not set'}
                {isTicketExpired(selectedTicket.dueDate) && (
                  <Tooltip title="Expired">
                    <WarningIcon color="error" fontSize="small" sx={{ ml: 0.5, verticalAlign: 'middle' }} />
                  </Tooltip>
                )}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.secondary.main }}>Notes</Typography>
              <List>
                {selectedTicket.notes && selectedTicket.notes.map((note, index) => (
                  <ListItem key={index} sx={{ bgcolor: alpha(theme.palette.background.paper, 0.5), mb: 1, borderRadius: 1 }}>
                    <ListItemText
                      primary={new Date(note.createdAt).toLocaleString()}
                      secondary={note.content}
                      primaryTypographyProps={{ variant: 'caption', color: 'textSecondary' }}
                      secondaryTypographyProps={{ variant: 'body2' }}
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
                error={!!formErrors.title}
                helperText={formErrors.title}
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
                error={!!formErrors.description}
                helperText={formErrors.description}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" error={!!formErrors.status}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status || ''}
                  onChange={handleInputChange}
                  label="Status"
                  required
                >
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                </Select>
                {formErrors.status && <FormHelperText>{formErrors.status}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" error={!!formErrors.priority}>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority || ''}
                  onChange={handleInputChange}
                  label="Priority"
                  required
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
                {formErrors.priority && <FormHelperText>{formErrors.priority}</FormHelperText>}
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
  }, [dialogType, selectedTicket, formData, formErrors, handleInputChange, noteContent, renderStatusChip, renderPriorityIcon, isTicketExpired, theme, setDialogType]);

  return (
    <PageWrapper>
      <AppBar position="static" color="transparent" elevation={0}>
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
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: theme.palette.primary.main }}>
            Ticket Management
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('add')}
            sx={{ borderRadius: '20px', textTransform: 'none' }}
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
            <ListItem>
              <ListItemText
                primary="Ticket Dashboard"
                primaryTypographyProps={{ variant: 'h6', color: 'primary' }}
              />
            </ListItem>
            <Divider />
            {['All Tickets', 'Open Tickets', 'In Progress Tickets', 'Closed Tickets', 'Expired Tickets'].map((text, index) => (
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

      <StyledTabs
        value={currentTab}
        onChange={(e, newValue) => setCurrentTab(newValue)}
        indicatorColor="primary"
        textColor="primary"
        centered={!isMobile}
        variant={isMobile ? "scrollable" : "standard"}
        sx={{ mb: 4 }}
      >
        <StyledTab label="All" icon={<DashboardIcon />} iconPosition="start" />
        <StyledTab label="Open" icon={<AssignmentIcon />} iconPosition="start" />
        <StyledTab label="In Progress" icon={<AccessTimeIcon />} iconPosition="start" />
        <StyledTab label="Closed" icon={<CheckCircleIcon />} iconPosition="start" />
        <StyledTab label="Expired" icon={<WarningIcon />} iconPosition="start" />
      </StyledTabs>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      ) : (
        <>
          {filteredTickets.length === 0 ? (
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="h6" color="textSecondary">
                No tickets found. Try adjusting your filters or create a new ticket.
              </Typography>
            </Paper>
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
        <DialogTitle
          sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
            color: 'white',
            fontWeight: 'bold'
          }}
        >
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
          <Button onClick={handleCloseDialog} color="primary" variant="outlined" sx={{ borderRadius: '20px' }}>
            Cancel
          </Button>
          {dialogType === 'add' || dialogType === 'edit' ? (
            <Button onClick={handleSubmit} color="primary" variant="contained" sx={{ borderRadius: '20px' }}>
              {dialogType === 'add' ? 'Create Ticket' : 'Save Changes'}
            </Button>
          ) : dialogType === 'delete' ? (
            <Button onClick={handleDeleteTicket} color="error" variant="contained" sx={{ borderRadius: '20px' }}>
              Delete
            </Button>
          ) : dialogType === 'addNote' ? (
            <Button onClick={handleAddNote} color="primary" variant="contained" sx={{ borderRadius: '20px' }}>
              Add Note
            </Button>
          ) : dialogType === 'view' ? (
            <>
              <Button onClick={() => handleOpenDialog('edit', selectedTicket)} color="primary" variant="contained" sx={{ borderRadius: '20px', mr: 1 }}>
                Edit Ticket
              </Button>
              <Button onClick={() => handleOpenDialog('delete', selectedTicket)} color="error" variant="contained" sx={{ borderRadius: '20px' }}>
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
          sx={{ width: '100%', borderRadius: '20px' }}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageWrapper>
  );
};

export default Tickets;