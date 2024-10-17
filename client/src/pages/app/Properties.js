import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography, Grid, Box, Card, CardContent, Button, TextField,
  MenuItem, IconButton, InputAdornment, Tooltip, Select, FormControl,
  FormControlLabel, Checkbox, Slider, Dialog, DialogTitle, DialogContent,
  DialogActions, Pagination, Chip, useMediaQuery, Snackbar,
  Alert, CircularProgress, Tabs, Tab, Paper, List, ListItem, ListItemText, Avatar, InputLabel, Rating, CardActions, Drawer, ListItemIcon,
  ImageList, ImageListItem, ImageListItemBar, FormHelperText
} from "@mui/material";
import { useTheme, styled, alpha } from "@mui/material/styles";
import {
  Search as SearchIcon, Sort as SortIcon, FilterList as FilterListIcon,
  Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon,
  BedroomParent as BedroomParentIcon, Bathtub as BathtubIcon,
  SquareFoot as SquareFootIcon, GridView as GridViewIcon, ViewList as ViewListIcon,
  Map as MapIcon, Home as HomeIcon, Edit as EditIcon,
  CheckCircle as CheckCircleIcon, Schedule as ScheduleIcon, Cancel as CancelIcon,
  Delete as DeleteIcon, Add as AddIcon, CloudUpload as CloudUploadIcon,
  NavigateBefore, NavigateNext, CropOriginal
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mapCenter, setMapCenter] = useState([40.7128, -74.006]);
  const [mapZoom, setMapZoom] = useState(13);

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
    setCurrentImageIndex(0);
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

  const LocationPicker = () => {
    const map = useMap();

    useEffect(() => {
      if (selectedLocation) {
        map.flyTo([selectedLocation.lat, selectedLocation.lng], 15);
      }
    }, [map]); // Remove selectedLocation from the dependency array

    useMapEvents({
      click(e) {
        setSelectedLocation(e.latlng);
        map.flyTo(e.latlng, 15); // Move the flyTo here to respond to clicks
      },
    });

    return selectedLocation ? (
      <Marker position={selectedLocation} icon={customMarkerIcon}>
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
      console.log('New property added:', response.data);
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
      setMapCenter([40.7128, -74.006]);
      setMapZoom(13);
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
    console.log("Attempting to edit property:", property);

    if (!property) {
      console.error("Error: property is null or undefined");
      setSnackbar({
        open: true,
        message: "Error: Invalid property data",
        severity: "error"
      });
      return;
    }

    const propertyId = property._id || property.id;

    if (!propertyId) {
      console.error("Error: property is missing identifier", property);
      setSnackbar({
        open: true,
        message: "Error: Property is missing identifier",
        severity: "error"
      });
      return;
    }

    setEditingProperty({ ...property, _id: propertyId });

    // Populate form fields immediately
    const fieldsToSet = [
      'name', 'description', 'rentAmount', 'propertyType',
      'bedrooms', 'bathrooms', 'area', 'furnished',
      'parking', 'petFriendly', 'availableNow'
    ];

    fieldsToSet.forEach(field => {
      console.log(`Setting ${field}:`, property[field]);
      setValue(field, property[field], { shouldValidate: true, shouldDirty: true });
    });

    if (property.latitude && property.longitude) {
      setSelectedLocation({
        lat: parseFloat(property.latitude),
        lng: parseFloat(property.longitude)
      });
      setMapCenter([parseFloat(property.latitude), parseFloat(property.longitude)]);
      setMapZoom(15);
    } else {
      setSelectedLocation(null);
      setMapCenter([40.7128, -74.006]);
      setMapZoom(13);
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

  // Modify the useEffect hook that watches for changes in editingProperty
  useEffect(() => {
    if (isAddPropertyModalOpen) {
      const formValues = control._formValues;
      console.log("Current form values:", formValues);
    }
  }, [isAddPropertyModalOpen, control._formValues]);

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

      console.log("Update response:", response.data);

      // Fetch the updated property data
      const updatedPropertyResponse = await axiosInstance.get(`/api/properties/${propertyId}`);
      const updatedProperty = updatedPropertyResponse.data;

      setProperties(prevProperties =>
        prevProperties.map(p => (p._id || p.id) === propertyId ? updatedProperty : p)
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
      setMapCenter([40.7128, -74.006]);
      setMapZoom(13);
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
      <PropertyCard key={propertyId}>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: 200,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: 'grey.200'
          }}
          onClick={() => handlePropertyDetails(property)}
        >
          <img
            src={imageUrl}
            alt={property.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              console.error('Image failed to load:', imageUrl);
              e.target.onerror = null;
              e.target.src = "/placeholder-property.jpg";
            }}
          />
        </Box>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              height: '2.5em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: '1.25em',
              mb: 1
            }}
          >
            {property.name}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            component="div"
            sx={{
              height: '3em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {property.description}
          </Typography>
          <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
            ${property.rentAmount?.toLocaleString()} / month
          </Typography>
          <StyledRating name={`rating-${propertyId}`} value={property.rating || 0} readOnly size="small" />
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            <Chip icon={<BedroomParentIcon />} label={`${property.bedrooms || 0} Beds`} size="small" />
            <Chip icon={<BathtubIcon />} label={`${property.bathrooms || 0} Baths`} size="small" />
            <Chip icon={<SquareFootIcon />} label={`${property.area || 0} sqft`} size="small" />
          </Box>
        </CardContent>
        <CardActions sx={{ justifyContent: "space-between", p: 1 }}>
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
              console.log("Edit button clicked for property:", property);
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
                  sx={{ mb: 2, border: 1, borderColor: "divider", borderRadius: 2, "&:hover": { backgroundColor: "action.hover" } }}
                  onClick={() => handlePropertyDetails(property)}
                >
                  <Box sx={{ display: 'flex', width: '100%' }}>
                    <Box sx={{ mr: 2 }}>
                      <Avatar
                        src={imageUrl}
                        alt={property.name}
                        variant="rounded"
                        sx={{ width: 100, height: 100 }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/placeholder-property.jpg";
                        }}
                      >
                        {(!mainImage) && <HomeIcon />}
                      </Avatar>
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">{property.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {property.description}
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                        ${property.rentAmount?.toLocaleString()} / month
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <StyledRating name={`rating-${propertyId}`} value={property.rating || 0} readOnly size="small" />
                      </Box>
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
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
            <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: "100%", width: "100%" }}>
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
            </MapContainer>
          </Box>
        );
      default:
        return null;
    }
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
                      ? `${process.env.REACT_APP_API_URL}/uploads/properties/${quickViewProperty.images[currentImageIndex].path}`
                      : "/placeholder-property.jpg"}
                    alt={quickViewProperty.name}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {quickViewProperty.images && quickViewProperty.images.length > 1 && (
                    <>
                      <IconButton
                        sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }}
                        onClick={() => setCurrentImageIndex(prev => (prev - 1 + quickViewProperty.images.length) % quickViewProperty.images.length)}
                      >
                        <NavigateBefore />
                      </IconButton>
                      <IconButton
                        sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
                        onClick={() => setCurrentImageIndex(prev => (prev + 1) % quickViewProperty.images.length)}
                      >
                        <NavigateNext />
                      </IconButton>
                    </>
                  )}
                </Box>
                {quickViewProperty.images && quickViewProperty.images.length > 1 && (
                  <ImageList sx={{ width: '100%', height: 100, mt: 2 }} cols={4} rowHeight={100}>
                    {quickViewProperty.images.map((img, index) => (
                      <ImageListItem key={img.path} onClick={() => setCurrentImageIndex(index)} sx={{ cursor: 'pointer' }}>
                        <img
                          src={`${process.env.REACT_APP_API_URL}/uploads/properties/${img.path}`}
                          alt={`${quickViewProperty.name} - ${index + 1}`}
                          loading="lazy"
                          style={{ objectFit: 'cover', height: '100%' }}
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                )}
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
                  <ListItem>
                    <ListItemIcon>{quickViewProperty.furnished ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}</ListItemIcon>
                    <ListItemText primary={`Furnished: ${quickViewProperty.furnished ? 'Yes' : 'No'}`} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>{quickViewProperty.parking ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}</ListItemIcon>
                    <ListItemText primary={`Parking: ${quickViewProperty.parking ? 'Available' : 'Not Available'}`} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>{quickViewProperty.petFriendly ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}</ListItemIcon>
                    <ListItemText primary={`Pet Friendly: ${quickViewProperty.petFriendly ? 'Yes' : 'No'}`} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>{quickViewProperty.availableNow ? <CheckCircleIcon color="success" /> : <ScheduleIcon />}</ListItemIcon>
                    <ListItemText primary={`Available: ${quickViewProperty.availableNow ? 'Now' : 'Soon'}`} />
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
          setMapCenter([40.7128, -74.006]);
          setMapZoom(13);
        }}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleSubmit(editingProperty ? handleUpdateProperty : handleAddProperty)}>
          <DialogTitle>{editingProperty ? `Edit Property: ${editingProperty._id}` : 'Add New Property'}</DialogTitle>
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
                      value={field.value || ''} // Ensure a value is always provided
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
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="rentAmount"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Rent amount is required', min: { value: 0, message: 'Rent must be positive' } }}
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
                    <FormControl fullWidth error={!!errors.propertyType}>
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
                  rules={{ required: 'Number of bedrooms is required', min: { value: 0, message: 'Bedrooms must be non-negative' } }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Bedrooms"
                      fullWidth
                      type="number"
                      error={!!errors.bedrooms}
                      helperText={errors.bedrooms?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="bathrooms"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Number of bathrooms is required', min: { value: 0, message: 'Bathrooms must be non-negative' } }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Bathrooms"
                      fullWidth
                      type="number"
                      error={!!errors.bathrooms}
                      helperText={errors.bathrooms?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="area"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Area is required', min: { value: 0, message: 'Area must be non-negative' } }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Area (sqft)"
                      fullWidth
                      type="number"
                      error={!!errors.area}
                      helperText={errors.area?.message}
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
                <Typography variant="subtitle1">Property Location</Typography>
                <Box sx={{ height: 300, width: '100%' }}>
                  <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: "100%", width: "100%" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationPicker />
                  </MapContainer>
                </Box>
                {selectedLocation && (
                  <Typography variant="body2">
                    Selected Location: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Property Images</Typography>
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
                            icon={<CropOriginal />}
                            checkedIcon={<CropOriginal color="primary" />}
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
              setMapCenter([40.7128, -74.006]);
              setMapZoom(13);
            }}>Cancel</Button>
            <Button
              type="submit"
              color="primary"
              onClick={() => console.log("Submit button clicked. editingProperty:", editingProperty)}
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
          height: 'calc(100% - 64px)',
          top: 64,
          overflowY: 'auto'
        }
      }}
    >
      <Box sx={{ p: 2 }}>
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