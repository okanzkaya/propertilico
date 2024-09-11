import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Typography,
  Grid,
  Box,
  Card,
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
  InputAdornment,
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
  Paper,
  useTheme,
  IconButton,
  Drawer,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Sort as SortIcon,
  Menu as MenuIcon,
  FilterList as FilterListIcon,
  Today as TodayIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { styled } from "@mui/system";

const PageWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  minHeight: "100vh",
  color: theme.palette.text.primary,
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.3s ease",
  cursor: "pointer",
  "&:hover": {
    boxShadow: theme.shadows[8],
    transform: "translateY(-5px)",
  },
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
}));

const CardContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  flexGrow: 1,
}));

const CardActions = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const SearchBar = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.shape.borderRadius * 2,
    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const Tickets = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [tickets, setTickets] = useState(() => {
    const storedTickets = localStorage.getItem("tickets");
    return storedTickets ? JSON.parse(storedTickets) : [];
  });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [dialogType, setDialogType] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("priority");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState("All");
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");

  useEffect(() => {
    localStorage.setItem("tickets", JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const filteredTickets = useMemo(() => {
    const statusFilter = ["All", "Open", "In Progress", "Closed"][currentTab];
    return tickets
      .filter(
        ({ title, description, status, priority }) =>
          (statusFilter === "All" || status === statusFilter) &&
          (filterPriority === "All" || priority === filterPriority) &&
          [title, description].some((field) =>
            field.toLowerCase().includes(searchTerm.toLowerCase())
          )
      )
      .sort((a, b) => {
        switch (sortOrder) {
          case "priority":
            return b.priority.localeCompare(a.priority);
          case "dateAsc":
            return new Date(a.createdAt) - new Date(b.createdAt);
          case "dateDesc":
            return new Date(b.createdAt) - new Date(a.createdAt);
          case "status":
            return a.status.localeCompare(b.status);
          case "dueDate":
            return new Date(a.dueDate) - new Date(b.dueDate);
          default:
            return 0;
        }
      });
  }, [searchTerm, sortOrder, currentTab, tickets, filterPriority]);

  const handleOpenDialog = useCallback((type, ticket = null) => {
    setSelectedTicket(ticket);
    setFormValues(ticket || { status: "Open", priority: "Low" });
    setDialogType(type);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setSelectedTicket(null);
    setFormValues({});
    setDialogType(null);
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSaveTicket = useCallback(() => {
    if (!formValues.title || !formValues.description) {
      setSnackbarMessage("Please fill in all required fields.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    if (dialogType === "add") {
      const newTicket = {
        id: Date.now(),
        ...formValues,
        createdAt: new Date().toISOString().split("T")[0],
        notes: [],
      };
      setTickets((prevTickets) => [...prevTickets, newTicket]);
      setSnackbarMessage("New ticket created successfully.");
    } else if (dialogType === "edit") {
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === selectedTicket.id ? { ...ticket, ...formValues } : ticket
        )
      );
      setSnackbarMessage("Ticket updated successfully.");
    }
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
    handleCloseDialog();
  }, [dialogType, formValues, selectedTicket, handleCloseDialog]);

  const handleDeleteTicket = useCallback(() => {
    setTickets((prevTickets) => prevTickets.filter((ticket) => ticket.id !== selectedTicket.id));
    setSnackbarMessage("Ticket deleted successfully.");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
    handleCloseDialog();
  }, [selectedTicket, handleCloseDialog]);

  const handleAddNote = useCallback(() => {
    if (noteContent.trim()) {
      const newNote = {
        id: Date.now(),
        content: noteContent,
        createdAt: new Date().toISOString(),
      };
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === selectedTicket.id
            ? { ...ticket, notes: [...ticket.notes, newNote] }
            : ticket
        )
      );
      setNoteContent("");
      setNoteDialogOpen(false);
      setSnackbarMessage("Note added successfully.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    }
  }, [noteContent, selectedTicket]);

  const renderChip = useCallback((label, color) => (
    <Chip label={label} color={color} size="small" sx={{ fontWeight: 'bold', borderRadius: '16px' }} />
  ), []);

  const dialogContent = useCallback(() => {
    switch (dialogType) {
      case "view":
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>{selectedTicket.title}</Typography>
              <Typography variant="body1" paragraph>{selectedTicket.description}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Status</Typography>
              {renderChip(selectedTicket.status, selectedTicket.status === "Open" ? "error" : selectedTicket.status === "In Progress" ? "warning" : "success")}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Priority</Typography>
              {renderChip(selectedTicket.priority, selectedTicket.priority === "High" ? "error" : selectedTicket.priority === "Medium" ? "warning" : "info")}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Assignee</Typography>
              <Typography variant="body2">{selectedTicket.assignee}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Due Date</Typography>
              <Typography variant="body2">{selectedTicket.dueDate}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Notes</Typography>
              <List>
                {selectedTicket.notes && selectedTicket.notes.map((note, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={new Date(note.createdAt).toLocaleString()}
                      secondary={note.content}
                    />
                  </ListItem>
                ))}
              </List>
              <Button
                startIcon={<AddIcon />}
                onClick={() => setNoteDialogOpen(true)}
                sx={{ mt: 2 }}
                variant="outlined"
              >
                Add Note
              </Button>
            </Grid>
          </Grid>
        );
      case "add":
      case "edit":
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                label="Title"
                fullWidth
                variant="outlined"
                value={formValues.title || ""}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                variant="outlined"
                multiline
                rows={4}
                value={formValues.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Status</InputLabel>
                <Select
                  value={formValues.status || "Open"}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  label="Status"
                >
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formValues.priority || "Low"}
                  onChange={(e) => handleInputChange("priority", e.target.value)}
                  label="Priority"
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Assignee"
                fullWidth
                variant="outlined"
                value={formValues.assignee || ""}
                onChange={(e) => handleInputChange("assignee", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Due Date"
                type="date"
                fullWidth
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                value={formValues.dueDate || ""}
                onChange={(e) => handleInputChange("dueDate", e.target.value)}
              />
            </Grid>
          </Grid>
        );
      case "delete":
        return (
          <Typography>
            Are you sure you want to delete this ticket? This action cannot be undone.
          </Typography>
        );
      default:
        return null;
    }
  }, [dialogType, selectedTicket, formValues, handleInputChange, renderChip]);

  const renderTicketCard = useCallback((ticket) => (
    <Grid item xs={12} sm={6} md={4} key={ticket.id}>
      <StyledCard onClick={() => handleOpenDialog("view", ticket)}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" noWrap sx={{ flex: 1 }}>{ticket.title}</Typography>
            <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40, fontSize: '1rem' }}>
              {ticket.assignee ? ticket.assignee[0].toUpperCase() : 'U'}
            </Avatar>
          </Box>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2, height: '3em', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {ticket.description}
          </Typography>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            {renderChip(ticket.status, ticket.status === "Open" ? "error" : ticket.status === "In Progress" ? "warning" : "success")}
            {renderChip(ticket.priority, ticket.priority === "High" ? "error" : ticket.priority === "Medium" ? "warning" : "info")}
          </Box>
        </CardContent>
        <CardActions>
          <Box>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenDialog("edit", ticket); }}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleOpenDialog("delete", ticket); }}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Tooltip title="Due Date">
            <Typography variant="caption" color="textSecondary">
              <TodayIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              {ticket.dueDate}
            </Typography>
          </Tooltip>
        </CardActions>
      </StyledCard>
    </Grid>
  ), [handleOpenDialog, renderChip, theme.palette.primary.main]);

  return (
    <PageWrapper>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: "white" }}>
            Tickets
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog("add")}
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
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={() => setDrawerOpen(false)}
          onKeyDown={() => setDrawerOpen(false)}
        >
          <List>
            {["All Tickets", "Open Tickets", "In Progress Tickets", "Closed Tickets"].map((text, index) => (
              <ListItem button key={text} onClick={() => setCurrentTab(index)}>
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <SearchBar
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
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Sort</InputLabel>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                label="Sort"
                startAdornment={
                  <InputAdornment position="start">
                    <SortIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="priority">Priority</MenuItem>
                <MenuItem value="dateAsc">Oldest First</MenuItem>
                <MenuItem value="dateDesc">Newest First</MenuItem>
                <MenuItem value="status">Status</MenuItem>
                <MenuItem value="dueDate">Due Date</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Filter Priority</InputLabel>
              <Select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                label="Filter Priority"
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
      </Box>

      <Paper sx={{ mb: 4, borderRadius: '16px', overflow: 'hidden' }}>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          centered={!isMobile}
          variant={isMobile ? "scrollable" : "standard"}
          sx={{ bgcolor: 'background.paper' }}
        >
          <Tab label="All" />
          <Tab label="Open" />
          <Tab label="In Progress" />
          <Tab label="Closed" />
        </Tabs>
      </Paper>

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      ) : (
        <>
          {filteredTickets.length === 0 ? (
            <Typography variant="h6" align="center" sx={{ mt: 4 }}>
              No tickets found. Try adjusting your filters or create a new ticket.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {filteredTickets.map(renderTicketCard)}
            </Grid>
          )}
        </>
      )}

      <Dialog
        open={!!dialogType}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderRadius: '16px',
          }
        }}
      >
        <StyledDialogTitle>
          {dialogType === "add"
            ? "Create New Ticket"
            : dialogType === "edit"
            ? "Edit Ticket"
            : dialogType === "view"
            ? selectedTicket?.title
            : "Confirm Delete"}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </StyledDialogTitle>
        <DialogContent dividers>{dialogContent()}</DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="outlined">Cancel</Button>
          {dialogType === "add" || dialogType === "edit" ? (
            <Button onClick={handleSaveTicket} color="primary" variant="contained">
              {dialogType === "add" ? "Create Ticket" : "Save Changes"}
            </Button>
          ) : dialogType === "delete" ? (
            <Button onClick={handleDeleteTicket} color="error" variant="contained">
              Delete
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>

      <Dialog
        open={noteDialogOpen}
        onClose={() => setNoteDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: '16px',
          }
        }}
      >
        <DialogTitle>Add Note</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Note Content"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialogOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleAddNote} color="primary" variant="contained">
            Add Note
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </PageWrapper>
  );
};

export default Tickets;