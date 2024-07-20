import React, { useState } from 'react';
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
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  InputAdornment,
} from '@mui/material';
import { styled } from '@mui/system';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';

const PageWrapper = styled(Box)({
  padding: '2rem',
  backgroundColor: '#f4f6f8',
  minHeight: '100vh',
});

const TicketCard = styled(Card)({
  padding: '1rem',
  marginBottom: '1rem',
  cursor: 'pointer',
  border: '1px solid #ccc',
  borderRadius: '8px',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
});

const MessageBox = styled(Box)({
  border: '1px solid #ccc',
  borderRadius: '8px',
  padding: '1rem',
  marginBottom: '1rem',
});

const tickets = [
  {
    id: 1,
    title: 'Leaky Faucet',
    description: 'The kitchen faucet is leaking and needs to be fixed.',
    status: 'Open',
    priority: 'High',
    createdBy: 'John Doe',
    assignee: 'Property Manager',
    createdAt: '2024-07-01',
    messages: [
      { sender: 'John Doe', text: 'Please fix the faucet as soon as possible.' },
      { sender: 'Property Manager', text: 'We will send someone to fix it today.' },
    ],
  },
  {
    id: 2,
    title: 'Broken Window',
    description: 'The window in the living room is broken.',
    status: 'In Progress',
    priority: 'Medium',
    createdBy: 'Jane Smith',
    assignee: 'Property Manager',
    createdAt: '2024-06-25',
    messages: [
      { sender: 'Jane Smith', text: 'The window is broken since last week.' },
      { sender: 'Property Manager', text: 'We are working on it.' },
    ],
  },
  {
    id: 3,
    title: 'Clogged Drain',
    description: 'The drain in the bathroom is clogged.',
    status: 'Closed',
    priority: 'Low',
    createdBy: 'Alice Brown',
    assignee: 'Property Manager',
    createdAt: '2024-06-20',
    messages: [
      { sender: 'Alice Brown', text: 'The bathroom drain is clogged.' },
      { sender: 'Property Manager', text: 'It has been fixed now.' },
    ],
  },
];

const Tickets = () => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [addTicketOpen, setAddTicketOpen] = useState(false);
  const [editTicket, setEditTicket] = useState(null);
  const [deleteTicketId, setDeleteTicketId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const handleTicketClick = (ticket) => setSelectedTicket(ticket);
  const handleClose = () => { setSelectedTicket(null); setAddTicketOpen(false); setEditTicket(null); setDeleteTicketId(null); };
  const handleAddTicketOpen = () => setAddTicketOpen(true);
  const handleEditTicketOpen = (ticket) => setEditTicket(ticket);
  const handleDeleteTicket = () => { console.log(`Deleting ticket with id: ${deleteTicketId}`); setDeleteTicketId(null); };
  const handleSendMessage = () => {
    if (selectedTicket && newMessage.trim()) {
      const updatedMessages = [...selectedTicket.messages, { sender: 'You', text: newMessage.trim() }];
      setSelectedTicket({ ...selectedTicket, messages: updatedMessages });
      setNewMessage('');
    }
  };

  const filteredTickets = tickets.filter((ticket) =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) || ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageWrapper>
      <Typography variant="h4" gutterBottom>Tickets</Typography>
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Button variant="contained" color="primary" onClick={handleAddTicketOpen} startIcon={<AddCircleIcon />}>Create New Ticket</Button>
      </Box>
      <TextField variant="outlined" placeholder="Search Tickets" fullWidth InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} onChange={(e) => setSearchTerm(e.target.value)} />
      <Grid container spacing={3} mt={2}>
        {filteredTickets.map((ticket) => (
          <Grid item xs={12} key={ticket.id}>
            <TicketCard onClick={() => handleTicketClick(ticket)}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{ticket.title}</Typography>
                <Box>
                  <IconButton onClick={(e) => { e.stopPropagation(); handleEditTicketOpen(ticket); }}><EditIcon /></IconButton>
                  <IconButton onClick={(e) => { e.stopPropagation(); setDeleteTicketId(ticket.id); }}><DeleteIcon /></IconButton>
                </Box>
              </Box>
              <Typography variant="body2" color="textSecondary">{ticket.description}</Typography>
              <Typography variant="body2" color="textSecondary">Status: {ticket.status}</Typography>
              <Typography variant="body2" color="textSecondary">Priority: {ticket.priority}</Typography>
              <Typography variant="body2" color="textSecondary">Created By: {ticket.createdBy}</Typography>
              <Typography variant="body2" color="textSecondary">Assignee: {ticket.assignee}</Typography>
              <Typography variant="body2" color="textSecondary">Created At: {ticket.createdAt}</Typography>
            </TicketCard>
          </Grid>
        ))}
      </Grid>

      {selectedTicket && (
        <Dialog open={!!selectedTicket} onClose={handleClose} fullWidth maxWidth="md">
          <DialogTitle>{selectedTicket.title}</DialogTitle>
          <DialogContent>
            <Typography variant="h6" gutterBottom>Details</Typography>
            <List>
              <ListItem><ListItemText primary="Description" secondary={selectedTicket.description} /></ListItem>
              <ListItem><ListItemText primary="Status" secondary={selectedTicket.status} /></ListItem>
              <ListItem><ListItemText primary="Priority" secondary={selectedTicket.priority} /></ListItem>
              <ListItem><ListItemText primary="Created By" secondary={selectedTicket.createdBy} /></ListItem>
              <ListItem><ListItemText primary="Assignee" secondary={selectedTicket.assignee} /></ListItem>
              <ListItem><ListItemText primary="Created At" secondary={selectedTicket.createdAt} /></ListItem>
            </List>

            <Typography variant="h6" gutterBottom>Messages</Typography>
            {selectedTicket.messages.map((message, index) => (
              <MessageBox key={index}>
                <Typography variant="body2"><strong>{message.sender}:</strong> {message.text}</Typography>
              </MessageBox>
            ))}
            <TextField
              variant="outlined"
              label="New Message"
              fullWidth
              multiline
              rows={2}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleSendMessage} color="primary">
                    <SendIcon />
                  </IconButton>
                ),
              }}
            />
          </DialogContent>
          <DialogActions><Button onClick={handleClose} color="primary">Close</Button></DialogActions>
        </Dialog>
      )}

      <Dialog open={addTicketOpen} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Create New Ticket</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Title" fullWidth variant="outlined" InputProps={{ endAdornment: <Tooltip title="Enter the ticket title" placement="top"><InfoIcon /></Tooltip> }} />
          <TextField margin="dense" label="Description" fullWidth variant="outlined" multiline rows={4} InputProps={{ endAdornment: <Tooltip title="Enter a brief description of the ticket" placement="top"><InfoIcon /></Tooltip> }} />
          <FormControl fullWidth variant="outlined" margin="dense">
            <InputLabel>Status</InputLabel>
            <Select label="Status">
              <MenuItem value="Open">Open</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Closed">Closed</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth variant="outlined" margin="dense">
            <InputLabel>Priority</InputLabel>
            <Select label="Priority">
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </Select>
          </FormControl>
          <TextField margin="dense" label="Assignee" fullWidth variant="outlined" InputProps={{ endAdornment: <Tooltip title="Enter the assignee" placement="top"><InfoIcon /></Tooltip> }} />
        </DialogContent>
        <DialogActions><Button onClick={handleClose} color="primary">Cancel</Button><Button onClick={handleClose} color="primary">Create Ticket</Button></DialogActions>
      </Dialog>

      {editTicket && (
        <Dialog open={!!editTicket} onClose={handleClose} fullWidth maxWidth="md">
          <DialogTitle>Edit Ticket</DialogTitle>
          <DialogContent>
            <TextField autoFocus margin="dense" label="Title" fullWidth variant="outlined" defaultValue={editTicket.title} InputProps={{ endAdornment: <Tooltip title="Enter the ticket title" placement="top"><InfoIcon /></Tooltip> }} />
            <TextField margin="dense" label="Description" fullWidth variant="outlined" multiline rows={4} defaultValue={editTicket.description} InputProps={{ endAdornment: <Tooltip title="Enter a brief description of the ticket" placement="top"><InfoIcon /></Tooltip> }} />
            <FormControl fullWidth variant="outlined" margin="dense">
              <InputLabel>Status</InputLabel>
              <Select label="Status" defaultValue={editTicket.status}>
                <MenuItem value="Open">Open</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Closed">Closed</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth variant="outlined" margin="dense">
              <InputLabel>Priority</InputLabel>
              <Select label="Priority" defaultValue={editTicket.priority}>
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </Select>
            </FormControl>
            <TextField margin="dense" label="Assignee" fullWidth variant="outlined" defaultValue={editTicket.assignee} InputProps={{ endAdornment: <Tooltip title="Enter the assignee" placement="top"><InfoIcon /></Tooltip> }} />
          </DialogContent>
          <DialogActions><Button onClick={handleClose} color="primary">Cancel</Button><Button onClick={handleClose} color="primary">Save Changes</Button></DialogActions>
        </Dialog>
      )}

      {deleteTicketId && (
        <Dialog open={!!deleteTicketId} onClose={handleClose} fullWidth maxWidth="sm">
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent><Typography>Are you sure you want to delete this ticket? This action cannot be undone.</Typography></DialogContent>
          <DialogActions><Button onClick={handleClose} color="primary">Cancel</Button><Button onClick={handleDeleteTicket} color="primary">Delete</Button></DialogActions>
        </Dialog>
      )}
    </PageWrapper>
  );
};

export default Tickets;
