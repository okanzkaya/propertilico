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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { styled } from '@mui/system';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/HourglassEmpty';
import OverdueIcon from '@mui/icons-material/Error';

const PageWrapper = styled(Box)({
  padding: '2rem',
  backgroundColor: '#f4f6f8',
  minHeight: '100vh',
});

const TaxCard = styled(Card)({
  padding: '1rem',
  marginBottom: '1rem',
  cursor: 'pointer',
  border: '1px solid #ccc',
  borderRadius: '8px',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(-5px)',
  },
});

const IconWrapper = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '1rem',
});

const taxes = [
  {
    id: 1,
    name: 'Property Tax 2024',
    description: 'Annual property tax for the year 2024.',
    amount: 5000,
    dueDate: '2024-12-31',
    status: 'Pending',
  },
  {
    id: 2,
    name: 'Income Tax 2023',
    description: 'Income tax for the year 2023.',
    amount: 3000,
    dueDate: '2023-04-15',
    status: 'Paid',
  },
  {
    id: 3,
    name: 'Maintenance Tax 2023',
    description: 'Maintenance tax for the year 2023.',
    amount: 2000,
    dueDate: '2023-06-30',
    status: 'Overdue',
  },
];

const Taxes = () => {
  const [selectedTax, setSelectedTax] = useState(null);
  const [addTaxOpen, setAddTaxOpen] = useState(false);
  const [editTax, setEditTax] = useState(null);
  const [deleteTaxId, setDeleteTaxId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleTaxClick = (tax) => setSelectedTax(tax);
  const handleClose = () => { setSelectedTax(null); setAddTaxOpen(false); setEditTax(null); setDeleteTaxId(null); };
  const handleAddTaxOpen = () => setAddTaxOpen(true);
  const handleEditTaxOpen = (tax) => setEditTax(tax);
  const handleDeleteTax = () => { console.log(`Deleting tax record with id: ${deleteTaxId}`); setDeleteTaxId(null); };

  const filteredTaxes = taxes.filter((tax) =>
    tax.name.toLowerCase().includes(searchTerm.toLowerCase()) || tax.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageWrapper>
      <Typography variant="h4" gutterBottom>Taxes</Typography>
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Button variant="contained" color="primary" onClick={handleAddTaxOpen} startIcon={<AddCircleIcon />}>Add New Tax Record</Button>
      </Box>
      <TextField variant="outlined" placeholder="Search Tax Records" fullWidth InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} onChange={(e) => setSearchTerm(e.target.value)} />
      <Grid container spacing={3} mt={2}>
        {filteredTaxes.map((tax) => (
          <Grid item xs={12} key={tax.id}>
            <TaxCard onClick={() => handleTaxClick(tax)}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{tax.name}</Typography>
                <Box>
                  <IconButton onClick={(e) => { e.stopPropagation(); handleEditTaxOpen(tax); }}><EditIcon /></IconButton>
                  <IconButton onClick={(e) => { e.stopPropagation(); setDeleteTaxId(tax.id); }}><DeleteIcon /></IconButton>
                </Box>
              </Box>
              <Typography variant="body2" color="textSecondary">{tax.description}</Typography>
              <Typography variant="body2" color="textSecondary">Amount: ${tax.amount}</Typography>
              <Typography variant="body2" color="textSecondary">Due Date: {tax.dueDate}</Typography>
              <Typography variant="body2" color="textSecondary">Status: {tax.status}</Typography>
              <IconWrapper>
                {tax.status === 'Paid' && <CheckCircleIcon style={{ color: 'green' }} />}
                {tax.status === 'Pending' && <PendingIcon style={{ color: 'orange' }} />}
                {tax.status === 'Overdue' && <OverdueIcon style={{ color: 'red' }} />}
              </IconWrapper>
            </TaxCard>
          </Grid>
        ))}
      </Grid>

      {selectedTax && (
        <Dialog open={!!selectedTax} onClose={handleClose} fullWidth maxWidth="md">
          <DialogTitle>{selectedTax.name}</DialogTitle>
          <DialogContent>
            <Typography variant="h6" gutterBottom>Details</Typography>
            <List>
              <ListItem><ListItemText primary="Description" secondary={selectedTax.description} /></ListItem>
              <ListItem><ListItemText primary="Amount" secondary={`$${selectedTax.amount}`} /></ListItem>
              <ListItem><ListItemText primary="Due Date" secondary={selectedTax.dueDate} /></ListItem>
              <ListItem><ListItemText primary="Status" secondary={selectedTax.status} /></ListItem>
            </List>
          </DialogContent>
          <DialogActions><Button onClick={handleClose} color="primary">Close</Button></DialogActions>
        </Dialog>
      )}

      <Dialog open={addTaxOpen} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Add New Tax Record</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Name" fullWidth variant="outlined" InputProps={{ endAdornment: <Tooltip title="Enter the tax name" placement="top"><InfoIcon /></Tooltip> }} />
          <TextField margin="dense" label="Description" fullWidth variant="outlined" multiline rows={4} InputProps={{ endAdornment: <Tooltip title="Enter a brief description of the tax" placement="top"><InfoIcon /></Tooltip> }} />
          <TextField margin="dense" label="Amount" fullWidth variant="outlined" type="number" InputProps={{ endAdornment: <Tooltip title="Enter the tax amount" placement="top"><AttachMoneyIcon /></Tooltip> }} />
          <TextField margin="dense" label="Due Date" fullWidth variant="outlined" type="date" InputLabelProps={{ shrink: true }} InputProps={{ endAdornment: <Tooltip title="Enter the due date" placement="top"><CalendarTodayIcon /></Tooltip> }} />
          <FormControl fullWidth variant="outlined" margin="dense">
            <InputLabel>Status</InputLabel>
            <Select label="Status">
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Overdue">Overdue</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions><Button onClick={handleClose} color="primary">Cancel</Button><Button onClick={handleClose} color="primary">Add Tax Record</Button></DialogActions>
      </Dialog>

      {editTax && (
        <Dialog open={!!editTax} onClose={handleClose} fullWidth maxWidth="md">
          <DialogTitle>Edit Tax Record</DialogTitle>
          <DialogContent>
            <TextField autoFocus margin="dense" label="Name" fullWidth variant="outlined" defaultValue={editTax.name} InputProps={{ endAdornment: <Tooltip title="Enter the tax name" placement="top"><InfoIcon /></Tooltip> }} />
            <TextField margin="dense" label="Description" fullWidth variant="outlined" multiline rows={4} defaultValue={editTax.description} InputProps={{ endAdornment: <Tooltip title="Enter a brief description of the tax" placement="top"><InfoIcon /></Tooltip> }} />
            <TextField margin="dense" label="Amount" fullWidth variant="outlined" type="number" defaultValue={editTax.amount} InputProps={{ endAdornment: <Tooltip title="Enter the tax amount" placement="top"><AttachMoneyIcon /></Tooltip> }} />
            <TextField margin="dense" label="Due Date" fullWidth variant="outlined" type="date" defaultValue={editTax.dueDate} InputLabelProps={{ shrink: true }} InputProps={{ endAdornment: <Tooltip title="Enter the due date" placement="top"><CalendarTodayIcon /></Tooltip> }} />
            <FormControl fullWidth variant="outlined" margin="dense">
              <InputLabel>Status</InputLabel>
              <Select label="Status" defaultValue={editTax.status}>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Paid">Paid</MenuItem>
                <MenuItem value="Overdue">Overdue</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions><Button onClick={handleClose} color="primary">Cancel</Button><Button onClick={handleClose} color="primary">Save Changes</Button></DialogActions>
        </Dialog>
      )}

      {deleteTaxId && (
        <Dialog open={!!deleteTaxId} onClose={handleClose} fullWidth maxWidth="sm">
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent><Typography>Are you sure you want to delete this tax record? This action cannot be undone.</Typography></DialogContent>
          <DialogActions><Button onClick={handleClose} color="primary">Cancel</Button><Button onClick={handleDeleteTax} color="primary">Delete</Button></DialogActions>
        </Dialog>
      )}
    </PageWrapper>
  );
};

export default Taxes;
