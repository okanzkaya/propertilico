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
  Snackbar
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  MarkEmailRead as MarkEmailReadIcon,
  MarkEmailUnread as MarkEmailUnreadIcon,
  Sort as SortIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { getFeedback, deleteFeedback, updateFeedback } from '../../api';
import './AdminFeedback.css';

// Constants
const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];
const DEFAULT_ROWS_PER_PAGE = 10;
const SNACKBAR_DURATION = 6000;

// Helper Components
const LoadingSpinner = () => (
  <Box className="loading-spinner">
    <CircularProgress />
  </Box>
);

const ErrorAlert = ({ message }) => (
  <Alert severity="error" className="error-alert">
    {message}
  </Alert>
);

const MediaRenderer = ({ attachment }) => {
  if (!attachment) return null;

  const fileExtension = attachment.split('.').pop().toLowerCase();
  const fullUrl = `${process.env.REACT_APP_API_URL}${attachment}`;
  const mediaTypes = {
    image: ['jpg', 'jpeg', 'png', 'gif'],
    video: ['mp4', 'webm', 'ogg'],
    audio: ['mp3', 'wav']
  };

  const renderMedia = () => {
    if (mediaTypes.image.includes(fileExtension)) {
      return <CardMedia component="img" image={fullUrl} alt="Feedback attachment" />;
    }
    if (mediaTypes.video.includes(fileExtension)) {
      return (
        <video controls>
          <source src={fullUrl} type={`video/${fileExtension}`} />
          Your browser does not support the video tag.
        </video>
      );
    }
    if (mediaTypes.audio.includes(fileExtension)) {
      return (
        <audio controls>
          <source src={fullUrl} type={`audio/${fileExtension}`} />
          Your browser does not support the audio tag.
        </audio>
      );
    }
    return <Typography variant="body2">Attachment: {attachment}</Typography>;
  };

  return <div className="media-container">{renderMedia()}</div>;
};

const SortableTableCell = ({
  label,
  sortKey,
  currentSortBy,
  currentSortOrder,
  onSort
}) => (
  <TableCell className="table-cell-header">
    <Box className="sortable-header">
      {label}
      <Tooltip title={`Sort by ${label}`}>
        <IconButton size="small" onClick={() => onSort(sortKey)}>
          {currentSortBy === sortKey ? (
            currentSortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />
          ) : (
            <SortIcon />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  </TableCell>
);

const FeedbackDetailsContent = ({ feedback }) => (
  <Box className="dialog-content">
    <Box className="feedback-section">
      <Typography variant="subtitle1" color="primary" gutterBottom>
        User Information
      </Typography>
      <Typography variant="body1">
        Name: {feedback.user?.name || 'Unknown User'}
      </Typography>
      <Typography variant="body1">
        Email: {feedback.user?.email || 'No email provided'}
      </Typography>
    </Box>

    <Box className="feedback-section">
      <Typography variant="subtitle1" color="primary" gutterBottom>
        Feedback Information
      </Typography>
      <Typography variant="body1" className="feedback-type">
        Type:
        <Chip
          label={feedback.feedbackType}
          size="small"
          sx={{ ml: 1 }}
          color={
            feedback.feedbackType === 'bug' ? 'error' :
            feedback.feedbackType === 'feature' ? 'primary' :
            feedback.feedbackType === 'improvement' ? 'success' :
            'default'
          }
        />
      </Typography>
      <Typography variant="body1">
        Date: {new Date(feedback.createdAt).toLocaleString()}
      </Typography>
    </Box>

    <Box className="feedback-section">
      <Typography variant="subtitle1" color="primary" gutterBottom>
        Message
      </Typography>
      <Paper variant="outlined" className="message-paper">
        <Typography variant="body1">{feedback.message}</Typography>
      </Paper>
    </Box>

    {feedback.rating > 0 && (
      <Box className="feedback-section">
        <Typography variant="subtitle1" color="primary" gutterBottom>
          Rating
        </Typography>
        <Rating
          value={feedback.rating}
          readOnly
          precision={0.5}
          className="custom-rating"
        />
      </Box>
    )}

    {feedback.attachment && (
      <Box className="feedback-section">
        <Typography variant="subtitle1" color="primary" gutterBottom>
          Attachment
        </Typography>
        <MediaRenderer attachment={feedback.attachment} />
      </Box>
    )}

    <Box className="dialog-chips">
      <Chip
        label={feedback.isRead ? "Read" : "Unread"}
        color={feedback.isRead ? "primary" : "default"}
        variant={feedback.isRead ? "filled" : "outlined"}
      />
      <Chip
        label={feedback.isFavorite ? "Favorite" : "Not Favorite"}
        color={feedback.isFavorite ? "error" : "default"}
        variant={feedback.isFavorite ? "filled" : "outlined"}
      />
    </Box>
  </Box>
);

const AdminFeedbackDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  // State Management
  const [state, setState] = useState({
    feedback: [],
    loading: true,
    error: null,
    selectedFeedback: null,
    openDialog: false,
    page: 0,
    rowsPerPage: DEFAULT_ROWS_PER_PAGE,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    filterType: 'all',
    searchTerm: '',
    snackbar: { open: false, message: '', severity: 'success' }
  });

  // Data Fetching
  const fetchFeedbackData = useCallback(async () => {
    if (!user?.isAdmin) {
      setState(prev => ({
        ...prev,
        error: 'You are not authorized to view this page.',
        loading: false
      }));
      return;
    }

    try {
      const data = await getFeedback();
      setState(prev => ({ ...prev, feedback: data, loading: false }));
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setState(prev => ({
        ...prev,
        error: 'An error occurred while fetching feedback.',
        loading: false
      }));
    }
  }, [user]);

  useEffect(() => {
    fetchFeedbackData();
  }, [fetchFeedbackData]);

  // Event Handlers
  const handleSort = useCallback((column) => {
    setState(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const handleFeedbackAction = async (actionType, id, currentStatus) => {
    if (!id) {
      setState(prev => ({
        ...prev,
        snackbar: {
          open: true,
          message: 'Invalid feedback ID',
          severity: 'error'
        }
      }));
      return;
    }

    const actions = {
      delete: {
        action: () => deleteFeedback(id),
        successMessage: 'Feedback deleted successfully',
        updateState: () => setState(prev => ({
          ...prev,
          feedback: prev.feedback.filter(item => item.id !== id),
          openDialog: false
        }))
      },
      favorite: {
        action: () => updateFeedback(id, { isFavorite: !currentStatus }),
        successMessage: `Feedback ${!currentStatus ? 'added to' : 'removed from'} favorites`,
        updateState: () => setState(prev => ({
          ...prev,
          feedback: prev.feedback.map(item =>
            item.id === id ? { ...item, isFavorite: !currentStatus } : item
          )
        }))
      },
      read: {
        action: () => updateFeedback(id, { isRead: !currentStatus }),
        successMessage: `Feedback marked as ${!currentStatus ? 'read' : 'unread'}`,
        updateState: () => setState(prev => ({
          ...prev,
          feedback: prev.feedback.map(item =>
            item.id === id ? { ...item, isRead: !currentStatus } : item
          )
        }))
      }
    };

    try {
      await actions[actionType].action();
      actions[actionType].updateState();
      setState(prev => ({
        ...prev,
        snackbar: {
          open: true,
          message: actions[actionType].successMessage,
          severity: 'success'
        }
      }));
    } catch (error) {
      console.error(`Error ${actionType}ing feedback:`, error);
      setState(prev => ({
        ...prev,
        snackbar: {
          open: true,
          message: `Error ${actionType}ing feedback`,
          severity: 'error'
        }
      }));
    }
  };

  // Computed Values
  const filteredAndSortedFeedback = useMemo(() => {
    return state.feedback
      .filter(item => {
        if (state.filterType === 'all') return true;
        if (state.filterType === 'unread') return !item.isRead;
        if (state.filterType === 'favorite') return item.isFavorite;
        return item.feedbackType === state.filterType;
      })
      .filter(item =>
        item.message?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        item.user?.name?.toLowerCase().includes(state.searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const compareValues = (aVal, bVal) => {
          if (aVal < bVal) return state.sortOrder === 'asc' ? -1 : 1;
          if (aVal > bVal) return state.sortOrder === 'asc' ? 1 : -1;
          return 0;
        };

        const getValue = (item, key) => {
          switch (key) {
            case 'user': return item.user?.name?.toLowerCase() || '';
            case 'feedbackType': return item.feedbackType?.toLowerCase() || '';
            case 'rating': return item.rating || 0;
            case 'createdAt': return new Date(item.createdAt).getTime();
            default: return '';
          }
        };

        return compareValues(getValue(a, state.sortBy), getValue(b, state.sortBy));
      });
  }, [state.feedback, state.filterType, state.searchTerm, state.sortBy, state.sortOrder]);

  // Render Conditions
  if (state.loading) return <LoadingSpinner />;
  if (state.error) return <ErrorAlert message={state.error} />;
  if (!user?.isAdmin) {
    navigate('/app/dashboard', { replace: true });
    return null;
  }

  return (
    <div className="feedback-dashboard">
      <Typography variant="h4" gutterBottom>
        Admin Feedback Dashboard
      </Typography>

      {/* Controls Section */}
      <Box className="feedback-controls">
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={state.searchTerm}
          onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
          className="search-field"
        />
        <FormControl variant="outlined" size="small" className="filter-control">
          <InputLabel>Filter</InputLabel>
          <Select
            value={state.filterType}
            onChange={(e) => setState(prev => ({ ...prev, filterType: e.target.value }))}
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
      <TableContainer component={Paper} className="feedback-table-container">
        <Table>
          <TableHead>
            <TableRow>
              <SortableTableCell
                label="User"
                sortKey="user"
                currentSortBy={state.sortBy}
                currentSortOrder={state.sortOrder}
                onSort={handleSort}
              />
              <TableCell className="table-cell-header">Message</TableCell>
              <SortableTableCell
                label="Type"
                sortKey="feedbackType"
                currentSortBy={state.sortBy}
                currentSortOrder={state.sortOrder}
                onSort={handleSort}
              />
              <SortableTableCell
                label="Rating"
                sortKey="rating"
                currentSortBy={state.sortBy}
                currentSortOrder={state.sortOrder}
                onSort={handleSort}
              />
              <SortableTableCell
                label="Date"
                sortKey="createdAt"
                currentSortBy={state.sortBy}
                currentSortOrder={state.sortOrder}
                onSort={handleSort}
              />
              <TableCell className="table-cell-header">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedFeedback
              .slice(
                state.page * state.rowsPerPage,
                state.page * state.rowsPerPage + state.rowsPerPage
              )
              .map((item) => (
                <TableRow
                  key={item.id}
                  className={`table-row ${!item.isRead ? 'unread' : ''}`}
                  onClick={() => setState(prev => ({
                    ...prev,
                    selectedFeedback: item,
                    openDialog: true
                  }))}
                >
                  <TableCell>{item.user?.name || 'Unknown User'}</TableCell>
                  <TableCell>
                    {item.message?.substring(0, 50)}
                    {item.message?.length > 50 ? '...' : ''}
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
                      <Rating
                        value={item.rating}
                        readOnly
                        size="small"
                        precision={0.5}
                        className="custom-rating"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No rating
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(item.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Box className="table-actions">
                      <Tooltip title="View Details">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            setState(prev => ({
                              ...prev,
                              selectedFeedback: item,
                              openDialog: true
                            }));
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
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        component="div"
        count={filteredAndSortedFeedback.length}
        rowsPerPage={state.rowsPerPage}
        page={state.page}
        onPageChange={(event, newPage) => 
          setState(prev => ({ ...prev, page: newPage }))
        }
        onRowsPerPageChange={(event) => 
          setState(prev => ({
            ...prev,
            rowsPerPage: parseInt(event.target.value, 10),
            page: 0
          }))
        }
      />

      {/* Details Dialog */}
      <Dialog
        open={state.openDialog}
        onClose={() => setState(prev => ({ ...prev, openDialog: false }))}
        maxWidth="md"
        fullWidth
        className="feedback-dialog"
      >
        {state.selectedFeedback && (
          <>
            <DialogTitle>
              <Typography variant="h6">Feedback Details</Typography>
            </DialogTitle>
            <DialogContent dividers>
              <FeedbackDetailsContent feedback={state.selectedFeedback} />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => handleFeedbackAction(
                  'read',
                  state.selectedFeedback.id,
                  state.selectedFeedback.isRead
                )}
              >
                Mark as {state.selectedFeedback.isRead ? 'Unread' : 'Read'}
              </Button>
              <Button
                onClick={() => handleFeedbackAction(
                  'favorite',
                  state.selectedFeedback.id,
                  state.selectedFeedback.isFavorite
                )}
              >
                {state.selectedFeedback.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </Button>
              <Button
                onClick={() => handleFeedbackAction('delete', state.selectedFeedback.id)}
                color="error"
              >
                Delete
              </Button>
              <Button
                onClick={() => setState(prev => ({ ...prev, openDialog: false }))}
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
        open={state.snackbar.open}
        autoHideDuration={SNACKBAR_DURATION}
        onClose={() => setState(prev => ({
          ...prev,
          snackbar: { ...prev.snackbar, open: false }
        }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setState(prev => ({
            ...prev,
            snackbar: { ...prev.snackbar, open: false }
          }))}
          severity={state.snackbar.severity}
          variant="filled"
        >
          {state.snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

// PropTypes Definitions
ErrorAlert.propTypes = {
  message: PropTypes.string.isRequired
};

MediaRenderer.propTypes = {
  attachment: PropTypes.string
};

SortableTableCell.propTypes = {
  label: PropTypes.string.isRequired,
  sortKey: PropTypes.string.isRequired,
  currentSortBy: PropTypes.string.isRequired,
  currentSortOrder: PropTypes.string.isRequired,
  onSort: PropTypes.func.isRequired
};

FeedbackDetailsContent.propTypes = {
  feedback: PropTypes.shape({
    id: PropTypes.string.isRequired,
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string
    }),
    message: PropTypes.string,
    feedbackType: PropTypes.string,
    rating: PropTypes.number,
    createdAt: PropTypes.string,
    attachment: PropTypes.string,
    isRead: PropTypes.bool,
    isFavorite: PropTypes.bool
  }).isRequired
};

export default AdminFeedbackDashboard;