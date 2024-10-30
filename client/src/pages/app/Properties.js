import styles from './Properties.module.css';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography, Grid, Box, Card, CardContent, Button, TextField,
  MenuItem, IconButton, InputAdornment, Select, FormControl,
  FormControlLabel, Checkbox, Slider, Dialog, DialogTitle, DialogContent,
  DialogActions, Pagination, Chip, useMediaQuery, Snackbar, Alert, 
  CircularProgress, Tabs, Tab, Paper, List, ListItem, ListItemText,
  ListItemIcon, InputLabel, CardActions, Drawer, ImageList, ImageListItem, 
  ImageListItemBar, FormHelperText, DialogContentText
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
  RadioButtonChecked as RadioButtonCheckedIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pets as PetsIcon,
  Close as CloseIcon
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

const DEFAULT_PROPERTY_IMAGE = `${process.env.REACT_APP_API_URL}/default-property.jpg`;

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

// Image Modal Component
const ImageModal = ({ open, onClose, imageUrl, alt }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="xl"
    fullScreen
  >
    <IconButton
      onClick={onClose}
      sx={{
        position: 'absolute',
        right: 8,
        top: 8,
        color: 'white',
        bgcolor: 'rgba(0, 0, 0, 0.5)',
        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' }
      }}
    >
      <CloseIcon />
    </IconButton>
    <DialogContent sx={{ p: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'black' }}>
      <img
        src={imageUrl}
        alt={alt}
        style={{
          maxWidth: '100%',
          maxHeight: '100vh',
          objectFit: 'contain'
        }}
      />
    </DialogContent>
  </Dialog>
);

// PropertyImageCarousel Component
const PropertyImageCarousel = ({ images, propertyName, onImageClick, enableZoom = false }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  // Add cleanup for image URLs
  useEffect(() => {
    const urls = [];
    if (images) {
      images.forEach(image => {
        if (image instanceof File) {
          const url = URL.createObjectURL(image);
          urls.push(url);
        }
      });
    }
    return () => {
      urls.forEach(URL.revokeObjectURL);
    };
  }, [images]);
  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images?.length - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev < (images?.length || 0) - 1 ? prev + 1 : 0));
  };

  const getImageUrl = useCallback((image) => {
    if (!image) return DEFAULT_PROPERTY_IMAGE;
    return `${process.env.REACT_APP_API_URL}/uploads/properties/${image.path}`;
  }, []);

  const mainImageIndex = images?.findIndex(img => img.isMain) || 0;
  const currentImage = images?.[enableZoom ? currentImageIndex : mainImageIndex];
  const imageUrl = getImageUrl(currentImage);

  return (
    <>
      <div className={styles.propertyImageContainer} style={{ position: 'relative', width: '100%', height: '250px' }}>
      <img
        className={styles.propertyImage}
        src={imageUrl}
        alt={propertyName}
        onClick={(e) => {
          e.stopPropagation();
          if (onImageClick) {
            onImageClick();
          }
        }}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={(e) => {
          e.target.src = DEFAULT_PROPERTY_IMAGE;
        }}
      />
        {enableZoom && images?.length > 1 && (
          <>
            <IconButton
              onClick={handlePrevImage}
              sx={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              onClick={handleNextImage}
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
              }}
            >
              <ChevronRightIcon />
            </IconButton>
            <Box 
              sx={{ 
                position: 'absolute', 
                bottom: 8, 
                left: '50%', 
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 1
              }}
            >
              {images.map((_, idx) => (
                <Box
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: idx === currentImageIndex ? 'primary.main' : 'rgba(255, 255, 255, 0.8)',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </Box>
          </>
        )}
      </div>

      {enableZoom && (
        <ImageModal
          open={isZoomed}
          onClose={() => setIsZoomed(false)}
          imageUrl={imageUrl}
          alt={propertyName}
        />
      )}
    </>
  );
};

// PropertyQuickViewModal Component
const PropertyQuickViewModal = ({ property, onClose, onEdit }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);

  if (!property) return null;

  return (
    <Dialog 
      open={!!property} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogContent sx={{ p: 0 }}>
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <Typography variant="h5">{property.name}</Typography>
            </Grid>
            <Grid item>
              <Typography variant="h5" color="primary">
                ${property.rentAmount?.toLocaleString()} / month
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Details" />
          <Tab label="Photos" />
          <Tab label="Location" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {selectedTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <PropertyImageCarousel 
                  images={property.images}
                  propertyName={property.name}
                  onImageClick={(url) => setSelectedImage(url)}
                  enableZoom={true}
                />
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1" paragraph>
                    {property.description}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>Property Features</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <List dense>
                        <ListItem>
                          <ListItemIcon><BedroomParentIcon /></ListItemIcon>
                          <ListItemText 
                            primary="Bedrooms"
                            secondary={property.bedrooms}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><BathtubIcon /></ListItemIcon>
                          <ListItemText 
                            primary="Bathrooms"
                            secondary={property.bathrooms}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><SquareFootIcon /></ListItemIcon>
                          <ListItemText 
                            primary="Area"
                            secondary={`${property.area} sqft`}
                          />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={6}>
                      <List dense>
                        <ListItem>
                          <ListItemIcon><HomeIcon /></ListItemIcon>
                          <ListItemText 
                            primary="Type"
                            secondary={property.propertyType}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            {property.furnished ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
                          </ListItemIcon>
                          <ListItemText primary="Furnished" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            {property.parking ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
                          </ListItemIcon>
                          <ListItemText primary="Parking" />
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>
                </Paper>

                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Additional Features</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {property.petFriendly && (
                      <Chip icon={<PetsIcon />} label="Pet Friendly" color="primary" variant="outlined" />
                    )}
                    {property.availableNow && (
                      <Chip icon={<CheckCircleIcon />} label="Available Now" color="success" variant="outlined" />
                    )}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}

          {selectedTab === 1 && (
            <ImageList cols={3} gap={8} sx={{ maxHeight: 500, overflow: 'auto' }}>
              {(property.images || []).map((image, index) => (
                <ImageListItem 
                  key={index}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => setSelectedImage(`${process.env.REACT_APP_API_URL}/uploads/properties/${image.path}`)}
                >
                  <img
                    src={`${process.env.REACT_APP_API_URL}/uploads/properties/${image.path}`}
                    alt={`${property.name} - View ${index + 1}`}
                    loading="lazy"
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  {image.isMain && (
                    <ImageListItemBar
                      title="Main Image"
                      position="top"
                      sx={{
                        background: 'rgba(0,0,0,0.5)',
                        textAlign: 'center'
                      }}
                    />
                  )}
                </ImageListItem>
              ))}
            </ImageList>
          )}

          {selectedTab === 2 && property.latitude && property.longitude && (
            <Box sx={{ height: 400, width: '100%' }}>
              <MapContainer
                center={[property.latitude, property.longitude]}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[property.latitude, property.longitude]} icon={customMarkerIcon}>
                  <Popup>{property.name}</Popup>
                </Marker>
              </MapContainer>
            </Box>
          )}
        </Box>
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
    <ImageModal
      open={!!selectedImage}
      onClose={() => setSelectedImage(null)}
      imageUrl={selectedImage}
      alt={property.name}
    />
  </Dialog>
);
};

// PropertyCard Component
const PropertyCard = ({ 
  property, 
  onEdit, 
  onDelete, 
  onToggleFavorite, 
  favoriteProperties,
  onViewDetails 
}) => {
  if (!property || !property.id) return null;

  const handleCardClick = (e) => {
    onViewDetails(property);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this property?')) {
      onDelete(property.id);
    }
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    onToggleFavorite(property.id);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(property);
  };

  return (
    <Card 
      className={styles.propertyCard} 
      onClick={handleCardClick}
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: (theme) => theme.shadows[4]
        }
      }}
    >
      <PropertyImageCarousel 
        images={property.images} 
        propertyName={property.name}
        onImageClick={() => onViewDetails(property)}
        enableZoom={false}
      />
    <CardContent className={styles.propertyContent} sx={{ flexGrow: 1 }}>
      <Typography variant="h6" className={styles.propertyTitle}>
        {property.name}
      </Typography>
      <Typography variant="h5" className={styles.propertyPrice} color="primary">
        ${property.rentAmount?.toLocaleString()} / month
      </Typography>
      <Box className={styles.propertyFeatures} sx={{ my: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip icon={<BedroomParentIcon />} label={`${property.bedrooms || 0} Beds`} size="small" />
        <Chip icon={<BathtubIcon />} label={`${property.bathrooms || 0} Baths`} size="small" />
        <Chip icon={<SquareFootIcon />} label={`${property.area || 0} sqft`} size="small" />
      </Box>
      <Typography variant="body2" color="text.secondary">
        {property.description?.substring(0, 100)}...
      </Typography>
    </CardContent>
    <CardActions>
      <IconButton onClick={handleToggleFavorite}>
        {favoriteProperties.includes(property.id) ? 
          <FavoriteIcon color="error" /> : 
          <FavoriteBorderIcon />
        }
      </IconButton>
      <IconButton onClick={handleEdit}>
        <EditIcon />
      </IconButton>
      <IconButton onClick={handleDelete}>
        <DeleteIcon />
      </IconButton>
    </CardActions>
  </Card>
);
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
  setUploadedImages,
  onImageUpload,
  mainImageIndex,
  setMainImageIndex,
  selectedLocation,
  setSelectedLocation
}) => {
  const handleImageDelete = (index) => {
    const newImages = [...uploadedImages];
    // Clean up preview URL if it exists
    if (newImages[index].preview) {
      URL.revokeObjectURL(newImages[index].preview);
    }
    newImages.splice(index, 1);
    setUploadedImages(newImages);
    
    // Adjust mainImageIndex after deletion
    if (index === mainImageIndex) {
      setMainImageIndex(newImages.length > 0 ? 0 : -1);
    } else if (index < mainImageIndex) {
      setMainImageIndex(mainImageIndex - 1);
    }
  };

  const handleMainImageChange = (index) => {
    setMainImageIndex(index);
    
    // Update the isMain property for all images
    const updatedImages = uploadedImages.map((img, idx) => ({
      ...img,
      isMain: idx === index
    }));
    setUploadedImages(updatedImages);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={onSubmit}>
        <DialogTitle>
          <DialogContentText>
            {property ? `Edit Property: ${property.name}` : 'Add New Property'}
          </DialogContentText>
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
        src={image.preview || `${process.env.REACT_APP_API_URL}/uploads/properties/${image.path}`}
        alt={`Property ${index + 1}`}
        loading="lazy"
        style={{ height: '100px', objectFit: 'cover' }}
      />
      <ImageListItemBar
        position="top"
        actionIcon={
          <IconButton
            sx={{ color: 'white' }}
            onClick={() => handleImageDelete(index)}
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
            onChange={() => handleMainImageChange(index)}
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
    <Slider value={filters.bathrooms}
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
  const [selectedImage, setSelectedImage] = useState(null);

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
          propertyType: selectedFilter || undefined
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
  }, [currentPage, searchTerm, sortOrder, filters, selectedFilter]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Event handlers
  const handleViewModeChange = useCallback((_, newMode) => setViewMode(newMode), []);

  const toggleFavorite = useCallback(async (propertyId) => {
    if (!propertyId) {
      console.error('Property ID is undefined');
      return;
    }
    
    try {
      const response = await axiosInstance.post(`/api/properties/favorites/${propertyId}`);
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
  
    setUploadedImages(prev => {
      const updatedImages = [
        ...prev,
        ...files.map(file => ({
          file,
          preview: URL.createObjectURL(file), // For preview only
          isMain: prev.length === 0 && files.length > 0 // Set first image as main if it's the first upload
        }))
      ];
      return updatedImages;
    });
  }, [uploadedImages]);

  const handleAddProperty = async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
  
      // Add files to formData
      uploadedImages.forEach((image, index) => {
        if (image.file) {
          formData.append('images', image.file);
        }
      });
      
      formData.append('mainImageIndex', mainImageIndex.toString());
      
      if (selectedLocation) {
        formData.append('latitude', selectedLocation.lat.toFixed(6));
        formData.append('longitude', selectedLocation.lng.toFixed(6));
      }
  
      const response = await axiosInstance.post('/api/properties', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
  
      // Clean up preview URLs
      uploadedImages.forEach(image => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview);
        }
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
        if (image.file instanceof File) {
          formData.append('images', image.file);
        } else {
          formData.append('existingImages', JSON.stringify({
            ...image,
            isMain: index === mainImageIndex
          }));
        }
      });
      
      formData.append('mainImageIndex', mainImageIndex.toString());

      if (selectedLocation) {
        formData.append('latitude', selectedLocation.lat.toString());
        formData.append('longitude', selectedLocation.lng.toString());
      }

      const propertyId = editingProperty.id;
    const response = await axiosInstance.put(`/api/properties/${propertyId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    setProperties(prev => prev.map(p => 
      p.id === propertyId ? response.data : p
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

  const handleDeleteProperty = useCallback(async (propertyId) => {
    if (!propertyId) {
      console.error('Invalid property ID:', propertyId);
      return;
    }

    try {
      await axiosInstance.delete(`/api/properties/${propertyId}`);
      setProperties(prev => prev.filter(p => p.id !== propertyId));
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
    const mainImageIndex = property.images?.findIndex(img => img.isMain) || 0;
    setMainImageIndex(mainImageIndex);
    setIsAddPropertyModalOpen(true);
  }, [setValue]);

  const handleModalClose = useCallback(() => {
    setIsAddPropertyModalOpen(false);
    setEditingProperty(null);
    reset();
    setUploadedImages([]);
    setMainImageIndex(0);
    setSelectedLocation(null);
  }, [reset]);

  const handlePropertyDetails = useCallback((property) => {
    setQuickViewProperty(property);
  }, []);

  // Render methods
  const renderProperties = () => {
    if (loading) {
      return (
        <Box className={styles.loadingContainer}>
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
              <Grid item key={property.id} xs={12} sm={6} md={4} lg={3}>
                <PropertyCard
                  property={property}
                  onEdit={handleEditProperty}
                  onDelete={handleDeleteProperty}
                  onToggleFavorite={toggleFavorite}
                  favoriteProperties={favoriteProperties}
                  onViewDetails={handlePropertyDetails}
                />
              </Grid>
            ))}
          </Grid>
        );
      case 'list':
        return (
          <List>
            {properties.map((property) => (
              <ListItem
                key={property.id}
                className={styles.listItem}
                onClick={() => handlePropertyDetails(property)}
              >
                <Box sx={{ display: 'flex', width: '100%' }}>
                  <Box className={styles.listItemImage}>
                    <img
                      src={property.images?.[0] ? 
                        `${process.env.REACT_APP_API_URL}/uploads/properties/${property.images[0].path}` :
                        DEFAULT_PROPERTY_IMAGE
                      }
                      alt={property.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_PROPERTY_IMAGE;
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
                        toggleFavorite(property.id);
                      }}>
                        {favoriteProperties.includes(property.id) ? 
                          <FavoriteIcon color="error" /> : 
                          <FavoriteBorderIcon />
                        }
                      </IconButton>
                      <IconButton onClick={(e) => {
                        e.stopPropagation();
                        handleEditProperty(property);}}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProperty(property.id);
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
          <Box className={styles.mapContainer}>
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
                      key={property.id}
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

  return (
    <div className={styles.pageWrapper}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, textAlign: "center" }}>
        Property Listings
      </Typography>
      
      <Paper className={styles.searchFiltersContainer} sx={{ p: 2, mb: 3 }}>
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
        <Box className={styles.paginationContainer}>
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
        className={styles.addPropertyButton}
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
  setUploadedImages={setUploadedImages}
  onImageUpload={handleImageUpload}  // Add this line
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

      <ImageModal
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage}
        alt="Property full view"
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

export default Properties;