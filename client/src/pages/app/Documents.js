import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  useTheme,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Tooltip,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  Menu,
  Divider,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  useMediaQuery,
  Paper,
  List,
  ListItem,
  Chip
} from '@mui/material';

import {
  Search as SearchIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  GetApp as DownloadIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
  Lock as LockIcon,
  Image as ImageIcon,
  VideoFile as VideoFileIcon,
  Description as DescriptionIcon,
  Folder as FolderIcon,
  Close as CloseIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  CloudUploadOutlined
} from '@mui/icons-material';

import { styled, alpha } from '@mui/material/styles';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { formatDistanceToNow } from 'date-fns';
import axiosInstance from '../../axiosSetup';

// Styled Components
const PageWrapper = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
  position: 'relative',
}));

const HeaderWrapper = styled(Box)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(2),
}));

const StyledCard = styled(motion(Card))(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.2s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const PreviewContainer = styled(Box)(({ theme }) => ({
  height: 200,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.action.hover,
  overflow: 'hidden',
  position: 'relative',
}));

const StyledDropzone = styled('div', {
  shouldForwardProp: prop => !['isDragActive', 'isDragReject'].includes(prop)
})(({ theme, isDragActive, isDragReject }) => ({
  padding: theme.spacing(4),
  border: `2px dashed ${isDragReject
    ? theme.palette.error.main
    : isDragActive
      ? theme.palette.primary.main
      : theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: isDragActive
    ? alpha(theme.palette.primary.main, 0.1)
    : isDragReject
      ? alpha(theme.palette.error.main, 0.1)
      : theme.palette.background.default,
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
}));

// Helper Components
const FilePreview = ({ file, onLoadError }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const isImage = file?.category === 'image' && file?.mimeType?.startsWith('image/');
  const isVideo = file?.category === 'video' && file?.mimeType?.startsWith('video/');

  const handleError = () => {
    console.error('Preview load error for file:', file);
    setError(true);
    setIsLoading(false);
    onLoadError?.(file?.id);
  };

  const handleLoad = () => {
    console.log('Preview loaded successfully for file:', file);
    setIsLoading(false);
    setError(false);
  };

  const getPreviewUrl = useCallback((fileId) => {
    return `${process.env.REACT_APP_API_URL}/documents/${fileId}/download`;
  }, []);

  if (error) {
    return (
      <PreviewContainer>
        <Box sx={{ textAlign: 'center' }}>
          <ErrorIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="caption" color="error" display="block">
            Preview unavailable
          </Typography>
        </Box>
      </PreviewContainer>
    );
  }

  if (isImage) {
    return (
      <PreviewContainer>
        {isLoading && (
          <CircularProgress
            size={24}
            sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          />
        )}
        <img
          src={getPreviewUrl(file.id)}
          alt={file.name}
          style={{
            maxHeight: '100%',
            maxWidth: '100%',
            objectFit: 'contain',
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out',
          }}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      </PreviewContainer>
    );
  }

  if (isVideo) {
    return (
      <PreviewContainer>
        {isLoading && (
          <CircularProgress
            size={24}
            sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          />
        )}
        <video
          style={{ maxHeight: '100%', maxWidth: '100%' }}
          controls
          preload="metadata"
          onLoadedData={handleLoad}
          onError={handleError}
        >
          <source src={getPreviewUrl(file.id)} type={file.mimeType} />
          Your browser does not support the video tag.
        </video>
      </PreviewContainer>
    );
  }

  // Icon fallback
  return (
    <PreviewContainer>
      {file?.category === 'document' ? (
        <DescriptionIcon sx={{ fontSize: 64, color: 'primary.main' }} />
      ) : file?.category === 'image' ? (
        <ImageIcon sx={{ fontSize: 64, color: 'secondary.main' }} />
      ) : file?.category === 'video' ? (
        <VideoFileIcon sx={{ fontSize: 64, color: 'error.main' }} />
      ) : (
        <DescriptionIcon sx={{ fontSize: 64, color: 'action.active' }} />
      )}
    </PreviewContainer>
  );
};

const UploadDialog = ({
  open,
  onClose,
  onUpload,
  isUploading,
  uploadProgress,
}) => {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    acceptedFiles,
  } = useDropzone({
    accept: {
      'image/*': [],
      'video/*': [],
      'application/pdf': [],
      'application/msword': [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
      'text/plain': [],
    },
    maxSize: 10485760, // 10MB
    multiple: true,
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Upload Documents
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <StyledDropzone
          {...getRootProps()}
          isDragActive={isDragActive}
          isDragReject={isDragReject}
        >
          <input {...getInputProps()} />
          <CloudUploadOutlined sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} />
          <Typography variant="h6" gutterBottom>
            Drag & Drop Files Here
          </Typography>
          <Typography variant="body2" color="textSecondary">
            or click to select files
          </Typography>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            Maximum file size: 10MB
          </Typography>
        </StyledDropzone>

        {acceptedFiles.length > 0 && (
          <Paper variant="outlined" sx={{ mt: 2, maxHeight: 200, overflow: 'auto' }}>
            <List dense>
              {acceptedFiles.map((file) => (
                <ListItem key={file.path}>
                  <ListItemIcon>
                    {file.type.startsWith('image/') ? (
                      <ImageIcon color="secondary" />
                    ) : file.type.startsWith('video/') ? (
                      <VideoFileIcon color="error" />
                    ) : (
                      <DescriptionIcon color="primary" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={file.path}
                    secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                  />
                  {isUploading && (
                    <CircularProgress
                      size={24}
                      variant="determinate"
                      value={uploadProgress}
                    />
                  )}
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {isUploading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography
              variant="caption"
              color="textSecondary"
              align="center"
              sx={{ mt: 1, display: 'block' }}
            >
              Uploading... {uploadProgress}%
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => onUpload(acceptedFiles)}
          disabled={acceptedFiles.length === 0 || isUploading}
          variant="contained"
          startIcon={<UploadIcon />}
        >
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const FileDetailsDialog = ({
  open,
  onClose,
  file,
  onUpdate,
  isUpdating,
  updateProgress,
}) => {
  const [editedFile, setEditedFile] = useState(file);

  useEffect(() => {
    setEditedFile(file);
  }, [file]);

  if (!file) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        File Details
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FilePreview file={file} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="File Name"
              value={editedFile?.name?.split('.')[0] || ''}
              onChange={(e) => setEditedFile({
                ...editedFile,
                name: `${e.target.value}.${editedFile.name.split('.').pop()}`
              })}
              sx={{ mb: 2 }}
            />
            <Typography variant="body1" gutterBottom>
              Type: {file.category.charAt(0).toUpperCase() + file.category.slice(1)}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Size: {(file.size / 1024 / 1024).toFixed(2)} MB
            </Typography>
            <Typography variant="body1" gutterBottom>
              Created: {formatDistanceToNow(new Date(file.createdAt))} ago
            </Typography>
            <Typography variant="body1" gutterBottom>
              Last modified: {formatDistanceToNow(new Date(file.updatedAt))} ago
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <Button
            onClick={() => onUpdate(editedFile)}
            disabled={isUpdating || !editedFile?.name}
            variant="contained"
          >
            Save Changes
          </Button>
          {isUpdating && (
            <CircularProgress
              size={24}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-12px',
                marginLeft: '-12px',
              }}
            />
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};
const ErrorFallback = ({ error }) => (
  <Box
    sx={{
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 400,
    }}
  >
    <ErrorIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
    <Typography variant="h6" color="error" gutterBottom>
      Something went wrong:
    </Typography>
    <Typography variant="body1" color="textSecondary" align="center">
      {error.message}
    </Typography>
    <Button
      variant="outlined"
      color="primary"
      onClick={() => window.location.reload()}
      startIcon={<RefreshIcon />}
      sx={{ mt: 2 }}
    >
      Reload Page
    </Button>
  </Box>
);

// Main Component
const Documents = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isFileDetailsOpen, setIsFileDetailsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);

  // Queries
  const { data: documentsData = [], isLoading, error } = useQuery(
    'documents',
    async () => {
      const response = await axiosInstance.get('/api/documents');
      return Array.isArray(response.data) ? response.data : [];
    },
    {
      staleTime: 30000,
      cacheTime: 3600000,
      retry: 3,
      onError: (error) => {
        console.error('Error fetching documents:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load documents. Please try again.',
          severity: 'error'
        });
      }
    }
  );

  const { data: storageData } = useQuery(
    'storage',
    async () => {
      const response = await axiosInstance.get('/api/documents/storage');
      return response.data;
    },
    {
      staleTime: 30000,
      cacheTime: 3600000
    }
  );

  // Mutations
  const uploadFileMutation = useMutation(
    async (files) => {
      const formData = new FormData();
      files.forEach(file => formData.append('file', file));

      return await axiosInstance.post('/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('documents');
        queryClient.invalidateQueries('storage');
        setSnackbar({
          open: true,
          message: 'Files uploaded successfully',
          severity: 'success'
        });
        setIsUploadDialogOpen(false);
        setUploadProgress(0);
      },
      onError: (error) => {
        console.error('Upload error:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Error uploading files',
          severity: 'error'
        });
        setUploadProgress(0);
      }
    }
  );

  const deleteDocumentMutation = useMutation(
    async (id) => {
      await axiosInstance.delete(`/api/documents/${id}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('documents');
        queryClient.invalidateQueries('storage');
        setSnackbar({
          open: true,
          message: 'Document deleted successfully',
          severity: 'success'
        });
      },
      onError: (error) => {
        console.error('Delete error:', error);
        setSnackbar({
          open: true,
          message: 'Error deleting document',
          severity: 'error'
        });
      }
    }
  );

  const toggleFavoriteMutation = useMutation(
    async (id) => {
      await axiosInstance.put(`/api/documents/${id}/favorite`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('documents');
        setSnackbar({
          open: true,
          message: 'Favorite status updated',
          severity: 'success'
        });
      },
      onError: (error) => {
        console.error('Favorite toggle error:', error);
        setSnackbar({
          open: true,
          message: 'Error updating favorite status',
          severity: 'error'
        });
      }
    }
  );

  const updateDocumentMutation = useMutation(
    async (document) => {
      setUpdateProgress(0);
      const interval = setInterval(() => {
        setUpdateProgress((prev) => (prev >= 90 ? 90 : prev + 10));
      }, 100);

      try {
        const response = await axiosInstance.put(
          `/api/documents/${document.id}`,
          document
        );
        clearInterval(interval);
        setUpdateProgress(100);
        return response.data;
      } catch (error) {
        clearInterval(interval);
        setUpdateProgress(0);
        throw error;
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('documents');
        setSnackbar({
          open: true,
          message: 'Document updated successfully',
          severity: 'success'
        });
        setIsFileDetailsOpen(false);
        setIsUpdating(false);
        setUpdateProgress(0);
      },
      onError: (error) => {
        console.error('Update error:', error);
        setSnackbar({
          open: true,
          message: 'Error updating document',
          severity: 'error'
        });
        setIsUpdating(false);
        setUpdateProgress(0);
      }
    }
  );

  // Memoized Values
  const filteredAndSortedDocuments = useMemo(() => {
    if (!Array.isArray(documentsData)) return [];

    let result = documentsData.filter(doc =>
      doc?.name?.toLowerCase().includes(searchTerm?.toLowerCase() || '')
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
      let compareResult;

      switch (field) {
        case 'name':
          compareResult = (a.name || '').localeCompare(b.name || '');
          break;
        case 'size':
          compareResult = (a.size || 0) - (b.size || 0);
          break;
        case 'createdAt':
          compareResult = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          break;
        default:
          compareResult = 0;
      }

      return isDesc ? -compareResult : compareResult;
    });

    return result;
  }, [documentsData, searchTerm, sortBy, filterBy, tabValue]);

  // Handlers
  const handleFileUpload = useCallback((files) => {
    if (!files?.length) return;
    uploadFileMutation.mutate(files);
  }, [uploadFileMutation]);

  const handleDeleteDocument = useCallback((id) => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteDocumentMutation.mutate(id);
    }
  }, [deleteDocumentMutation]);

  const handleToggleFavorite = useCallback((id) => {
    if (!id) return;
    toggleFavoriteMutation.mutate(id);
  }, [toggleFavoriteMutation]);

  const handleDownload = useCallback(async (id, fileName) => {
    if (!id || !fileName) return;
    try {
      const response = await axiosInstance.get(`/api/documents/${id}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      setSnackbar({
        open: true,
        message: 'Error downloading file',
        severity: 'error'
      });
    }
  }, []);
  // Add these handlers after the existing handleDownload handler
  const handleFileDetails = useCallback((file) => {
    if (!file) return;
    setSelectedFile(file);
    setIsFileDetailsOpen(true);
  }, []);

  const handleUpdateDocument = useCallback((updatedFile) => {
    if (!updatedFile?.id) return;
    setIsUpdating(true);
    updateDocumentMutation.mutate(updatedFile);
  }, [updateDocumentMutation]);


  if (error) {
    return <ErrorFallback error={error} />;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <PageWrapper>
        <HeaderWrapper>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2
          }}>
            {/* Left section - Document title with lock */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: '0 0 auto' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                Documents
              </Typography>
              <Tooltip title="Your data is encrypted">
                <LockIcon color="action" />
              </Tooltip>
            </Box>

            {/* Middle section - Tabs */}
            <Box sx={{ flex: '1 1 auto', display: 'flex', justifyContent: 'center' }}>
              <Tabs
                value={tabValue}
                onChange={(_, newValue) => setTabValue(newValue)}
                sx={{
                  minHeight: '48px',
                  '& .MuiTabs-flexContainer': {
                    justifyContent: 'center'
                  }
                }}
              >
                <Tab label="All Documents" />
                <Tab label="Favorites" />
              </Tabs>
            </Box>

            {/* Right section - Upload button */}
            <Box sx={{ flex: '0 0 auto' }}>
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={() => setIsUploadDialogOpen(true)}
              >
                Upload
              </Button>
            </Box>
          </Box>

          {storageData && (
            <Box sx={{ mt: 3, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Storage: {((storageData?.used || 0) / 1024 / 1024).toFixed(2)} MB / {((storageData?.limit || 0) / 1024 / 1024).toFixed(2)} MB
              </Typography>
              <LinearProgress
                variant="determinate"
                value={((storageData?.used || 0) / (storageData?.limit || 1)) * 100}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
          )}

          <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
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
              <FormControl fullWidth>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  startAdornment={<SortIcon sx={{ mr: 1 }} />}
                  displayEmpty
                >
                  <MenuItem value="name">Name (A-Z)</MenuItem>
                  <MenuItem value="-name">Name (Z-A)</MenuItem>
                  <MenuItem value="size">Size (Smallest)</MenuItem>
                  <MenuItem value="-size">Size (Largest)</MenuItem>
                  <MenuItem value="createdAt">Date (Oldest)</MenuItem>
                  <MenuItem value="-createdAt">Date (Newest)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <Select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  startAdornment={<FilterIcon sx={{ mr: 1 }} />}
                  displayEmpty
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="document">Documents</MenuItem>
                  <MenuItem value="image">Images</MenuItem>
                  <MenuItem value="video">Videos</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </HeaderWrapper>

        {/* Content Area */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredAndSortedDocuments.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
              minHeight: 400,
            }}
          >
            <FolderIcon sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No documents found
            </Typography>
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 2 }}>
              {searchTerm
                ? "No documents match your search criteria"
                : "Upload some files to get started"}
            </Typography>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={() => setIsUploadDialogOpen(true)}
            >
              Upload Files
            </Button>
          </Box>
        ) : (
          <Grid container spacing={isSmallScreen ? 2 : 3}>
            <AnimatePresence>
              {filteredAndSortedDocuments.map((doc) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={doc.id}>
                  <StyledCard
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => handleFileDetails(doc)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setSelectedFileId(doc.id);
                      setMenuAnchorEl(e.currentTarget);
                    }}
                  >
                    <FilePreview
                      file={doc}
                      onLoadError={(fileId) => {
                        console.log(`Preview failed to load for file ${fileId}`);
                      }}
                    />
                    <CardContent>
                      <Typography variant="subtitle1" noWrap>
                        {doc.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {`${(doc.size / 1024 / 1024).toFixed(2)} MB`}
                      </Typography>
                      <Chip
                        label={doc.category}
                        size="small"
                        sx={{ mt: 1 }}
                        color={
                          doc.category === 'document' ? 'primary' :
                            doc.category === 'image' ? 'secondary' :
                              doc.category === 'video' ? 'error' : 'default'
                        }
                      />
                    </CardContent>
                    <CardActions>
                      <Tooltip title={doc.isFavorite ? "Remove from Favorites" : "Add to Favorites"}>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(doc.id);
                          }}
                        >
                          {doc.isFavorite ? (
                            <StarIcon color="warning" />
                          ) : (
                            <StarBorderIcon />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(doc.id, doc.name);
                          }}
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDocument(doc.id);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </StyledCard>
                </Grid>
              ))}
            </AnimatePresence>
          </Grid>
        )}

        {/* Upload Dialog */}
        <UploadDialog
          open={isUploadDialogOpen}
          onClose={() => {
            setIsUploadDialogOpen(false);
            setUploadProgress(0);
          }}
          onUpload={handleFileUpload}
          isUploading={uploadFileMutation.isLoading}
          uploadProgress={uploadProgress}
        />

        {/* File Details Dialog */}
        <FileDetailsDialog
          open={isFileDetailsOpen}
          onClose={() => {
            setIsFileDetailsOpen(false);
            setSelectedFile(null);
            setUpdateProgress(0);
          }}
          file={selectedFile}
          onUpdate={handleUpdateDocument}
          isUpdating={isUpdating}
          updateProgress={updateProgress}
        />

        {/* Context Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={() => setMenuAnchorEl(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {selectedFileId && documentsData && (
            <>
              <MenuItem
                onClick={() => {
                  const file = documentsData.find(doc => doc.id === selectedFileId);
                  if (file) {
                    handleDownload(file.id, file.name);
                  }
                  setMenuAnchorEl(null);
                }}
              >
                <ListItemIcon>
                  <DownloadIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Download</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  const file = documentsData.find(doc => doc.id === selectedFileId);
                  if (file) {
                    handleToggleFavorite(file.id);
                  }
                  setMenuAnchorEl(null);
                }}
              >
                <ListItemIcon>
                  {documentsData.find(doc => doc.id === selectedFileId)?.isFavorite ? (
                    <StarIcon fontSize="small" color="warning" />
                  ) : (
                    <StarBorderIcon fontSize="small" />
                  )}
                </ListItemIcon>
                <ListItemText>
                  {documentsData.find(doc => doc.id === selectedFileId)?.isFavorite
                    ? "Remove from Favorites"
                    : "Add to Favorites"}
                </ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={() => {
                  const file = documentsData.find(doc => doc.id === selectedFileId);
                  if (file) {
                    handleDeleteDocument(file.id);
                  }
                  setMenuAnchorEl(null);
                }}
                sx={{ color: 'error.main' }}
              >
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItem>
            </>
          )}
        </Menu>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </PageWrapper>
    </ErrorBoundary>
  );
};

export default Documents;