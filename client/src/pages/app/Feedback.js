import React, { useState, useCallback, useEffect } from 'react';
import {
  Typography,
  Grid,
  Select,
  TextField,
  Avatar,
  Tooltip,
  Alert,
  Snackbar,
  IconButton,
  Fade,
  CircularProgress,
  List,
  ListItem,
  ListItemSecondaryAction,
  MenuItem,
  Box,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import FeedbackIcon from '@mui/icons-material/Feedback';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDropzone } from 'react-dropzone';
import { sendFeedback, checkFeedbackLimit } from '../../api';
import styles from './Feedback.module.css';

const INITIAL_STATE = {
  message: '',
  rating: 0,
  feedbackType: '',
  attachment: null,
};

const StarRating = ({ value, onChange }) => {
  const [hover, setHover] = useState(-1);

  return (
    <Box 
      className={styles.starRating}
      sx={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <IconButton
          key={star}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(-1)}
          size="large"
          sx={{
            padding: '4px',
            color: (hover !== -1 ? star <= hover : star <= value) 
              ? '#FFB400'
              : 'rgba(0, 0, 0, 0.38)',
            '&:hover': {
              background: 'transparent',
            }
          }}
        >
          <StarIcon 
            sx={{ 
              fontSize: '2rem',
              transition: 'color 0.2s ease-in-out',
            }} 
          />
        </IconButton>
      ))}
      <Typography 
        variant="body2" 
        sx={{ 
          marginLeft: '8px',
          minWidth: '60px',
          color: 'text.secondary'
        }}
      >
        {value ? `${value} Star${value !== 1 ? 's' : ''}` : 'No rating'}
      </Typography>
    </Box>
  );
};

const FeedbackPage = () => {
  const [feedback, setFeedback] = useState(INITIAL_STATE);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [canSubmit, setCanSubmit] = useState(true);
  const [timeUntilNextSubmission, setTimeUntilNextSubmission] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkSubmissionLimit = async () => {
      try {
        const { canSubmit, timeUntilNext } = await checkFeedbackLimit();
        setCanSubmit(canSubmit);
        setTimeUntilNextSubmission(timeUntilNext);
      } catch (error) {
        console.error('Error checking submission limit:', error);
        handleError(error);
      }
    };

    checkSubmissionLimit();
  }, []);

  useEffect(() => {
    let timer;
    if (!canSubmit && timeUntilNextSubmission > 0) {
      timer = setInterval(() => {
        setTimeUntilNextSubmission((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [canSubmit, timeUntilNextSubmission]);

  const handleError = (error) => {
    setError(error.message || 'An unexpected error occurred');
    setSnackbarMessage(error.message || 'Error occurred. Please try again later.');
    setSnackbarSeverity('error');
    setSnackbarOpen(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFeedback((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleRatingChange = (value) => {
    setFeedback((prev) => ({ ...prev, rating: value }));
    if (error) setError(null);
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.[0]) {
      const file = acceptedFiles[0];
      if (file.size > 50 * 1024 * 1024) {
        handleError(new Error('File size exceeds 50MB limit.'));
      } else {
        setFeedback((prev) => ({ ...prev, attachment: file }));
        if (error) setError(null);
      }
    }
  }, [error]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.heic'],
      'video/*': ['.mp4', '.webm', '.ogg'],
      'audio/*': ['.mp3', '.wav']
    },
    maxSize: 50 * 1024 * 1024,
    maxFiles: 1,
  });

  const handleSubmit = async () => {
    if (!canSubmit) {
      handleError(new Error(`Please wait ${timeUntilNextSubmission} seconds before submitting again.`));
      return;
    }

    if (feedback.message.length < 10 || !feedback.feedbackType) {
      handleError(new Error('Please provide a message (at least 10 characters) and select a feedback type.'));
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      formData.append('message', feedback.message.trim());
      formData.append('feedbackType', feedback.feedbackType);
      formData.append('rating', String(feedback.rating));
      
      if (feedback.attachment) {
        formData.append('attachment', feedback.attachment);
      }

      await sendFeedback(formData);
      
      setSnackbarMessage('Feedback submitted successfully!');
      setSnackbarSeverity('success');
      setFeedback(INITIAL_STATE);
      setCanSubmit(false);
      setTimeUntilNextSubmission(300);
      setError(null);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      handleError(error);
    } finally {
      setIsSubmitting(false);
      setSnackbarOpen(true);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Typography variant="h4" className={styles.pageTitle}>
        Send Feedback
      </Typography>

      {error && <Alert severity="error" className={styles.errorAlert}>{error}</Alert>}

      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={8} lg={6}>
          <Fade in={true} timeout={1000}>
            <div className={styles.feedbackCard}>
              <div className={styles.sectionTitle}>
                <Tooltip title="Send Feedback">
                  <Avatar className={styles.feedbackIcon}>
                    <FeedbackIcon />
                  </Avatar>
                </Tooltip>
                <span>Share Your Insights</span>
              </div>

              <div className={styles.customFormControl}>
                <label className={styles.inputLabel}>Type of Feedback</label>
                <Select
                  name="feedbackType"
                  value={feedback.feedbackType}
                  onChange={handleChange}
                  required
                  fullWidth
                  displayEmpty
                  className={styles.selectField}
                  error={Boolean(error && !feedback.feedbackType)}
                >
                  <MenuItem value="" disabled>Select feedback type</MenuItem>
                  <MenuItem value="bug">Report a Bug</MenuItem>
                  <MenuItem value="feature">Request a Feature</MenuItem>
                  <MenuItem value="improvement">Suggest an Improvement</MenuItem>
                  <MenuItem value="general">General Feedback</MenuItem>
                </Select>
              </div>

              <div className={styles.customFormControl}>
                <label className={styles.inputLabel}>Message</label>
                <TextField
                  multiline
                  rows={4}
                  variant="outlined"
                  name="message"
                  value={feedback.message}
                  onChange={handleChange}
                  placeholder="Please provide detailed feedback (minimum 10 characters)..."
                  required
                  fullWidth
                  className={styles.textField}
                  error={Boolean(error && feedback.message.length < 10)}
                  helperText={feedback.message.length < 10 ? "Message must be at least 10 characters long" : ""}
                />
              </div>

              <div className={styles.customFormControl}>
                <label className={styles.inputLabel}>Rating (Optional)</label>
                <StarRating 
                  value={feedback.rating} 
                  onChange={handleRatingChange} 
                />
              </div>

              <div className={styles.customFormControl}>
                <label className={styles.inputLabel}>Attachment (Max 50MB)</label>
                <div className={styles.dropzoneArea} {...getRootProps()}>
                  <input {...getInputProps()} />
                  <Typography>
                    {isDragActive
                      ? 'Drop the file here ...'
                      : "Drag 'n' drop an image, video, or audio file here, or click to select a file"}
                  </Typography>
                </div>
                {feedback.attachment && (
                  <List className={styles.fileList}>
                    <ListItem className={styles.fileListItem}>
                      <div className={styles.listItemText}>
                        <div className={styles.listItemTextPrimary}>
                          {feedback.attachment.name}
                        </div>
                        <div className={styles.listItemTextSecondary}>
                          {`${(feedback.attachment.size / 1024 / 1024).toFixed(2)} MB`}
                        </div>
                      </div>
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFeedback((prev) => ({ ...prev, attachment: null }));
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                )}
              </div>

              <button
                className={`custom-button ${isSubmitting ? styles.submitting : ''}`}
                onClick={handleSubmit}
                disabled={isSubmitting || !canSubmit}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={24} />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <SendIcon />
                    <span>
                      {canSubmit ? 'Submit Feedback' : `Wait ${timeUntilNextSubmission}s`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </Fade>
        </Grid>
      </Grid>

      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          severity={snackbarSeverity}
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={() => setSnackbarOpen(false)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default FeedbackPage;