import React, { useState, useCallback, useEffect } from 'react';
import {
  Typography,
  Grid,
  Box,
  Card,
  Button,
  TextField,
  Rating,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Avatar,
  Tooltip,
  Alert,
  Snackbar,
  IconButton,
  Fade,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { styled } from '@mui/system';
import FeedbackIcon from '@mui/icons-material/Feedback';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '@mui/material/styles';
import { sendFeedback, checkFeedbackLimit } from '../../api';
import { useDropzone } from 'react-dropzone';

const PageWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const FeedbackCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  boxShadow: theme.shadows[3],
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'translateY(-5px)',
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const CustomFormControl = styled(FormControl)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const InputLabelStyled = styled(InputLabel)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

const CustomButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  width: '200px',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const CustomRating = styled(Rating)(({ theme }) => ({
  fontSize: '2rem',
  color: theme.palette.primary.main,
}));

const DropzoneArea = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const FeedbackPage = () => {
  const theme = useTheme();
  const [feedback, setFeedback] = useState({
    message: '',
    rating: 0,
    feedbackType: '',
    attachment: null,
  });
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
        setError(error.message || 'An error occurred while checking feedback limit');
        setSnackbarMessage(error.message || 'Error checking feedback limit. Please try again later.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFeedback((prev) => ({ ...prev, [name]: value }));
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > 50 * 1024 * 1024) {
        setSnackbarMessage('File size exceeds 50MB limit.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } else {
        setFeedback((prev) => ({
          ...prev,
          attachment: file
        }));
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

  const handleRemoveAttachment = () => {
    setFeedback((prev) => ({ ...prev, attachment: null }));
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      setSnackbarMessage(`Please wait ${timeUntilNextSubmission} seconds before submitting again.`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (feedback.message.length < 10 || !feedback.feedbackType) {
      setSnackbarMessage('Please provide a message (at least 10 characters) and select a feedback type.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('message', feedback.message);
      formData.append('feedbackType', feedback.feedbackType);
      
      if (feedback.rating > 0) {
        formData.append('rating', feedback.rating);
      }
      
      if (feedback.attachment) {
        formData.append('attachment', feedback.attachment);
      }

      await sendFeedback(formData);
      setSnackbarMessage('Feedback submitted successfully!');
      setSnackbarSeverity('success');
      setFeedback({ message: '', rating: 0, feedbackType: '', attachment: null });
      setCanSubmit(false);
      setTimeUntilNextSubmission(300); // 5 minutes cooldown
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSnackbarMessage(error.message || 'Failed to submit feedback. Please try again.');
      setSnackbarSeverity('error');
    } finally {
      setIsSubmitting(false);
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <PageWrapper>
      <Typography variant="h4" gutterBottom align="center">
        Send Feedback
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={8} lg={6}>
          <Fade in={true} timeout={1000}>
            <FeedbackCard>
              <SectionTitle variant="h6">
                <Tooltip title="Send Feedback">
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                    }}
                  >
                    <FeedbackIcon />
                  </Avatar>
                </Tooltip>
                Share Your Insights
              </SectionTitle>
              <CustomFormControl fullWidth>
                <InputLabelStyled shrink>Type of Feedback</InputLabelStyled>
                <Select
                  name="feedbackType"
                  value={feedback.feedbackType}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="bug">Report a Bug</MenuItem>
                  <MenuItem value="feature">Request a Feature</MenuItem>
                  <MenuItem value="improvement">Suggest an Improvement</MenuItem>
                  <MenuItem value="general">General Feedback</MenuItem>
                </Select>
              </CustomFormControl>
              <CustomFormControl fullWidth>
                <InputLabelStyled shrink>Message</InputLabelStyled>
                <TextField
                  multiline
                  rows={4}
                  variant="outlined"
                  name="message"
                  value={feedback.message}
                  onChange={handleChange}
                  placeholder="Please provide detailed feedback (minimum 10 characters)..."
                  required
                />
              </CustomFormControl>
              <CustomFormControl fullWidth>
                <InputLabelStyled shrink>Rating (Optional)</InputLabelStyled>
                <CustomRating
                  name="rating"
                  value={feedback.rating}
                  onChange={(event, newValue) => {
                    setFeedback((prev) => ({ ...prev, rating: newValue || 0 }));
                  }}
                />
              </CustomFormControl>
              <CustomFormControl fullWidth>
                <InputLabelStyled shrink>Attachment (Max 50MB)</InputLabelStyled>
                <DropzoneArea {...getRootProps()}>
                  <input {...getInputProps()} />
                  {isDragActive ? (
                    <p>Drop the file here ...</p>
                  ) : (
                    <p>Drag 'n' drop an image, video, or audio file here, or click to select a file</p>
                  )}
                </DropzoneArea>
                {feedback.attachment && (
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary={feedback.attachment.name} 
                        secondary={`${(feedback.attachment.size / 1024 / 1024).toFixed(2)} MB`} 
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" aria-label="delete" onClick={handleRemoveAttachment}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                )}
              </CustomFormControl>
              <CustomButton
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                startIcon={isSubmitting ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                disabled={isSubmitting || !canSubmit}
              >
                {isSubmitting ? 'Submitting...' : canSubmit ? 'Submit Feedback' : `Wait ${timeUntilNextSubmission}s`}
              </CustomButton>
            </FeedbackCard>
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
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleSnackbarClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </PageWrapper>
  );
};

export default FeedbackPage;