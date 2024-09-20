import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardActions, Avatar, IconButton,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip,
  Snackbar, Alert, useTheme, Fab, Tooltip, CircularProgress, InputAdornment,
  Menu, MenuItem, FormControl, InputLabel, Select, Pagination, ListItemIcon,
  ListItemText, useMediaQuery, styled, Paper, Tabs, Tab
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Phone as PhoneIcon,
  Email as EmailIcon, Work as WorkIcon, Save as SaveIcon, Search as SearchIcon,
  Sort as SortIcon, Clear as ClearIcon, MoreVert as MoreVertIcon,
  Close as CloseIcon, Visibility as VisibilityIcon, GetApp as DownloadIcon
} from '@mui/icons-material';
import axiosInstance from '../../axiosSetup';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
  background: theme.palette.background.paper,
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[10],
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(12),
  height: theme.spacing(12),
  margin: 'auto',
  marginBottom: theme.spacing(2),
  border: `4px solid ${theme.palette.primary.main}`,
  boxShadow: theme.shadows[3],
}));

const roles = [
  'All', 'Manager', 'Employee', 'Client', 'Contractor', 'Vendor', 'Investor',
  'Tenant', 'Landlord', 'Agent', 'Broker', 'Appraiser', 'Inspector'
];

const Contacts = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [contacts, setContacts] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterRole, setFilterRole] = useState('All');
  const [page, setPage] = useState(1);
  const [contactsPerPage] = useState(8);
  const [anchorEl, setAnchorEl] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/api/contacts');
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setSnackbar({ open: true, message: 'Failed to fetch contacts', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const handleOpenDialog = useCallback((contact = null) => {
    setCurrentContact(contact);
    setAvatarPreview(contact?.avatar || null);
    setAvatarFile(null);
    setDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setCurrentContact(null);
    setAvatarFile(null);
    setAvatarPreview(null);
    setDialogOpen(false);
  }, []);

  const handleOpenDetailDialog = useCallback((contact) => {
    setCurrentContact(contact);
    setDetailDialogOpen(true);
  }, []);

  const handleSaveContact = useCallback(async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    if (avatarFile) formData.append('avatar', avatarFile);
    try {
      const method = currentContact ? 'put' : 'post';
      const url = currentContact ? `/api/contacts/${currentContact._id}` : '/api/contacts';
      await axiosInstance[method](url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSnackbar({ open: true, message: `Contact ${currentContact ? 'updated' : 'created'} successfully`, severity: 'success' });
      fetchContacts();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving contact:', error);
      setSnackbar({ open: true, message: `Failed to ${currentContact ? 'update' : 'create'} contact: ${error.response?.data?.message || error.message}`, severity: 'error' });
    }
  }, [currentContact, avatarFile, fetchContacts, handleCloseDialog]);

  const handleDeleteContact = useCallback(async (id) => {
    if (!id) {
      setSnackbar({ open: true, message: 'Failed to delete contact: No ID provided', severity: 'error' });
      return;
    }
    try {
      await axiosInstance.delete(`/api/contacts/${id}`);
      setSnackbar({ open: true, message: 'Contact deleted successfully', severity: 'success' });
      fetchContacts();
      setAnchorEl(null);
    } catch (error) {
      console.error('Error deleting contact:', error);
      setSnackbar({ open: true, message: `Failed to delete contact: ${error.response?.data?.message || error.message}`, severity: 'error' });
    }
  }, [fetchContacts]);

  const handleAvatarChange = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  }, []);

  const filteredAndSortedContacts = useMemo(() => {
    return contacts
      .filter(contact => 
        (filterRole === 'All' || contact.role === filterRole) &&
        Object.values(contact).some(value => 
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
      .sort((a, b) => {
        const compare = (a[sortBy] || '').localeCompare(b[sortBy] || '');
        return sortOrder === 'asc' ? compare : -compare;
      });
  }, [contacts, searchTerm, sortBy, sortOrder, filterRole]);

  const paginatedContacts = useMemo(() => {
    const startIndex = (page - 1) * contactsPerPage;
    return filteredAndSortedContacts.slice(startIndex, startIndex + contactsPerPage);
  }, [filteredAndSortedContacts, page, contactsPerPage]);

  const pageCount = Math.ceil(filteredAndSortedContacts.length / contactsPerPage);

  const handleDownloadVCard = useCallback((contact) => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${contact.name}
TEL:${contact.phone}
EMAIL:${contact.email}
TITLE:${contact.role}
ADR:${contact.address}
NOTE:${contact.notes}
END:VCARD`;

    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${contact.name}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const renderContactCard = useCallback((contact) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={contact._id}>
      <StyledCard onClick={() => handleOpenDetailDialog(contact)}>
        <CardContent>
          <StyledAvatar src={`${process.env.REACT_APP_API_URL}${contact.avatar}`} alt={contact.name} />
          <Typography variant="h6" align="center" gutterBottom>{contact.name}</Typography>
          <Typography variant="subtitle1" align="center" color="textSecondary" gutterBottom>{contact.role}</Typography>
          <Box display="flex" justifyContent="center" flexWrap="wrap" gap={1} mt={2}>
            <Chip icon={<PhoneIcon />} label={contact.phone} size="small" />
            <Chip icon={<EmailIcon />} label={contact.email} size="small" />
            <Chip icon={<WorkIcon />} label={contact.role} size="small" />
          </Box>
        </CardContent>
        <CardActions sx={{ justifyContent: 'center', mt: 'auto' }}>
          <IconButton onClick={(e) => { e.stopPropagation(); handleOpenDialog(contact); }} color="primary">
            <EditIcon />
          </IconButton>
          <IconButton onClick={(e) => { e.stopPropagation(); setCurrentContact(contact); setAnchorEl(e.currentTarget); }} color="default">
            <MoreVertIcon />
          </IconButton>
        </CardActions>
      </StyledCard>
    </Grid>
  ), [handleOpenDialog, handleOpenDetailDialog]);

  const renderContactList = useCallback(() => (
    <Paper elevation={3}>
      {paginatedContacts.map((contact) => (
        <Box key={contact._id} sx={{ p: 2, borderBottom: 1, borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <Avatar src={`${process.env.REACT_APP_API_URL}${contact.avatar}`} alt={contact.name} />
            </Grid>
            <Grid item xs>
              <Typography variant="subtitle1">{contact.name}</Typography>
              <Typography variant="body2" color="textSecondary">{contact.role}</Typography>
            </Grid>
            <Grid item>
              <IconButton onClick={() => handleOpenDetailDialog(contact)}>
                <VisibilityIcon />
              </IconButton>
              <IconButton onClick={() => handleOpenDialog(contact)}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={(e) => { setCurrentContact(contact); setAnchorEl(e.currentTarget); }}>
                <MoreVertIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Box>
      ))}
    </Paper>
  ), [paginatedContacts, handleOpenDetailDialog, handleOpenDialog]);

  return (
    <Box sx={{ p: 3, background: theme.palette.background.default, minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>Contacts</Typography>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          variant="outlined"
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={() => setSearchTerm('')} edge="end" size="small">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, maxWidth: 300 }}
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl variant="outlined" size="small">
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Sort By"
              endAdornment={
                <IconButton size="small" onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}>
                  <SortIcon />
                </IconButton>
              }
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="role">Role</MenuItem>
              <MenuItem value="email">Email</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" size="small">
            <InputLabel>Filter Role</InputLabel>
            <Select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              label="Filter Role"
            >
              {roles.map((role) => (
                <MenuItem key={role} value={role}>{role}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip title="Add new contact">
            <Fab color="primary" size="medium" onClick={() => handleOpenDialog()} sx={{ boxShadow: theme.shadows[3] }}>
              <AddIcon />
            </Fab>
          </Tooltip>
        </Box>
      </Box>
      <Tabs value={viewMode} onChange={(_, newValue) => setViewMode(newValue)} sx={{ mb: 2 }}>
        <Tab label="Grid View" value="grid" />
        <Tab label="List View" value="list" />
      </Tabs>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <Grid container spacing={3}>
              {paginatedContacts.map(renderContactCard)}
            </Grid>
          ) : (
            renderContactList()
          )}
          {pageCount > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pageCount}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                size={isMobile ? 'small' : 'medium'}
              />
            </Box>
          )}
        </>
      )}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <form onSubmit={handleSaveContact}>
          <DialogTitle>{currentContact ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
          <DialogContent>
          <Grid container spacing={2}>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="avatar-file-input"
                  type="file"
                  onChange={handleAvatarChange}
                />
                <label htmlFor="avatar-file-input">
                  <Avatar
                    src={avatarPreview || (currentContact && `${process.env.REACT_APP_API_URL}${currentContact.avatar}`)}
                    sx={{ width: 100, height: 100, cursor: 'pointer' }}
                  />
                  <Typography variant="caption" display="block" align="center" sx={{ mt: 1 }}>
                    Click to upload avatar
                  </Typography>
                </label>
              </Grid>
              {['name', 'role', 'email', 'phone'].map((field) => (
                <Grid item xs={12} sm={6} key={field}>
                  <TextField
                    fullWidth
                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                    name={field}
                    defaultValue={currentContact?.[field] || ''}
                    required={['name', 'email', 'phone', 'role'].includes(field)}
                    type={field === 'email' ? 'email' : 'text'}
                  />
                </Grid>
              ))}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  defaultValue={currentContact?.address || ''}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  defaultValue={currentContact?.notes || ''}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />}>
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          Contact Details
          <IconButton
            aria-label="close"
            onClick={() => setDetailDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {currentContact && (
            <Grid container spacing={2}>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Avatar
                  src={`${process.env.REACT_APP_API_URL}${currentContact.avatar}`}
                  sx={{ width: 100, height: 100 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6">{currentContact.name}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" color="textSecondary">{currentContact.role}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">Email</Typography>
                <Typography variant="body1">{currentContact.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">Phone</Typography>
                <Typography variant="body1">{currentContact.phone}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">Address</Typography>
                <Typography variant="body1">{currentContact.address || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">Notes</Typography>
                <Typography variant="body1">{currentContact.notes || 'N/A'}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleDownloadVCard(currentContact)} startIcon={<DownloadIcon />}>
            Download vCard
          </Button>
          <Button onClick={() => { setDetailDialogOpen(false); handleOpenDialog(currentContact); }} color="primary">
            Edit
          </Button>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => { handleOpenDetailDialog(currentContact); setAnchorEl(null); }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="View Details" />
        </MenuItem>
        <MenuItem onClick={() => { handleOpenDialog(currentContact); setAnchorEl(null); }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Edit" />
        </MenuItem>
        <MenuItem onClick={() => { handleDownloadVCard(currentContact); setAnchorEl(null); }}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Download vCard" />
        </MenuItem>
        <MenuItem onClick={() => { handleDeleteContact(currentContact?._id); setAnchorEl(null); }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Contacts;