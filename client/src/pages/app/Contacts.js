import React, { useState, useMemo, useCallback } from "react";
import {
  Typography, Grid, Box, Card, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, IconButton, Tooltip, Avatar,
  InputAdornment, Pagination, List, ListItem, ListItemText, Link, Snackbar,
  Chip, useMediaQuery, useTheme, Fade
} from "@mui/material";
import {
  AddCircle as AddCircleIcon, Edit as EditIcon, Delete as DeleteIcon,
  Info as InfoIcon, Search as SearchIcon, Upload as UploadIcon,
  ContentCopy as ContentCopyIcon, Phone as PhoneIcon, Email as EmailIcon,
  Room as RoomIcon, WhatsApp as WhatsAppIcon, Telegram as TelegramIcon,
  Call as CallIcon, Map as MapIcon, AccountCircle as AccountCircleIcon,
  MailOutline as MailOutlineIcon, FilterList as FilterListIcon
} from "@mui/icons-material";
import { styled } from "@mui/system";

const PageWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  minHeight: "100vh",
}));

const ContactCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  cursor: "pointer",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: theme.shadows[4],
    transform: "translateY(-3px)",
  },
}));

const CopyButton = ({ text }) => {
  const [open, setOpen] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setOpen(true);
  }, [text]);

  return (
    <>
      <Tooltip title="Copy to clipboard" placement="top">
        <IconButton onClick={handleCopy} size="small">
          <ContentCopyIcon fontSize="small" />
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedContact, setSelectedContact] = useState(null);
  const [dialogState, setDialogState] = useState({
    addContactOpen: false,
    editContact: null,
    deleteContactId: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [newAvatar, setNewAvatar] = useState(null);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("All");
  const contactsPerPage = 9;

  const contacts = useMemo(() => [
    { id: 1, name: "John Doe", role: "Property Manager", email: "john.doe@example.com", phone: "123-456-7890", avatar: "https://i.pravatar.cc/150?img=1", joinDate: "2020-01-01", address: "123 Main St, Cityville, USA", profile: "https://profiles.example.com/johndoe" },
    // ... (other contacts)
  ], []);

  const filteredContacts = useMemo(() => contacts.filter(({ name, role }) => {
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "All" || role === roleFilter;
    return matchesSearch && matchesRole;
  }), [searchTerm, contacts, roleFilter]);

  const paginatedContacts = useMemo(() => {
    const startIndex = (page - 1) * contactsPerPage;
    return filteredContacts.slice(startIndex, startIndex + contactsPerPage);
  }, [filteredContacts, page, contactsPerPage]);

  const handlePageChange = useCallback((_, value) => setPage(value), []);
  const handleClose = useCallback(() => {
    setSelectedContact(null);
    setDialogState({ addContactOpen: false, editContact: null, deleteContactId: null });
    setNewAvatar(null);
  }, []);

  const handleAvatarChange = useCallback((event) => {
    const file = event.target.files[0];
    if (file) setNewAvatar(URL.createObjectURL(file));
  }, []);

  const handleRoleFilterChange = useCallback((event) => {
    setRoleFilter(event.target.value);
    setPage(1);
  }, []);

  return (
    <PageWrapper>
      <Typography variant="h4" gutterBottom>Contacts</Typography>
      <Box mb={3} display="flex" flexDirection={isMobile ? "column" : "row"} justifyContent="space-between" alignItems={isMobile ? "stretch" : "center"}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleIcon />}
          sx={{ mb: isMobile ? 2 : 0, width: isMobile ? "100%" : "auto" }}
          onClick={() => setDialogState({ ...dialogState, addContactOpen: true })}
        >
          Add New Contact
        </Button>
        <Box display="flex" flexDirection={isMobile ? "column" : "row"} alignItems="center" width={isMobile ? "100%" : "auto"}>
          <TextField
            select
            variant="outlined"
            value={roleFilter}
            onChange={handleRoleFilterChange}
            sx={{ width: isMobile ? "100%" : 200, mb: isMobile ? 2 : 0, mr: isMobile ? 0 : 2 }}
            SelectProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterListIcon />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="All">All Roles</MenuItem>
            <MenuItem value="Property Manager">Property Manager</MenuItem>
            <MenuItem value="Tenant">Tenant</MenuItem>
            <MenuItem value="Contractor">Contractor</MenuItem>
            <MenuItem value="Plumber">Plumber</MenuItem>
          </TextField>
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
        </Box>
      </Box>
      <Grid container spacing={3}>
        {paginatedContacts.map((contact) => (
          <Grid item xs={12} sm={6} md={4} key={contact.id}>
            <Fade in={true} timeout={500}>
              <ContactCard onClick={() => setSelectedContact(contact)}>
                <Box p={2} display="flex" flexDirection="column" height="100%">
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Avatar src={contact.avatar} alt={contact.name} sx={{ width: 56, height: 56 }} />
                    <Box>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDialogState({ ...dialogState, editContact: contact }); }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDialogState({ ...dialogState, deleteContactId: contact.id }); }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography variant="h6" noWrap>{contact.name}</Typography>
                  <Typography variant="body2" color="textSecondary" noWrap>{contact.role}</Typography>
                  <Box mt={1} mb={2} display="flex" flexWrap="wrap">
                    <Chip icon={<PhoneIcon fontSize="small" />} label={contact.phone} size="small" sx={{ mr: 1, mb: 1 }} />
                    <Chip icon={<EmailIcon fontSize="small" />} label={contact.email} size="small" sx={{ mb: 1 }} />
                  </Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: "auto" }}>
                    <RoomIcon fontSize="small" /> {contact.address}
                  </Typography>
                </Box>
              </ContactCard>
            </Fade>
          </Grid>
        ))}
      </Grid>

      {filteredContacts.length > contactsPerPage && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={Math.ceil(filteredContacts.length / contactsPerPage)}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size={isMobile ? "small" : "medium"}
          />
        </Box>
      )}

      {/* Selected Contact Dialog */}
      <Dialog
        open={!!selectedContact}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2, boxShadow: 24 } }}
      >
        <DialogTitle>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            {selectedContact?.name}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Avatar
              src={selectedContact?.avatar}
              alt={selectedContact?.name}
              sx={{ width: 150, height: 150, mb: 2, boxShadow: 3 }}
            />
            <Chip label={selectedContact?.role} color="primary" sx={{ fontWeight: 'bold' }} />
          </Box>
          <List>
            {selectedContact && [
              { label: "Email", value: selectedContact.email, icon: EmailIcon, link: `mailto:${selectedContact.email}` },
              { label: "Phone", value: selectedContact.phone, icon: PhoneIcon,
                links: [
                  { icon: WhatsAppIcon, link: `https://wa.me/${selectedContact.phone.replace(/[-\s]/g, '')}`, tooltip: "WhatsApp" },
                  { icon: TelegramIcon, link: `https://t.me/${selectedContact.phone.replace(/[-\s]/g, '')}`, tooltip: "Telegram" },
                  { icon: CallIcon, link: `tel:${selectedContact.phone}`, tooltip: "Call" }
                ]
              },
              { label: "Address", value: selectedContact.address, icon: RoomIcon, link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedContact.address)}` },
              { label: "Join Date", value: selectedContact.joinDate, icon: InfoIcon },
              { label: "Profile", value: selectedContact.profile, icon: AccountCircleIcon, link: selectedContact.profile }
            ].map(({ label, value, icon: Icon, link, links }, idx) => (
              value && (
                <ListItem key={idx} sx={{ py: 2, flexDirection: 'column', alignItems: 'flex-start' }}>
                  <ListItemText
                    primary={label}
                    secondary={
                      <Box display="flex" alignItems="center" mt={0.5}>
                        <Icon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                        {value}
                      </Box>
                    }
                    primaryTypographyProps={{ variant: "subtitle1", color: "textSecondary", sx: { fontWeight: 'bold' } }}
                    secondaryTypographyProps={{ variant: "body2", sx: { wordBreak: 'break-word' } }}
                  />
                  <Box mt={1}>
                    {link && (
                      <Tooltip title={`Open ${label.toLowerCase()}`} placement="top">
                        <IconButton component={Link} href={link} target="_blank" rel="noopener noreferrer" size="small">
                          {label === "Email" ? <MailOutlineIcon /> : label === "Address" ? <MapIcon /> : <AccountCircleIcon />}
                        </IconButton>
                      </Tooltip>
                    )}
                    {links && links.map(({ icon: LinkIcon, link, tooltip }, linkIdx) => (
                      <Tooltip key={linkIdx} title={tooltip} placement="top">
                        <IconButton component={Link} href={link} target="_blank" rel="noopener noreferrer" size="small">
                          <LinkIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ))}
                    <CopyButton text={value} />
                  </Box>
                </ListItem>
              )
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Contact Dialog */}
      <Dialog open={dialogState.addContactOpen || !!dialogState.editContact} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{dialogState.editContact ? "Edit Contact" : "Add New Contact"}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Avatar
              src={newAvatar || (dialogState.editContact && dialogState.editContact.avatar) || "https://via.placeholder.com/150"}
              alt={(dialogState.editContact && dialogState.editContact.name) || "New Avatar"}
              sx={{ width: 150, height: 150, mb: 2 }}
            />
            <input
              accept="image/*"
              style={{ display: "none" }}
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
              >
                Upload Avatar
              </Button>
            </label>
          </Box>
          {[
            { name: "name", label: "Name" },
            { name: "role", label: "Role", select: true, options: ["Property Manager", "Tenant", "Contractor", "Plumber"] },
            { name: "email", label: "Email" },
            { name: "phone", label: "Phone" },
            { name: "address", label: "Address" },
            { name: "profile", label: "Profile Link" }
          ].map(({ name, label, select, options }) => (
            <TextField
              key={name}
              fullWidth
              margin="normal"
              name={name}
              label={label}
              variant="outlined"
              select={select}
              defaultValue={dialogState.editContact && dialogState.editContact[name]}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={`Enter the contact's ${label.toLowerCase()}`}>
                      <InfoIcon color="action" />
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            >
              {select && options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Cancel</Button>
          <Button onClick={handleClose} color="primary">
            {dialogState.editContact ? "Save Changes" : "Add Contact"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Contact Confirmation Dialog */}
      <Dialog
        open={!!dialogState.deleteContactId}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this contact? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              console.log(`Deleting contact with id: ${dialogState.deleteContactId}`);
              handleClose();
            }}
            color="error"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </PageWrapper>
  );
};

export default Contacts;