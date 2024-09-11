import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Typography, Grid, Box, Card, CardContent, Button, TextField,
  MenuItem, IconButton, InputAdornment, Tooltip, Select, FormControl,
  FormControlLabel, Checkbox, Slider, Dialog, DialogTitle, DialogContent,
  DialogActions, Pagination, Chip, useMediaQuery, useTheme, Snackbar,
  Alert, CircularProgress, Tabs, Tab, Paper, List, ListItem, ListItemText,
  ListItemAvatar, Avatar, InputLabel, Rating, CardActions, Drawer, ListItemIcon,
} from "@mui/material";
import {
  Search as SearchIcon, Sort as SortIcon, FilterList as FilterListIcon,
  Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon,
  BedroomParent as BedroomParentIcon, Bathtub as BathtubIcon,
  SquareFoot as SquareFootIcon, Visibility as VisibilityIcon,
  GridView as GridViewIcon, ViewList as ViewListIcon,
  Map as MapIcon, Home as HomeIcon, Edit as EditIcon,
  CheckCircle as CheckCircleIcon, Schedule as ScheduleIcon,
  KeyboardArrowLeft, KeyboardArrowRight, Save as SaveIcon, Cancel as CancelIcon,
  Add as AddIcon, Delete as DeleteIcon,
  Pets as PetsIcon, LocalParking as ParkingIcon, Star as StarIcon
} from "@mui/icons-material";
import { styled, alpha } from "@mui/system";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const generatePlaceholderImage = (index) => `/api/placeholder/800/600?text=Property+Image+${index}`;

// Mock data for properties with placeholder images
const propertiesData = [
  {
    id: 1,
    name: "Sunny Meadows Apartment",
    description: "Beautiful apartment with a view of the meadows",
    rentAmount: 1500,
    rating: 4,
    images: [
      generatePlaceholderImage(1),
      generatePlaceholderImage(2),
      generatePlaceholderImage(3),
    ],
    additionalInfo: {
      bedrooms: 2,
      bathrooms: 1,
      area: 800,
      furnished: true,
      parking: true,
      petFriendly: false,
      availableNow: true
    },
    propertyType: "Apartment",
    location: [40.7128, -74.006]
  },
  // Add more mock properties here...
];

const PageWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  minHeight: "100vh",
}));

const PropertyCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
}));

const StyledRating = styled(Rating)(({ theme }) => ({
  '& .MuiRating-iconFilled': {
    color: theme.palette.secondary.main,
  },
}));

const propertyIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

const Properties = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("nameAsc");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    rentAmount: [500, 10000],
    bedrooms: [1, 10],
    bathrooms: [1, 5],
    area: [500, 10000],
    furnished: false,
    parking: false,
    petFriendly: false,
    availableNow: false,
  });
  const [favoriteProperties, setFavoriteProperties] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(false);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
  const [properties, setProperties] = useState(propertiesData);
  const propertiesPerPage = 12;

  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteProperties');
    if (savedFavorites) {
      setFavoriteProperties(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('favoriteProperties', JSON.stringify(favoriteProperties));
  }, [favoriteProperties]);

  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            property.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = !selectedFilter || property.propertyType === selectedFilter;
      const matchesRentAmount = property.rentAmount >= filters.rentAmount[0] && property.rentAmount <= filters.rentAmount[1];
      const matchesBedrooms = property.additionalInfo.bedrooms >= filters.bedrooms[0] && property.additionalInfo.bedrooms <= filters.bedrooms[1];
      const matchesBathrooms = property.additionalInfo.bathrooms >= filters.bathrooms[0] && property.additionalInfo.bathrooms <= filters.bathrooms[1];
      const matchesArea = property.additionalInfo.area >= filters.area[0] && property.additionalInfo.area <= filters.area[1];
      const matchesFurnished = !filters.furnished || property.additionalInfo.furnished;
      const matchesParking = !filters.parking || property.additionalInfo.parking;
      const matchesPetFriendly = !filters.petFriendly || property.additionalInfo.petFriendly;
      const matchesAvailableNow = !filters.availableNow || property.additionalInfo.availableNow;

      return matchesSearch && matchesFilter && matchesRentAmount && matchesBedrooms && 
             matchesBathrooms && matchesArea && matchesFurnished && matchesParking &&
             matchesPetFriendly && matchesAvailableNow;
    }).sort((a, b) => {
      switch (sortOrder) {
        case "nameAsc": return a.name.localeCompare(b.name);
        case "nameDesc": return b.name.localeCompare(a.name);
        case "priceAsc": return a.rentAmount - b.rentAmount;
        case "priceDesc": return b.rentAmount - a.rentAmount;
        default: return 0;
      }
    });
  }, [searchTerm, selectedFilter, sortOrder, filters, properties]);

  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * propertiesPerPage;
    return filteredProperties.slice(startIndex, startIndex + propertiesPerPage);
  }, [filteredProperties, currentPage]);

  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);

  const handlePageChange = useCallback((_, value) => setCurrentPage(value), []);
  const handleViewModeChange = useCallback((_, newMode) => setViewMode(newMode), []);

  const toggleFavorite = useCallback((propertyId) => {
    setFavoriteProperties(prev => {
      const newFavorites = prev.includes(propertyId) ? prev.filter(id => id !== propertyId) : [...prev, propertyId];
      setSnackbar({
        open: true,
        message: prev.includes(propertyId) ? "Property removed from favorites" : "Property added to favorites",
        severity: "success",
      });
      return newFavorites;
    });
  }, []);

  const handlePropertyDetails = useCallback((property) => setSelectedProperty(property), []);

  const handleEditProperty = useCallback((property) => {
    setEditingProperty({ ...property, newImages: [] });
  }, []);

  const handleSaveEdit = useCallback(() => {
    setProperties(prev => prev.map(p => p.id === editingProperty.id ? {
      ...editingProperty,
      images: [...editingProperty.images, ...editingProperty.newImages]
    } : p));
    setSnackbar({
      open: true,
      message: "Property updated successfully",
      severity: "success",
    });
    setEditingProperty(null);
  }, [editingProperty]);

  const handleCancelEdit = useCallback(() => {
    setEditingProperty(null);
  }, []);

  const handleImageUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProperty(prev => ({
          ...prev,
          newImages: [...prev.newImages, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleRemoveImage = useCallback((index) => {
    setEditingProperty(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  }, []);

  const handleSetMainImage = useCallback((index) => {
    setEditingProperty(prev => ({
      ...prev,
      images: [prev.images[index], ...prev.images.filter((_, i) => i !== index)]
    }));
  }, []);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const ImageCarousel = ({ images }) => {
    const [activeStep, setActiveStep] = useState(0);
    const maxSteps = images.length;

    const handleNext = () => {
      setActiveStep((prevActiveStep) => (prevActiveStep + 1) % maxSteps);
    };

    const handleBack = () => {
      setActiveStep((prevActiveStep) => (prevActiveStep - 1 + maxSteps) % maxSteps);
    };

    return (
      <Box sx={{ position: 'relative', width: '100%', height: 200 }}>
        <img
          src={images[activeStep]}
          alt={`Property ${activeStep + 1}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <IconButton
          onClick={handleBack}
          disabled={activeStep === 0}
          sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }}
        >
          <KeyboardArrowLeft />
        </IconButton>
        <IconButton
          onClick={handleNext}
          disabled={activeStep === maxSteps - 1}
          sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
        >
          <KeyboardArrowRight />
        </IconButton>
      </Box>
    );
  };

  const renderPropertyCard = (property) => (
    <PropertyCard>
      <ImageCarousel images={property.images} />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div">{property.name}</Typography>
        <Typography variant="body2" color="text.secondary" noWrap>{property.description}</Typography>
        <Typography variant="h6" color="primary" sx={{ mt: 1 }}>${property.rentAmount.toLocaleString()} / month</Typography>
        <StyledRating name="read-only" value={property.rating || 0} readOnly size="small" />
        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          <Chip icon={<BedroomParentIcon />} label={`${property.additionalInfo.bedrooms} Beds`} size="small" />
          <Chip icon={<BathtubIcon />} label={`${property.additionalInfo.bathrooms} Baths`} size="small" />
          <Chip icon={<SquareFootIcon />} label={`${property.additionalInfo.area} sqft`} size="small" />
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: "space-between", p: 1 }}>
        <Tooltip title="Quick View">
          <IconButton onClick={() => handlePropertyDetails(property)}><VisibilityIcon /></IconButton>
        </Tooltip>
        <Tooltip title={favoriteProperties.includes(property.id) ? "Remove from Favorites" : "Add to Favorites"}>
          <IconButton onClick={() => toggleFavorite(property.id)}>
            {favoriteProperties.includes(property.id) ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit">
          <IconButton onClick={() => handleEditProperty(property)}><EditIcon /></IconButton>
        </Tooltip>
      </CardActions>
    </PropertyCard>
  );

  const renderProperties = () => {
    if (loading) return <CircularProgress />;

    if (viewMode === "grid") {
      return (
        <Grid container spacing={3}>
          {paginatedProperties.map((property) => (
            <Grid item key={property.id} xs={12} sm={6} md={4} lg={3}>
              {renderPropertyCard(property)}
            </Grid>
          ))}
        </Grid>
      );
    }

    if (viewMode === "list") {
      return (
        <List>
          {paginatedProperties.map((property) => (
            <ListItem key={property.id} alignItems="flex-start" sx={{ mb: 2, border: 1, borderColor: "divider", borderRadius: 2, "&:hover": { backgroundColor: "action.hover" } }}>
              <ListItemAvatar sx={{ mr: 2 }}>
                <Avatar src={property.images[0]} alt={property.name} variant="rounded" sx={{ width: 100, height: 100 }}>
                  {!property.images[0] && <HomeIcon />}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box>
                    <Typography variant="h6" component="div">{property.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{property.description}</Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 1 }}>${property.rentAmount.toLocaleString()} / month</Typography>
                    <StyledRating name="read-only" value={property.rating || 0} readOnly size="small" />
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      <Chip icon={<BedroomParentIcon />} label={`${property.additionalInfo.bedrooms} Beds`} size="small" />
                      <Chip icon={<BathtubIcon />} label={`${property.additionalInfo.bathrooms} Baths`} size="small" />
                      <Chip icon={<SquareFootIcon />} label={`${property.additionalInfo.area} sqft`} size="small" />
                    </Box>
                  </Box>
                }
              />
              <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <Tooltip title="Quick View">
                  <IconButton onClick={() => handlePropertyDetails(property)}><VisibilityIcon /></IconButton>
                </Tooltip>
                <Tooltip title={favoriteProperties.includes(property.id) ? "Remove from Favorites" : "Add to Favorites"}>
                  <IconButton onClick={() => toggleFavorite(property.id)}>
                    {favoriteProperties.includes(property.id) ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit">
                  <IconButton onClick={() => handleEditProperty(property)}><EditIcon /></IconButton>
                </Tooltip>
              </Box>
            </ListItem>
          ))}
        </List>
      );
    }

    if (viewMode === "map") {
      return (
        <Box sx={{ height: 600, width: '100%', borderRadius: theme.shape.borderRadius * 2, overflow: 'hidden' }}>
          <MapContainer center={[40.7128, -74.006]} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {paginatedProperties.map((property) => (
              <Marker key={property.id} position={property.location} icon={propertyIcon}>
                <Popup>
                  <Typography variant="subtitle1">{property.name}</Typography>
                  <Typography variant="body2">${property.rentAmount.toLocaleString()} / month</Typography>
                  <Button size="small" onClick={() => handlePropertyDetails(property)}>View Details</Button>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </Box>
      );
    }

    return null;
  };

  const renderPropertyDetailsModal = () => (
    <Dialog
      open={!!selectedProperty}
      onClose={() => setSelectedProperty(null)}
      maxWidth="md"
      fullWidth
    >
      {selectedProperty && (
        <>
          <DialogTitle>{selectedProperty.name}</DialogTitle>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <ImageCarousel images={selectedProperty.images} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" color="primary">${selectedProperty.rentAmount.toLocaleString()} / month</Typography>
                <Typography variant="body1" paragraph>{selectedProperty.description}</Typography>
                <Typography variant="subtitle1">Property Details:</Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><BedroomParentIcon /></ListItemIcon>
                    <ListItemText primary={`${selectedProperty.additionalInfo.bedrooms} Bedrooms`} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><BathtubIcon /></ListItemIcon>
                    <ListItemText primary={`${selectedProperty.additionalInfo.bathrooms} Bathrooms`} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><SquareFootIcon /></ListItemIcon>
                    <ListItemText primary={`${selectedProperty.additionalInfo.area} sqft`} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><HomeIcon /></ListItemIcon>
                    <ListItemText primary={`Type: ${selectedProperty.propertyType}`} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>{selectedProperty.additionalInfo.availableNow ? <CheckCircleIcon color="success" /> : <ScheduleIcon />}</ListItemIcon>
                    <ListItemText primary={`Available: ${selectedProperty.additionalInfo.availableNow ? 'Now' : 'Soon'}`} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>{selectedProperty.additionalInfo.furnished ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}</ListItemIcon>
                    <ListItemText primary={`Furnished: ${selectedProperty.additionalInfo.furnished ? 'Yes' : 'No'}`} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>{selectedProperty.additionalInfo.parking ? <ParkingIcon color="success" /> : <CancelIcon color="error" />}</ListItemIcon>
                    <ListItemText primary={`Parking: ${selectedProperty.additionalInfo.parking ? 'Available' : 'Not Available'}`} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>{selectedProperty.additionalInfo.petFriendly ? <PetsIcon color="success" /> : <CancelIcon color="error" />}</ListItemIcon>
                    <ListItemText primary={`Pet Friendly: ${selectedProperty.additionalInfo.petFriendly ? 'Yes' : 'No'}`} />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedProperty(null)}>Close</Button>
            <Button onClick={() => handleEditProperty(selectedProperty)} color="primary">Edit Property</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );

  const renderEditPropertyModal = () => (
    <Dialog
      open={!!editingProperty}
      onClose={handleCancelEdit}
      maxWidth="md"
      fullWidth
    >
      {editingProperty && (
        <>
          <DialogTitle>Edit Property</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  value={editingProperty.name}
                  onChange={(e) => setEditingProperty({...editingProperty, name: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={editingProperty.description}
                  onChange={(e) => setEditingProperty({...editingProperty, description: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Rent Amount"
                  value={editingProperty.rentAmount}
                  onChange={(e) => setEditingProperty({...editingProperty, rentAmount: Number(e.target.value)})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Property Type"
                  value={editingProperty.propertyType}
                  onChange={(e) => setEditingProperty({...editingProperty, propertyType: e.target.value})}
                >
                  {["Apartment", "House", "Condo", "Townhouse"].map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Bedrooms"
                  value={editingProperty.additionalInfo.bedrooms}
                  onChange={(e) => setEditingProperty({
                    ...editingProperty,
                    additionalInfo: {...editingProperty.additionalInfo, bedrooms: Number(e.target.value)}
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Bathrooms"
                  value={editingProperty.additionalInfo.bathrooms}
                  onChange={(e) => setEditingProperty({
                    ...editingProperty,
                    additionalInfo: {...editingProperty.additionalInfo, bathrooms: Number(e.target.value)}
                  })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Area (sqft)"
                  value={editingProperty.additionalInfo.area}
                  onChange={(e) => setEditingProperty({
                    ...editingProperty,
                    additionalInfo: {...editingProperty.additionalInfo, area: Number(e.target.value)}
                  })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editingProperty.additionalInfo.furnished}
                      onChange={(e) => setEditingProperty({
                        ...editingProperty,
                        additionalInfo: {...editingProperty.additionalInfo, furnished: e.target.checked}
                      })}
                    />
                  }
                  label="Furnished"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editingProperty.additionalInfo.parking}
                      onChange={(e) => setEditingProperty({
                        ...editingProperty,
                        additionalInfo: {...editingProperty.additionalInfo, parking: e.target.checked}
                      })}
                    />
                  }
                  label="Parking Available"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editingProperty.additionalInfo.petFriendly}
                      onChange={(e) => setEditingProperty({
                        ...editingProperty,
                        additionalInfo: {...editingProperty.additionalInfo, petFriendly: e.target.checked}
                      })}
                    />
                  }
                  label="Pet Friendly"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editingProperty.additionalInfo.availableNow}
                      onChange={(e) => setEditingProperty({
                        ...editingProperty,
                        additionalInfo: {...editingProperty.additionalInfo, availableNow: e.target.checked}
                      })}
                    />
                  }
                  label="Available Now"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Property Images</Typography>
                <Grid container spacing={2}>
                  {editingProperty.images.map((image, index) => (
                    <Grid item key={index} xs={6} sm={4} md={3}>
                      <Box sx={{ position: 'relative' }}>
                        <img src={image} alt={`Property ${index + 1}`} style={{ width: '100%', height: 'auto' }} />
                        <Box sx={{ position: 'absolute', top: 0, right: 0 }}>
                          <IconButton onClick={() => handleRemoveImage(index)} size="small">
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                        {index !== 0 && (
                          <Box sx={{ position: 'absolute', top: 0, left: 0 }}>
                            <IconButton onClick={() => handleSetMainImage(index)} size="small">
                              <StarIcon />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AddIcon />}
                  sx={{ mt: 2 }}
                >
                  Add Image
                  <input type="file" hidden onChange={handleImageUpload} accept="image/*" />
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelEdit} startIcon={<CancelIcon />}>Cancel</Button>
            <Button onClick={handleSaveEdit} color="primary" startIcon={<SaveIcon />}>Save Changes</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );

  const renderAdvancedFilterDrawer = () => (
    <Drawer
      anchor="right"
      open={isAdvancedFilterOpen}
      onClose={() => setIsAdvancedFilterOpen(false)}
    >
      <Box sx={{ width: 300, p: 2 }}>
        <Typography variant="h6" gutterBottom>Advanced Filters</Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Property Type</InputLabel>
          <Select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <MenuItem value="">All Types</MenuItem>
            {["Villa", "Apartment", "House", "Condo", "Townhouse"].map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography gutterBottom>Rent Amount ($)</Typography>
        <Slider
          value={filters.rentAmount}
          onChange={(_, newValue) => setFilters(prev => ({ ...prev, rentAmount: newValue }))}
          valueLabelDisplay="auto"
          min={500}
          max={10000}
          step={100}
        />
        <Typography gutterBottom>Bedrooms</Typography>
        <Slider
          value={filters.bedrooms}
          onChange={(_, newValue) => setFilters(prev => ({ ...prev, bedrooms: newValue }))}
          valueLabelDisplay="auto"
          min={1}
          max={10}
          step={1}
        />
        <Typography gutterBottom>Bathrooms</Typography>
        <Slider
          value={filters.bathrooms}
          onChange={(_, newValue) => setFilters(prev => ({ ...prev, bathrooms: newValue }))}
          valueLabelDisplay="auto"
          min={1}
          max={5}
          step={0.5}
        />
        <Typography gutterBottom>Area (sqft)</Typography>
        <Slider
        value={filters.area}
        onChange={(_, newValue) => setFilters(prev => ({ ...prev, area: newValue }))}
        valueLabelDisplay="auto"
        min={500}
        max={10000}
        step={100}
      />
      <FormControlLabel
        control={<Checkbox checked={filters.furnished} onChange={(e) => setFilters(prev => ({ ...prev, furnished: e.target.checked }))} />}
        label="Furnished"
      />
      <FormControlLabel
        control={<Checkbox checked={filters.parking} onChange={(e) => setFilters(prev => ({ ...prev, parking: e.target.checked }))} />}
        label="Parking Available"
      />
      <FormControlLabel
        control={<Checkbox checked={filters.petFriendly} onChange={(e) => setFilters(prev => ({ ...prev, petFriendly: e.target.checked }))} />}
        label="Pet Friendly"
      />
      <FormControlLabel
        control={<Checkbox checked={filters.availableNow} onChange={(e) => setFilters(prev => ({ ...prev, availableNow: e.target.checked }))} />}
        label="Available Now"
      />
      <Button
        fullWidth
        variant="contained"
        color="primary"
        onClick={() => setIsAdvancedFilterOpen(false)}
        sx={{ mt: 2 }}
      >
        Apply Filters
      </Button>
    </Box>
  </Drawer>
);

return (
  <PageWrapper>
    <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, textAlign: "center" }}>Property Listings</Typography>
    <Paper sx={{ mb: 3, p: 2, borderRadius: theme.shape.borderRadius * 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search Properties"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>)
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth variant="outlined">
            <Select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              displayEmpty
              startAdornment={<InputAdornment position="start"><SortIcon /></InputAdornment>}
            >
              <MenuItem value="nameAsc">Name (A-Z)</MenuItem>
              <MenuItem value="nameDesc">Name (Z-A)</MenuItem>
              <MenuItem value="priceAsc">Price: Low to High</MenuItem>
              <MenuItem value="priceDesc">Price: High to Low</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setIsAdvancedFilterOpen(true)}
          >
            Advanced Filters
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Tabs
            value={viewMode}
            onChange={handleViewModeChange}
            aria-label="view mode"
            variant="fullWidth"
          >
            <Tab icon={<GridViewIcon />} value="grid" aria-label="grid view" />
            <Tab icon={<ViewListIcon />} value="list" aria-label="list view" />
            <Tab icon={<MapIcon />} value="map" aria-label="map view" />
          </Tabs>
        </Grid>
      </Grid>
    </Paper>

    {renderProperties()}

    {totalPages > 1 && (
      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          size={isMobile ? "small" : "medium"}
        />
      </Box>
    )}

    {renderPropertyDetailsModal()}
    {renderEditPropertyModal()}
    {renderAdvancedFilterDrawer()}

    <Snackbar
      open={snackbar.open}
      autoHideDuration={6000}
      onClose={() => setSnackbar({ ...snackbar, open: false })}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        severity={snackbar.severity}
        sx={{ width: "100%" }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  </PageWrapper>
);
};

export default Properties;