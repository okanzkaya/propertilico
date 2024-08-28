import React, { useState } from "react";
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
} from "@mui/material";
import { styled } from "@mui/system";
import FeedbackIcon from "@mui/icons-material/Feedback";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import { useTheme } from "@mui/material/styles";

const PageWrapper = styled(Box)(({ theme }) => ({
  padding: "2rem",
  backgroundColor: theme.palette.background.default,
  minHeight: "100vh",
  [theme.breakpoints.down("sm")]: {
    padding: "1rem",
  },
}));

const FeedbackCard = styled(Card)(({ theme }) => ({
  padding: "2rem",
  marginBottom: "2rem",
  boxShadow: theme.shadows[2],
  borderRadius: "8px",
  backgroundColor: theme.palette.background.paper,
}));

const SectionTitle = styled(Typography)({
  marginBottom: "1.5rem",
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
});

const CustomFormControl = styled(FormControl)({
  marginBottom: "1.5rem",
});

const InputLabelStyled = styled(InputLabel)({
  marginBottom: "0.5rem",
});

const CustomButton = styled(Button)({
  marginTop: "1rem",
  width: "200px", // Set the width for the button
});

const CustomAttachButton = styled(Button)({
  marginTop: "1rem",
  width: "200px", // Set the width for the button to match Submit Feedback button
  whiteSpace: "nowrap",
});

const CustomRating = styled(Rating)({
  fontSize: "2rem", // Increase the star size
});

const SendFeedbackPage = () => {
  const theme = useTheme(); // Access the theme
  const [feedback, setFeedback] = useState({
    message: "",
    rating: 0,
    feedbackType: "",
    attachment: "",
  });

  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFeedback((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFeedback((prev) => ({ ...prev, attachment: file }));
  };

  const handleSubmit = () => {
    // Handle feedback submission logic here
    alert("Feedback submitted successfully!");
    setFeedbackSent(true);
    setFeedback({ message: "", rating: 0, feedbackType: "", attachment: "" });
  };

  return (
    <PageWrapper>
      <Typography variant="h4" gutterBottom>
        Send Feedback
      </Typography>

      {feedbackSent && (
        <Alert
          severity="success"
          onClose={() => setFeedbackSent(false)}
          sx={{ mb: 2 }}
        >
          Feedback submitted successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
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
              >
                <MenuItem value="bug">Report a Bug</MenuItem>
                <MenuItem value="feature">Request a Feature</MenuItem>
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
              />
            </CustomFormControl>
            <CustomFormControl fullWidth>
              <CustomRating
                name="rating"
                value={feedback.rating}
                onChange={(event, newValue) => {
                  setFeedback((prev) => ({ ...prev, rating: newValue }));
                }}
              />
            </CustomFormControl>
            <CustomFormControl fullWidth>
              <CustomAttachButton
                variant="contained"
                component="label"
                startIcon={<AttachFileIcon />}
              >
                Attach File
                <input type="file" hidden onChange={handleFileChange} />
              </CustomAttachButton>
              {feedback.attachment && (
                <Typography variant="body2" mt={2}>
                  {feedback.attachment.name}
                </Typography>
              )}
            </CustomFormControl>
            <CustomButton
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              startIcon={<SendIcon />}
            >
              Submit Feedback
            </CustomButton>
          </FeedbackCard>
        </Grid>
      </Grid>
    </PageWrapper>
  );
};

export default SendFeedbackPage;
