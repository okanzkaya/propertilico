import React, { useState, useMemo } from "react";
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
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputAdornment,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  AddCircle as AddCircleIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Sort as SortIcon,
  NoteAdd as NoteAddIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { styled, useTheme } from "@mui/system";

const PageWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.default,
  minHeight: "100vh",
}));

const TicketCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  cursor: "pointer",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: theme.shadows[4],
    transform: "translateY(-3px)",
  },
  [theme.breakpoints.up("md")]: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
    "& .MuiTypography-h6": {
      fontSize: "1rem",
    },
    "& .MuiTypography-body2": {
      fontSize: "0.875rem",
    },
  },
}));

const ControlsWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  marginBottom: theme.spacing(3),
  gap: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
}));

const ButtonWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  width: "100%",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "stretch",
  },
}));

const Tickets = () => {
  const theme = useTheme();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [dialogType, setDialogType] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("priority");

  const ticketsData = useMemo(
    () => [
      {
        id: 1,
        title: "Leaky Faucet",
        description: "The kitchen faucet is leaking and needs to be fixed.",
        status: "Open",
        priority: "High",
        createdBy: "John Doe",
        assignee: "Property Manager",
        createdAt: "2024-07-01",
        notes: [
          {
            title: "Initial Note",
            content: "Tenant reported the leak on 1st July. Scheduled repair for 3rd July.",
            date: "2024-07-01",
          },
        ],
      },
      {
        id: 2,
        title: "Broken Window",
        description: "The window in the living room is broken.",
        status: "In Progress",
        priority: "Medium",
        createdBy: "Jane Smith",
        assignee: "Property Manager",
        createdAt: "2024-06-25",
        notes: [
          {
            title: "Assessment",
            content: "Window needs replacement, contacted contractor for a quote.",
            date: "2024-06-26",
          },
        ],
      },
      {
        id: 3,
        title: "Clogged Drain",
        description: "The drain in the bathroom is clogged.",
        status: "Closed",
        priority: "Low",
        createdBy: "Alice Brown",
        assignee: "Property Manager",
        createdAt: "2024-06-20",
        notes: [
          {
            title: "Resolved",
            content: "Drain was unclogged, and tenant confirmed no further issues.",
            date: "2024-06-22",
          },
        ],
      },
    ],
    []
  );

  const filteredTickets = useMemo(() => {
    return ticketsData
      .filter(({ title, description }) =>
        [title, description].some((field) =>
          field.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
      .sort((a, b) => {
        switch (sortOrder) {
          case "priority":
            return a.priority.localeCompare(b.priority);
          case "dateAsc":
            return new Date(a.createdAt) - new Date(b.createdAt);
          case "dateDesc":
            return new Date(b.createdAt) - new Date(a.createdAt);
          case "status":
            return a.status.localeCompare(b.status);
          default:
            return 0;
        }
      });
  }, [searchTerm, sortOrder, ticketsData]);

  const handleOpenDialog = (type, ticket = null) => {
    setSelectedTicket(ticket);
    setFormValues(ticket || {});
    setDialogType(type);
  };

  const handleCloseDialog = () => {
    setSelectedTicket(null);
    setFormValues({});
    setDialogType(null);
  };

  const handleInputChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveNote = () => {
    const updatedTicket = {
      ...selectedTicket,
      notes: [
        ...selectedTicket.notes,
        {
          title: formValues.newNoteTitle.trim(),
          content: formValues.newNoteContent.trim(),
          date: new Date().toISOString().split("T")[0],
        },
      ],
    };
    setSelectedTicket(updatedTicket);
    setFormValues({});
  };

  const handleSaveStatus = () => {
    const updatedTicket = {
      ...selectedTicket,
      status: formValues.status,
    };
    setSelectedTicket(updatedTicket);
    console.log(`Status for ticket ${selectedTicket.id} saved as ${selectedTicket.status}`);
  };

  const dialogContent = () => {
    switch (dialogType) {
      case "view":
        return (
          <>
            <Typography variant="h6">Details</Typography>
            <List>
              <ListItem>
                <ListItemText primary="Description" secondary={selectedTicket.description} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Status" secondary={selectedTicket.status} />
                <FormControl fullWidth variant="outlined" margin="dense">
                  <Select
                    value={formValues.status || selectedTicket.status}
                    onChange={(e) => handleInputChange("status", e.target.value)}
                  >
                    <MenuItem value="Open">Open</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Closed">Closed</MenuItem>
                  </Select>
                </FormControl>
                <Box display="flex" justifyContent="flex-end" mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveStatus}
                  >
                    Save
                  </Button>
                </Box>
              </ListItem>
              <ListItem>
                <ListItemText primary="Priority" secondary={selectedTicket.priority} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Created By" secondary={selectedTicket.createdBy} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Assignee" secondary={selectedTicket.assignee} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Created At" secondary={selectedTicket.createdAt} />
              </ListItem>
            </List>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Notes</Typography>
            {selectedTicket.notes.map((note, index) => (
              <Box
                key={index}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: theme.shape.borderRadius,
                  padding: theme.spacing(1),
                  marginBottom: theme.spacing(2),
                  backgroundColor: theme.palette.background.paper,
                }}
              >
                <Typography variant="subtitle1">{note.title}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {note.date}
                </Typography>
                <Typography variant="body2" mt={1}>
                  {note.content}
                </Typography>
              </Box>
            ))}
            <TextField
              variant="outlined"
              label="Note Title"
              fullWidth
              value={formValues.newNoteTitle || ""}
              onChange={(e) => handleInputChange("newNoteTitle", e.target.value)}
              sx={{ marginTop: 2 }}
            />
            <TextField
              variant="outlined"
              label="Note Content"
              fullWidth
              multiline
              rows={3}
              value={formValues.newNoteContent || ""}
              onChange={(e) => handleInputChange("newNoteContent", e.target.value)}
              sx={{ marginTop: 2 }}
            />
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<NoteAddIcon />}
                onClick={handleSaveNote}
              >
                Add Note
              </Button>
            </Box>
          </>
        );
      case "add":
        return (
          <>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              fullWidth
              variant="outlined"
              value={formValues.title || ""}
              onChange={(e) => handleInputChange("title", e.target.value)}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              variant="outlined"
              multiline
              rows={4}
              value={formValues.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
            <FormControl fullWidth variant="outlined" margin="dense">
              <Select
                value={formValues.status || "Open"}
                onChange={(e) => handleInputChange("status", e.target.value)}
              >
                <MenuItem value="Open">Open</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Closed">Closed</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth variant="outlined" margin="dense">
              <Select
                value={formValues.priority || "Low"}
                onChange={(e) => handleInputChange("priority", e.target.value)}
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label="Assignee"
              fullWidth
              variant="outlined"
              value={formValues.assignee || ""}
              onChange={(e) => handleInputChange("assignee", e.target.value)}
            />
          </>
        );
      case "edit":
        return dialogContent();
      case "delete":
        return <Typography>Are you sure you want to delete this ticket? This action cannot be undone.</Typography>;
      default:
        return null;
    }
  };

  return (
    <PageWrapper>
      <Typography variant="h4" gutterBottom>
        Tickets
      </Typography>
      <ControlsWrapper>
        <ButtonWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenDialog("add")}
            startIcon={<AddCircleIcon />}
            sx={{ padding: "8px 16px" }}
          >
            Create New Ticket
          </Button>
          <FormControl variant="outlined" sx={{ minWidth: 120 }}>
            <Select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
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
            </Select>
          </FormControl>
          <TextField
            variant="outlined"
            placeholder="Search Tickets"
            sx={{ maxWidth: "300px", marginLeft: "auto" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </ButtonWrapper>
      </ControlsWrapper>
      <Grid container spacing={3}>
        {filteredTickets.map((ticket) => (
          <Grid item xs={12} sm={6} md={4} key={ticket.id}>
            <TicketCard onClick={() => handleOpenDialog("view", ticket)}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{ticket.title}</Typography>
                <Box>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDialog("edit", ticket);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDialog("delete", ticket);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
              <Typography variant="body2" color="textSecondary">
                {ticket.description}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Status: {ticket.status}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Priority: {ticket.priority}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Created By: {ticket.createdBy}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Assignee: {ticket.assignee}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Created At: {ticket.createdAt}
              </Typography>
            </TicketCard>
          </Grid>
        ))}
      </Grid>

      <Dialog open={!!dialogType} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>{dialogType === "add" ? "Create New Ticket" : dialogType === "edit" ? "Edit Ticket" : dialogType === "view" ? selectedTicket?.title : "Confirm Delete"}</DialogTitle>
        <DialogContent>{dialogContent()}</DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          {dialogType === "add" || dialogType === "edit" ? (
            <Button onClick={handleCloseDialog} color="primary">
              {dialogType === "add" ? "Create Ticket" : "Save Changes"}
            </Button>
          ) : dialogType === "delete" ? (
            <Button onClick={() => console.log(`Deleting ticket with id: ${selectedTicket.id}`)} color="primary">
              Delete
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>
    </PageWrapper>
  );
};

export default Tickets;
