import React, { useState, useMemo, useCallback } from 'react';
import {
  Box, Typography, Grid, TextField, InputAdornment, IconButton, Button,
  Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Alert,
  useTheme, Card, CardContent, CardActions, CircularProgress, Tooltip,
  LinearProgress, Select, MenuItem, FormControl, InputLabel, Chip, Tabs, Tab
} from '@mui/material';
import {
  Search as SearchIcon, InsertDriveFile as FileIcon, CloudUpload as UploadIcon,
  Delete as DeleteIcon, GetApp as DownloadIcon, Star as StarIcon,
  StarBorder as StarBorderIcon, Sort as SortIcon, FilterList as FilterIcon,
  Edit as EditIcon, Lock as LockIcon, Image as ImageIcon,
  VideoFile as VideoFileIcon, Description as DocumentIcon
} from '@mui/icons-material';
import { styled } from '@mui/system';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ErrorBoundary } from 'react-error-boundary';
import axiosInstance from '../../axiosSetup';

const PageWrapper = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url("/lock-icon.svg")',
    backgroundRepeat: 'repeat',
    backgroundSize: '100px',
    opacity: 0.05,
    zIndex: -1,
  }
}));

const HeaderWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[4],
  },
}));

const FileIconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 150,
  backgroundColor: theme.palette.action.hover,
}));

const ErrorFallback = ({ error }) => (
  <Box role="alert" sx={{ p: 3 }}>
    <Typography variant="h6" color="error" gutterBottom>Something went wrong:</Typography>
    <Typography variant="body1">{error.message}</Typography>
  </Box>
);

const Documents = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isFileDetailsOpen, setIsFileDetailsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');
  const [uploadFile, setUploadFile] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [isEncryptionInfoOpen, setIsEncryptionInfoOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [renameProgress, setRenameProgress] = useState(0);

  const { data: documentsData, isLoading, error } = useQuery('documents', () =>
    axiosInstance.get('/api/documents').then(res => {
      console.log('Documents fetched:', res.data);
      return res.data;
    })
  );

  const { data: storageData } = useQuery('storage', () =>
    axiosInstance.get('/api/documents/storage').then(res => res.data)
  );

  const uploadFileMutation = useMutation(
    (formData) => axiosInstance.post('/api/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      }
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('documents');
        queryClient.invalidateQueries('storage');
        setSnackbar({ open: true, message: 'File uploaded successfully', severity: 'success' });
        setIsUploadDialogOpen(false);
        setUploadFile(null);
        setUploadProgress(0);
      },
      onError: (error) => {
        console.error('Upload error:', error);
        setSnackbar({ open: true, message: 'Error uploading file', severity: 'error' });
        setUploadProgress(0);
      },
    }
  );

  const deleteDocumentMutation = useMutation(
    (id) => axiosInstance.delete(`/api/documents/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('documents');
        queryClient.invalidateQueries('storage');
        setSnackbar({ open: true, message: 'Document deleted successfully', severity: 'success' });
      },
      onError: (error) => {
        console.error('Delete error:', error);
        setSnackbar({ open: true, message: 'Error deleting document', severity: 'error' });
      },
    }
  );

  const toggleFavoriteMutation = useMutation(
    (id) => axiosInstance.put(`/api/documents/${id}/favorite`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('documents');
        setSnackbar({ open: true, message: 'Favorite status updated', severity: 'success' });
      },
      onError: (error) => {
        console.error('Favorite toggle error:', error);
        setSnackbar({ open: true, message: 'Error updating favorite status', severity: 'error' });
      },
    }
  );

  const updateDocumentMutation = useMutation(
    (updatedDoc) => axiosInstance.put(`/api/documents/${updatedDoc.id}`, updatedDoc),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('documents');
        setSnackbar({ open: true, message: 'Document updated successfully', severity: 'success' });
        setIsFileDetailsOpen(false);
        setRenameProgress(0);
      },
      onError: (error) => {
        console.error('Update error:', error);
        setSnackbar({ open: true, message: 'Error updating document', severity: 'error' });
        setRenameProgress(0);
      },
    }
  );

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setUploadFile(file);
  };

  const handleUploadSubmit = useCallback(async () => {
    if (uploadFile) {
      const formData = new FormData();
      formData.append('file', uploadFile);
      await uploadFileMutation.mutateAsync(formData);
    }
  }, [uploadFile, uploadFileMutation]);

  const handleDeleteDocument = useCallback((id) => {
    console.log('Delete document:', id);  // Debug log
    if (!id) {
      console.error('Document ID is undefined');
      setSnackbar({ open: true, message: 'Error: Document ID is missing', severity: 'error' });
      return;
    }
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteDocumentMutation.mutate(id);
    }
  }, [deleteDocumentMutation]);

  const handleToggleFavorite = useCallback((id) => {
    console.log('Toggle favorite:', id);  // Debug log
    if (!id) {
      console.error('Document ID is undefined');
      setSnackbar({ open: true, message: 'Error: Document ID is missing', severity: 'error' });
      return;
    }
    toggleFavoriteMutation.mutate(id);
  }, [toggleFavoriteMutation]);

  const handleDownload = useCallback(async (id, fileName) => {
    if (!id || !fileName) {
      console.error('Document ID or file name is undefined');
      setSnackbar({ open: true, message: 'Error: Document information is missing', severity: 'error' });
      return;
    }
    try {
      const response = await axiosInstance.get(`/api/documents/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download error:', error);
      setSnackbar({ open: true, message: 'Error downloading file', severity: 'error' });
    }
  }, []);

  const handleFileDetails = useCallback((file) => {
    console.log('File details:', file);  // Debug log
    setSelectedFile(file);
    setIsFileDetailsOpen(true);
  }, []);

  const handleUpdateDocument = useCallback(() => {
    console.log('Update document:', selectedFile);  // Debug log
    if (selectedFile && selectedFile.id) {
      setRenameProgress(0);
      const interval = setInterval(() => {
        setRenameProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prevProgress + 10;
        });
      }, 50);

      const updatedFile = { ...selectedFile };
      const nameParts = updatedFile.name.split('.');
      const extension = nameParts.pop();
      updatedFile.name = `${nameParts.join('.')}.${extension}`;

      updateDocumentMutation.mutate(updatedFile, {
        onSuccess: () => {
          clearInterval(interval);
          setRenameProgress(100);
        },
        onError: () => {
          clearInterval(interval);
          setRenameProgress(0);
        }
      });
    } else {
      console.error('Selected file or file ID is undefined');
      setSnackbar({ open: true, message: 'Error: File information is missing', severity: 'error' });
    }
  }, [selectedFile, updateDocumentMutation]);

  const renderFilePreview = useCallback((file) => {
    return (
      <FileIconWrapper>
        {file.category === 'document' ? <DocumentIcon fontSize="large" color="primary" sx={{ fontSize: 100 }} /> :
          file.category === 'image' ? <ImageIcon fontSize="large" color="secondary" sx={{ fontSize: 100 }} /> :
            file.category === 'video' ? <VideoFileIcon fontSize="large" color="error" sx={{ fontSize: 100 }} /> :
              <FileIcon fontSize="large" color="action" sx={{ fontSize: 100 }} />}
      </FileIconWrapper>
    );
  }, []);

  const filteredAndSortedDocuments = useMemo(() => {
    if (!Array.isArray(documentsData)) return [];

    let result = documentsData.filter(doc =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterBy !== 'all') {
      result = result.filter(doc => doc.category === filterBy);
    }

    if (tabValue === 1) {
      result = result.filter(doc => doc.isFavorite);
    }

    result.sort((a, b) => {
      const isDesc = sortBy.startsWith('-');
      const field = isDesc ? sortBy.slice(1) : sortBy;
      const compareResult = field === 'name' ? a.name.localeCompare(b.name) :
        field === 'size' ? a.size - b.size :
          new Date(a.createdAt) - new Date(b.createdAt);
      return isDesc ? -compareResult : compareResult;
    });

    return result;
  }, [documentsData, searchTerm, sortBy, filterBy, tabValue]);

  const renderDocumentGrid = useCallback(() => (
    <Grid container spacing={3}>
      {filteredAndSortedDocuments.map((doc) => {
        console.log('Document in grid:', doc);  // Debug log
        return (
          <Grid item xs={12} sm={6} md={4} lg={3} key={doc.id || doc._id}>
            <StyledCard onClick={() => handleFileDetails(doc)}>
              {renderFilePreview(doc)}
              <CardContent>
                <Typography variant="h6" noWrap>{doc.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {`${(doc.size / 1024 / 1024).toFixed(2)} MB`}
                </Typography>
                <Chip
                  label={doc.category}
                  size="small"
                  sx={{ mt: 1 }}
                  color={doc.category === 'document' ? 'primary' : doc.category === 'image' ? 'secondary' : doc.category === 'video' ? 'error' : 'default'}
                />
              </CardContent>
              <CardActions>
                <Tooltip title={doc.isFavorite ? "Remove from Favorites" : "Add to Favorites"}>
                  <IconButton onClick={(e) => { e.stopPropagation(); handleToggleFavorite(doc.id || doc._id); }}>
                    {doc.isFavorite ? <StarIcon color="warning" /> : <StarBorderIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download">
                  <IconButton onClick={(e) => { e.stopPropagation(); handleDownload(doc.id || doc._id, doc.name); }}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc.id || doc._id); }}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit">
                  <IconButton onClick={(e) => { e.stopPropagation(); handleFileDetails(doc); }}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </StyledCard>
          </Grid>
        );
      })}
    </Grid>
  ), [filteredAndSortedDocuments, handleToggleFavorite, handleDeleteDocument, handleDownload, handleFileDetails, renderFilePreview]);

  if (error) {
    console.error('Error loading documents:', error);
    return <Typography color="error">Error loading documents. Please try again later.</Typography>;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <PageWrapper>
        <HeaderWrapper>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
              Documents
            </Typography>
            <Tooltip title="Your data is encrypted">
              <IconButton color="inherit" onClick={() => setIsEncryptionInfoOpen(true)}>
                <LockIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => setIsUploadDialogOpen(true)}
          >
            Upload
          </Button>
        </HeaderWrapper>

        {storageData && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Storage: {((storageData.used / 1024 / 1024) || 0).toFixed(2)} MB / 256 MB
            </Typography>
            <LinearProgress
              variant="determinate"
              value={((storageData.used / (256 * 1024 * 1024)) || 0) * 100}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>
        )}

        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
          <Tab label="All Documents" />
          <Tab label="Favorites" />
        </Tabs>

        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                  startAdornment={<SortIcon />}
                >
                  <MenuItem value="name">Name (A-Z)</MenuItem>
                  <MenuItem value="-name">Name (Z-A)</MenuItem>
                  <MenuItem value="size">Size (Smallest first)</MenuItem>
                  <MenuItem value="-size">Size (Largest first)</MenuItem>
                  <MenuItem value="createdAt">Date (Oldest first)</MenuItem>
                  <MenuItem value="-createdAt">Date (Newest first)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Filter</InputLabel>
                <Select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  label="Filter"
                  startAdornment={<FilterIcon />}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="document">Documents</MenuItem>
                  <MenuItem value="image">Images</MenuItem>
                  <MenuItem value="video">Videos</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {isLoading ? (
          <CircularProgress />
        ) : filteredAndSortedDocuments.length === 0 ? (
          <Typography>No documents found. Upload some files to get started!</Typography>
        ) : (
          renderDocumentGrid()
        )}

        <Dialog
          open={isUploadDialogOpen}
          onClose={() => setIsUploadDialogOpen(false)}
        >
          <DialogTitle>Upload Document</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2, mt: 2 }}>
              <input
                type="file"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="raised-button-file"
              />
              <label htmlFor="raised-button-file">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                >
                  Choose File
                </Button>
              </label>
              {uploadFile && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected file: {uploadFile.name}
                </Typography>
              )}
            </Box>
            {uploadProgress > 0 && (
              <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="body2" color="text.secondary" align="center">
                  {`${uploadProgress}%`}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsUploadDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleUploadSubmit}
              color="primary"
              disabled={!uploadFile || uploadProgress > 0}
              variant="contained"
            >
              Upload
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={isFileDetailsOpen}
          onClose={() => setIsFileDetailsOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>File Details</DialogTitle>
          <DialogContent>
            {selectedFile && (
              <Box>
                {renderFilePreview(selectedFile)}
                <TextField
                  fullWidth
                  label="File Name"
                  value={selectedFile.name.split('.')[0]}
                  onChange={(e) => setSelectedFile({
                    ...selectedFile,
                    name: `${e.target.value}.${selectedFile.name.split('.').pop()}`
                  })}
                  sx={{ mt: 2, mb: 2 }}
                />
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Category: {selectedFile.category}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Uploaded on: {new Date(selectedFile.createdAt).toLocaleString()}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Last modified: {new Date(selectedFile.updatedAt).toLocaleString()}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsFileDetailsOpen(false)}>Close</Button>
            <Box position="relative" display="inline-flex">
              <CircularProgress
                variant="determinate"
                value={renameProgress}
                size={24}
                thickness={4}
                style={{ marginRight: 10 }}
              />
              <Button
                onClick={handleUpdateDocument}
                color="primary"
                variant="contained"
                disabled={renameProgress > 0 && renameProgress < 100}
              >
                Save Changes
              </Button>
            </Box>
          </DialogActions>
        </Dialog>

        <Dialog
          open={isEncryptionInfoOpen}
          onClose={() => setIsEncryptionInfoOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>About Encryption</DialogTitle>
          <DialogContent>
            <Typography variant="body1" paragraph>
              Your files are encrypted using AES-256 encryption before being stored on our servers.
              This means that even if someone were to gain unauthorized access to our servers,
              they wouldn't be able to read your files without the encryption key.
            </Typography>
            <Typography variant="body1">
              Files are only decrypted when you request to download them, ensuring they remain
              secure at all times while stored in our system.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEncryptionInfoOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </PageWrapper>
    </ErrorBoundary>
  );
};

export default Documents;