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
  MenuItem,
  IconButton,
  Tooltip,
  Avatar,
  InputAdornment,
  Pagination,
  List,
  ListItem,
  ListItemText,
  Link,
  Snackbar,
} from "@mui/material";
import {
  AddCircle as AddCircleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  Upload as UploadIcon,
  ContentCopy as ContentCopyIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Room as RoomIcon,
  WhatsApp as WhatsAppIcon,
  Telegram as TelegramIcon,
  Call as CallIcon,
  Map as MapIcon,
  AccountCircle as AccountCircleIcon,
  MailOutline as MailOutlineIcon,
} from "@mui/icons-material";
import { styled } from "@mui/system";

const PageWrapper = styled(Box)(({ theme }) => ({
  padding: "2rem",
  backgroundColor: theme.palette.background.default,
  minHeight: "100vh",
}));

const ContactCard = styled(Card)(({ theme }) => ({
  padding: "1rem",
  marginBottom: "1rem",
  cursor: "pointer",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "8px",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: theme.shadows[4],
    transform: "translateY(-3px)",
  },
}));

const CopyButton = ({ text }) => {
  const [open, setOpen] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setOpen(true);
  };
  return (
    <>
      <Tooltip title="Copy to clipboard" placement="top">
        <IconButton onClick={handleCopy}>
          <ContentCopyIcon />
        </IconButton>
      </Tooltip>
      <Snackbar
        open={open}
        onClose={() => setOpen(false)}
        autoHideDuration={2000}
        message="Copied!"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
};

const Contacts = () => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [dialogState, setDialogState] = useState({
    addContactOpen: false,
    editContact: null,
    deleteContactId: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [newAvatar, setNewAvatar] = useState(null);
  const [page, setPage] = useState(1);
  const contactsPerPage = 9;

  const contacts = useMemo(
    () => [
      { id: 1, name: "John Doe", role: "Property Manager", email: "john.doe@example.com", phone: "123-456-7890", avatar: "https://via.placeholder.com/150", joinDate: "2020-01-01", address: "123 Main St, Cityville, USA", profile: "https://profiles.example.com/johndoe" },
      { id: 2, name: "Jane Smith", role: "Tenant", email: "jane.smith@example.com", phone: "987-654-3210", avatar: "https://via.placeholder.com/150", joinDate: "2021-05-15", address: "456 Elm St, Townsville, USA" },
      { id: 3, name: "Bob Johnson", role: "Contractor", email: "bob.johnson@example.com", phone: "555-666-7777", avatar: "https://via.placeholder.com/150", joinDate: "2019-03-20", address: "789 Oak St, Villageville, USA" },
      { id: 4, name: "Alice Brown", role: "Tenant", email: "alice.brown@example.com", phone: "333-222-1111", avatar: "https://via.placeholder.com/150", joinDate: "2022-08-11", address: "789 Maple St, Smalltown, USA" },
      { id: 5, name: "Charlie Davis", role: "Contractor", email: "charlie.davis@example.com", phone: "444-555-6666", avatar: "https://via.placeholder.com/150", joinDate: "2018-07-21", address: "678 Pine St, Bigcity, USA" },
      { id: 6, name: "Dana Evans", role: "Property Manager", email: "dana.evans@example.com", phone: "123-654-9870", avatar: "https://via.placeholder.com/150", joinDate: "2020-02-17", address: "123 Birch St, Lakeview, USA" },
      { id: 7, name: "Eli Foster", role: "Tenant", email: "eli.foster@example.com", phone: "789-123-4560", avatar: "https://via.placeholder.com/150", joinDate: "2019-11-22", address: "456 Oakwood St, Seaview, USA" },
      { id: 8, name: "Fiona Green", role: "Plumber", email: "fiona.green@example.com", phone: "111-222-3333", avatar: "https://via.placeholder.com/150", joinDate: "2021-09-10", address: "987 Elm St, Hillside, USA" },
      { id: 9, name: "George Harris", role: "Property Manager", email: "george.harris@example.com", phone: "555-444-3333", avatar: "https://via.placeholder.com/150", joinDate: "2017-05-03", address: "321 Cedar St, Forestview, USA" },
      { id: 10, name: "Henry Adams", role: "Tenant", email: "henry.adams@example.com", phone: "888-999-7777", avatar: "https://via.placeholder.com/150", joinDate: "2023-01-12", address: "654 Spruce St, Westview, USA" },
    ],
    []
  );

  const filteredContacts = useMemo(() => contacts.filter(({ name, role }) => name.toLowerCase().includes(searchTerm.toLowerCase()) || role.toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm, contacts]);

  const paginatedContacts = useMemo(() => {
    const startIndex = (page - 1) * contactsPerPage;
    return filteredContacts.slice(startIndex, startIndex + contactsPerPage);
  }, [filteredContacts, page, contactsPerPage]);

  const handlePageChange = (_, value) => setPage(value);
  const handleClose = () => {
    setSelectedContact(null);
    setDialogState({ addContactOpen: false, editContact: null, deleteContactId: null });
    setNewAvatar(null);
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) setNewAvatar(URL.createObjectURL(file));
  };

  return (
    <PageWrapper>
      <Typography variant="h4" gutterBottom>
        Contacts
      </Typography>
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Button variant="contained" color="primary" startIcon={<AddCircleIcon />} sx={{ maxWidth: "200px", mr: 2 }} onClick={() => setDialogState({ ...dialogState, addContactOpen: true })}>
          Add New Contact
        </Button>
        <TextField
          variant="outlined"
          placeholder="Search Contacts"
          sx={{ maxWidth: "300px", flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>
      <Grid container spacing={3}>
        {paginatedContacts.map((contact) => (
          <Grid item xs={12} sm={6} md={4} key={contact.id}>
            <ContactCard onClick={() => setSelectedContact(contact)}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" flex="1">
                  <Avatar src={contact.avatar} alt={contact.name} sx={{ width: 56, height: 56, marginRight: "1rem" }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h6" noWrap>
                      {contact.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" noWrap>
                      {contact.role}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ flexShrink: 0, ml: 1 }}>
                  <IconButton onClick={(e) => { e.stopPropagation(); setDialogState({ ...dialogState, editContact: contact }); }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={(e) => { e.stopPropagation(); setDialogState({ ...dialogState, deleteContactId: contact.id }); }}>
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

      {filteredContacts.length > contactsPerPage && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination count={Math.ceil(filteredContacts.length / contactsPerPage)} page={page} onChange={handlePageChange} color="primary" />
        </Box>
      )}

      {/* Selected Contact Dialog */}
      {selectedContact && (
        <Dialog open={!!selectedContact} onClose={handleClose} fullWidth maxWidth="md">
          <DialogTitle>{selectedContact.name}</DialogTitle>
          <DialogContent>
            <Box display="flex" justifyContent="center" mb={3}>
              <Avatar src={selectedContact.avatar} alt={selectedContact.name} sx={{ width: 150, height: 150 }} />
            </Box>
            <List>
              {[
                { label: "Role", value: selectedContact.role },
                { label: "Email", value: selectedContact.email, link: `mailto:${selectedContact.email}` },
                { label: "Phone", value: selectedContact.phone, links: [
                    { icon: WhatsAppIcon, link: `https://wa.me/${selectedContact.phone.replace(/[-\s]/g, '')}`, tooltip: "Send WhatsApp Message" },
                    { icon: TelegramIcon, link: `https://t.me/${selectedContact.phone.replace(/[-\s]/g, '')}`, tooltip: "Send Telegram Message" },
                    { icon: CallIcon, link: `tel:${selectedContact.phone}`, tooltip: "Dial Phone Number" }
                  ] 
                },
                { label: "Address", value: selectedContact.address, link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedContact.address)}` },
                { label: "Join Date", value: selectedContact.joinDate },
                { label: "Profile", value: selectedContact.profile, link: selectedContact.profile }
              ].map(({ label, value, link, links }, idx) => (
                value && (
                  <ListItem key={idx}>
                    <ListItemText primary={label} secondary={value} />
                    {link && (
                      <Tooltip title={`Open ${label.toLowerCase()}`} placement="top">
                        <IconButton component={Link} href={link} target="_blank">
                          {label === "Email" ? <MailOutlineIcon /> : label === "Address" ? <MapIcon /> : <AccountCircleIcon />}
                        </IconButton>
                      </Tooltip>
                    )}
                    {links && links.map(({ icon: Icon, link, tooltip }, idx) => (
                      <Tooltip key={idx} title={tooltip} placement="top">
                        <IconButton component={Link} href={link} target="_blank">
                          <Icon />
                        </IconButton>
                      </Tooltip>
                    ))}
                    <CopyButton text={value} />
                  </ListItem>
                )
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">Close</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Add/Edit Contact Dialog */}
      <Dialog open={dialogState.addContactOpen || !!dialogState.editContact} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>{dialogState.editContact ? "Edit Contact" : "Add New Contact"}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Avatar src={newAvatar || dialogState.editContact?.avatar || "https://via.placeholder.com/150"} alt={dialogState.editContact?.name || "New Avatar"} sx={{ width: 150, height: 150, marginBottom: "1rem" }} />
            <input accept="image/*" style={{ display: "none" }} id="avatar-upload" type="file" onChange={handleAvatarChange} />
            <label htmlFor="avatar-upload">
              <Button variant="contained" color="primary" component="span" startIcon={<UploadIcon />} sx={{ marginBottom: "1rem" }}>Upload Avatar</Button>
            </label>
          </Box>
          {["Name", "Role", "Email", "Phone", "Address", "Profile Link"].map((label, idx) => (
            <TextField
              key={idx}
              margin="dense"
              label={label}
              fullWidth
              variant="outlined"
              select={label === "Role"}
              InputProps={{
                endAdornment: (
                  <Tooltip title={`Enter the contact's ${label.toLowerCase()}`} placement="top">
                    <InfoIcon />
                  </Tooltip>
                ),
              }}
              defaultValue={dialogState.editContact && dialogState.editContact[label.toLowerCase().replace(" ", "")]}
            >
              {label === "Role" && ["Property Manager", "Tenant", "Contractor", "Plumber"].map(role => <MenuItem key={role} value={role}>{role}</MenuItem>)}
            </TextField>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Cancel</Button>
          <Button onClick={handleClose} color="primary">{dialogState.editContact ? "Save Changes" : "Add Contact"}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Contact Confirmation */}
      {dialogState.deleteContactId && (
        <Dialog open={!!dialogState.deleteContactId} onClose={handleClose} fullWidth maxWidth="sm">
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this contact? This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">Cancel</Button>
            <Button onClick={() => console.log(`Deleting contact with id: ${dialogState.deleteContactId}`)} color="primary">Delete</Button>
          </DialogActions>
        </Dialog>
      )}
    </PageWrapper>
  );
};

export default Contacts;
