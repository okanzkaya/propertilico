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
  MenuItem,
  IconButton,
  Tooltip,
  Avatar,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { styled } from '@mui/system';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import UploadIcon from '@mui/icons-material/Upload';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import RoomIcon from '@mui/icons-material/Room';

const PageWrapper = styled(Box)({
  padding: '2rem',
  backgroundColor: '#f4f6f8',
  minHeight: '100vh',
});

const ContactCard = styled(Card)({
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

const ButtonWrapper = styled(Box)({
  marginBottom: '2rem',
});

const contacts = [
  {
    id: 1,
    name: 'John Doe',
    role: 'Property Manager',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    avatar: 'https://via.placeholder.com/150',
    joinDate: '2020-01-01',
    address: '123 Main St, Cityville, USA',
  },
  {
    id: 2,
    name: 'Jane Smith',
    role: 'Tenant',
    email: 'jane.smith@example.com',
    phone: '987-654-3210',
    avatar: 'https://via.placeholder.com/150',
    joinDate: '2021-05-15',
    address: '456 Elm St, Townsville, USA',
  },
  {
    id: 3,
    name: 'Bob Johnson',
    role: 'Contractor',
    email: 'bob.johnson@example.com',
    phone: '555-666-7777',
    avatar: 'https://via.placeholder.com/150',
    joinDate: '2019-03-20',
    address: '789 Oak St, Villageville, USA',
  },
];

const Contacts = () => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [deleteContactId, setDeleteContactId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newAvatar, setNewAvatar] = useState(null);

  const handleContactClick = (contact) => setSelectedContact(contact);
  const handleClose = () => {
    setSelectedContact(null);
    setAddContactOpen(false);
    setEditContact(null);
    setDeleteContactId(null);
    setNewAvatar(null);
  };
  const handleAddContactOpen = () => setAddContactOpen(true);
  const handleEditContactOpen = (contact) => setEditContact(contact);
  const handleDeleteContact = () => {
    console.log(`Deleting contact with id: ${deleteContactId}`);
    setDeleteContactId(null);
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    setNewAvatar(URL.createObjectURL(file));
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageWrapper>
      <Typography variant="h4" gutterBottom>
        Contacts
      </Typography>
      <ButtonWrapper>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddContactOpen}
          startIcon={<AddCircleIcon />}
        >
          Add New Contact
        </Button>
      </ButtonWrapper>
      <TextField
        variant="outlined"
        placeholder="Search Contacts"
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Grid container spacing={3} mt={2}>
        {filteredContacts.map((contact) => (
          <Grid item xs={12} md={6} key={contact.id}>
            <ContactCard onClick={() => handleContactClick(contact)}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center">
                  <Avatar
                    src={contact.avatar}
                    alt={contact.name}
                    sx={{ width: 56, height: 56, marginRight: '1rem' }}
                  />
                  <Box>
                    <Typography variant="h6">{contact.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {contact.role}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditContactOpen(contact);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteContactId(contact.id);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
              <Box mt={1}>
                <Typography variant="body2" color="textSecondary">
                  <PhoneIcon fontSize="small" /> {contact.phone}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <EmailIcon fontSize="small" /> {contact.email}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <RoomIcon fontSize="small" /> {contact.address}
                </Typography>
              </Box>
            </ContactCard>
          </Grid>
        ))}
      </Grid>

      {selectedContact && (
        <Dialog open={!!selectedContact} onClose={handleClose} fullWidth maxWidth="md">
          <DialogTitle>{selectedContact.name}</DialogTitle>
          <DialogContent>
            <Box display="flex" justifyContent="center" mb={3}>
              <Avatar
                src={selectedContact.avatar}
                alt={selectedContact.name}
                sx={{ width: 150, height: 150 }}
              />
            </Box>
            <Typography variant="h6" gutterBottom>
              Details
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Role" secondary={selectedContact.role} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Email" secondary={selectedContact.email} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Phone" secondary={selectedContact.phone} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Address" secondary={selectedContact.address} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Join Date" secondary={selectedContact.joinDate} />
              </ListItem>
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Dialog open={addContactOpen} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Add New Contact</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Avatar
              src={newAvatar || 'https://via.placeholder.com/150'}
              alt="New Avatar"
              sx={{ width: 150, height: 150, marginBottom: '1rem' }}
            />
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="avatar-upload"
              type="file"
              onChange={handleAvatarChange}
            />
            <label htmlFor="avatar-upload">
              <Button
                variant="contained"
                color="primary"
                component="span"
                startIcon={<UploadIcon />}
                sx={{ marginBottom: '1rem' }}
              >
                Upload Avatar
              </Button>
            </label>
          </Box>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            variant="outlined"
            InputProps={{
              endAdornment: (
                <Tooltip title="Enter the contact's name" placement="top">
                  <InfoIcon />
                </Tooltip>
              ),
            }}
          />
          <TextField
            margin="dense"
            label="Role"
            fullWidth
            variant="outlined"
            select
            InputProps={{
              endAdornment: (
                <Tooltip title="Select the contact's role" placement="top">
                  <InfoIcon />
                </Tooltip>
              ),
            }}
          >
            <MenuItem value="Property Manager">Property Manager</MenuItem>
            <MenuItem value="Tenant">Tenant</MenuItem>
            <MenuItem value="Contractor">Contractor</MenuItem>
            <MenuItem value="Plumber">Plumber</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            label="Email"
            fullWidth
            variant="outlined"
            InputProps={{
              endAdornment: (
                <Tooltip title="Enter the contact's email" placement="top">
                  <InfoIcon />
                </Tooltip>
              ),
            }}
          />
          <TextField
            margin="dense"
            label="Phone"
            fullWidth
            variant="outlined"
            InputProps={{
              endAdornment: (
                <Tooltip title="Enter the contact's phone number" placement="top">
                  <InfoIcon />
                </Tooltip>
              ),
            }}
          />
          <TextField
            margin="dense"
            label="Address"
            fullWidth
            variant="outlined"
            InputProps={{
              endAdornment: (
                <Tooltip title="Enter the contact's address" placement="top">
                  <InfoIcon />
                </Tooltip>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleClose} color="primary">
            Add Contact
          </Button>
        </DialogActions>
      </Dialog>

      {editContact && (
        <Dialog open={!!editContact} onClose={handleClose} fullWidth maxWidth="md">
          <DialogTitle>Edit Contact</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
              <Avatar
                src={newAvatar || editContact.avatar}
                alt={editContact.name}
                sx={{ width: 150, height: 150, marginBottom: '1rem' }}
              />
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="avatar-edit-upload"
                type="file"
                onChange={handleAvatarChange}
              />
              <label htmlFor="avatar-edit-upload">
                <Button
                  variant="contained"
                  color="primary"
                  component="span"
                  startIcon={<UploadIcon />}
                  sx={{ marginBottom: '1rem' }}
                >
                  Change Avatar
                </Button>
              </label>
            </Box>
            <TextField
              autoFocus
              margin="dense"
              label="Name"
              fullWidth
              variant="outlined"
              defaultValue={editContact.name}
              InputProps={{
                endAdornment: (
                  <Tooltip title="Enter the contact's name" placement="top">
                    <InfoIcon />
                  </Tooltip>
                ),
              }}
            />
            <TextField
              margin="dense"
              label="Role"
              fullWidth
              variant="outlined"
              select
              defaultValue={editContact.role}
              InputProps={{
                endAdornment: (
                  <Tooltip title="Select the contact's role" placement="top">
                    <InfoIcon />
                  </Tooltip>
                ),
              }}
            >
              <MenuItem value="Property Manager">Property Manager</MenuItem>
              <MenuItem value="Tenant">Tenant</MenuItem>
              <MenuItem value="Contractor">Contractor</MenuItem>
              <MenuItem value="Plumber">Plumber</MenuItem>
            </TextField>
            <TextField
              margin="dense"
              label="Email"
              fullWidth
              variant="outlined"
              defaultValue={editContact.email}
              InputProps={{
                endAdornment: (
                  <Tooltip title="Enter the contact's email" placement="top">
                    <InfoIcon />
                  </Tooltip>
                ),
              }}
            />
            <TextField
              margin="dense"
              label="Phone"
              fullWidth
              variant="outlined"
              defaultValue={editContact.phone}
              InputProps={{
                endAdornment: (
                  <Tooltip title="Enter the contact's phone number" placement="top">
                    <InfoIcon />
                  </Tooltip>
                ),
              }}
            />
            <TextField
              margin="dense"
              label="Address"
              fullWidth
              variant="outlined"
              defaultValue={editContact.address}
              InputProps={{
                endAdornment: (
                  <Tooltip title="Enter the contact's address" placement="top">
                    <InfoIcon />
                  </Tooltip>
                ),
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={handleClose} color="primary">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {deleteContactId && (
        <Dialog open={!!deleteContactId} onClose={handleClose} fullWidth maxWidth="sm">
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this contact? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDeleteContact} color="primary">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </PageWrapper>
  );
};

export default Contacts;
