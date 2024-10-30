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
import { useTheme, alpha } from '@mui/material/styles';
import { createTicket, getTickets, updateTicket, deleteTicket, addNoteToTicket } from '../../api';
import styles from './Tickets.module.css';

const TABS = [
  { label: 'All', icon: <DashboardIcon /> },
  { label: 'Open', icon: <AssignmentIcon /> },
  { label: 'In Progress', icon: <AccessTimeIcon /> },
  { label: 'Closed', icon: <CheckCircleIcon /> },
  { label: 'Expired', icon: <WarningIcon /> }
];

const Tickets = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Open',
    priority: 'Low',
    assignee: '',
    dueDate: ''
  });
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
    const statusFilter = TABS[currentTab].label;
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
    } else if (type === 'add') {
      setFormData({
        title: '',
        description: '',
        status: 'Open',
        priority: 'Low',
        assignee: '',
        dueDate: ''
      });
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

  const validateForm = useCallback(() => {
    const errors = {};
    if (!formData.title) errors.title = 'Title is required';
    if (!formData.description) errors.description = 'Description is required';
    if (!formData.status) errors.status = 'Status is required';
    if (!formData.priority) errors.priority = 'Priority is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    try {
      if (dialogType === 'add') {
        await createTicket(formData);
        setSnackbar({ open: true, message: 'Ticket created successfully', severity: 'success' });
      } else if (dialogType === 'edit') {
        await updateTicket(selectedTicket.id, formData);
        setSnackbar({ open: true, message: 'Ticket updated successfully', severity: 'success' });
      }
      handleCloseDialog();
      fetchTickets();
    } catch (error) {
      console.error('Error submitting ticket:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to submit ticket',
        severity: 'error'
      });
    }
  }, [dialogType, formData, selectedTicket, handleCloseDialog, fetchTickets, validateForm]);

  const handleDeleteTicket = useCallback(async () => {
    if (!selectedTicket?.id) {
      setSnackbar({ open: true, message: 'Invalid ticket selected', severity: 'error' });
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
        <Paper className={styles.ticketCard} onClick={() => handleOpenDialog('view', ticket)}>
          <Box className={styles.cardHeader}>
            <Typography variant="h6" noWrap className={styles.cardTitle}>
              {ticket.title}
            </Typography>
          </Box>
          <Box className={styles.cardContent}>
            <Typography variant="body2" color="textSecondary" className={styles.cardDescription}>
              {ticket.description}
            </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              {renderStatusChip(ticket.status, ticket.dueDate)}
              <Tooltip title={`Priority: ${ticket.priority}`}>
                {renderPriorityIcon(ticket.priority)}
              </Tooltip>
            </Box>
          </Box>
          <Box className={styles.cardFooter}>
            <Tooltip title="Assignee">
              <Box display="flex" alignItems="center">
                <Avatar className={styles.assigneeAvatar}>
                  <PersonIcon fontSize="small" />
                </Avatar>
                <Typography variant="body2">{ticket.assignee || 'Unassigned'}</Typography>
              </Box>
            </Tooltip>
            <Tooltip title="Due Date">
              <Box display="flex" alignItems="center">
                <AccessTimeIcon fontSize="small" className={styles.dueDateIcon} />
                <Typography
                  variant="body2"
                  className={isTicketExpired(ticket.dueDate) ? styles.expiredDate : ''}
                >
                  {ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString() : 'Not set'}
                </Typography>
                {isTicketExpired(ticket.dueDate) && (
                  <WarningIcon color="error" fontSize="small" className={styles.warningIcon} />
                )}
              </Box>
            </Tooltip>
          </Box>
        </Paper>
      </Fade>
    </Grid>
  ), [handleOpenDialog, renderStatusChip, renderPriorityIcon, isTicketExpired]);

  const renderDialogContent = useCallback(() => {
    switch (dialogType) {
      case 'view':
        return selectedTicket ? (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom className={styles.dialogTitle}>
                {selectedTicket.title}
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedTicket.description}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Status</Typography>
              {renderStatusChip(selectedTicket.status, selectedTicket.dueDate)}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Priority</Typography>
              <Box display="flex" alignItems="center">
                {renderPriorityIcon(selectedTicket.priority)}
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {selectedTicket.priority}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom className={styles.sectionTitle}>
                Notes
              </Typography>
              <List className={styles.notesList}>
                {selectedTicket.notes?.map((note, index) => (
                  <ListItem key={index} className={styles.noteItem}>
                    <ListItemText
                      primary={new Date(note.createdAt).toLocaleString()}
                      secondary={note.content}
                      primaryTypographyProps={{ className: 'note-timestamp' }}
                      secondaryTypographyProps={{ className: 'note-content' }}
                    />
                  </ListItem>
                ))}
              </List>
              <Button
                startIcon={<AddIcon />}
                onClick={() => setDialogType('addNote')}
                variant="outlined"
                className={styles.addNoteButton}
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
                name="title"
                label="Title"
                fullWidth
                value={formData.title}
                onChange={handleInputChange}
                error={!!formErrors.title}
                helperText={formErrors.title}
                className={styles.formField}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                error={!!formErrors.description}
                helperText={formErrors.description}
                className={styles.formField}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.status}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  label="Status"
                >
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                </Select>{formErrors.status && <FormHelperText>{formErrors.status}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.priority}>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  label="Priority"
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
                name="assignee"
                label="Assignee"
                fullWidth
                value={formData.assignee}
                onChange={handleInputChange}
                className={styles.formField}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="dueDate"
                label="Due Date"
                type="date"
                fullWidth
                value={formData.dueDate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                className={styles.formField}
              />
            </Grid>
          </Grid>
        );

      case 'delete':
        return (
          <Typography className={styles.dialogMessage}>
            Are you sure you want to delete this ticket? This action cannot be undone.
          </Typography>
        );

      case 'addNote':
        return (
          <TextField
            autoFocus
            name="noteContent"
            label="Note Content"
            fullWidth
            multiline
            rows={4}
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className={styles.noteInput}
          />
        );

      default:
        return null;
    }
  }, [dialogType, selectedTicket, formData, formErrors, handleInputChange, noteContent, renderStatusChip, renderPriorityIcon]);

  return (
    <Box className={styles.pageWrapper}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setDrawerOpen(true)}
            sx={{ display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h5" component="div" className={styles.pageTitle}>
            Ticket Management
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('add')}
            className={styles.addButton}
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
        <Box className={styles.drawerContent}>
          <List>
            <ListItem>
              <ListItemText primary="Ticket Dashboard" className={styles.drawerTitle} />
            </ListItem>
            <Divider />
            {TABS.map((tab, index) => (
              <ListItem 
                button 
                key={tab.label} 
                onClick={() => {
                  setCurrentTab(index);
                  setDrawerOpen(false);
                }}
              >
                <ListItemText primary={`${tab.label} Tickets`} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box className={styles.contentWrapper}>
        <Grid container spacing={3} className={styles.filtersContainer}>
          <Grid item xs={12} md={4}>
            <TextField
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
              className={styles.searchField}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                label="Sort By"
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
              <InputLabel>Priority Filter</InputLabel>
              <Select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                label="Priority Filter"
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

        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          centered={!isMobile}
          variant={isMobile ? "scrollable" : "standard"}
          className={styles.customTabs}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.label}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              className={styles.customTab}
            />
          ))}
        </Tabs>

        {loading ? (
          <Box className={styles.loadingContainer}>
            <CircularProgress />
          </Box>
        ) : filteredTickets.length === 0 ? (
          <Paper elevation={3} className={styles.emptyState}>
            <Typography variant="h6" color="textSecondary">
              No tickets found. Try adjusting your filters or create a new ticket.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredTickets.map(renderTicketCard)}
          </Grid>
        )}

        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="md"
          className={styles.customDialog}
        >
          <DialogTitle className={styles.dialogHeader}>
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
              onClick={handleCloseDialog}
              className={styles.dialogCloseButton}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {renderDialogContent()}
          </DialogContent>
          <DialogActions className={styles.dialogActions}>
            <Button 
              onClick={handleCloseDialog}
              color="primary"
              variant="outlined"
              className={styles.actionButton}
            >
              Cancel
            </Button>
            {dialogType === 'add' || dialogType === 'edit' ? (
              <Button
                onClick={handleSubmit}
                color="primary"
                variant="contained"
                className={styles.actionButton}
              >
                {dialogType === 'add' ? 'Create Ticket' : 'Save Changes'}
              </Button>
            ) : dialogType === 'delete' ? (
              <Button
                onClick={handleDeleteTicket}
                color="error"
                variant="contained"
                className={styles.actionButton}
              >
                Delete
              </Button>
            ) : dialogType === 'addNote' ? (
              <Button
                onClick={handleAddNote}
                color="primary"
                variant="contained"
                className={styles.actionButton}
              >
                Add Note
              </Button>
            ) : dialogType === 'view' ? (
              <>
                <Button
                  onClick={() => handleOpenDialog('edit', selectedTicket)}
                  color="primary"
                  variant="contained"
                  className={styles.actionButton}
                >
                  Edit Ticket
                </Button>
                <Button
                  onClick={() => handleOpenDialog('delete', selectedTicket)}
                  color="error"
                  variant="contained"
                  className={styles.actionButton}
                >
                  Delete Ticket
                </Button>
              </>
            ) : null}
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            className={styles.snackbarAlert}
            elevation={6}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Tickets;