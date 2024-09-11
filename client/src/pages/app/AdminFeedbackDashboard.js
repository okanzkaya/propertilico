import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Alert,
  CircularProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Rating,
  CardMedia,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Snackbar,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { getFeedback, deleteFeedback, updateFeedback } from '../../api';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import SortIcon from '@mui/icons-material/Sort';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.action.hover : theme.palette.grey[50],
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  transition: 'background-color 0.3s',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.action.selected : theme.palette.action.hover,
  },
  cursor: 'pointer',
}));

const StyledRating = styled(Rating)({
  '& .MuiRating-iconFilled': {
    color: '#ff6d75',
  },
  '& .MuiRating-iconHover': {
    color: '#ff3d47',
  },
});

const AdminFeedbackDashboard = () => {
  const theme = useTheme();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const navigate = useNavigate();
  const { user } = useUser();

  const fetchFeedback = useCallback(async () => {
    if (!user?.isAdmin) {
      setError('You are not authorized to view this page.');
      setLoading(false);
      return;
    }
    try {
      const data = await getFeedback();
      setFeedback(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setError('An error occurred while fetching feedback.');
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleOpenDialog = (feedbackItem) => {
    setSelectedFeedback(feedbackItem);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteFeedback(id);
      setFeedback(feedback.filter(item => item._id !== id));
      setSnackbar({ open: true, message: 'Feedback deleted successfully', severity: 'success' });
    } catch (error) {
      console.error('Error deleting feedback:', error);
      setSnackbar({ open: true, message: 'Error deleting feedback', severity: 'error' });
    }
  };

  const handleToggleFavorite = async (id, currentStatus) => {
    try {
      await updateFeedback(id, { isFavorite: !currentStatus });
      setFeedback(feedback.map(item =>
        item._id === id ? { ...item, isFavorite: !currentStatus } : item
      ));
      setSnackbar({ open: true, message: `Feedback ${!currentStatus ? 'added to' : 'removed from'} favorites`, severity: 'success' });
    } catch (error) {
      console.error('Error updating feedback:', error);
      setSnackbar({ open: true, message: 'Error updating feedback', severity: 'error' });
    }
  };

  const handleMarkAsRead = async (id, currentStatus) => {
    try {
      await updateFeedback(id, { isRead: !currentStatus });
      setFeedback(feedback.map(item =>
        item._id === id ? { ...item, isRead: !currentStatus } : item
      ));
      setSnackbar({ open: true, message: `Feedback marked as ${!currentStatus ? 'read' : 'unread'}`, severity: 'success' });
    } catch (error) {
      console.error('Error updating feedback:', error);
      setSnackbar({ open: true, message: 'Error updating feedback', severity: 'error' });
    }
  };

  const renderAttachment = (attachment) => {
    if (!attachment) return null;
  
    const fileExtension = attachment.split('.').pop().toLowerCase();
    const fullUrl = `${process.env.REACT_APP_API_URL}${attachment}`;
  
    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      return (
        <CardMedia
          component="img"
          image={fullUrl}
          alt="Feedback attachment"
          sx={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
        />
      );
    } else if (['mp4', 'webm', 'ogg'].includes(fileExtension)) {
      return (
        <video controls style={{ maxWidth: '100%', maxHeight: '300px' }}>
          <source src={fullUrl} type={`video/${fileExtension}`} />
          Your browser does not support the video tag.
        </video>
      );
    } else if (['mp3', 'wav'].includes(fileExtension)) {
      return (
        <audio controls>
          <source src={fullUrl} type={`audio/${fileExtension}`} />
          Your browser does not support the audio tag.
        </audio>
      );
    } else {
      return <Typography variant="body2">Attachment: {attachment}</Typography>;
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (column) => {
    const isAsc = sortBy === column && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortBy(column);
  };

  const handleFilterChange = (event) => {
    setFilterType(event.target.value);
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const filteredAndSortedFeedback = useMemo(() => {
    return feedback
      .filter(item => {
        if (filterType === 'all') return true;
        if (filterType === 'unread') return !item.isRead;
        if (filterType === 'favorite') return item.isFavorite;
        return item.feedbackType === filterType;
      })
      .filter(item =>
        item.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === 'createdAt') {
          return sortOrder === 'asc'
            ? new Date(a.createdAt) - new Date(b.createdAt)
            : new Date(b.createdAt) - new Date(a.createdAt);
        }
        if (sortBy === 'rating') {
          return sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating;
        }
        return 0;
      });
  }, [feedback, filterType, searchTerm, sortBy, sortOrder]);

  const paginatedFeedback = filteredAndSortedFeedback.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!user?.isAdmin) {
    navigate('/app/dashboard', { replace: true });
    return null;
  }

  return (
    <Box sx={{ padding: 3, backgroundColor: theme.palette.background.default, color: theme.palette.text.primary }}>
      <Typography variant="h4" gutterBottom>Admin Feedback Dashboard</Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ backgroundColor: theme.palette.background.paper }}
        />
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120, backgroundColor: theme.palette.background.paper }}>
          <InputLabel>Filter</InputLabel>
          <Select
            value={filterType}
            onChange={handleFilterChange}
            label="Filter"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="unread">Unread</MenuItem>
            <MenuItem value="favorite">Favorite</MenuItem>
            <MenuItem value="bug">Bug</MenuItem>
            <MenuItem value="feature">Feature</MenuItem>
            <MenuItem value="improvement">Improvement</MenuItem>
            <MenuItem value="general">General</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper} sx={{ backgroundColor: theme.palette.background.paper }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                User
                <IconButton size="small" onClick={() => handleSort('user')}>
                  <SortIcon />
                </IconButton>
              </TableCell>
              <TableCell>Message</TableCell>
              <TableCell>
                Type
                <IconButton size="small" onClick={() => handleSort('feedbackType')}>
                  <SortIcon />
                </IconButton>
              </TableCell>
              <TableCell>
                Rating
                <IconButton size="small" onClick={() => handleSort('rating')}>
                  <SortIcon />
                </IconButton>
              </TableCell>
              <TableCell>
                Date
                <IconButton size="small" onClick={() => handleSort('createdAt')}>
                  <SortIcon />
                </IconButton>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedFeedback.map((item) => (
              <StyledTableRow 
                key={item._id} 
                sx={{ 
                  backgroundColor: item.isRead 
                    ? theme.palette.background.paper 
                    : theme.palette.mode === 'dark' 
                      ? theme.palette.action.hover 
                      : theme.palette.action.selected
                }}
                onClick={() => handleOpenDialog(item)}
              >
                <TableCell>{item.user.name}</TableCell>
                <TableCell>{item.message.substring(0, 50)}...</TableCell>
                <TableCell>{item.feedbackType}</TableCell>
                <TableCell>
                  {item.rating > 0 ? (
                    <StyledRating value={item.rating} readOnly size="small" />
                  ) : (
                    <Typography variant="body2">No rating</Typography>
                  )}
                </TableCell>
                <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton onClick={(e) => { e.stopPropagation(); handleOpenDialog(item); }}>
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={item.isFavorite ? "Remove from Favorites" : "Add to Favorites"}>
                    <IconButton onClick={(e) => { e.stopPropagation(); handleToggleFavorite(item._id, item.isFavorite); }}>
                      {item.isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={item.isRead ? "Mark as Unread" : "Mark as Read"}>
                    <IconButton onClick={(e) => { e.stopPropagation(); handleMarkAsRead(item._id, item.isRead); }}>
                      {item.isRead ? <MarkEmailReadIcon color="primary" /> : <MarkEmailUnreadIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredAndSortedFeedback.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{ color: theme.palette.text.primary }}
      />
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
        }}
      >
        {selectedFeedback && (
          <>
            <DialogTitle>Feedback Details</DialogTitle>
            <DialogContent>
              <Typography variant="h6">User: {selectedFeedback.user.name}</Typography>
              <Typography variant="body1">Email: {selectedFeedback.user.email}</Typography>
              <Typography variant="body1">Type: {selectedFeedback.feedbackType}</Typography>
              <Typography variant="body1">Date: {new Date(selectedFeedback.createdAt).toLocaleString()}</Typography>
              <Typography variant="body1">Message: {selectedFeedback.message}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Typography variant="body1">Rating: </Typography>
                {selectedFeedback.rating > 0 ? (
                  <StyledRating value={selectedFeedback.rating} readOnly sx={{ ml: 1 }} />
                ) : (
                  <Typography variant="body2" sx={{ ml: 1 }}>No rating</Typography>
                )}
              </Box>
              {selectedFeedback.attachment && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1">Attachment:</Typography>
                  {renderAttachment(selectedFeedback.attachment)}
                </Box>
              )}
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label={selectedFeedback.isRead ? "Read" : "Unread"} 
                  color={selectedFeedback.isRead ? "primary" : "default"}
                  sx={{ mr: 1 }}
                />
                <Chip 
                  label={selectedFeedback.isFavorite ? "Favorite" : "Not Favorite"} 
                  color={selectedFeedback.isFavorite ? "error" : "default"}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => handleMarkAsRead(selectedFeedback._id, selectedFeedback.isRead)}>
                Mark as {selectedFeedback.isRead ? 'Unread' : 'Read'}
              </Button>
              <Button onClick={() => handleToggleFavorite(selectedFeedback._id, selectedFeedback.isFavorite)}>
                {selectedFeedback.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </Button>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
          style={{
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50],
            color: theme.palette.text.primary,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminFeedbackDashboard;