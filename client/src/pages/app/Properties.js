import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography, Grid, Box, Card, CardContent, Button, TextField,
  MenuItem, IconButton, InputAdornment, Select, FormControl,
  FormControlLabel, Checkbox, Slider, Dialog, DialogTitle, DialogContent,
  DialogActions, Pagination, Chip, useMediaQuery, Snackbar, Alert, 
  CircularProgress, Tabs, Tab, Paper, List, ListItem, ListItemText,
  ListItemIcon, InputLabel, CardActions, Drawer,
  ImageList, ImageListItem, ImageListItemBar, FormHelperText
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Search as SearchIcon, Sort as SortIcon, FilterList as FilterListIcon,
  Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon,
  BedroomParent as BedroomParentIcon, Bathtub as BathtubIcon,
  SquareFoot as SquareFootIcon, GridView as GridViewIcon, 
  ViewList as ViewListIcon, Map as MapIcon, Home as HomeIcon, 
  Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, 
  CloudUpload as CloudUploadIcon, RadioButtonUnchecked as RadioButtonUncheckedIcon,
  RadioButtonChecked as RadioButtonCheckedIcon
} from "@mui/icons-material";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import L from 'leaflet';
import axiosInstance from '../../axiosSetup';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import './Properties.css';

// Validation schema
const propertySchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  description: yup.string().required('Description is required'),
  rentAmount: yup.number().positive('Rent must be positive').required('Rent is required'),
  propertyType: yup.string().required('Property type is required'),
  bedrooms: yup.number().positive('Bedrooms must be positive').required('Bedrooms are required'),
  bathrooms: yup.number().positive('Bathrooms must be positive').required('Bathrooms are required'),
  area: yup.number().positive('Area must be positive').required('Area is required'),
  furnished: yup.boolean(),
  parking: yup.boolean(),
  petFriendly: yup.boolean(),
  availableNow: yup.boolean(),
});

// Custom marker icon configuration
const customMarkerIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Initial filters state
const initialFilters = {
  rentAmount: [500, 10000],
  bedrooms: [1, 10],
  bathrooms: [1, 5],
  area: [500, 10000],
  furnished: false,
  parking: false,
  petFriendly: false,
  availableNow: false,
};

// PropertyFormModal Component
const PropertyFormModal = ({
  open,
  onClose,
  property,
  onSubmit,
  control,
  errors,
  uploadedImages,
  onImageUpload,
  mainImageIndex,
  setMainImageIndex,
  selectedLocation,
  setSelectedLocation
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={onSubmit}>
        <DialogTitle>
          {property ? `Edit Property: ${property.name}` : 'Add New Property'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Property Name"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    margin="normal"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    margin="normal"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="rentAmount"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Rent Amount"
                    fullWidth
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    error={!!errors.rentAmount}
                    helperText={errors.rentAmount?.message}
                    margin="normal"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="propertyType"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.propertyType} margin="normal">
                    <InputLabel>Property Type</InputLabel>
                    <Select {...field} label="Property Type">
                      {["Apartment", "House", "Condo", "Townhouse"].map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                    {errors.propertyType && (
                      <FormHelperText>{errors.propertyType.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="bedrooms"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Bedrooms"
                    fullWidth
                    type="number"
                    error={!!errors.bedrooms}
                    helperText={errors.bedrooms?.message}
                    margin="normal"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="bathrooms"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Bathrooms"
                    fullWidth
                    type="number"
                    error={!!errors.bathrooms}
                    helperText={errors.bathrooms?.message}
                    margin="normal"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="area"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Area (sqft)"
                    fullWidth
                    type="number"
                    error={!!errors.area}
                    helperText={errors.area?.message}
                    margin="normal"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Features</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Controller
                    name="furnished"
                    control={control}
                    defaultValue={false}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} />}
                        label="Furnished"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Controller
                    name="parking"
                    control={control}
                    defaultValue={false}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} />}
                        label="Parking"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Controller
                    name="petFriendly"
                    control={control}
                    defaultValue={false}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} />}
                        label="Pet Friendly"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Controller
                    name="availableNow"
                    control={control}
                    defaultValue={true}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} />}
                        label="Available Now"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Location</Typography>
              <Box sx={{ height: 300, width: '100%', mb: 2 }}>
                <MapContainer
                  center={[0, 0]}
                  zoom={2}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationPicker onLocationSelect={setSelectedLocation} />
                  {selectedLocation && (
                    <Marker position={selectedLocation} icon={customMarkerIcon}>
                      <Popup>Selected location</Popup>
                    </Marker>
                  )}
                </MapContainer>
              </Box>
              {selectedLocation && (
                <Typography variant="body2">
                  Selected Location: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Images</Typography>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="raised-button-file"
                multiple
                type="file"
                onChange={onImageUpload}
              />
              <label htmlFor="raised-button-file">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                >
                  Upload Images
                </Button>
              </label>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Max 16 images, total size up to 200 MB
              </Typography>
              <ImageList sx={{ width: '100%', height: 200, mt: 2 }} cols={4} rowHeight={100}>
                {uploadedImages.map((image, index) => (
                  <ImageListItem key={index}>
                    <img
                      src={image instanceof File ? URL.createObjectURL(image) : 
                        `${process.env.REACT_APP_API_URL}/uploads/properties/${image.path}`}
                      alt={`Upload ${index + 1}`}
                      loading="lazy"
                    />
                    <ImageListItemBar
                      position="top"
                      actionIcon={
                        <IconButton
                          sx={{ color: 'white' }}
                          onClick={() => {
                            const newImages = [...uploadedImages];
                            newImages.splice(index, 1);
                            if (index === mainImageIndex) {
                              setMainImageIndex(0);
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    />
                    <ImageListItemBar
                      position="bottom"
                      actionIcon={
                        <Checkbox
                          checked={index === mainImageIndex}
                          onChange={() => setMainImageIndex(index)}
                          icon={<RadioButtonUncheckedIcon />}
                          checkedIcon={<RadioButtonCheckedIcon />}
                        />
                      }
                      title="Set as main"
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {property ? 'Update' : 'Add'} Property
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// PropertyQuickViewModal Component
const PropertyQuickViewModal = ({ property, onClose, onEdit }) => {
  if (!property) return null;

  return (
    <Dialog open={!!property} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{property.name}</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box className="quick-view-image">
              <img
                src={property.images && property.images.length > 0
                  ? `${process.env.REACT_APP_API_URL}/uploads/properties/${property.images[0].path}`
                  : "/placeholder-property.jpg"}
                alt={property.name}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" color="primary">
              ${property.rentAmount?.toLocaleString()} / month
            </Typography>
            <Typography variant="body1" paragraph>
              {property.description}
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon><BedroomParentIcon /></ListItemIcon>
                <ListItemText primary={`${property.bedrooms || 0} Bedrooms`} />
              </ListItem>
              <ListItem>
                <ListItemIcon><BathtubIcon /></ListItemIcon>
                <ListItemText primary={`${property.bathrooms || 0} Bathrooms`} />
              </ListItem>
              <ListItem>
                <ListItemIcon><SquareFootIcon /></ListItemIcon>
                <ListItemText primary={`${property.area || 0} sqft`} />
              </ListItem>
              <ListItem>
                <ListItemIcon><HomeIcon /></ListItemIcon>
                <ListItemText primary={`Type: ${property.propertyType}`} />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={() => {
          onEdit(property);
          onClose();
        }} color="primary">
        Edit Property
      </Button>
    </DialogActions>
  </Dialog>
);
};

// AdvancedFilterDrawer Component
const AdvancedFilterDrawer = ({
open,
onClose,
filters,
setFilters,
selectedFilter,
setSelectedFilter,
onApply
}) => {
return (
  <Drawer
    anchor="right"
    open={open}
    onClose={onClose}
    PaperProps={{
      sx: { width: { xs: '100%', sm: 300 }, padding: 2 }
    }}
  >
    <Typography variant="h6" gutterBottom>Advanced Filters</Typography>
    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel>Property Type</InputLabel>
      <Select
        value={selectedFilter}
        onChange={(e) => setSelectedFilter(e.target.value)}
      >
        <MenuItem value="">All Types</MenuItem>
        {["Apartment", "House", "Condo", "Townhouse"].map((type) => (
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
      control={
        <Checkbox
          checked={filters.furnished}
          onChange={(e) => setFilters(prev => ({ ...prev, furnished: e.target.checked }))}
        />
      }
      label="Furnished"
    />

    <FormControlLabel
      control={
        <Checkbox
          checked={filters.parking}
          onChange={(e) => setFilters(prev => ({ ...prev, parking: e.target.checked }))}
        />
      }
      label="Parking Available"
    />

    <FormControlLabel
      control={
        <Checkbox
          checked={filters.petFriendly}
          onChange={(e) => setFilters(prev => ({ ...prev, petFriendly: e.target.checked }))}
        />
      }
      label="Pet Friendly"
    />

    <FormControlLabel
      control={
        <Checkbox
          checked={filters.availableNow}
          onChange={(e) => setFilters(prev => ({ ...prev, availableNow: e.target.checked }))}
        />
      }
      label="Available Now"
    />

    <Button
      fullWidth
      variant="contained"
      color="primary"
      onClick={() => {
        onApply();
        onClose();
      }}
      sx={{ mt: 2 }}
    >
      Apply Filters
    </Button>
  </Drawer>
);
};

// LocationPicker Component
const LocationPicker = ({ onLocationSelect }) => {
const map = useMap();
const [localSelectedLocation, setLocalSelectedLocation] = useState(null);

useEffect(() => {
  if (localSelectedLocation) {
    map.flyTo([localSelectedLocation.lat, localSelectedLocation.lng], 15);
    onLocationSelect(localSelectedLocation);
  }
}, [map, localSelectedLocation, onLocationSelect]);

useMapEvents({
  click(e) {
    setLocalSelectedLocation(e.latlng);
  },
});

return localSelectedLocation ? (
  <Marker position={localSelectedLocation} icon={customMarkerIcon}>
    <Popup>Selected location</Popup>
  </Marker>
) : null;
};

// Main Properties Component
const Properties = () => {
const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

// State management
const [searchTerm, setSearchTerm] = useState("");
const [selectedFilter, setSelectedFilter] = useState("");
const [sortOrder, setSortOrder] = useState("nameAsc");
const [currentPage, setCurrentPage] = useState(1);
const [filters, setFilters] = useState(initialFilters);
const [favoriteProperties, setFavoriteProperties] = useState([]);
const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
const [viewMode, setViewMode] = useState("grid");
const [loading, setLoading] = useState(true);
const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
const [editingProperty, setEditingProperty] = useState(null);
const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);
const [properties, setProperties] = useState([]);
const [totalPages, setTotalPages] = useState(1);
const [selectedLocation, setSelectedLocation] = useState(null);
const [uploadedImages, setUploadedImages] = useState([]);
const [mainImageIndex, setMainImageIndex] = useState(0);
const [quickViewProperty, setQuickViewProperty] = useState(null);

// Form handling
const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm({
  resolver: yupResolver(propertySchema),
  defaultValues: {
    name: '',
    description: '',
    rentAmount: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    furnished: false,
    parking: false,
    petFriendly: false,
    availableNow: true,
  }
});

// Data fetching
const fetchProperties = useCallback(async () => {
  setLoading(true);
  try {
    const response = await axiosInstance.get('/api/properties', {
      params: {
        page: currentPage,
        limit: 12,
        search: searchTerm,
        sort: sortOrder,
        ...filters,
      }
    });

    if (Array.isArray(response.data)) {
      setProperties(response.data);
      setTotalPages(1);
    } else if (response.data?.properties) {
      setProperties(response.data.properties);
      setTotalPages(response.data.totalPages || 1);
    }
  } catch (error) {
    console.error('Error fetching properties:', error);
    setSnackbar({
      open: true,
      message: "Failed to fetch properties. Please try again.",
      severity: "error"
    });
    setProperties([]);
    setTotalPages(1);
  } finally {
    setLoading(false);
  }
}, [currentPage, searchTerm, sortOrder, filters]);

// Effects
useEffect(() => {
  fetchProperties();
}, [fetchProperties]);

useEffect(() => {
  const savedFavorites = localStorage.getItem('favoriteProperties');
  if (savedFavorites) {
    setFavoriteProperties(JSON.parse(savedFavorites));
  }
}, []);

useEffect(() => {
  localStorage.setItem('favoriteProperties', JSON.stringify(favoriteProperties));
}, [favoriteProperties]);

// Event handlers
const handleViewModeChange = useCallback((_, newMode) => setViewMode(newMode), []);

const toggleFavorite = useCallback(async (propertyId) => {
  try {
    const response = await axiosInstance.post(`/api/user/favorites/${propertyId}`);
    setFavoriteProperties(prev => {
      const newFavorites = response.data.isFavorite
        ? [...prev, propertyId]
        : prev.filter(id => id !== propertyId);
      return newFavorites;
    });
    setSnackbar({
      open: true,
      message: response.data.isFavorite
        ? "Property added to favorites"
        : "Property removed from favorites",
      severity: "success",
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    setSnackbar({
      open: true,
      message: "Failed to update favorites. Please try again.",
      severity: "error",
    });
  }
}, []);

const handleImageUpload = useCallback((event) => {
  const files = Array.from(event.target.files);
  const totalSize = files.reduce((acc, file) => acc + file.size, 0);
  const totalImages = uploadedImages.length + files.length;

  if (totalImages > 16) {
    setSnackbar({
      open: true,
      message: "Maximum 16 images allowed",
      severity: "warning"
    });
    return;
  }

  if (totalSize > 200 * 1024 * 1024) {
    setSnackbar({
      open: true,
      message: "Total size exceeds 200MB limit",
      severity: "warning"
    });
    return;
  }

  setUploadedImages(prev => [...prev, ...files]);
}, [uploadedImages]);

const handlePropertyDetails = useCallback((property) => {
  setQuickViewProperty(property);
}, []);

const handleEditProperty = useCallback((property) => {
  setEditingProperty(property);
  Object.entries(property).forEach(([key, value]) => {
    if (key in propertySchema.fields) {
      setValue(key, value, { shouldValidate: true });
    }
  });

  if (property.latitude && property.longitude) {
    setSelectedLocation({
      lat: parseFloat(property.latitude),
      lng: parseFloat(property.longitude)
    });
  }

  setUploadedImages(property.images || []);
  setMainImageIndex(property.images?.findIndex(img => img.isMain) || 0);
  setIsAddPropertyModalOpen(true);
}, [setValue]);

const handleDeleteProperty = useCallback(async (propertyId) => {
  if (!propertyId || !window.confirm('Are you sure you want to delete this property?')) return;

  try {
    await axiosInstance.delete(`/api/properties/${propertyId}`);
    setProperties(prev => prev.filter(p => p._id !== propertyId));
    setSnackbar({
      open: true,
      message: "Property deleted successfully",
      severity: "success"
    });
  } catch (error) {
    console.error('Error deleting property:', error);
    setSnackbar({
      open: true,
      message: "Failed to delete property",
      severity: "error"
    });
  }
}, []);

const handleAddProperty = async (data) => {
  try {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, value));
    uploadedImages.forEach(image => formData.append('images', image));
    formData.append('mainImageIndex', mainImageIndex.toString());
    
    if (selectedLocation) {
      formData.append('latitude', selectedLocation.lat.toFixed(6));
      formData.append('longitude', selectedLocation.lng.toFixed(6));
    }

    const response = await axiosInstance.post('/api/properties', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    setProperties(prev => [response.data, ...prev]);
    setSnackbar({
      open: true,
      message: "Property added successfully",
      severity: "success"
    });
    handleModalClose();
  } catch (error) {
    console.error('Error adding property:', error);
    setSnackbar({
      open: true,
      message: "Failed to add property",
      severity: "error"
    });
  }
};

const handleUpdateProperty = async (data) => {
  try {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    uploadedImages.forEach((image, index) => {
      if (image instanceof File) {
        formData.append('images', image);
      } else {
        formData.append('existingImages', JSON.stringify(image));
      }
    });
    formData.append('mainImageIndex', mainImageIndex.toString());

    if (selectedLocation) {
      formData.append('latitude', selectedLocation.lat.toString());
      formData.append('longitude', selectedLocation.lng.toString());
    }

    const propertyId = editingProperty._id;
    const response = await axiosInstance.put(`/api/properties/${propertyId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    setProperties(prev => prev.map(p => 
      p._id === propertyId ? response.data : p
    ));

    setSnackbar({
      open: true,
      message: "Property updated successfully",
      severity: "success"
    });
    handleModalClose();
  } catch (error) {
    console.error('Error updating property:', error);
    setSnackbar({
      open: true,
      message: "Failed to update property",
      severity: "error"
    });
  }
};

const handleModalClose = useCallback(() => {
  setIsAddPropertyModalOpen(false);
  setEditingProperty(null);
  reset();
  setUploadedImages([]);
  setMainImageIndex(0);
  setSelectedLocation(null);
}, [reset]);

// Rendering methods
const renderPropertyCard = useCallback((property) => {
  if (!property) return null;
  
  const propertyId = property._id;
  const mainImage = property.images?.find(img => img.isMain) || property.images?.[0];
  const imageUrl = mainImage
    ? `${process.env.REACT_APP_API_URL}/uploads/properties/${mainImage.path}`
    : "/placeholder-property.jpg";

  return (
    <Card className="property-card">
      <img
        className="property-image"
        src={imageUrl}
        alt={property.name}
        onClick={() => handlePropertyDetails(property)}
      />
      <CardContent className="property-content">
        <Typography variant="h6" className="property-title">
          {property.name}
        </Typography>
        <Typography variant="h5" className="property-price">
          ${property.rentAmount?.toLocaleString()} / month
        </Typography>
        <Box className="property-features">
          <Chip icon={<BedroomParentIcon />} label={`${property.bedrooms || 0} Beds`} size="small" />
          <Chip icon={<BathtubIcon />} label={`${property.bathrooms || 0} Baths`} size="small" />
          <Chip icon={<SquareFootIcon />} label={`${property.area || 0} sqft`} size="small" />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {property.description.substring(0, 100)}...
          </Typography>
        </CardContent>
        <CardActions>
          <IconButton onClick={() => toggleFavorite(propertyId)}>
            {favoriteProperties.includes(propertyId) ? 
              <FavoriteIcon color="error" /> : 
              <FavoriteBorderIcon />
            }
          </IconButton>
          <IconButton onClick={() => handleEditProperty(property)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDeleteProperty(propertyId)}>
            <DeleteIcon />
          </IconButton>
        </CardActions>
      </Card>
    );
  }, [favoriteProperties, toggleFavorite, handleDeleteProperty, handlePropertyDetails, handleEditProperty]);

  const renderProperties = () => {
    if (loading) {
      return (
        <Box className="loading-container">
          <CircularProgress />
        </Box>
      );
    }

    if (!properties?.length) {
      return (
        <Typography variant="h6" sx={{ textAlign: 'center', mt: 4 }}>
          No properties found. Try adjusting your filters or add a new property.
        </Typography>
      );
    }

    switch (viewMode) {
      case 'grid':
        return (
          <Grid container spacing={3}>
            {properties.map((property) => (
              <Grid item key={property._id} xs={12} sm={6} md={4} lg={3}>
                {renderPropertyCard(property)}
              </Grid>
            ))}
          </Grid>
        );
      case 'list':
        return (
          <List>
            {properties.map((property) => (
              <ListItem
                key={property._id}
                className="list-item"
                onClick={() => handlePropertyDetails(property)}
              >
                <Box sx={{ display: 'flex', width: '100%' }}>
                  <Box className="list-item-image">
                    <img
                      src={property.images?.[0] ? 
                        `${process.env.REACT_APP_API_URL}/uploads/properties/${property.images[0].path}` :
                        "/placeholder-property.jpg"
                      }
                      alt={property.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder-property.jpg";
                      }}
                    />
                  </Box>
                  <Box sx={{ flexGrow: 1, px: 2 }}>
                    <Typography variant="h6" gutterBottom>{property.name}</Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {property.description.substring(0, 150)}...
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip icon={<BedroomParentIcon />} label={`${property.bedrooms || 0} Beds`} size="small" />
                      <Chip icon={<BathtubIcon />} label={`${property.bathrooms || 0} Baths`} size="small" />
                      <Chip icon={<SquareFootIcon />} label={`${property.area || 0} sqft`} size="small" />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
                    <Typography variant="h6" color="primary">
                      ${property.rentAmount?.toLocaleString()} / month
                    </Typography>
                    <Box>
                      <IconButton onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(property._id);
                      }}>
                        {favoriteProperties.includes(property._id) ? 
                          <FavoriteIcon color="error" /> : 
                          <FavoriteBorderIcon />
                        }
                      </IconButton>
                      <IconButton onClick={(e) => {
                        e.stopPropagation();
                        handleEditProperty(property);
                      }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProperty(property._id);
                      }}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        );
      case 'map':
        return (
          <Box className="map-container">
            <MapContainer
              center={[0, 0]}
              zoom={2}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {properties.map((property) => {
                if (property.latitude && property.longitude) {
                  return (
                    <Marker
                      key={property._id}
                      position={[property.latitude, property.longitude]}
                      icon={customMarkerIcon}
                    >
                      <Popup>
                        <Typography variant="subtitle1">{property.name}</Typography>
                        <Typography variant="body2">
                          ${property.rentAmount?.toLocaleString()} / month
                        </Typography>
                        <Button 
                          size="small" 
                          onClick={() => handlePropertyDetails(property)}
                        >
                          View Details
                        </Button>
                      </Popup>
                    </Marker>
                  );
                }
                return null;
              })}
            </MapContainer>
          </Box>
        );
      default:
        return null;
    }
  };

  // Main render
  return (
    <div className="page-wrapper">
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, textAlign: "center" }}>
        Property Listings
      </Typography>
      
      <Paper className="search-filters-container" sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search Properties"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <SortIcon />
                  </InputAdornment>
                }
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
              variant="fullWidth"
            >
              <Tab icon={<GridViewIcon />} value="grid" />
              <Tab icon={<ViewListIcon />} value="list" />
              <Tab icon={<MapIcon />} value="map" />
            </Tabs>
          </Grid>
        </Grid>
      </Paper>

      {renderProperties()}

      {totalPages > 1 && (
        <Box className="pagination-container">
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
            size={isMobile ? "small" : "medium"}
          />
        </Box>
      )}

      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        className="add-property-button"
        onClick={() => {
          setEditingProperty(null);
          setIsAddPropertyModalOpen(true);
        }}
      >
        Add Property
      </Button>

      <PropertyFormModal
        open={isAddPropertyModalOpen}
        onClose={handleModalClose}
        property={editingProperty}
        onSubmit={handleSubmit(editingProperty ? handleUpdateProperty : handleAddProperty)}
        control={control}
        errors={errors}
        uploadedImages={uploadedImages}
        onImageUpload={handleImageUpload}
        mainImageIndex={mainImageIndex}
        setMainImageIndex={setMainImageIndex}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
      />

      <PropertyQuickViewModal
        property={quickViewProperty}
        onClose={() => setQuickViewProperty(null)}
        onEdit={handleEditProperty}
      />

      <AdvancedFilterDrawer
        open={isAdvancedFilterOpen}
        onClose={() => setIsAdvancedFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        onApply={fetchProperties}
      />

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
    </div>
  );
};

export default React.memo(Properties);