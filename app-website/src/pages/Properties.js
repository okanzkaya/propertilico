import React, { useState } from 'react';
import { Typography, Grid, Box, Card, Button, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, TextField, MenuItem, IconButton, Tooltip, Avatar, List, ListItem, ListItemText, InputAdornment, Select, FormControl, InputLabel } from '@mui/material';
import { styled } from '@mui/system';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ImageIcon from '@mui/icons-material/Image';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import moment from 'moment';

const PageWrapper = styled(Box)({
  padding: '2rem',
  backgroundColor: '#f4f6f8',
  minHeight: '100vh',
});

const PropertyCard = styled(Card)({
  padding: '1rem',
  marginBottom: '1rem',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  border: '1px solid #ccc',
  borderRadius: '8px',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
});

const ImageGrid = styled(Grid)({
  marginTop: '0.5rem',
});

const properties = [
  {
    id: 1,
    name: 'Sunset Villa',
    description: 'A beautiful villa with a sunset view.',
    establishmentDate: '2015-06-15',
    contractStartDate: '2022-01-01',
    contractEndDate: '2023-01-01',
    renter: { name: 'John Doe', contact: 'john.doe@example.com', phone: '123-456-7890' },
    location: [51.505, -0.09],
    images: ['https://via.placeholder.com/150', 'https://via.placeholder.com/150', 'https://via.placeholder.com/150'],
    propertyType: 'Villa',
    rentAmount: 2500,
    additionalInfo: {
      area: '2000 sqft',
      bedrooms: 3,
      bathrooms: 2,
      furnished: true,
      parking: 'Available',
    },
  },
  {
    id: 2,
    name: 'Mountain Retreat',
    description: 'A cozy retreat in the mountains.',
    establishmentDate: '2010-09-12',
    contractStartDate: '2021-05-15',
    contractEndDate: '2022-05-15',
    renter: { name: 'Jane Smith', contact: 'jane.smith@example.com', phone: '987-654-3210' },
    location: [51.515, -0.1],
    images: ['https://via.placeholder.com/150', 'https://via.placeholder.com/150', 'https://via.placeholder.com/150'],
    propertyType: 'Retreat',
    rentAmount: 1500,
    additionalInfo: {
      area: '1500 sqft',
      bedrooms: 2,
      bathrooms: 1,
      furnished: false,
      parking: 'Not Available',
    },
  },
  {
    id: 3,
    name: 'City Apartment',
    description: 'A modern apartment in the city center.',
    establishmentDate: '2018-01-20',
    contractStartDate: '2022-03-01',
    contractEndDate: '2023-03-01',
    renter: { name: 'Alice Brown', contact: 'alice.brown@example.com', phone: '555-666-7777' },
    location: [51.525, -0.11],
    images: ['https://via.placeholder.com/150', 'https://via.placeholder.com/150', 'https://via.placeholder.com/150'],
    propertyType: 'Apartment',
    rentAmount: 2000,
    additionalInfo: {
      area: '1000 sqft',
      bedrooms: 1,
      bathrooms: 1,
      furnished: true,
      parking: 'Available',
    },
  },
];

const Properties = () => {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [addPropertyOpen, setAddPropertyOpen] = useState(false);
  const [editProperty, setEditProperty] = useState(null);
  const [deletePropertyId, setDeletePropertyId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');

  const handlePropertyClick = (property) => setSelectedProperty(property);
  const handleClose = () => { setSelectedProperty(null); setAddPropertyOpen(false); setEditProperty(null); setDeletePropertyId(null); };
  const handleAddPropertyOpen = () => setAddPropertyOpen(true);
  const handleEditPropertyOpen = (property) => setEditProperty(property);
  const handleDeleteProperty = () => { console.log(`Deleting property with id: ${deletePropertyId}`); setDeletePropertyId(null); };
  const calculatePropertyAge = (establishmentDate) => moment().diff(moment(establishmentDate), 'years');
  const filteredProperties = properties.filter((property) =>
    property.name.toLowerCase().includes(searchTerm.toLowerCase()) || property.description.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter((property) =>
    selectedFilter ? property.propertyType === selectedFilter : true
  );

  return (
    <PageWrapper>
      <Typography variant="h4" gutterBottom>Properties</Typography>
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Button variant="contained" color="primary" onClick={handleAddPropertyOpen} startIcon={<AddCircleIcon />}>Add New Property</Button>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)} label="Filter by Type">
            <MenuItem value=""><em>None</em></MenuItem>
            <MenuItem value="Villa">Villa</MenuItem>
            <MenuItem value="Retreat">Retreat</MenuItem>
            <MenuItem value="Apartment">Apartment</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <TextField variant="outlined" placeholder="Search Properties" fullWidth InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} onChange={(e) => setSearchTerm(e.target.value)} />
      <Grid container spacing={3} mt={2}>
        {filteredProperties.map((property) => (
          <Grid item xs={12} md={6} key={property.id}>
            <PropertyCard onClick={() => handlePropertyClick(property)}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{property.name}</Typography>
                <Box>
                  <IconButton onClick={(e) => { e.stopPropagation(); handleEditPropertyOpen(property); }}><EditIcon /></IconButton>
                  <IconButton onClick={(e) => { e.stopPropagation(); setDeletePropertyId(property.id); }}><DeleteIcon /></IconButton>
                </Box>
              </Box>
              <Typography variant="body2" color="textSecondary">{property.description}</Typography>
              <Typography variant="body2" color="textSecondary">Type: {property.propertyType}</Typography>
              <Typography variant="body2" color="textSecondary">Age: {calculatePropertyAge(property.establishmentDate)} years</Typography>
              <Typography variant="body2" color="textSecondary">Rent: ${property.rentAmount}</Typography>
              <ImageGrid container spacing={1}>
                {property.images.slice(0, 3).map((image, index) => (
                  <Grid item xs={4} key={index}>
                    <Avatar src={image} alt={`Image ${index + 1}`} variant="square" sx={{ width: '100%', height: 'auto', borderRadius: '4px' }} />
                  </Grid>
                ))}
              </ImageGrid>
              <MapContainer center={property.location} zoom={13} scrollWheelZoom style={{ height: '200px', width: '100%', marginTop: '1rem', borderRadius: '8px' }} attributionControl={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={property.location} icon={new L.Icon({ iconUrl: require('leaflet/dist/images/marker-icon.png'), iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'), shadowUrl: require('leaflet/dist/images/marker-shadow.png'), iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] })}><Popup>{property.name}</Popup></Marker>
              </MapContainer>
            </PropertyCard>
          </Grid>
        ))}
      </Grid>

      {selectedProperty && (
        <Dialog open={!!selectedProperty} onClose={handleClose} fullWidth maxWidth="md">
          <DialogTitle>{selectedProperty.name}</DialogTitle>
          <DialogContent>
            <Typography variant="h6" gutterBottom>Details</Typography>
            <List>
              <ListItem><ListItemText primary="Description" secondary={selectedProperty.description} /></ListItem>
              <ListItem><ListItemText primary="Establishment Date" secondary={moment(selectedProperty.establishmentDate).format('LL')} /></ListItem>
              <ListItem><ListItemText primary="Contract Start Date" secondary={moment(selectedProperty.contractStartDate).format('LL')} /></ListItem>
              <ListItem><ListItemText primary="Contract End Date" secondary={moment(selectedProperty.contractEndDate).format('LL')} /></ListItem>
              <ListItem><ListItemText primary="Renter Information" secondary={<><Typography>Name: {selectedProperty.renter.name}</Typography><Typography>Email: {selectedProperty.renter.contact}</Typography><Typography>Phone: {selectedProperty.renter.phone}</Typography></>} /></ListItem>
              <ListItem><ListItemText primary="Area" secondary={selectedProperty.additionalInfo.area} /></ListItem>
              <ListItem><ListItemText primary="Bedrooms" secondary={selectedProperty.additionalInfo.bedrooms} /></ListItem>
              <ListItem><ListItemText primary="Bathrooms" secondary={selectedProperty.additionalInfo.bathrooms} /></ListItem>
              <ListItem><ListItemText primary="Furnished" secondary={selectedProperty.additionalInfo.furnished ? 'Yes' : 'No'} /></ListItem>
              <ListItem><ListItemText primary="Parking" secondary={selectedProperty.additionalInfo.parking} /></ListItem>
            </List>
            <Typography variant="h6" gutterBottom>Location</Typography>
            <MapContainer center={selectedProperty.location} zoom={13} scrollWheelZoom style={{ height: '300px', width: '100%', borderRadius: '8px' }} attributionControl={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={selectedProperty.location} icon={new L.Icon({ iconUrl: require('leaflet/dist/images/marker-icon.png'), iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'), shadowUrl: require('leaflet/dist/images/marker-shadow.png'), iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] })}><Popup>{selectedProperty.name}</Popup></Marker>
            </MapContainer>
            <Typography variant="h6" gutterBottom>Images</Typography>
            <Box display="flex" justifyContent="space-around" flexWrap="wrap">
              {selectedProperty.images.map((image, index) => (
                <Avatar key={index} src={image} alt={`Image ${index + 1}`} sx={{ width: 100, height: 100, margin: '0.5rem' }} variant="square" />
              ))}
            </Box>
          </DialogContent>
          <DialogActions><Button onClick={handleClose} color="primary">Close</Button></DialogActions>
        </Dialog>
      )}

      <Dialog open={addPropertyOpen} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Add New Property</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Property Name" fullWidth variant="outlined" InputProps={{ endAdornment: <Tooltip title="Enter the property name" placement="top"><InfoIcon /></Tooltip> }} />
          <TextField margin="dense" label="Description" fullWidth variant="outlined" multiline rows={4} InputProps={{ endAdornment: <Tooltip title="Enter a brief description of the property" placement="top"><InfoIcon /></Tooltip> }} />
          <TextField margin="dense" label="Property Type" fullWidth variant="outlined" select InputProps={{ endAdornment: <Tooltip title="Select the property type" placement="top"><InfoIcon /></Tooltip> }}><MenuItem value="Villa">Villa</MenuItem><MenuItem value="Retreat">Retreat</MenuItem><MenuItem value="Apartment">Apartment</MenuItem></TextField>
          <TextField margin="dense" label="Establishment Date" fullWidth variant="outlined" type="date" InputLabelProps={{ shrink: true }} InputProps={{ endAdornment: <Tooltip title="Enter the establishment date" placement="top"><InfoIcon /></Tooltip> }} />
          <TextField margin="dense" label="Rent Amount" fullWidth variant="outlined" type="number" InputProps={{ endAdornment: <Tooltip title="Enter the rent amount" placement="top"><InfoIcon /></Tooltip> }} />
          <TextField margin="dense" label="Contract Start Date" fullWidth variant="outlined" type="date" InputLabelProps={{ shrink: true }} InputProps={{ endAdornment: <Tooltip title="Enter the contract start date" placement="top"><InfoIcon /></Tooltip> }} />
          <TextField margin="dense" label="Contract End Date" fullWidth variant="outlined" type="date" InputLabelProps={{ shrink: true }} InputProps={{ endAdornment: <Tooltip title="Enter the contract end date" placement="top"><InfoIcon /></Tooltip> }} />
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}><Button variant="contained" color="primary" startIcon={<LocationOnIcon />}>Set Location</Button><Button variant="contained" color="primary" startIcon={<ImageIcon />}>Upload Image</Button></Box>
        </DialogContent>
        <DialogActions><Button onClick={handleClose} color="primary">Cancel</Button><Button onClick={handleClose} color="primary">Add Property</Button></DialogActions>
      </Dialog>

      {editProperty && (
        <Dialog open={!!editProperty} onClose={handleClose} fullWidth maxWidth="md">
          <DialogTitle>Edit Property</DialogTitle>
          <DialogContent>
            <TextField autoFocus margin="dense" label="Property Name" fullWidth variant="outlined" defaultValue={editProperty.name} InputProps={{ endAdornment: <Tooltip title="Enter the property name" placement="top"><InfoIcon /></Tooltip> }} />
            <TextField margin="dense" label="Description" fullWidth variant="outlined" multiline rows={4} defaultValue={editProperty.description} InputProps={{ endAdornment: <Tooltip title="Enter a brief description of the property" placement="top"><InfoIcon /></Tooltip> }} />
            <TextField margin="dense" label="Property Type" fullWidth variant="outlined" select defaultValue={editProperty.propertyType} InputProps={{ endAdornment: <Tooltip title="Select the property type" placement="top"><InfoIcon /></Tooltip> }}><MenuItem value="Villa">Villa</MenuItem><MenuItem value="Retreat">Retreat</MenuItem><MenuItem value="Apartment">Apartment</MenuItem></TextField>
            <TextField margin="dense" label="Establishment Date" fullWidth variant="outlined" type="date" defaultValue={editProperty.establishmentDate} InputLabelProps={{ shrink: true }} InputProps={{ endAdornment: <Tooltip title="Enter the establishment date" placement="top"><InfoIcon /></Tooltip> }} />
            <TextField margin="dense" label="Rent Amount" fullWidth variant="outlined" type="number" defaultValue={editProperty.rentAmount} InputProps={{ endAdornment: <Tooltip title="Enter the rent amount" placement="top"><InfoIcon /></Tooltip> }} />
            <TextField margin="dense" label="Contract Start Date" fullWidth variant="outlined" type="date" defaultValue={editProperty.contractStartDate} InputLabelProps={{ shrink: true }} InputProps={{ endAdornment: <Tooltip title="Enter the contract start date" placement="top"><InfoIcon /></Tooltip> }} />
            <TextField margin="dense" label="Contract End Date" fullWidth variant="outlined" type="date" defaultValue={editProperty.contractEndDate} InputLabelProps={{ shrink: true }} InputProps={{ endAdornment: <Tooltip title="Enter the contract end date" placement="top"><InfoIcon /></Tooltip> }} />
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}><Button variant="contained" color="primary" startIcon={<LocationOnIcon />}>Set Location</Button><Button variant="contained" color="primary" startIcon={<ImageIcon />}>Upload Image</Button></Box>
          </DialogContent>
          <DialogActions><Button onClick={handleClose} color="primary">Cancel</Button><Button onClick={handleClose} color="primary">Save Changes</Button></DialogActions>
        </Dialog>
      )}

      {deletePropertyId && (
        <Dialog open={!!deletePropertyId} onClose={handleClose} fullWidth maxWidth="sm">
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent><DialogContentText>Are you sure you want to delete this property? This action cannot be undone.</DialogContentText></DialogContent>
          <DialogActions><Button onClick={handleClose} color="primary">Cancel</Button><Button onClick={handleDeleteProperty} color="primary">Delete</Button></DialogActions>
        </Dialog>
      )}
    </PageWrapper>
  );
};

export default Properties;
