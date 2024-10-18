import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography, Grid, Box, Card, CardContent, Button, TextField,
  MenuItem, IconButton, InputAdornment, Tooltip, Select, FormControl,
  FormControlLabel, Checkbox, Slider, Dialog, DialogTitle, DialogContent,
  DialogActions, Pagination, Chip, useMediaQuery, Snackbar,
  Alert, CircularProgress, Tabs, Tab, Paper, List, ListItem, ListItemText,
  ListItemIcon, InputLabel, Rating, CardActions, Drawer,
  ImageList, ImageListItem, ImageListItemBar, FormHelperText
} from "@mui/material";
import { useTheme, styled, alpha } from "@mui/material/styles";
import {
  Search as SearchIcon, Sort as SortIcon, FilterList as FilterListIcon,
  Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon,
  BedroomParent as BedroomParentIcon, Bathtub as BathtubIcon,
  SquareFoot as SquareFootIcon, GridView as GridViewIcon, ViewList as ViewListIcon,
  Map as MapIcon, Home as HomeIcon, Edit as EditIcon,
  Delete as DeleteIcon, Add as AddIcon, CloudUpload as CloudUploadIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  RadioButtonChecked as RadioButtonCheckedIcon
} from "@mui/icons-material";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axiosInstance from '../../axiosSetup';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Styled components
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

const PropertyImage = styled('img')({
  width: '100%',
  height: '200px',
  objectFit: 'cover',
});

const PropertyContent = styled(CardContent)({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
});

const PropertyTitle = styled(Typography)({
  fontWeight: 'bold',
  marginBottom: '8px',
});

const PropertyPrice = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 'bold',
  marginBottom: '8px',
}));

const PropertyFeatures = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '8px',
});

const StyledRating = styled(Rating)(({ theme }) => ({
  '& .MuiRating-iconFilled': {
    color: theme.palette.secondary.main,
  },
}));

// Custom marker icon
const customMarkerIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

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
      } else if (response.data && Array.isArray(response.data.properties)) {
        setProperties(response.data.properties);
        setTotalPages(response.data.totalPages || 1);
      } else {
        console.error('Unexpected data format:', response.data);
        setProperties([]);
        setTotalPages(1);
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
      console.error('Error toggling favorite:', error.response?.data || error.message);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to update favorites. Please try again.",
        severity: "error",
      });
    }
  }, []);

  const handlePropertyDetails = useCallback((property) => {
    setQuickViewProperty(property);
  }, []);

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    const totalImages = uploadedImages.length + files.length;

    if (totalImages > 16) {
      setSnackbar({
        open: true,
        message: "You can upload a maximum of 16 images per property.",
        severity: "warning"
      });
      return;
    }

    if (totalSize > 200 * 1024 * 1024) {
      setSnackbar({
        open: true,
        message: "Total image size exceeds 200 MB. Please compress your images or choose smaller files.",
        severity: "warning"
      });
      return;
    }

    setUploadedImages(prevImages => [...prevImages, ...files]);
  };

  const handleRemoveImage = (index) => {
    setUploadedImages(prevImages => prevImages.filter((_, i) => i !== index));
    if (index === mainImageIndex) {
      setMainImageIndex(0);
    } else if (index < mainImageIndex) {
      setMainImageIndex(prevIndex => prevIndex - 1);
    }
  };

  const handleSetMainImage = (index) => {
    setMainImageIndex(index);
  };

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

  const handleAddProperty = async (data) => {
    try {
      if (Object.keys(errors).length > 0) {
        const firstErrorField = Object.keys(errors)[0];
        const errorElement = document.getElementById(firstErrorField);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setSnackbar({
          open: true,
          message: "Please fill all required fields correctly",
          severity: "error"
        });
        return;
      }

      const formData = new FormData();
      Object.keys(data).forEach(key => formData.append(key, data[key]));
      uploadedImages.forEach((image, index) => {
        formData.append('images', image);
      });
      formData.append('mainImageIndex', mainImageIndex.toString());
      if (selectedLocation) {
        formData.append('latitude', selectedLocation.lat.toFixed(6));
        formData.append('longitude', selectedLocation.lng.toFixed(6));
      }

      const response = await axiosInstance.post('/api/properties', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProperties(prevProperties => [response.data, ...prevProperties]);
      setSnackbar({
        open: true,
        message: "Property added successfully",
        severity: "success"
      });
      setIsAddPropertyModalOpen(false);
      reset();
      setUploadedImages([]);
      setMainImageIndex(0);
      setSelectedLocation(null);
    } catch (error) {
      console.error('Error adding property:', error.response?.data || error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to add property. Please try again.",
        severity: "error"
      });
    }
  };

  const handleEditProperty = useCallback((property) => {
    setEditingProperty(property);
    const fieldsToSet = [
      'name', 'description', 'rentAmount', 'propertyType',
      'bedrooms', 'bathrooms', 'area', 'furnished',
      'parking', 'petFriendly', 'availableNow'
    ];

    fieldsToSet.forEach(field => {
      setValue(field, property[field], { shouldValidate: true, shouldDirty: true });
    });

    if (property.latitude && property.longitude) {
      setSelectedLocation({
        lat: parseFloat(property.latitude),
        lng: parseFloat(property.longitude)
      });
    } else {
      setSelectedLocation(null);
    }

    if (property.images && Array.isArray(property.images)) {
      setUploadedImages(property.images);
      const mainImageIndex = property.images.findIndex(img => img.isMain);
      setMainImageIndex(mainImageIndex !== -1 ? mainImageIndex : 0);
    } else {
      setUploadedImages([]);
      setMainImageIndex(0);
    }

    setIsAddPropertyModalOpen(true);
  }, [setValue]);

  const handleUpdateProperty = async (data) => {
    try {
      if (Object.keys(errors).length > 0) {
        const firstErrorField = Object.keys(errors)[0];
        const errorElement = document.getElementById(firstErrorField);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setSnackbar({
          open: true,
          message: "Please fill all required fields correctly",
          severity: "error"
        });
        return;
      }

      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      });

      uploadedImages.forEach((image, index) => {
        if (image instanceof File) {
          formData.append('images', image);
        } else {
          formData.append('existingImages', JSON.stringify(image));
        }
        if (index === mainImageIndex) {
          formData.append('mainImageIndex', index.toString());
        }
      });

      if (selectedLocation) {
        formData.append('latitude', selectedLocation.lat.toString());
        formData.append('longitude', selectedLocation.lng.toString());
      }

      const propertyId = editingProperty._id || editingProperty.id;
      const response = await axiosInstance.put(`/api/properties/${propertyId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setProperties(prevProperties =>
        prevProperties.map(p => (p._id || p.id) === propertyId ? response.data : p)
      );

      setSnackbar({
        open: true,
        message: "Property updated successfully",
        severity: "success"
      });

      setIsAddPropertyModalOpen(false);
      setEditingProperty(null);
      reset();
      setUploadedImages([]);
      setMainImageIndex(0);
      setSelectedLocation(null);
    } catch (error) {
      console.error('Error updating property:', error.response?.data || error.message);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to update property. Please try again.",
        severity: "error"
      });
    }
  };

  const handleDeleteProperty = useCallback(async (propertyId) => {
    if (!propertyId) {
      console.error('Invalid property ID');
      setSnackbar({
        open: true,
        message: "Invalid property ID. Cannot delete.",
        severity: "error"
      });
      return;
    }

    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await axiosInstance.delete(`/api/properties/${propertyId}`);
        setProperties(prevProperties => prevProperties.filter(p => p._id !== propertyId));
        setSnackbar({
          open: true,
          message: "Property deleted successfully",
          severity: "success"
        });
        fetchProperties();
      } catch (error) {
        console.error('Error deleting property:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || "Failed to delete property. Please try again.",
          severity: "error"
        });
      }
    }
  }, [fetchProperties]);

  const renderPropertyCard = useCallback((property) => {
    if (!property) return null;
    const propertyId = property._id || property.id;

    const mainImage = property.images && property.images.length > 0
      ? property.images.find(img => img.isMain) || property.images[0]
      : null;

    const imageUrl = mainImage
      ? `${process.env.REACT_APP_API_URL}/uploads/properties/${mainImage.path}`
      : "/placeholder-property.jpg";

    return (
      <PropertyCard>
        <PropertyImage
          src={imageUrl}
          alt={property.name}
          onClick={() => handlePropertyDetails(property)}
        />
        <PropertyContent>
          <PropertyTitle variant="h6">{property.name}</PropertyTitle>
          <PropertyPrice variant="h5">${property.rentAmount?.toLocaleString()} / month</PropertyPrice>
          <PropertyFeatures>
            <Chip icon={<BedroomParentIcon />} label={`${property.bedrooms || 0} Beds`} size="small" />
            <Chip icon={<BathtubIcon />} label={`${property.bathrooms || 0} Baths`} size="small" />
            <Chip icon={<SquareFootIcon />} label={`${property.area || 0} sqft`} size="small" />
          </PropertyFeatures>
          <Typography variant="body2" color="text.secondary">
            {property.description.substring(0, 100)}...
          </Typography>
        </PropertyContent>
        <CardActions>
          <IconButton onClick={() => toggleFavorite(propertyId)}>
            {favoriteProperties.includes(propertyId) ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
          </IconButton>
          <IconButton onClick={() => handleEditProperty(property)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDeleteProperty(propertyId)}>
            <DeleteIcon />
          </IconButton>
        </CardActions>
      </PropertyCard>
    );
  }, [favoriteProperties, toggleFavorite, handleDeleteProperty, handlePropertyDetails, handleEditProperty]);

  const renderProperties = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      );
    }

    if (!properties || properties.length === 0) {
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
              <Grid item key={property._id || property.id} xs={12} sm={6} md={4} lg={3}>
                {renderPropertyCard(property)}
              </Grid>
            ))}
          </Grid>
        );
      case 'list':
        return (
          <List>
            {properties.map((property) => {
              const propertyId = property._id || property.id;
              const mainImage = property.images && property.images.length > 0
                ? property.images.find(img => img.isMain) || property.images[0]
                : null;

              const imageUrl = mainImage
                ? `${process.env.REACT_APP_API_URL}/uploads/properties/${mainImage.path}`
                : "/placeholder-property.jpg";

              return (
                <ListItem
                  key={propertyId}
                  alignItems="flex-start"
                  sx={{
                    mb: 2,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    "&:hover": { backgroundColor: "action.hover" },
                    transition: 'all 0.3s',
                  }}
                  onClick={() => handlePropertyDetails(property)}
                >
                  <Box sx={{ display: 'flex', width: '100%' }}>
                    <Box sx={{ mr: 2, width: 150, height: 150, flexShrink: 0 }}>
                      <img
                        src={imageUrl}
                        alt={property.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: theme.shape.borderRadius }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/placeholder-property.jpg";
                        }}
                      />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>{property.name}</Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {property.description.length > 150
                          ? `${property.description.substring(0, 150)}...`
                          : property.description}
                      </Typography>
                      <Typography variant="h6" color="primary" gutterBottom>
                        ${property.rentAmount?.toLocaleString()} / month
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <StyledRating name={`rating-${propertyId}`} value={property.rating || 0} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          {property.propertyType}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip icon={<BedroomParentIcon />} label={`${property.bedrooms || 0} Beds`} size="small" />
                        <Chip icon={<BathtubIcon />} label={`${property.bathrooms || 0} Baths`} size="small" />
                        <Chip icon={<SquareFootIcon />} label={`${property.area || 0} sqft`} size="small" />
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", ml: 2 }}>
                      <Tooltip title={favoriteProperties.includes(propertyId) ? "Remove from Favorites" : "Add to Favorites"}>
                        <IconButton onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(propertyId);
                        }}>
                          {favoriteProperties.includes(propertyId) ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton onClick={(e) => {
                          e.stopPropagation();
                          handleEditProperty(property);
                        }}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProperty(propertyId);
                        }}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </ListItem>
              );
            })}
          </List>
        );
      case 'map':
        return (
          <Box sx={{ height: 600, width: '100%', borderRadius: theme.shape.borderRadius * 2, overflow: 'hidden', position: 'relative' }}>
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
                      key={property._id || property.id}
                      position={[property.latitude, property.longitude]}
                      icon={customMarkerIcon}
                    >
                      <Popup>
                        <Typography variant="subtitle1">{property.name}</Typography>
                        <Typography variant="body2">${property.rentAmount?.toLocaleString()} / month</Typography>
                        <Button size="small" onClick={() => handlePropertyDetails(property)}>View Details</Button>
                      </Popup>
                    </Marker>
                  );
                }
                return null;
              })}
              <MapBoundsSetter properties={properties} />
            </MapContainer>
          </Box>
        );
      default:
        return null;
    }
  };

  const MapBoundsSetter = ({ properties }) => {
    const map = useMap();

    useEffect(() => {
      if (properties.length > 0) {
        const validLocations = properties
          .filter(p => p.latitude && p.longitude)
          .map(p => [p.latitude, p.longitude]);

        if (validLocations.length > 0) {
          const bounds = L.latLngBounds(validLocations);
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    }, [properties, map]);

    return null;
  };

  const renderQuickViewModal = () => (
    <Dialog
      open={!!quickViewProperty}
      onClose={() => setQuickViewProperty(null)}
      maxWidth="md"
      fullWidth
    >
      {quickViewProperty && (
        <>
          <DialogTitle>{quickViewProperty.name}</DialogTitle>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ position: 'relative', width: '100%', paddingTop: '75%' }}>
                  <img
                    src={quickViewProperty.images && quickViewProperty.images.length > 0
                      ? `${process.env.REACT_APP_API_URL}/uploads/properties/${quickViewProperty.images[0].path}`
                      : "/placeholder-property.jpg"}
                    alt={quickViewProperty.name}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" color="primary">${quickViewProperty.rentAmount?.toLocaleString()} / month</Typography>
                <Typography variant="body1" paragraph>{quickViewProperty.description}</Typography>
                <Typography variant="subtitle1">Property Details:</Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><BedroomParentIcon /></ListItemIcon>
                    <ListItemText primary={`${quickViewProperty.bedrooms || 0} Bedrooms`} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><BathtubIcon /></ListItemIcon>
                    <ListItemText primary={`${quickViewProperty.bathrooms || 0} Bathrooms`} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><SquareFootIcon /></ListItemIcon>
                    <ListItemText primary={`${quickViewProperty.area || 0} sqft`} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><HomeIcon /></ListItemIcon>
                    <ListItemText primary={`Type: ${quickViewProperty.propertyType}`} />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setQuickViewProperty(null)}>Close</Button>
            <Button onClick={() => {
              handleEditProperty(quickViewProperty);
              setQuickViewProperty(null);
            }} color="primary">Edit Property</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );

  const renderAddEditPropertyModal = () => {
    return (
      <Dialog
        open={isAddPropertyModalOpen}
        onClose={() => {
          setIsAddPropertyModalOpen(false);
          setEditingProperty(null);
          reset();
          setUploadedImages([]);
          setMainImageIndex(0);
          setSelectedLocation(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleSubmit(editingProperty ? handleUpdateProperty : handleAddProperty)}>
          <DialogTitle>{editingProperty ? `Edit Property: ${editingProperty.name}` : 'Add New Property'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="name"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Property name is required' }}
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
                  rules={{ required: 'Description is required' }}
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
                  rules={{ required: 'Rent amount is required' }}
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
                  rules={{ required: 'Property type is required' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.propertyType} margin="normal">
                      <InputLabel>Property Type</InputLabel>
                      <Select {...field} label="Property Type">
                        {["Apartment", "House", "Condo", "Townhouse"].map((type) => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                      {errors.propertyType && <FormHelperText>{errors.propertyType.message}</FormHelperText>}
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="bedrooms"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Number of bedrooms is required' }}
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
                  rules={{ required: 'Number of bathrooms is required' }}
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
                  rules={{ required: 'Area is required' }}
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
                <FormControlLabel
                  control={
                    <Controller
                      name="furnished"
                      control={control}
                      defaultValue={false}
                      render={({ field }) => <Checkbox {...field} checked={field.value} />}
                    />
                  }
                  label="Furnished"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Controller
                      name="parking"
                      control={control}
                      defaultValue={false}
                      render={({ field }) => <Checkbox {...field} checked={field.value} />}
                    />
                  }
                  label="Parking Available"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Controller
                      name="petFriendly"
                      control={control}
                      defaultValue={false}
                      render={({ field }) => <Checkbox {...field} checked={field.value} />}
                    />
                  }
                  label="Pet Friendly"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Controller
                      name="availableNow"
                      control={control}
                      defaultValue={true}
                      render={({ field }) => <Checkbox {...field} checked={field.value} />}
                    />
                  }
                  label="Available Now"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Property Location</Typography>
                <Box sx={{ height: 300, width: '100%', marginBottom: 2 }}>
                  <MapContainer center={[0, 0]} zoom={2} style={{ height: "100%", width: "100%" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationPicker onLocationSelect={setSelectedLocation} />
                  </MapContainer>
                </Box>
                {selectedLocation && (
                  <Typography variant="body2">
                    Selected Location: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Property Images</Typography>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="raised-button-file"
                  multiple
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="raised-button-file">
                  <Button variant="contained" component="span" startIcon={<CloudUploadIcon />}>
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
                        src={image instanceof File ? URL.createObjectURL(image) : `${process.env.REACT_APP_API_URL}/uploads/properties/${image.path}`}
                        alt={`Uploaded ${index + 1}`}
                        loading="lazy"
                        style={{ objectFit: 'cover', height: '100%' }}
                      />
                      <ImageListItemBar
                        position="top"
                        actionIcon={
                          <IconButton
                            sx={{ color: 'white' }}
                            onClick={() => handleRemoveImage(index)}
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
                            onChange={() => handleSetMainImage(index)}
                            icon={<RadioButtonUncheckedIcon />}
                            checkedIcon={<RadioButtonCheckedIcon />}
                          />
                        }
                        actionPosition="left"
                        title="Set as main image"
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setIsAddPropertyModalOpen(false);
              setEditingProperty(null);
              reset();
              setUploadedImages([]);
              setMainImageIndex(0);
              setSelectedLocation(null);
            }}>Cancel</Button>
            <Button
              type="submit"
              color="primary"
              variant="contained"
            >
              {editingProperty ? 'Update' : 'Add'} Property
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  };

  const renderAdvancedFilterDrawer = () => (
    <Drawer
      anchor="right"
      open={isAdvancedFilterOpen}
      onClose={() => setIsAdvancedFilterOpen(false)}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 300 },
          padding: theme.spacing(2),
        }
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
        onClick={() => {
          setIsAdvancedFilterOpen(false);
          fetchProperties();
        }}
        sx={{ mt: 2 }}
      >
        Apply Filters
      </Button>
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
        onClick={() => {
          setEditingProperty(null);
          setIsAddPropertyModalOpen(true);
        }}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        Add Property
      </Button>

      {renderAdvancedFilterDrawer()}
      {renderQuickViewModal()}
      {renderAddEditPropertyModal()}

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

export default React.memo(Properties);