import React, { useState, useMemo, useCallback } from "react";
import {
  Typography, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, TextField, InputAdornment, FormControl, InputLabel, Select,
  MenuItem, Pagination, Snackbar, Alert, Grid, Chip, LinearProgress,
  useTheme, useMediaQuery, Menu, Tabs, Tab, Paper
} from "@mui/material";
import {
  AddCircle as AddCircleIcon, Delete as DeleteIcon, Download as DownloadIcon,
  Search as SearchIcon, Sort as SortIcon, Image as ImageIcon,
  Description as DescriptionIcon, PictureAsPdf as PdfIcon,
  InsertDriveFile as FileIcon, MoreVert as MoreVertIcon,
  CloudUpload as CloudUploadIcon, Edit as EditIcon,
  Star as StarIcon, StarBorder as StarBorderIcon
} from "@mui/icons-material";
import { styled } from "@mui/system";
import moment from "moment";

const DocumentPreview = styled(Box)(({ theme }) => ({
  width: '100%',
  height: 200,
  backgroundColor: theme.palette.grey[200],
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
}));

const MAX_TOTAL_SIZE_MB = 128;
const DOCUMENTS_PER_PAGE = 12;

const documentCategories = [
  "Lease Agreements", "Invoices", "Property Photos", "Maintenance Reports",
  "Tenant Applications", "Insurance Documents", "Financial Statements",
  "Legal Documents", "Floor Plans", "Miscellaneous",
];

const getFileIcon = (extension) => {
  switch (extension.toLowerCase()) {
    case 'pdf': return <PdfIcon fontSize="large" />;
    case 'jpg':
    case 'jpeg':
    case 'png': return <ImageIcon fontSize="large" />;
    case 'doc':
    case 'docx': return <DescriptionIcon fontSize="large" />;
    default: return <FileIcon fontSize="large" />;
  }
};

const Documents = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [favorites, setFavorites] = useState(new Set());
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: "Lease Agreement - 123 Main St",
      extension: "pdf",
      size: "0.22",
      uploadDate: moment().subtract(2, "days").format("YYYY-MM-DD HH:mm"),
      category: "Lease Agreements",
    },
    // Add more mock documents here
  ]);

  const [dialogState, setDialogState] = useState({
    addDocumentOpen: false,
    deleteDocumentId: null,
    isUploading: false,
    editingDocumentId: null,
    previewDocumentId: null,
  });
  const [file, setFile] = useState(null);
  const [totalSize, setTotalSize] = useState(
    documents.reduce((total, doc) => total + parseFloat(doc.size), 0)
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("dateDesc");
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [snackbarState, setSnackbarState] = useState({ open: false, message: "", severity: "success" });
  const [editedName, setEditedName] = useState("");
  const [newDocumentCategory, setNewDocumentCategory] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);

  const availableExtensions = useMemo(
    () => [...new Set(documents.map((doc) => doc.extension))],
    [documents]
  );

  const toggleFavorite = useCallback((documentId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(documentId)) {
        newFavorites.delete(documentId);
      } else {
        newFavorites.add(documentId);
      }
      return newFavorites;
    });
  }, []);

  const handleClose = useCallback(() => {
    setDialogState({ 
      addDocumentOpen: false, 
      deleteDocumentId: null, 
      editingDocumentId: null,
      previewDocumentId: null
    });
    setFile(null);
    setNewDocumentCategory("");
    setEditedName("");
  }, []);

  const handleDeleteDocument = useCallback(() => {
    const updatedDocuments = documents.filter(
      (doc) => doc.id !== dialogState.deleteDocumentId
    );
    setDocuments(updatedDocuments);
    setTotalSize(
      updatedDocuments.reduce((total, doc) => total + parseFloat(doc.size), 0)
    );
    setSnackbarState({ open: true, message: "Document deleted successfully!", severity: "success" });
    handleClose();
  }, [dialogState.deleteDocumentId, documents, handleClose]);

  const handleUpload = useCallback(() => {
    if (!file) return;
    setDialogState((prev) => ({ ...prev, isUploading: true }));
    const fileSizeMB = file.size / 1024 / 1024;
    if (totalSize + fileSizeMB > MAX_TOTAL_SIZE_MB) {
      setSnackbarState({ 
        open: true, 
        message: "Total file size exceeds the limit of 128 MB.", 
        severity: "error" 
      });
      setDialogState((prev) => ({ ...prev, isUploading: false }));
      return;
    }
    setTimeout(() => {
      const [name, extension] = file.name.split(".");
      const newDocument = {
        id: documents.length + 1,
        name,
        extension,
        size: fileSizeMB.toFixed(2),
        uploadDate: moment().format("YYYY-MM-DD HH:mm"),
        category: newDocumentCategory || "Miscellaneous",
      };
      const updatedDocuments = [...documents, newDocument];
      setDocuments(updatedDocuments);
      setTotalSize(
        updatedDocuments.reduce((total, doc) => total + parseFloat(doc.size), 0)
      );
      setSnackbarState({ open: true, message: "Document uploaded successfully!", severity: "success" });
      handleClose();
    }, 2000);
  }, [file, totalSize, documents, newDocumentCategory, handleClose]);

  const handleRename = useCallback(() => {
    const updatedDocuments = documents.map((doc) =>
      doc.id === dialogState.editingDocumentId ? { ...doc, name: editedName } : doc
    );
    setDocuments(updatedDocuments);
    setSnackbarState({ open: true, message: "Document renamed successfully!", severity: "success" });
    handleClose();
  }, [documents, dialogState.editingDocumentId, editedName, handleClose]);

  const filteredDocuments = useMemo(
    () =>
      documents
        .filter(
          (document) =>
            document.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            document.extension.toLowerCase().includes(searchTerm.toLowerCase()) ||
            document.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .filter((document) => (filterType ? document.extension === filterType : true))
        .filter((document) => (filterCategory ? document.category === filterCategory : true))
        .filter((document) => {
          if (currentTab === 1) {
            return moment(document.uploadDate).isAfter(moment().subtract(7, 'days'));
          }
          if (currentTab === 2) {
            return favorites.has(document.id);
          }
          return true;
        })
        .sort((a, b) => {
          if (sortOrder === "alphabetical") return a.name.localeCompare(b.name);
          if (sortOrder === "sizeAsc") return parseFloat(a.size) - parseFloat(b.size);
          if (sortOrder === "sizeDesc") return parseFloat(b.size) - parseFloat(a.size);
          if (sortOrder === "dateAsc") return new Date(a.uploadDate) - new Date(b.uploadDate);
          if (sortOrder === "dateDesc") return new Date(b.uploadDate) - new Date(a.uploadDate);
          return 0;
        }),
    [documents, searchTerm, sortOrder, filterType, filterCategory, currentTab, favorites]
  );

  const paginatedDocuments = useMemo(
    () => filteredDocuments.slice((currentPage - 1) * DOCUMENTS_PER_PAGE, currentPage * DOCUMENTS_PER_PAGE),
    [currentPage, filteredDocuments]
  );

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const renderDocumentList = () => (
    <Grid container spacing={2}>
      {paginatedDocuments.map((document) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={document.id}>
          <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: 100, 
                mb: 2, 
                bgcolor: 'grey.200', 
                borderRadius: 1,
                cursor: 'pointer'
              }}
              onClick={() => setDialogState({ ...dialogState, previewDocumentId: document.id })}
            >
              {getFileIcon(document.extension)}
            </Box>
            <Typography variant="subtitle1" noWrap>{document.name}.{document.extension}</Typography>
            <Typography variant="body2" color="textSecondary">Size: {document.size} MB</Typography>
            <Typography variant="body2" color="textSecondary">Uploaded: {document.uploadDate}</Typography>
            <Chip label={document.category} size="small" sx={{ mt: 1, alignSelf: 'flex-start' }} />
            <Box sx={{ mt: 'auto', pt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <IconButton size="small" onClick={() => console.log("Downloading", document.name)}>
                <DownloadIcon />
              </IconButton>
              <IconButton size="small" onClick={() => {
                setDialogState({ ...dialogState, editingDocumentId: document.id });
                setEditedName(document.name);
              }}>
                <EditIcon />
              </IconButton>
              <IconButton size="small" onClick={() => setDialogState({ ...dialogState, deleteDocumentId: document.id })}>
                <DeleteIcon />
              </IconButton>
              <IconButton size="small" onClick={() => toggleFavorite(document.id)}>
                {favorites.has(document.id) ? <StarIcon color="primary" /> : <StarBorderIcon />}
              </IconButton>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length) {
      setFile(files[0]);
      setDialogState({ ...dialogState, addDocumentOpen: true });
    }
  };

  return (
    <Box sx={{ padding: 3 }} onDragOver={onDragOver} onDrop={onDrop}>
      <Typography variant="h4" gutterBottom>Documents</Typography>
      
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setDialogState({ ...dialogState, addDocumentOpen: true })}
            startIcon={<AddCircleIcon />}
          >
            Upload New Document
          </Button>

          {!isMobile && (
            <>
              <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                <InputLabel>Sort By</InputLabel>
                <Select 
                  value={sortOrder} 
                  onChange={(e) => setSortOrder(e.target.value)}
                  startAdornment={<InputAdornment position="start"><SortIcon /></InputAdornment>}
                >
                  <MenuItem value="alphabetical">Alphabetical</MenuItem>
                  <MenuItem value="sizeAsc">Size (Ascending)</MenuItem>
                  <MenuItem value="sizeDesc">Size (Descending)</MenuItem>
                  <MenuItem value="dateAsc">Date (Oldest First)</MenuItem>
                  <MenuItem value="dateDesc">Date (Newest First)</MenuItem>
                </Select>
              </FormControl>

              <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                <InputLabel>Filter By Type</InputLabel>
                <Select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {availableExtensions.map((ext) => (
                    <MenuItem key={ext} value={ext}>{ext.toUpperCase()}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                <InputLabel>Filter By Category</InputLabel>
                <Select 
                  value={filterCategory} 
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {documentCategories.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}

          {isMobile && (
            <IconButton onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          )}
        </Box>

        <TextField
          variant="outlined"
          placeholder="Search Documents"
          sx={{ maxWidth: "300px", flexGrow: 1, ml: 2 }}
          InputProps={{ 
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> 
          }}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      <Box mb={2}>
        <LinearProgress 
          variant="determinate" 
          value={(totalSize / MAX_TOTAL_SIZE_MB) * 100} 
          sx={{ height: 10, borderRadius: 5 }}
        />
        <Typography variant="body2" align="right" mt={1}>
          {totalSize.toFixed(2)} MB / {MAX_TOTAL_SIZE_MB} MB used
        </Typography>
      </Box>

      <Tabs 
        value={currentTab} 
        onChange={(_, newValue) => setCurrentTab(newValue)} 
        sx={{ mb: 2 }}
      >
        <Tab label="All Documents" />
        <Tab label="Recent Uploads" />
        <Tab label="Favorites" />
      </Tabs>

      {renderDocumentList()}

      {filteredDocuments.length > DOCUMENTS_PER_PAGE && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination
            count={Math.ceil(filteredDocuments.length / DOCUMENTS_PER_PAGE)}
            page={currentPage}
            onChange={(e, val) => setCurrentPage(val)}
            color="primary"
          />
        </Box>
      )}

      {/* Upload Document Dialog */}
      <Dialog open={dialogState.addDocumentOpen} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Upload New Document</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" mb={2}>
            <input
              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
              style={{ display: "none" }}
              id="upload-file"
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <label htmlFor="upload-file">
              <Button variant="contained" color="primary" component="span" startIcon={<CloudUploadIcon />}>
                Choose File
              </Button>
            </label>
            {file && <Typography variant="body1" mt={2}>{file.name}</Typography>}
            <Typography variant="body2" color="textSecondary" mt={1}>
              Accepted file types: PDF, DOC, DOCX, Images. Max upload size: {MAX_TOTAL_SIZE_MB} MB total.
            </Typography>
          </Box>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Document Category</InputLabel>
            <Select
              value={newDocumentCategory}
              onChange={(e) => setNewDocumentCategory(e.target.value)}
              label="Document Category"
            >
              {documentCategories.map((category) => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {dialogState.isUploading && <LinearProgress sx={{ mt: 2 }} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Cancel</Button>
          <Button onClick={handleUpload} color="primary" disabled={!file || dialogState.isUploading}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!dialogState.deleteDocumentId} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this document? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Cancel</Button>
          <Button onClick={handleDeleteDocument} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog open={!!dialogState.previewDocumentId} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Document Preview</DialogTitle>
        <DialogContent>
          {dialogState.previewDocumentId && (
            <DocumentPreview>
              {getFileIcon(documents.find(doc => doc.id === dialogState.previewDocumentId).extension)}
            </DocumentPreview>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Close</Button>
          <Button onClick={() => console.log("Download document")} color="primary" startIcon={<DownloadIcon />}>
            Download
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Document Dialog */}
      <Dialog open={!!dialogState.editingDocumentId} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Document</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Document Name"
            type="text"
            fullWidth
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Cancel</Button>
          <Button onClick={handleRename} color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Mobile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem>
          <FormControl fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                handleMenuClose();
              }}
            >
              <MenuItem value="alphabetical">Alphabetical</MenuItem>
              <MenuItem value="sizeAsc">Size (Ascending)</MenuItem>
              <MenuItem value="sizeDesc">Size (Descending)</MenuItem>
              <MenuItem value="dateAsc">Date (Oldest First)</MenuItem>
              <MenuItem value="dateDesc">Date (Newest First)</MenuItem>
            </Select>
          </FormControl>
        </MenuItem>
        <MenuItem>
          <FormControl fullWidth>
            <InputLabel>Filter By Type</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                handleMenuClose();
              }}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {availableExtensions.map((ext) => (
                <MenuItem key={ext} value={ext}>{ext.toUpperCase()}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </MenuItem>
        <MenuItem>
          <FormControl fullWidth>
            <InputLabel>Filter By Category</InputLabel>
            <Select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                handleMenuClose();
              }}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {documentCategories.map((category) => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </MenuItem>
      </Menu>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarState.open}
        autoHideDuration={6000}
        onClose={() => setSnackbarState({ ...snackbarState, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert onClose={() => setSnackbarState({ ...snackbarState, open: false })} severity={snackbarState.severity}>
          {snackbarState.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Documents;