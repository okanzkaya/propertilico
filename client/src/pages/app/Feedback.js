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
} from '@mui/material';
import FeedbackIcon from '@mui/icons-material/Feedback';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDropzone } from 'react-dropzone';
import { sendFeedback, checkFeedbackLimit } from '../../api';
import './Feedback.css';

const INITIAL_STATE = {
  message: '',
  rating: 0,
  feedbackType: '',
  attachment: null,
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
        setError(null);
        const { canSubmit, timeUntilNext } = await checkFeedbackLimit();
        setCanSubmit(canSubmit);
        setTimeUntilNextSubmission(timeUntilNext);
      } catch (error) {
        console.error('Error in checkSubmissionLimit:', error);
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
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.[0]) {
      const file = acceptedFiles[0];
      if (file.size > 50 * 1024 * 1024) {
        handleError(new Error('File size exceeds 50MB limit.'));
      } else {
        setFeedback((prev) => ({ ...prev, attachment: file }));
      }
    }
  }, []);

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
      Object.entries(feedback).forEach(([key, value]) => {
        if (value && key !== 'attachment') {
          formData.append(key, value);
        }
      });
      
      if (feedback.attachment) {
        formData.append('attachment', feedback.attachment);
      }

      await sendFeedback(formData);
      setSnackbarMessage('Feedback submitted successfully!');
      setSnackbarSeverity('success');
      setFeedback(INITIAL_STATE);
      setCanSubmit(false);
      setTimeUntilNextSubmission(300);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      handleError(error);
    } finally {
      setIsSubmitting(false);
      setSnackbarOpen(true);
    }
  };

  return (
    <div className="page-wrapper">
      <Typography variant="h4" className="page-title">
        Send Feedback
      </Typography>

      {error && <Alert severity="error" className="error-alert">{error}</Alert>}

      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={8} lg={6}>
          <Fade in={true} timeout={1000}>
            <div className="feedback-card">
              <div className="section-title">
                <Tooltip title="Send Feedback">
                  <Avatar className="feedback-icon">
                    <FeedbackIcon />
                  </Avatar>
                </Tooltip>
                <span>Share Your Insights</span>
              </div>

              <div className="custom-form-control">
                <label className="input-label">Type of Feedback</label>
                <Select
                  name="feedbackType"
                  value={feedback.feedbackType}
                  onChange={handleChange}
                  required
                  displayEmpty
                  className="select-field"
                >
                  <MenuItem value="" disabled>Select feedback type</MenuItem>
                  <MenuItem value="bug">Report a Bug</MenuItem>
                  <MenuItem value="feature">Request a Feature</MenuItem>
                  <MenuItem value="improvement">Suggest an Improvement</MenuItem>
                  <MenuItem value="general">General Feedback</MenuItem>
                </Select>
              </div>

              <div className="custom-form-control">
                <label className="input-label">Message</label>
                <TextField
                  multiline
                  rows={4}
                  variant="outlined"
                  name="message"
                  value={feedback.message}
                  onChange={handleChange}
                  placeholder="Please provide detailed feedback (minimum 10 characters)..."
                  required
                  className="text-field"
                />
              </div>

              <div className="custom-form-control">
                <label className="input-label">Rating (Optional)</label>
                <div className="custom-rating">
                  {/* Implement your rating component here */}
                </div>
              </div>

              <div className="custom-form-control">
                <label className="input-label">Attachment (Max 50MB)</label>
                <div className="dropzone-area" {...getRootProps()}>
                  <input {...getInputProps()} />
                  <Typography>
                    {isDragActive ? 'Drop the file here ...' : 
                     'Drag \'n\' drop an image, video, or audio file here, or click to select a file'}
                  </Typography>
                </div>
                {feedback.attachment && (
                  <List className="file-list">
                    <ListItem className="file-list-item">
                      <div className="list-item-text">
                        <div className="list-item-text-primary">{feedback.attachment.name}</div>
                        <div className="list-item-text-secondary">
                          {`${(feedback.attachment.size / 1024 / 1024).toFixed(2)} MB`}
                        </div>
                      </div>
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          onClick={() => setFeedback(prev => ({ ...prev, attachment: null }))}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                )}
              </div>

              <button
                className={`custom-button ${isSubmitting ? 'submitting' : ''}`}
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