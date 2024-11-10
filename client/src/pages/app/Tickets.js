import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Typography,
  Grid,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Chip,
  Snackbar,
  Alert,
  useMediaQuery,
  AppBar,
  Toolbar,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Drawer,
  Tooltip,
  InputAdornment,
  Fade,
  Paper,
  Avatar,
  Divider,
  FormHelperText,
  ListItemAvatar,
  ListItemSecondaryAction,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
  Menu as MenuIcon,
  PriorityHigh as PriorityHighIcon,
  FlagCircle as FlagCircleIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  AttachFile as AttachFileIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  Download as DownloadIcon, // Add this line
} from "@mui/icons-material";
import { useTheme, alpha } from "@mui/material/styles";
import {
  createTicket,
  getTickets,
  updateTicket,
  deleteTicket,
  addNoteToTicket,
  downloadTicketAttachment
} from "../../api";
import styles from "./Tickets.module.css";

const TABS = [
  { label: "All", icon: <DashboardIcon /> },
  { label: "Open", icon: <AssignmentIcon /> },
  { label: "In Progress", icon: <AccessTimeIcon /> },
  { label: "Closed", icon: <CheckCircleIcon /> },
  { label: "Expired", icon: <WarningIcon /> },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
];

const Tickets = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State management
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "Open",
    priority: "Low",
    assignee: "",
    dueDate: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [noteContent, setNoteContent] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("dateDesc");
  const [currentTab, setCurrentTab] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState("All");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [noteFiles, setNoteFiles] = useState([]);
  const [fileError, setFileError] = useState("");

  // Fetch tickets
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedTickets = await getTickets();
      setTickets(fetchedTickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch tickets. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // File handling
  const handleFileChange = useCallback((event) => {
    const files = Array.from(event.target.files);
    const validFiles = [];
    const errors = [];

    files.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name} is too large (max 5MB)`);
        return;
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        errors.push(
          `${file.name} has invalid type (allowed: JPG, PNG, GIF, PDF)`
        );
        return;
      }
      validFiles.push(file);
    });

    if (errors.length > 0) {
      setFileError(errors.join(". "));
    } else {
      setFileError("");
    }

    setSelectedFiles(validFiles);
  }, []);

  const handleNoteFileChange = useCallback((event) => {
    const files = Array.from(event.target.files);
    const validFiles = [];
    const errors = [];

    files.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name} is too large (max 5MB)`);
        return;
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        errors.push(
          `${file.name} has invalid type (allowed: JPG, PNG, GIF, PDF)`
        );
        return;
      }
      validFiles.push(file);
    });

    if (errors.length > 0) {
      setSnackbar({
        open: true,
        message: errors.join(". "),
        severity: "error",
      });
    }

    setNoteFiles((prev) => [...prev, ...validFiles]);
  }, []);

  const handleRemoveFile = useCallback(
    (index) => {
      setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
      if (selectedFiles.length === 1) {
        setFileError("");
      }
    },
    [selectedFiles.length]
  );

  const handleRemoveNoteFile = useCallback((index) => {
    setNoteFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Ticket status and filtering
  const isTicketExpired = useCallback((dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  }, []);

  const filteredTickets = useMemo(() => {
    const statusFilter = TABS[currentTab].label;
    return tickets
      .filter((ticket) => ticket && ticket.title && ticket.description)
      .filter(({ title, description, status, priority, dueDate }) => {
        const isExpired = isTicketExpired(dueDate);
        return (
          (statusFilter === "All" ||
            (statusFilter === "Expired"
              ? isExpired
              : status === statusFilter)) &&
          (filterPriority === "All" || priority === filterPriority) &&
          [title, description].some((field) =>
            field.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      })
      .sort((a, b) => {
        switch (sortOrder) {
          case "dateAsc":
            return new Date(a.createdAt) - new Date(b.createdAt);
          case "dateDesc":
            return new Date(b.createdAt) - new Date(a.createdAt);
          case "priority":
            return b.priority.localeCompare(a.priority);
          default:
            return 0;
        }
      });
  }, [
    tickets,
    searchTerm,
    sortOrder,
    currentTab,
    filterPriority,
    isTicketExpired,
  ]);

  // Dialog handlers
  const handleOpenDialog = useCallback((type, ticket = null) => {
    setDialogType(type);
    setSelectedTicket(ticket);
    setSelectedFiles([]);
    setNoteFiles([]);
    setFileError("");

    if (type === "edit" && ticket) {
      setFormData({
        ...ticket,
        dueDate: ticket.dueDate
          ? new Date(ticket.dueDate).toISOString().split("T")[0]
          : "",
      });
    } else if (type === "add") {
      setFormData({
        title: "",
        description: "",
        status: "Open",
        priority: "Low",
        assignee: "",
        dueDate: "",
      });
    }
    setFormErrors({});
    setDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setSelectedTicket(null);
    setNoteContent("");
    setFormErrors({});
    setSelectedFiles([]);
    setNoteFiles([]);
    setFileError("");
  }, []);

  // Form handling
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const validateForm = useCallback(() => {
    const errors = {};
    if (!formData.title?.trim()) errors.title = "Title is required";
    if (!formData.description?.trim())
      errors.description = "Description is required";
    if (!formData.status) errors.status = "Status is required";
    if (!formData.priority) errors.priority = "Priority is required";

    if (fileError) errors.files = fileError;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, fileError]);

  // CRUD operations
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        formDataToSend.append(key, formData[key]);
      }
    });

    // Make sure to append each file with the correct field name
    selectedFiles.forEach((file) => {
      formDataToSend.append("attachments", file);
    });

    try {
      if (dialogType === "add") {
        const response = await createTicket(formDataToSend);
        setSnackbar({
          open: true,
          message: response.message,
          severity: "success",
        });
      } else if (dialogType === "edit") {
        const response = await updateTicket(selectedTicket.id, formDataToSend);
        setSnackbar({
          open: true,
          message: response.message,
          severity: "success",
        });
      }
      handleCloseDialog();
      fetchTickets();
    } catch (error) {
      console.error("Error submitting ticket:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to submit ticket",
        severity: "error",
      });
    }
  }, [
    dialogType,
    formData,
    selectedTicket,
    handleCloseDialog,
    fetchTickets,
    validateForm,
    selectedFiles,
  ]);

  const handleDeleteTicket = useCallback(async () => {
    if (!selectedTicket?.id) {
      setSnackbar({
        open: true,
        message: "Invalid ticket selected",
        severity: "error",
      });
      return;
    }

    try {
      await deleteTicket(selectedTicket.id);
      setSnackbar({
        open: true,
        message: "Ticket deleted successfully",
        severity: "success",
      });
      handleCloseDialog();
      fetchTickets();
    } catch (error) {
      console.error("Error deleting ticket:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete ticket",
        severity: "error",
      });
    }
  }, [selectedTicket, handleCloseDialog, fetchTickets]);

  const handleAddNote = useCallback(
    async (e) => {
      e.preventDefault();

      if (!noteContent.trim()) {
        setFormErrors((prev) => ({
          ...prev,
          noteContent: "Note content is required",
        }));
        return;
      }

      try {
        const formData = new FormData();
        formData.append("content", noteContent);

        // Add note files
        noteFiles.forEach((file) => {
          formData.append("attachments", file);
        });

        // Log the formData to verify content
        for (let pair of formData.entries()) {
          console.log("FormData:", pair[0], pair[1]);
        }

        const response = await addNoteToTicket(selectedTicket.id, formData);
        console.log("Note Response:", response);

        if (response.ticket) {
          // Update the ticket in the local state
          setTickets((prevTickets) =>
            prevTickets.map((t) =>
              t.id === selectedTicket.id ? response.ticket : t
            )
          );
        }

        setSnackbar({
          open: true,
          message: "Note added successfully",
          severity: "success",
        });
        handleCloseDialog();
        await fetchTickets(); // Refresh tickets after adding note
      } catch (error) {
        console.error("Error adding note:", error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || "Failed to add note",
          severity: "error",
        });
      }
    },
    [selectedTicket, noteContent, noteFiles, handleCloseDialog, fetchTickets]
  );

  // Rendering functions
  const renderPriorityIcon = useCallback((priority) => {
    switch (priority) {
      case "High":
        return <PriorityHighIcon color="error" />;
      case "Medium":
        return <FlagCircleIcon color="warning" />;
      case "Low":
        return <FlagCircleIcon color="info" />;
      default:
        return null;
    }
  }, []);

  const renderStatusChip = useCallback(
    (status, dueDate) => {
      let color =
        status === "Open"
          ? "error"
          : status === "In Progress"
          ? "warning"
          : "success";
      let label = status;

      if (isTicketExpired(dueDate)) {
        color = "default";
        label = "Expired";
      }

      return (
        <Chip
          label={label}
          color={color}
          size="small"
          sx={{
            fontWeight: "bold",
            borderRadius: "16px",
            boxShadow: `0 0 8px ${alpha(
              theme.palette[color]?.main || theme.palette.grey[300],
              0.5
            )}`,
          }}
        />
      );
    },
    [isTicketExpired, theme]
  );

  // In the renderAttachments function, update to use handleRemoveNoteFile for note attachments
  const renderAttachments = useCallback(
    (files, isNote = false) => {
      if (!files || files.length === 0) return null;

      return (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Attachments
          </Typography>
          <List dense>
            {files.map((file, index) => (
              <ListItem key={index}>
                <ListItemAvatar>
                  <Avatar>
                    {file.type?.startsWith("image/") ? (
                      <ImageIcon />
                    ) : (
                      <FileIcon />
                    )}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={file.fileName || file.name}
                  secondary={`${(
                    (file.fileSize || file.size) /
                    1024 /
                    1024
                  ).toFixed(2)} MB`}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() =>
                      isNote
                        ? handleRemoveNoteFile(index)
                        : handleRemoveFile(index)
                    }
                  >
                    <CloseIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      );
    },
    [handleRemoveFile, handleRemoveNoteFile]
  );
  const handleDownloadAttachment = useCallback(async (attachment, ticketId) => {
    try {
      const blob = await downloadTicketAttachment(ticketId, attachment.id);

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", attachment.fileName);

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading attachment:", error);
      setSnackbar({
        open: true,
        message: "Failed to download attachment",
        severity: "error",
      });
    }
  }, []);
  const renderNotes = useCallback(
    (notes, ticketId) => {
      if (!notes?.length) {
        return (
          <Typography color="textSecondary" align="center" sx={{ py: 2 }}>
            No notes yet
          </Typography>
        );
      }
      return (
        <List className={styles.notesList}>
          {notes
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((note, index) => (
              <Paper
                key={note.id || index}
                elevation={1}
                sx={{ mb: 2, p: 2, backgroundColor: "background.paper" }}
              >
                <Box display="flex" alignItems="center" mb={1}>
                  <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                    {note.userName?.[0] || <PersonIcon />}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2">
                      {note.userName || "User"}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(note.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>

                <Typography
                  variant="body1"
                  sx={{ whiteSpace: "pre-wrap", mb: 2 }}
                >
                  {note.content}
                </Typography>

                {note.attachments?.length > 0 && (
                  <Box mt={1}>
                    <Typography variant="subtitle2" gutterBottom>
                      Attachments:
                    </Typography>
                    <Grid container spacing={1}>
                      {note.attachments.map((attachment, attIndex) => (
                        <Grid item key={attIndex}>
                          <Chip
                            icon={
                              attachment.fileType?.startsWith("image/") ? (
                                <ImageIcon />
                              ) : (
                                <AttachFileIcon />
                              )
                            }
                            label={attachment.fileName}
                            variant="outlined"
                            size="small"
                            onClick={() =>
                              handleDownloadAttachment(attachment, ticketId)
                            }
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Paper>
            ))}
        </List>
      );
    },
    [handleDownloadAttachment]
  );

  const renderTicketCard = useCallback(
    (ticket) => (
      <Grid item xs={12} sm={6} md={4} key={ticket.id}>
        <Fade in={true} timeout={500}>
          <Paper
            className={styles.ticketCard}
            onClick={() => handleOpenDialog("view", ticket)}
          >
            <Box className={styles.cardHeader}>
              <Typography variant="h6" noWrap className={styles.cardTitle}>
                {ticket.title}
              </Typography>
            </Box>
            <Box className={styles.cardContent}>
              <Typography
                variant="body2"
                color="textSecondary"
                className={styles.cardDescription}
              >
                {ticket.description}
              </Typography>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
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
                  <Typography variant="body2">
                    {ticket.assignee || "Unassigned"}
                  </Typography>
                </Box>
              </Tooltip>
              <Tooltip title="Due Date">
                <Box display="flex" alignItems="center">
                  <AccessTimeIcon
                    fontSize="small"
                    className={styles.dueDateIcon}
                  />
                  <Typography
                    variant="body2"
                    className={
                      isTicketExpired(ticket.dueDate) ? styles.expiredDate : ""
                    }
                  >
                    {ticket.dueDate
                      ? new Date(ticket.dueDate).toLocaleDateString()
                      : "Not set"}
                  </Typography>
                  {isTicketExpired(ticket.dueDate) && (
                    <WarningIcon
                      color="error"
                      fontSize="small"
                      className={styles.warningIcon}
                    />
                  )}
                </Box>
              </Tooltip>
              {ticket.attachments?.length > 0 && (
                <Tooltip title={`${ticket.attachments.length} attachment(s)`}>
                  <Box display="flex" alignItems="center">
                    <AttachFileIcon fontSize="small" />
                    <Typography variant="body2">
                      {ticket.attachments.length}
                    </Typography>
                  </Box>
                </Tooltip>
              )}
            </Box>
          </Paper>
        </Fade>
      </Grid>
    ),
    [handleOpenDialog, renderStatusChip, renderPriorityIcon, isTicketExpired]
  );

  const renderDialogContent = useCallback(() => {
    switch (dialogType) {
      case "view":
        return selectedTicket ? (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography
                variant="h5"
                gutterBottom
                className={styles.dialogTitle}
              >
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
            {selectedTicket.attachments?.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Attachments
                </Typography>
                <List>
                  {selectedTicket.attachments.map((attachment, index) => (
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <Avatar>
                          {attachment.fileType?.startsWith("image/") ? (
                            <ImageIcon />
                          ) : (
                            <FileIcon />
                          )}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={attachment.fileName}
                        secondary={`Uploaded ${new Date(
                          attachment.uploadedAt
                        ).toLocaleString()}`}
                      />
                      <IconButton
                        onClick={() =>
                          handleDownloadAttachment(
                            attachment,
                            selectedTicket.id
                          )
                        }
                      >
                        <DownloadIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography
                variant="h6"
                gutterBottom
                className={styles.sectionTitle}
              >
                Notes
              </Typography>
              {renderNotes(selectedTicket.notes, selectedTicket.id)}
              <Button
                startIcon={<AddIcon />}
                onClick={() => setDialogType("addNote")}
                variant="outlined"
                className={styles.addNoteButton}
              >
                Add Note
              </Button>
            </Grid>
          </Grid>
        ) : null;

      case "add":
      case "edit":
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                name="title"
                label="Title"
                fullWidth
                required
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
                required
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
                </Select>
                {formErrors.status && (
                  <FormHelperText>{formErrors.status}</FormHelperText>
                )}
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
                {formErrors.priority && (
                  <FormHelperText>{formErrors.priority}</FormHelperText>
                )}
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
            <Grid item xs={12}>
              <input
                accept="image/*,application/pdf"
                style={{ display: "none" }}
                id="file-upload"
                multiple
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<AttachFileIcon />}
                >
                  Attach Files
                </Button>
              </label>
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ ml: 2 }}
              >
                Max size: 5MB. Allowed types: Images, PDF
              </Typography>
              {fileError && (
                <Typography
                  color="error"
                  variant="caption"
                  display="block"
                  sx={{ mt: 1 }}
                >
                  {fileError}
                </Typography>
              )}
              {renderAttachments(selectedFiles)}
            </Grid>
          </Grid>
        );

      case "delete":
        return (
          <Typography className={styles.dialogMessage}>
            Are you sure you want to delete this ticket? This action cannot be
            undone.
          </Typography>
        );

      case "addNote":
        return (
          <Box component="form" onSubmit={handleAddNote}>
            <TextField
              autoFocus
              name="noteContent"
              label="Note Content"
              fullWidth
              multiline
              rows={4}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              error={!!formErrors.noteContent}
              helperText={formErrors.noteContent}
              sx={{ mb: 2 }}
            />

            <input
              accept="image/*,application/pdf"
              style={{ display: "none" }}
              id="note-attachments"
              multiple
              type="file"
              onChange={handleNoteFileChange}
            />

            <label htmlFor="note-attachments">
              <Button
                variant="outlined"
                component="span"
                startIcon={<AttachFileIcon />}
                sx={{ mb: 2 }}
              >
                Add Attachments
              </Button>
            </label>

            {noteFiles?.length > 0 && renderAttachments(noteFiles, true)}
          </Box>
        );

      default:
        return null;
    }
  }, [
    dialogType,
    selectedTicket,
    formData,
    formErrors,
    handleInputChange,
    noteContent,
    noteFiles,
    fileError,
    selectedFiles,
    renderStatusChip,
    renderPriorityIcon,
    renderAttachments,
    renderNotes,
    handleAddNote,
    handleNoteFileChange,
    handleFileChange,
    handleDownloadAttachment // Add this line
  ]);

  return (
    <Box className={styles.pageWrapper}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setDrawerOpen(true)}
            sx={{ display: { sm: "none" } }}
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
            onClick={() => handleOpenDialog("add")}
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
              <ListItemText
                primary="Ticket Dashboard"
                className={styles.drawerTitle}
              />
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
              No tickets found. Try adjusting your filters or create a new
              ticket.
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
            {dialogType === "add"
              ? "Create New Ticket"
              : dialogType === "edit"
              ? "Edit Ticket"
              : dialogType === "view"
              ? selectedTicket?.title
              : dialogType === "addNote"
              ? "Add Note"
              : "Confirm Delete"}
            <IconButton
              onClick={handleCloseDialog}
              className={styles.dialogCloseButton}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>{renderDialogContent()}</DialogContent>
          <DialogActions className={styles.dialogActions}>
            <Button
              onClick={handleCloseDialog}
              color="primary"
              variant="outlined"
              className={styles.actionButton}
            >
              Cancel
            </Button>
            {dialogType === "add" || dialogType === "edit" ? (
              <Button
                onClick={handleSubmit}
                color="primary"
                variant="contained"
                className={styles.actionButton}
              >
                {dialogType === "add" ? "Create Ticket" : "Save Changes"}
              </Button>
            ) : dialogType === "delete" ? (
              <Button
                onClick={handleDeleteTicket}
                color="error"
                variant="contained"
                className={styles.actionButton}
              >
                Delete
              </Button>
            ) : dialogType === "addNote" ? (
              <Button
                onClick={handleAddNote}
                color="primary"
                variant="contained"
                className={styles.actionButton}
              >
                Add Note
              </Button>
            ) : dialogType === "view" ? (
              <>
                <Button
                  onClick={() => handleOpenDialog("edit", selectedTicket)}
                  color="primary"
                  variant="contained"
                  className={styles.actionButton}
                >
                  Edit Ticket
                </Button>
                <Button
                  onClick={() => handleOpenDialog("delete", selectedTicket)}
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
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
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
