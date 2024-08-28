import React, { useState, useMemo } from "react";
import {
  Typography,
  Grid,
  Box,
  Card,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Avatar,
  InputAdornment,
  Tooltip,
  Divider,
  Select,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Pagination,
} from "@mui/material";
import {
  AddCircle as AddCircleIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  FilterList as FilterListIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBackIos as ArrowBackIosIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  UploadFile as UploadFileIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import moment from "moment";
import "leaflet/dist/leaflet.css";
import { styled } from "@mui/system";

const defaultIcon = new L.Icon({
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const PageWrapper = (props) => (
  <Box
    sx={{
      p: { xs: 2, md: 3 },
      bgcolor: "background.default",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}
    {...props}
  />
);

const PropertyCard = (props) => (
  <Card
    sx={{
      width: "100%",
      maxWidth: 400,
      p: 2,
      mb: 2,
      cursor: "pointer",
      textAlign: "center",
      boxShadow: 3,
      transition: "0.3s",
      "&:hover": { boxShadow: 6, transform: "translateY(-4px)" },
    }}
    {...props}
  />
);

const PropertyImageWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
  width: "100%",
  height: 180,
}));

const PropertyImage = styled(Avatar)(({ theme }) => ({
  width: 128,
  height: 128,
  borderRadius: "8px",
}));

const ArrowButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 1,
  color: theme.palette.primary.main,
}));

const Properties = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("nameAsc");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    rentAmount: [1000, 5000],
    bedrooms: [1, 5],
    bathrooms: [1, 3],
    area: [500, 5000],
    furnished: false,
    parking: false,
  });
  const [newProperty, setNewProperty] = useState({
    name: "",
    description: "",
    rentAmount: "",
    area: "",
    bedrooms: "",
    bathrooms: "",
    furnished: false,
    parking: false,
    renterName: "",
    contractStartDate: "",
    contractEndDate: "",
    location: "",
    images: [],
    mainImage: null,
  });
  const propertiesPerPage = 9;

  const filteredProperties = useMemo(() => {
    return propertiesData
      .filter(
        ({ name, description, rentAmount, propertyType, additionalInfo }) =>
          (name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            description.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (!selectedFilter || propertyType === selectedFilter) &&
          rentAmount >= filters.rentAmount[0] &&
          rentAmount <= filters.rentAmount[1] &&
          additionalInfo.bedrooms >= filters.bedrooms[0] &&
          additionalInfo.bedrooms <= filters.bedrooms[1] &&
          additionalInfo.bathrooms >= filters.bathrooms[0] &&
          additionalInfo.bathrooms <= filters.bathrooms[1] &&
          additionalInfo.area >= filters.area[0] &&
          additionalInfo.area <= filters.area[1] &&
          (!filters.furnished || additionalInfo.furnished) &&
          (!filters.parking || additionalInfo.parking)
      )
      .sort((a, b) => {
        const sortOptions = {
          nameAsc: () => a.name.localeCompare(b.name),
          nameDesc: () => b.name.localeCompare(a.name),
          priceAsc: () => a.rentAmount - b.rentAmount,
          priceDesc: () => b.rentAmount - a.rentAmount,
          dateAsc: () => new Date(a.establishmentDate) - new Date(b.establishmentDate),
          dateDesc: () => new Date(b.establishmentDate) - new Date(a.establishmentDate),
        };
        return sortOptions[sortOrder]();
      });
  }, [searchTerm, selectedFilter, sortOrder, filters]);

  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * propertiesPerPage,
    currentPage * propertiesPerPage
  );
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);

  const handlePageChange = (_, value) => setCurrentPage(value);

  const handleFilterChange = (name) => (_, newValue) =>
    setFilters({ ...filters, [name]: newValue });
  const handleCheckboxChange = ({ target }) =>
    setFilters({ ...filters, [target.name]: target.checked });

  const handleNewPropertyChange = ({ target }) =>
    setNewProperty({ ...newProperty, [target.name]: target.value });
  const handleImageUpload = ({ target }) => {
    const files = Array.from(target.files);
    setNewProperty((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
      mainImage: prev.mainImage || files[0],
    }));
  };

  const handleMainImageSelect = (index) =>
    setNewProperty((prev) => ({ ...prev, mainImage: prev.images[index] }));
  const handleDeleteImage = (index) =>
    setNewProperty((prev) => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages,
        mainImage: prev.mainImage === prev.images[index] ? newImages[0] || null : prev.mainImage,
      };
    });

  const handleSaveProperty = () => setSelectedProperty(null);

  const [imageIndex, setImageIndex] = useState(0);

  const handleNextImage = (imagesLength, event) => {
    event.stopPropagation(); // Prevent propagation to parent elements
    setImageIndex((prev) => (prev + 1) % imagesLength);
  };

  const handlePrevImage = (imagesLength, event) => {
    event.stopPropagation(); // Prevent propagation to parent elements
    setImageIndex((prev) => (prev - 1 + imagesLength) % imagesLength);
  };

  return (
    <PageWrapper>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, textAlign: "center" }}>
        Property Listings
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm="auto">
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleIcon />}
            onClick={() => setSelectedProperty({ add: true })}
            fullWidth
          >
            Add New Property
          </Button>
        </Grid>
        <Grid item xs={12} sm="auto">
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FilterListIcon />}
            onClick={() => setFilterDialogOpen(true)}
            fullWidth
          >
            Filter
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box display="flex" justifyContent={{ xs: "flex-start", sm: "flex-end" }}>
            <FormControl variant="outlined" size="small" fullWidth>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                displayEmpty
                startAdornment={
                  <InputAdornment position="start">
                    <SortIcon />
                  </InputAdornment>
                }
              >
                {[
                  "Name (A-Z)",
                  "Name (Z-A)",
                  "Price: Lowest First",
                  "Price: Highest First",
                  "Date: Oldest First",
                  "Date: Newest First",
                ].map((label, index) => (
                  <MenuItem
                    key={label}
                    value={[
                      "nameAsc",
                      "nameDesc",
                      "priceAsc",
                      "priceDesc",
                      "dateAsc",
                      "dateDesc",
                    ][index]}
                  >
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box display="flex" justifyContent={{ xs: "flex-start", sm: "flex-end" }}>
            <TextField
              variant="outlined"
              placeholder="Search Properties"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ maxWidth: "250px", width: "100%" }}
            />
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={3} justifyContent="center" mt={4}>
        {paginatedProperties.length > 0 ? (
          paginatedProperties.map((property) => (
            <Grid
              item
              key={property.id}
              xs={12}
              sm={6}
              md={4}
              display="flex"
              justifyContent="center"
            >
              <PropertyCard onClick={() => setSelectedProperty(property)}>
                <PropertyImageWrapper>
                  <ArrowButton
                    onClick={(e) => handlePrevImage(property.images.length, e)}
                    sx={{ left: 0 }}
                  >
                    <ArrowBackIosIcon />
                  </ArrowButton>
                  <PropertyImage
                    src={property.images[imageIndex]}
                    alt={property.name}
                  />
                  <ArrowButton
                    onClick={(e) => handleNextImage(property.images.length, e)}
                    sx={{ right: 0 }}
                  >
                    <ArrowForwardIosIcon />
                  </ArrowButton>
                </PropertyImageWrapper>
                <Typography variant="h6" gutterBottom>
                  {property.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {property.description}
                </Typography>
                <Typography variant="body2" color="textSecondary" mt={1}>
                  ${property.rentAmount} / month
                </Typography>
                <Divider sx={{ margin: 2, width: "100%" }} />
                <Box
                  display="flex"
                  justifyContent="space-between"
                  width="100%"
                  mt={1}
                  alignItems="center"
                >
                  <Tooltip title="Edit Property">
                    <IconButton sx={{ transform: "scale(1.25)" }}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Property">
                    <IconButton sx={{ transform: "scale(1.25)" }}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </PropertyCard>
            </Grid>
          ))
        ) : (
          <Typography variant="body1" color="textSecondary">
            No properties found.
          </Typography>
        )}
      </Grid>

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {selectedProperty && (
        <Dialog
          open={!!selectedProperty}
          onClose={() => setSelectedProperty(null)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            {selectedProperty.add ? "Add New Property" : selectedProperty.name}
          </DialogTitle>
          <DialogContent>
            {selectedProperty.add ? (
              <Box component="form">
                {[
                  "name",
                  "description",
                  "rentAmount",
                  "area",
                  "bedrooms",
                  "bathrooms",
                  "renterName",
                  "contractStartDate",
                  "contractEndDate",
                  "location",
                ].map((field) => (
                  <TextField
                    fullWidth
                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                    margin="normal"
                    variant="outlined"
                    required
                    name={field}
                    value={newProperty[field]}
                    onChange={handleNewPropertyChange}
                    type={field.includes("Date") ? "date" : "text"}
                    InputLabelProps={
                      field.includes("Date") ? { shrink: true } : undefined
                    }
                    key={field}
                  />
                ))}
                <FormGroup row sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={newProperty.furnished}
                        onChange={(e) =>
                          setNewProperty((prev) => ({
                            ...prev,
                            furnished: e.target.checked,
                          }))
                        }
                      />
                    }
                    label="Furnished"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={newProperty.parking}
                        onChange={(e) =>
                          setNewProperty((prev) => ({
                            ...prev,
                            parking: e.target.checked,
                          }))
                        }
                      />
                    }
                    label="Parking Available"
                  />
                </FormGroup>
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<UploadFileIcon />}
                  sx={{ mt: 2 }}
                >
                  Upload Images
                  <input
                    type="file"
                    hidden
                    multiple
                    onChange={handleImageUpload}
                  />
                </Button>
                {newProperty.images.length > 0 && (
                  <Box
                    display="flex"
                    justifyContent="space-around"
                    flexWrap="wrap"
                    mt={2}
                  >
                    {newProperty.images.map((image, index) => (
                      <Box key={index} position="relative">
                        <PropertyImage
                          src={URL.createObjectURL(image)}
                          alt={`Image ${index + 1}`}
                        />
                        <Tooltip title="Set as Main Image">
                          <IconButton
                            onClick={() => handleMainImageSelect(index)}
                            sx={{
                              position: "absolute",
                              top: 0,
                              right: 0,
                              bgcolor:
                                newProperty.mainImage === image
                                  ? "primary.main"
                                  : "rgba(0,0,0,0.5)",
                              color: "white",
                              "&:hover": { bgcolor: "primary.main" },
                            }}
                          >
                            <ImageIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Image">
                          <IconButton
                            onClick={() => handleDeleteImage(index)}
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              bgcolor: "error.main",
                              color: "white",
                              "&:hover": { bgcolor: "error.dark" },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            ) : (
              <>
                <Typography variant="h6" gutterBottom>
                  Details
                </Typography>
                <List>
                  {[
                    "description",
                    "establishmentDate",
                    "contractStartDate",
                    "contractEndDate",
                  ].map((field, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={field.charAt(0).toUpperCase() + field.slice(1)}
                        secondary={
                          field.includes("Date")
                            ? moment(selectedProperty[field]).format("LL")
                            : selectedProperty[field]
                        }
                      />
                    </ListItem>
                  ))}
                  <ListItem>
                    <ListItemText
                      primary="Renter Information"
                      secondary={
                        <>
                          <Typography component="span">
                            Name: {selectedProperty.renter.name}
                          </Typography>
                          <Typography component="span">
                            Email: {selectedProperty.renter.contact}
                          </Typography>
                          <Typography component="span">
                            Phone: {selectedProperty.renter.phone}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {["area", "bedrooms", "bathrooms"].map((field, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={field.charAt(0).toUpperCase() + field.slice(1)}
                        secondary={selectedProperty.additionalInfo[field]}
                      />
                    </ListItem>
                  ))}
                  {["furnished", "parking"].map((field, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={field.charAt(0).toUpperCase() + field.slice(1)}
                        secondary={
                          selectedProperty.additionalInfo[field] ? "Yes" : "No"
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                {selectedProperty.location && (
                  <MapContainer
                    center={selectedProperty.location}
                    zoom={13}
                    scrollWheelZoom={false}
                    style={{ height: "300px", width: "100%", borderRadius: "8px" }}
                    attributionControl={false}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={selectedProperty.location} icon={defaultIcon}>
                      <Popup>{selectedProperty.name}</Popup>
                    </Marker>
                  </MapContainer>
                )}
                <Typography variant="h6" gutterBottom>
                  Images
                </Typography>
                <Box display="flex" justifyContent="space-around" flexWrap="wrap">
                  {selectedProperty.images.map((image, index) => (
                    <PropertyImage key={index} src={image} alt={`Image ${index + 1}`} />
                  ))}
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedProperty(null)} color="primary">
              {selectedProperty.add ? "Cancel" : "Close"}
            </Button>
            {selectedProperty.add && (
              <Button color="primary" variant="contained" onClick={handleSaveProperty}>
                Save
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}

      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Filter Properties</DialogTitle>
        <DialogContent>
          <Box p={3}>
            <FormGroup>
              <Typography variant="subtitle1">Property Type</Typography>
              <FormControl variant="outlined" size="small" fullWidth sx={{ mb: 2 }}>
                <Select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  displayEmpty
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterListIcon />
                    </InputAdornment>
                  }
                >
                  {[
                    "All Types",
                    "Villa",
                    "Retreat",
                    "Apartment",
                    "Condo",
                    "House",
                    "Bungalow",
                    "Loft",
                    "Cabin",
                    "Penthouse",
                  ].map((type, index) => (
                    <MenuItem key={index} value={type === "All Types" ? "" : type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {["Rent Amount ($)", "Bedrooms", "Bathrooms", "Area (sqft)"].map(
                (label, index) => (
                  <React.Fragment key={index}>
                    <Typography variant="subtitle1">{label}</Typography>
                    <Slider
                      value={filters[label.toLowerCase().replace(/[^a-z]/gi, "")]}
                      onChange={handleFilterChange(
                        label.toLowerCase().replace(/[^a-z]/gi, "")
                      )}
                      valueLabelDisplay="auto"
                      min={label.includes("Rent") ? 500 : 1}
                      max={
                        label.includes("Rent")
                          ? 10000
                          : label.includes("Area")
                          ? 10000
                          : 10
                      }
                      sx={{ mb: 2 }}
                    />
                  </React.Fragment>
                )
              )}

              {["furnished", "parking"].map((label, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      checked={filters[label]}
                      onChange={handleCheckboxChange}
                      name={label}
                    />
                  }
                  label={label.charAt(0).toUpperCase() + label.slice(1)}
                />
              ))}
            </FormGroup>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => setFilterDialogOpen(false)}
            color="primary"
            variant="contained"
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
    </PageWrapper>
  );
};

const propertiesData = [
  {
    id: 1,
    name: "Sunset Villa",
    description: "A beautiful villa with a sunset view.",
    establishmentDate: "2015-06-15",
    contractStartDate: "2022-01-01",
    contractEndDate: "2023-01-01",
    renter: {
      name: "John Doe",
      contact: "john.doe@example.com",
      phone: "123-456-7890",
    },
    location: [51.505, -0.09],
    images: Array(3).fill("https://via.placeholder.com/150"),
    propertyType: "Villa",
    rentAmount: 2500,
    additionalInfo: {
      area: 2000,
      bedrooms: 3,
      bathrooms: 2,
      furnished: true,
      parking: true,
    },
  },
  {
    id: 2,
    name: "Mountain Retreat",
    description: "A cozy retreat in the mountains.",
    establishmentDate: "2010-09-12",
    contractStartDate: "2021-05-15",
    contractEndDate: "2022-05-15",
    renter: {
      name: "Jane Smith",
      contact: "jane.smith@example.com",
      phone: "987-654-3210",
    },
    location: [51.515, -0.1],
    images: Array(3).fill("https://via.placeholder.com/150"),
    propertyType: "Retreat",
    rentAmount: 1500,
    additionalInfo: {
      area: 1500,
      bedrooms: 2,
      bathrooms: 1,
      furnished: false,
      parking: false,
    },
  },
  {
    id: 3,
    name: "City Apartment",
    description: "A modern apartment in the city center.",
    establishmentDate: "2018-01-20",
    contractStartDate: "2022-03-01",
    contractEndDate: "2023-03-01",
    renter: {
      name: "Alice Brown",
      contact: "alice.brown@example.com",
      phone: "555-666-7777",
    },
    location: [51.525, -0.11],
    images: Array(3).fill("https://via.placeholder.com/150"),
    propertyType: "Apartment",
    rentAmount: 2000,
    additionalInfo: {
      area: 1000,
      bedrooms: 1,
      bathrooms: 1,
      furnished: true,
      parking: true,
    },
  },
  {
    id: 4,
    name: "Beachfront Condo",
    description: "A luxurious condo with direct beach access.",
    establishmentDate: "2016-04-10",
    contractStartDate: "2022-07-01",
    contractEndDate: "2023-07-01",
    renter: {
      name: "Chris Green",
      contact: "chris.green@example.com",
      phone: "234-567-8901",
    },
    location: [34.0219, -118.4814],
    images: Array(3).fill("https://via.placeholder.com/150"),
    propertyType: "Condo",
    rentAmount: 3000,
    additionalInfo: {
      area: 1500,
      bedrooms: 2,
      bathrooms: 2,
      furnished: true,
      parking: true,
    },
  },
  {
    id: 5,
    name: "Country House",
    description: "A peaceful house in the countryside.",
    establishmentDate: "2005-03-20",
    contractStartDate: "2021-09-01",
    contractEndDate: "2022-09-01",
    renter: {
      name: "Rebecca White",
      contact: "rebecca.white@example.com",
      phone: "321-654-0987",
    },
    location: [40.7128, -74.006],
    images: Array(3).fill("https://via.placeholder.com/150"),
    propertyType: "House",
    rentAmount: 1800,
    additionalInfo: {
      area: 2500,
      bedrooms: 4,
      bathrooms: 3,
      furnished: false,
      parking: true,
    },
  },
  {
    id: 6,
    name: "Suburban Bungalow",
    description: "A charming bungalow in a quiet suburb.",
    establishmentDate: "2012-11-05",
    contractStartDate: "2022-06-15",
    contractEndDate: "2023-06-15",
    renter: {
      name: "Michael Blue",
      contact: "michael.blue@example.com",
      phone: "456-789-0123",
    },
    location: [37.7749, -122.4194],
    images: Array(3).fill("https://via.placeholder.com/150"),
    propertyType: "Bungalow",
    rentAmount: 2200,
    additionalInfo: {
      area: 1800,
      bedrooms: 3,
      bathrooms: 2,
      furnished: true,
      parking: true,
    },
  },
  {
    id: 7,
    name: "Urban Loft",
    description: "A stylish loft in the heart of the city.",
    establishmentDate: "2019-02-18",
    contractStartDate: "2022-12-01",
    contractEndDate: "2023-12-01",
    renter: {
      name: "Laura Black",
      contact: "laura.black@example.com",
      phone: "789-012-3456",
    },
    location: [40.73061, -73.935242],
    images: Array(3).fill("https://via.placeholder.com/150"),
    propertyType: "Loft",
    rentAmount: 2800,
    additionalInfo: {
      area: 1400,
      bedrooms: 1,
      bathrooms: 1,
      furnished: true,
      parking: false,
    },
  },
  {
    id: 8,
    name: "Lakeview Cabin",
    description: "A cozy cabin with a stunning lake view.",
    establishmentDate: "2010-08-14",
    contractStartDate: "2021-04-01",
    contractEndDate: "2022-04-01",
    renter: {
      name: "Daniel Grey",
      contact: "daniel.grey@example.com",
      phone: "654-321-987",
    },
    location: [46.8523, -121.7603],
    images: Array(3).fill("https://via.placeholder.com/150"),
    propertyType: "Cabin",
    rentAmount: 1600,
    additionalInfo: {
      area: 1300,
      bedrooms: 2,
      bathrooms: 1,
      furnished: false,
      parking: true,
    },
  },
  {
    id: 9,
    name: "Downtown Penthouse",
    description: "A luxurious penthouse in the downtown area.",
    establishmentDate: "2020-01-15",
    contractStartDate: "2022-11-01",
    contractEndDate: "2023-11-01",
    renter: {
      name: "Sophia Brown",
      contact: "sophia.brown@example.com",
      phone: "987-654-321",
    },
    location: [34.0522, -118.2437],
    images: Array(3).fill("https://via.placeholder.com/150"),
    propertyType: "Penthouse",
    rentAmount: 5000,
    additionalInfo: {
      area: 2500,
      bedrooms: 3,
      bathrooms: 3,
      furnished: true,
      parking: true,
    },
  },
  {
    id: 10,
    name: "Eco-friendly House",
    description: "A sustainable house with eco-friendly features.",
    establishmentDate: "2017-05-12",
    contractStartDate: "2021-08-01",
    contractEndDate: "2022-08-01",
    renter: {
      name: "Emma Green",
      contact: "emma.green@example.com",
      phone: "123-789-456",
    },
    location: [36.7783, -119.4179],
    images: Array(3).fill("https://via.placeholder.com/150"),
    propertyType: "House",
    rentAmount: 3200,
    additionalInfo: {
      area: 2200,
      bedrooms: 4,
      bathrooms: 2,
      furnished: true,
      parking: true,
    },
  },
  // 10 more properties
  {
    id: 11,
    name: "Seaside Villa",
    description: "A villa with a beautiful view of the sea.",
    establishmentDate: "2014-07-10",
    contractStartDate: "2022-02-01",
    contractEndDate: "2023-02-01",
    renter: {
      name: "William Brown",
      contact: "william.brown@example.com",
      phone: "234-567-891",
    },
    location: [36.7783, -119.4179],
    images: Array(3).fill("https://via.placeholder.com/150"),
    propertyType: "Villa",
    rentAmount: 4500,
    additionalInfo: {
      area: 3000,
      bedrooms: 4,
      bathrooms: 3,
      furnished: true,
      parking: true,
    },
  },
  {
    id: 12,
    name: "Desert Oasis",
    description: "A peaceful retreat in the desert.",
    establishmentDate: "2013-03-12",
    contractStartDate: "2021-05-01",
    contractEndDate: "2022-05-01",
    renter: {
      name: "Olivia Davis",
      contact: "olivia.davis@example.com",
      phone: "987-123-456",
    },
    location: [33.7488, -116.2309],
    images: Array(3).fill("https://via.placeholder.com/150"),
    propertyType: "Retreat",
    rentAmount: 2300,
    additionalInfo: {
      area: 2000,
      bedrooms: 3,
      bathrooms: 2,
      furnished: true,
      parking: true,
    },
  },
  {
    id: 13,
    name: "Urban Penthouse",
    description: "A luxurious penthouse in the heart of the city.",
    establishmentDate: "2019-11-22",
    contractStartDate: "2023-01-01",
    contractEndDate: "2024-01-01",
    renter: {
      name: "Sophia Smith",
      contact: "sophia.smith@example.com",
      phone: "321-654-098",
    },
    location: [40.7128, -74.006],
    images: Array(3).fill("https://via.placeholder.com/150"),
    propertyType: "Penthouse",
    rentAmount: 8000,
    additionalInfo: {
      area: 3500,
      bedrooms: 5,
      bathrooms: 4,
      furnished: true,
      parking: true,
    },
  },
  {
    id: 14,
    name: "Country Villa",
    description: "A large villa in the countryside.",
    establishmentDate: "2016-04-22",
    contractStartDate: "2022-09-01",
    contractEndDate: "2023-09-01",
    renter: {
      name: "James Wilson",
      contact: "james.wilson@example.com",
      phone: "123-789-456",
    },
    location: [34.0522, -118.2437],
    images: Array(3).fill("https://via.placeholder.com/150"),
    propertyType: "Villa",
    rentAmount: 3500,
    additionalInfo: {
      area: 3000,
      bedrooms: 4,
      bathrooms: 3,
      furnished: true,
      parking: true,
    },
  },
  {
    id: 15,
    name: "Beachside Bungalow",
    description: "A cozy bungalow by the beach.",
    establishmentDate: "2018-08-12",
    contractStartDate: "2022-12-01",
    contractEndDate: "2023-12-01",
    renter: {
      name: "Emily Clark",
      contact: "emily.clark@example.com",
      phone: "654-321-987",
    },
    location: [34.0195, -118.4912],
    images: Array(3).fill("https://via.placeholder.com/150"),
    propertyType: "Bungalow",
    rentAmount: 2700,
    additionalInfo: {
      area: 1800,
      bedrooms: 2,
      bathrooms: 2,
      furnished: true,
      parking: true,
    },
  },
  {
    id: 16,
    name: "City Loft",
    description: "A modern loft in the downtown area.",
    establishmentDate: "2020-05-15",
    contractStartDate: "2023-03-01",
    contractEndDate: "2024-03-01",
    renter: {
      name: "Isabella Moore",
      contact: "isabella.moore@example.com",
      phone: "789-456-123",
    },
    location: [40.73061, -73.935242],
    images: Array(3).fill("https://via.placeholder.com/150"),
    propertyType: "Loft",
    rentAmount: 3200,
    additionalInfo: {
      area: 1500,
      bedrooms: 2,
      bathrooms: 2,
      furnished: true,
      parking: false,
    },
  },
  {
    id: 17,
    name: "Mountain Lodge",
    description: "A lodge with a stunning mountain view.",
    establishmentDate: "2012-12-25",
    contractStartDate: "2021-09-01",
    contractEndDate: "2022-09-01",
    renter: {
      name: "Liam Martinez",
      contact: "liam.martinez@example.com",
      phone: "456-789-012",
    },
    location: [51.0447, -114.0719],
    images: Array(3).fill("https://via.placeholder.com/150"),
    propertyType: "Lodge",
    rentAmount: 1800,
    additionalInfo: {
      area: 2500,
      bedrooms: 3,
      bathrooms: 3,
      furnished: true,
      parking: true,
    },
  },
  {
    id: 18,
    name: "Forest Cabin",
    description: "A secluded cabin in the forest.",
    establishmentDate: "2011-09-10",
    contractStartDate: "2021-11-01",
    contractEndDate: "2022-11-01",
    renter: {
      name: "Ella Rodriguez",
      contact: "ella.rodriguez@example.com",
      phone: "321-987-654",
    },
    location: [34.0522, -118.2437],
    images: Array(3).fill("https://via.placeholder.com/150"),
    propertyType: "Cabin",
    rentAmount: 1400,
    additionalInfo: {
      area: 1200,
      bedrooms: 2,
      bathrooms: 1,
      furnished: false,
      parking: true,
    },
  },
  {
    id: 19,
    name: "Lakeside Retreat",
    description: "A retreat with a stunning lake view.",
    establishmentDate: "2017-07-04",
    contractStartDate: "2022-08-01",
    contractEndDate: "2023-08-01",
    renter: {
      name: "Mason Lee",
      contact: "mason.lee@example.com",
      phone: "456-123-789",
    },
    location: [34.0522, -118.2437],
    images: Array(3).fill("https://via.placeholder.com/150"),
    propertyType: "Retreat",
    rentAmount: 2900,
    additionalInfo: {
      area: 2200,
      bedrooms: 3,
      bathrooms: 2,
      furnished: true,
      parking: true,
    },
  },
  {
    id: 20,
    name: "Oceanfront Mansion",
    description: "A luxurious mansion with oceanfront views.",
    establishmentDate: "2021-06-01",
    contractStartDate: "2023-05-01",
    contractEndDate: "2024-05-01",
    renter: {
      name: "Sophia White",
      contact: "sophia.white@example.com",
      phone: "789-654-321",
    },
    location: [34.0219, -118.4814],
    images: Array(3).fill("https://via.placeholder.com/150"),
    propertyType: "Mansion",
    rentAmount: 12000,
    additionalInfo: {
      area: 5000,
      bedrooms: 6,
      bathrooms: 5,
      furnished: true,
      parking: true,
    },
  },
];

export default Properties;
