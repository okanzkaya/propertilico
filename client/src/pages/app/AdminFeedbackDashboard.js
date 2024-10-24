import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
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
import {
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  MarkEmailRead as MarkEmailReadIcon,
  MarkEmailUnread as MarkEmailUnreadIcon,
  Sort as SortIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import { getFeedback, deleteFeedback, updateFeedback } from '../../api';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

// Constants
const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];
const DEFAULT_ROWS_PER_PAGE = 10;
const SNACKBAR_DURATION = 6000;

// Styled Components
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? theme.palette.action.hover 
      : theme.palette.grey[50],
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  transition: 'background-color 0.3s',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? theme.palette.action.selected 
      : theme.palette.action.hover,
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

const TableCellHeader = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  backgroundColor: theme.palette.mode === 'dark'
    ? theme.palette.grey[900]
    : theme.palette.grey[100],
}));

// Helper Components
const LoadingSpinner = () => (
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    <CircularProgress />
  </Box>
);

const ErrorAlert = ({ message }) => (
  <Alert 
    severity="error" 
    sx={{ 
      width: '100%', 
      maxWidth: 600, 
      margin: '20px auto' 
    }}
  >
    {message}
  </Alert>
);

ErrorAlert.propTypes = {
  message: PropTypes.string.isRequired,
};

const MediaRenderer = ({ attachment }) => {
  if (!attachment) return null;

  const fileExtension = attachment.split('.').pop().toLowerCase();
  const fullUrl = `${process.env.REACT_APP_API_URL}${attachment}`;

  const mediaTypes = {
    image: ['jpg', 'jpeg', 'png', 'gif'],
    video: ['mp4', 'webm', 'ogg'],
    audio: ['mp3', 'wav']
  };

  if (mediaTypes.image.includes(fileExtension)) {
    return (
      <CardMedia
        component="img"
        image={fullUrl}
        alt="Feedback attachment"
        sx={{ 
          maxWidth: '100%', 
          maxHeight: '300px', 
          objectFit: 'contain',
          borderRadius: 1,
        }}
      />
    );
  }

  if (mediaTypes.video.includes(fileExtension)) {
    return (
      <video 
        controls 
        style={{ 
          maxWidth: '100%', 
          maxHeight: '300px',
          borderRadius: '4px',
        }}
      >
        <source src={fullUrl} type={`video/${fileExtension}`} />
        Your browser does not support the video tag.
      </video>
    );
  }

  if (mediaTypes.audio.includes(fileExtension)) {
    return (
      <Box sx={{ width: '100%', mt: 1 }}>
        <audio controls style={{ width: '100%' }}>
          <source src={fullUrl} type={`audio/${fileExtension}`} />
          Your browser does not support the audio tag.
        </audio>
      </Box>
    );
  }

  return (
    <Typography variant="body2" color="text.secondary">
      Attachment: {attachment}
    </Typography>
  );
};

MediaRenderer.propTypes = {
  attachment: PropTypes.string,
};

const SortableTableCell = ({ 
  label, 
  sortKey, 
  currentSortBy, 
  currentSortOrder, 
  onSort 
}) => (
  <TableCellHeader>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {label}
      <Tooltip title={`Sort by ${label}`}>
        <IconButton 
          size="small" 
          onClick={() => onSort(sortKey)}
          sx={{ ml: 0.5 }}
        >
          {currentSortBy === sortKey ? (
            currentSortOrder === 'asc' ? (
              <ArrowUpwardIcon fontSize="small" />
            ) : (
              <ArrowDownwardIcon fontSize="small" />
            )
          ) : (
            <SortIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  </TableCellHeader>
);

SortableTableCell.propTypes = {
  label: PropTypes.string.isRequired,
  sortKey: PropTypes.string.isRequired,
  currentSortBy: PropTypes.string.isRequired,
  currentSortOrder: PropTypes.string.isRequired,
  onSort: PropTypes.func.isRequired,
};

// Main Component
const AdminFeedbackDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useUser();

  // State Management
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Data Fetching
  const fetchFeedback = useCallback(async () => {
    if (!user?.isAdmin) {
      setError('You are not authorized to view this page.');
      setLoading(false);
      return;
    }

    try {
      const data = await getFeedback();
      setFeedback(data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setError('An error occurred while fetching feedback.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  // Event Handlers
  const handleSort = (column) => {
    setSortBy(prevSort => {
      setSortOrder(prevSort === column && sortOrder === 'asc' ? 'desc' : 'asc');
      return column;
    });
  };

  const handleFeedbackAction = async (actionType, id, currentStatus) => {
    if (!id) {
      setSnackbar({
        open: true,
        message: 'Invalid feedback ID',
        severity: 'error'
      });
      return;
    }

    const actions = {
      delete: {
        action: () => deleteFeedback(id),
        successMessage: 'Feedback deleted successfully',
        updateState: () => {
          setFeedback(prev => prev.filter(item => item.id !== id));
          setOpenDialog(false);
        }
      },
      favorite: {
        action: () => updateFeedback(id, { isFavorite: !currentStatus }),
        successMessage: `Feedback ${!currentStatus ? 'added to' : 'removed from'} favorites`,
        updateState: () => setFeedback(prev => 
          prev.map(item => item.id === id ? { ...item, isFavorite: !currentStatus } : item)
        )
      },
      read: {
        action: () => updateFeedback(id, { isRead: !currentStatus }),
        successMessage: `Feedback marked as ${!currentStatus ? 'read' : 'unread'}`,
        updateState: () => setFeedback(prev => 
          prev.map(item => item.id === id ? { ...item, isRead: !currentStatus } : item)
        )
      }
    };

    try {
      await actions[actionType].action();
      actions[actionType].updateState();
      setSnackbar({
        open: true,
        message: actions[actionType].successMessage,
        severity: 'success'
      });
    } catch (error) {
      console.error(`Error ${actionType}ing feedback:`, error);
      setSnackbar({
        open: true,
        message: `Error ${actionType}ing feedback`,
        severity: 'error'
      });
    }
  };

  // Computed Values
  const filteredAndSortedFeedback = useMemo(() => {
    return feedback
      .filter(item => {
        if (filterType === 'all') return true;
        if (filterType === 'unread') return !item.isRead;
        if (filterType === 'favorite') return item.isFavorite;
        return item.feedbackType === filterType;
      })
      .filter(item =>
        item.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const compareValues = (aVal, bVal) => {
          if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        };

        switch (sortBy) {
          case 'user':
            return compareValues(
              a.user?.name?.toLowerCase() || '', 
              b.user?.name?.toLowerCase() || ''
            );
          case 'feedbackType':
            return compareValues(
              a.feedbackType?.toLowerCase() || '', 
              b.feedbackType?.toLowerCase() || ''
            );
          case 'rating':
            return compareValues(a.rating || 0, b.rating || 0);
          case 'createdAt':
            return compareValues(
              new Date(a.createdAt).getTime(),
              new Date(b.createdAt).getTime()
            );
          default:
            return 0;
        }
      });
  }, [feedback, filterType, searchTerm, sortBy, sortOrder]);

  const paginatedFeedback = useMemo(() => 
    filteredAndSortedFeedback.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    ),
    [filteredAndSortedFeedback, page, rowsPerPage]
  );

  // Render Conditions
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!user?.isAdmin) {
    navigate('/app/dashboard', { replace: true });
    return null;
  }

  return (
    <Box sx={{ 
      padding: 3, 
      backgroundColor: theme.palette.background.default, 
      color: theme.palette.text.primary 
    }}>
      <Typography variant="h4" gutterBottom>
        Admin Feedback Dashboard
      </Typography>
      
      {/* Controls Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2,
        gap: 2,
        flexWrap: 'wrap'
      }}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ 
            backgroundColor: theme.palette.background.paper,
            minWidth: 200,
            flex: 1
          }}
        />
        <FormControl 
          variant="outlined" 
          size="small" 
          sx={{ 
            minWidth: 150,
            backgroundColor: theme.palette.background.paper
          }}
        >
          <InputLabel>Filter</InputLabel>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
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

      {/* Feedback Table */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          backgroundColor: theme.palette.background.paper,
          mb: 2,
          borderRadius: 1,
          boxShadow: theme.shadows[2]
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <SortableTableCell
                label="User"
                sortKey="user"
                currentSortBy={sortBy}
                currentSortOrder={sortOrder}
                onSort={handleSort}
              />
              <TableCellHeader>Message</TableCellHeader>
              <SortableTableCell
                label="Type"
                sortKey="feedbackType"
                currentSortBy={sortBy}
                currentSortOrder={sortOrder}
                onSort={handleSort}
              />
              <SortableTableCell
                label="Rating"
                sortKey="rating"
                currentSortBy={sortBy}
                currentSortOrder={sortOrder}
                onSort={handleSort}
              />
              <SortableTableCell
                label="Date"
                sortKey="createdAt"
                currentSortBy={sortBy}
                currentSortOrder={sortOrder}
                onSort={handleSort}
              />
              <TableCellHeader>Actions</TableCellHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedFeedback.map((item) => (
              <StyledTableRow 
                key={item.id}
                sx={{ 
                  backgroundColor: item.isRead 
                    ? theme.palette.background.paper 
                    : theme.palette.mode === 'dark' 
                      ? theme.palette.action.hover 
                      : theme.palette.action.selected
                }}
                onClick={() => {
                  setSelectedFeedback(item);
                  setOpenDialog(true);
                }}
              >
                <TableCell>{item.user?.name || 'Unknown User'}</TableCell>
                <TableCell>
                  {item.message?.substring(0, 50)}{item.message?.length > 50 ? '...' : ''}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={item.feedbackType} 
                    size="small"
                    color={
                      item.feedbackType === 'bug' ? 'error' :
                      item.feedbackType === 'feature' ? 'primary' :
                      item.feedbackType === 'improvement' ? 'success' :
                      'default'
                    }
                  />
                </TableCell>
                <TableCell>
                  {item.rating > 0 ? (
                    <StyledRating 
                      value={item.rating} 
                      readOnly 
                      size="small"
                      precision={0.5}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No rating
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(item.createdAt).toLocaleString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="View Details">
                      <IconButton 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFeedback(item);
                          setOpenDialog(true);
                        }}
                        size="small"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={item.isFavorite ? "Remove from Favorites" : "Add to Favorites"}>
                      <IconButton 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFeedbackAction('favorite', item.id, item.isFavorite);
                        }}
                        size="small"
                      >
                        {item.isFavorite ? 
                          <FavoriteIcon color="error" /> : 
                          <FavoriteBorderIcon />
                        }
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={item.isRead ? "Mark as Unread" : "Mark as Read"}>
                      <IconButton 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFeedbackAction('read', item.id, item.isRead);
                        }}
                        size="small"
                      >
                        {item.isRead ? 
                          <MarkEmailReadIcon color="primary" /> : 
                          <MarkEmailUnreadIcon />
                        }
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFeedbackAction('delete', item.id);
                        }}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        component="div"
        count={filteredAndSortedFeedback.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        sx={{ 
          color: theme.palette.text.primary,
          '.MuiTablePagination-select': {
            backgroundColor: theme.palette.background.paper
          }
        }}
      />

      {/* Feedback Details Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderRadius: 1,
          },
        }}
      >
        {selectedFeedback && (
          <>
            <DialogTitle>
              <Typography variant="h6" component="div">
                Feedback Details
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    User Information
                  </Typography>
                  <Typography variant="body1">
                    Name: {selectedFeedback.user?.name || 'Unknown User'}
                  </Typography>
                  <Typography variant="body1">
                    Email: {selectedFeedback.user?.email || 'No email provided'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    Feedback Information
                  </Typography>
                  <Typography variant="body1">
                    Type: 
                    <Chip 
                      label={selectedFeedback.feedbackType}
                      size="small"
                      sx={{ ml: 1 }}
                      color={
                        selectedFeedback.feedbackType === 'bug' ? 'error' :
                        selectedFeedback.feedbackType === 'feature' ? 'primary' :
                        selectedFeedback.feedbackType === 'improvement' ? 'success' :
                        'default'
                      }
                    />
                  </Typography>
                  <Typography variant="body1">
                    Date: {new Date(selectedFeedback.createdAt).toLocaleString()}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    Message
                  </Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      backgroundColor: theme.palette.background.default 
                    }}
                  >
                    <Typography variant="body1">
                      {selectedFeedback.message}
                    </Typography>
                  </Paper>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" color="primary">
                    Rating:
                  </Typography>
                  {selectedFeedback.rating > 0 ? (
                    <StyledRating 
                      value={selectedFeedback.rating} 
                      readOnly 
                      precision={0.5}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No rating provided
                    </Typography>
                  )}
                </Box>

                {selectedFeedback.attachment && (
                  <Box>
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      Attachment
                    </Typography>
                    <MediaRenderer attachment={selectedFeedback.attachment} />
                  </Box>
                )}

                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip 
                    label={selectedFeedback.isRead ? "Read" : "Unread"} 
                    color={selectedFeedback.isRead ? "primary" : "default"}
                    variant={selectedFeedback.isRead ? "filled" : "outlined"}
                  />
                  <Chip 
                    label={selectedFeedback.isFavorite ? "Favorite" : "Not Favorite"} 
                    color={selectedFeedback.isFavorite ? "error" : "default"}
                    variant={selectedFeedback.isFavorite ? "filled" : "outlined"}
                  />
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => handleFeedbackAction(
                  'read', 
                  selectedFeedback.id, 
                  selectedFeedback.isRead
                )}
                color="primary"
              >
                Mark as {selectedFeedback.isRead ? 'Unread' : 'Read'}
              </Button>
              <Button 
                onClick={() => handleFeedbackAction(
                  'favorite', 
                  selectedFeedback.id, 
                  selectedFeedback.isFavorite
                )}
                color="primary"
              >
                {selectedFeedback.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </Button>
              <Button 
                onClick={() => handleFeedbackAction(
                  'delete',
                  selectedFeedback.id
                )}
                color="error"
              >
                Delete
              </Button>
              <Button 
                onClick={() => setOpenDialog(false)}
                color="primary"
                variant="contained"
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={SNACKBAR_DURATION}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminFeedbackDashboard;