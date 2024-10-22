import React, { useState, useMemo, useCallback, useEffect, useRef, forwardRef } from 'react';
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
  Alert as MuiAlert,
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
  CloudUploadOutlined,
  FileCopy as FileCopyIcon,
  PlayCircleOutline as PlayIcon
} from '@mui/icons-material';

import { styled, alpha } from '@mui/material/styles';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { formatDistanceToNow } from 'date-fns';
import axiosInstance from '../../axiosSetup';

// DocumentCard Component (add this before the Documents component)
const DocumentCard = React.memo(({
  document,
  onDetails,
  onDelete,
  onDownload,
  onToggleFavorite,
  onContextMenu
}) => {
  const handleClick = useCallback(() => {
    onDetails(document);
  }, [document, onDetails]);

  const handleToggleFavorite = useCallback((e) => {
    e.stopPropagation();
    onToggleFavorite(document.id);
  }, [document.id, onToggleFavorite]);

  const handleDownload = useCallback((e) => {
    e.stopPropagation();
    onDownload(document.id, document.name);
  }, [document.id, document.name, onDownload]);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    onDelete(document.id);
  }, [document.id, onDelete]);

  return (
    <StyledCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu(e);
      }}
    >
      <FilePreview
        file={document}
        onLoadError={(fileId) => {
          console.log(`Preview failed to load for file ${fileId}`);
        }}
      />
      <CardContent>
        <Typography variant="subtitle1" noWrap title={document.name}>
          {document.name}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {`${(document.size / 1024 / 1024).toFixed(2)} MB`}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
          <Chip
            label={document.category}
            size="small"
            color={
              document.category === 'document' ? 'primary' :
                document.category === 'image' ? 'secondary' :
                  document.category === 'video' ? 'error' : 'default'
            }
          />
          {document.isFavorite && (
            <Chip
              label="Favorite"
              size="small"
              color="warning"
              icon={<StarIcon />}
            />
          )}
        </Box>
      </CardContent>
      <CardActions>
        <Tooltip title={document.isFavorite ? "Remove from Favorites" : "Add to Favorites"}>
          <IconButton
            onClick={handleToggleFavorite}
            size="small"
            color={document.isFavorite ? "warning" : "default"}
          >
            {document.isFavorite ? <StarIcon /> : <StarBorderIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Download">
          <IconButton
            onClick={handleDownload}
            size="small"
          >
            <DownloadIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            onClick={handleDelete}
            size="small"
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </StyledCard>
  );
});

// Request queue system
const previewQueue = {
  queue: new Map(),
  inProgress: new Set(),
  maxConcurrent: 3,

  async add(fileId, loadFn) {
    if (this.queue.has(fileId) || this.inProgress.has(fileId)) {
      return;
    }

    if (this.inProgress.size >= this.maxConcurrent) {
      return new Promise((resolve, reject) => {
        this.queue.set(fileId, { loadFn, resolve, reject });
      });
    }

    return this.process(fileId, loadFn);
  },

  async process(fileId, loadFn) {
    this.inProgress.add(fileId);
    try {
      const result = await loadFn();
      return result;
    } finally {
      this.inProgress.delete(fileId);
      this.processNext();
    }
  },

  processNext() {
    if (this.inProgress.size >= this.maxConcurrent || this.queue.size === 0) {
      return;
    }

    const [nextFileId, { loadFn, resolve, reject }] = this.queue.entries().next().value;
    this.queue.delete(nextFileId);

    this.process(nextFileId, loadFn)
      .then(resolve)
      .catch(reject);
  }
};

// Video thumbnail generation
const getVideoThumbnail = async (videoBlob) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const videoUrl = URL.createObjectURL(videoBlob);

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    };

    video.onseeked = () => {
      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(videoUrl);
          resolve(URL.createObjectURL(blob));
        }, 'image/jpeg', 0.7);
      } catch (error) {
        URL.revokeObjectURL(videoUrl);
        reject(error);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(videoUrl);
      reject(new Error('Failed to load video'));
    };

    video.src = videoUrl;
    video.currentTime = 1;
  });
};

// Alert component
const Alert = forwardRef((props, ref) => (
  <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));

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
// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <Box sx={{
    p: 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
  }}>
    <ErrorIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
    <Typography variant="h6" color="error" gutterBottom>
      Something went wrong:
    </Typography>
    <Typography variant="body1" color="textSecondary" align="center" sx={{ mb: 2 }}>
      {error.message}
    </Typography>
    <Button
      variant="outlined"
      color="primary"
      onClick={resetErrorBoundary}
      startIcon={<RefreshIcon />}
    >
      Try Again
    </Button>
  </Box>
);

// FilePreview Component
const FilePreview = React.memo(({ file, onLoadError }) => {
  const [state, setState] = useState({
    isLoading: true,
    error: false,
    previewUrl: ''
  });

  useEffect(() => {
    let mounted = true;
    let currentPreviewUrl = null;

    const loadPreview = async () => {
      if (!file?.id || !['image', 'video'].includes(file?.category)) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const loadAndProcessFile = async () => {
          const response = await axiosInstance.get(`/api/documents/${file.id}/download`, {
            responseType: 'blob'
          });

          if (!mounted) return null;

          if (file.category === 'video') {
            return await getVideoThumbnail(response.data);
          } else {
            return URL.createObjectURL(response.data);
          }
        };

        const blobUrl = await previewQueue.add(file.id, loadAndProcessFile);

        if (!mounted) return;

        if (blobUrl) {
          currentPreviewUrl = blobUrl;
          setState({
            isLoading: false,
            error: false,
            previewUrl: blobUrl
          });
        }
      } catch (error) {
        console.error('Preview loading error:', error);
        if (mounted) {
          setState({
            isLoading: false,
            error: true,
            previewUrl: ''
          });
          onLoadError?.(file?.id);
        }
      }
    };

    setState(prev => ({ ...prev, isLoading: true, error: false }));
    loadPreview();

    return () => {
      mounted = false;
      if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl);
      }
    };
  }, [file?.id, file?.category, onLoadError]);

  const handleRetry = useCallback(() => {
    setState({ isLoading: true, error: false, previewUrl: '' });
  }, []);

  if (state.error) {
    return (
      <PreviewContainer>
        <Box sx={{ textAlign: 'center' }}>
          <ErrorIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="caption" color="error" display="block">
            Preview unavailable
          </Typography>
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={handleRetry}
            sx={{ mt: 1 }}
          >
            Retry
          </Button>
        </Box>
      </PreviewContainer>
    );
  }

  if (file?.category === 'image' || file?.category === 'video') {
    return (
      <PreviewContainer>
        {state.isLoading && (
          <CircularProgress
            size={24}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1
            }}
          />
        )}
        {state.previewUrl && (
          <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
            <Box
              component="img"
              src={state.previewUrl}
              alt={file.name}
              sx={{
                maxHeight: '100%',
                maxWidth: '100%',
                objectFit: 'contain',
                opacity: state.isLoading ? 0 : 1,
                transition: 'opacity 0.3s ease-in-out',
              }}
              onLoad={() => setState(prev => ({ ...prev, isLoading: false }))}
              onError={handleRetry}
            />
            {file.category === 'video' && (
              <PlayIcon
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: 48,
                  color: 'white',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '50%',
                  padding: '8px'
                }}
              />
            )}
          </Box>
        )}
      </PreviewContainer>
    );
  }

  const IconComponent = file?.category === 'document' ? DescriptionIcon :
    file?.category === 'video' ? VideoFileIcon :
      FileCopyIcon;

  return (
    <PreviewContainer>
      <IconComponent sx={{
        fontSize: 64,
        color: file?.category === 'document' ? 'primary.main' :
          file?.category === 'video' ? 'error.main' :
            'action.active'
      }} />
    </PreviewContainer>
  );
});
// UploadDialog Component
const UploadDialog = React.memo(({
  open,
  onClose,
  onUpload,
  isUploading,
  uploadProgress,
}) => {
  const theme = useTheme();
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    acceptedFiles,
    fileRejections,
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

  const [localUploadProgress, setLocalUploadProgress] = useState(0);

  useEffect(() => {
    if (isUploading) {
      const interval = setInterval(() => {
        setLocalUploadProgress(prev => {
          if (prev < uploadProgress) {
            return Math.min(prev + 2, uploadProgress);
          }
          return prev;
        });
      }, 20);

      return () => clearInterval(interval);
    } else {
      setLocalUploadProgress(0);
    }
  }, [isUploading, uploadProgress]);

  return (
    <Dialog
      open={open}
      onClose={!isUploading ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          m: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>
        Upload Documents
        {!isUploading && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        )}
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
                      value={localUploadProgress}
                    />
                  )}
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {fileRejections.length > 0 && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {fileRejections.length} file(s) were rejected:
            <List dense>
              {fileRejections.map(({ file, errors }) => (
                <ListItem key={file.path}>
                  <ListItemText
                    primary={file.path}
                    secondary={errors.map(e => e.message).join(', ')}
                  />
                </ListItem>
              ))}
            </List>
          </Alert>
        )}

        {isUploading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={localUploadProgress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                }
              }}
            />
            <Typography
              variant="caption"
              color="textSecondary"
              align="center"
              sx={{ mt: 1, display: 'block' }}
            >
              Uploading... {localUploadProgress}%
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isUploading}>
          Cancel
        </Button>
        <Box sx={{ position: 'relative' }}>
          <Button
            onClick={() => onUpload(acceptedFiles)}
            disabled={acceptedFiles.length === 0 || isUploading}
            variant="contained"
            startIcon={<UploadIcon />}
          >
            Upload
          </Button>
          {isUploading && (
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
});

// Main Documents Component
const Documents = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // State management
  const [state, setState] = useState({
    searchTerm: '',
    snackbar: { open: false, message: '', severity: 'success' },
    isUploadDialogOpen: false,
    isFileDetailsOpen: false,
    selectedFile: null,
    sortBy: 'name',
    filterBy: 'all',
    tabValue: 0,
    uploadProgress: 0,
    menuAnchorEl: null,
    selectedFileId: null,
    isUpdating: false,
    updateProgress: 0
  });

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Queries
  const documentsQuery = useQuery(
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
        updateState({
          snackbar: {
            open: true,
            message: 'Failed to load documents. Please try again.',
            severity: 'error'
          }
        });
      }
    }
  );

  const storageQuery = useQuery(
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
  const uploadMutation = useMutation(
    async (files) => {
      const formData = new FormData();
      files.forEach(file => formData.append('file', file));

      const response = await axiosInstance.post('/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          updateState({ uploadProgress: percentCompleted });
        }
      });

      return response.data;
    },
    {
      onSuccess: (data) => {
        const newFiles = data.file ? [data.file] : data.files || [];

        queryClient.setQueryData('documents', (oldData = []) => {
          return [...oldData, ...newFiles];
        });

        updateState({
          snackbar: {
            open: true,
            message: 'Files uploaded successfully',
            severity: 'success'
          },
          isUploadDialogOpen: false,
          uploadProgress: 0
        });

        queryClient.invalidateQueries(['documents', 'storage']);
      },
      onError: (error) => {
        console.error('Upload error:', error);
        updateState({
          snackbar: {
            open: true,
            message: error.response?.data?.message || 'Error uploading files',
            severity: 'error'
          },
          uploadProgress: 0
        });
      }
    }
  );

  const deleteMutation = useMutation(
    async (id) => {
      await axiosInstance.delete(`/api/documents/${id}`);
      return id;
    },
    {
      onMutate: async (deletedId) => {
        await queryClient.cancelQueries('documents');
        const previousDocuments = queryClient.getQueryData('documents');

        queryClient.setQueryData('documents', (old = []) =>
          old.filter(doc => doc.id !== deletedId)
        );

        return { previousDocuments };
      },
      onSuccess: () => {
        updateState({
          snackbar: {
            open: true,
            message: 'Document deleted successfully',
            severity: 'success'
          }
        });
      },
      onError: (error, variables, context) => {
        queryClient.setQueryData('documents', context.previousDocuments);
        updateState({
          snackbar: {
            open: true,
            message: 'Error deleting document',
            severity: 'error'
          }
        });
      },
      onSettled: () => {
        queryClient.invalidateQueries(['documents', 'storage']);
      }
    }
  );

  const toggleFavoriteMutation = useMutation(
    async (id) => {
      await axiosInstance.put(`/api/documents/${id}/favorite`);
      return id;
    },
    {
      onMutate: async (toggledId) => {
        await queryClient.cancelQueries('documents');
        const previousDocuments = queryClient.getQueryData('documents');

        queryClient.setQueryData('documents', (old = []) =>
          old.map(doc =>
            doc.id === toggledId
              ? { ...doc, isFavorite: !doc.isFavorite }
              : doc
          )
        );

        return { previousDocuments };
      },
      onError: (error, variables, context) => {
        queryClient.setQueryData('documents', context.previousDocuments);
        updateState({
          snackbar: {
            open: true,
            message: 'Error updating favorite status',
            severity: 'error'
          }
        });
      }
    }
  );

  const updateMutation = useMutation(
    async (document) => {
      const response = await axiosInstance.put(
        `/api/documents/${document.id}`,
        document
      );
      return response.data;
    },
    {
      onMutate: async (updatedDoc) => {
        await queryClient.cancelQueries('documents');
        const previousDocuments = queryClient.getQueryData('documents');

        queryClient.setQueryData('documents', (old = []) =>
          old.map(doc =>
            doc.id === updatedDoc.id
              ? { ...doc, ...updatedDoc }
              : doc
          )
        );

        return { previousDocuments };
      },
      onSuccess: () => {
        updateState({
          snackbar: {
            open: true,
            message: 'Document updated successfully',
            severity: 'success'
          },
          isFileDetailsOpen: false,
          isUpdating: false,
          updateProgress: 0
        });
      },
      onError: (error, variables, context) => {
        queryClient.setQueryData('documents', context.previousDocuments);
        updateState({
          snackbar: {
            open: true,
            message: 'Error updating document',
            severity: 'error'
          },
          isUpdating: false,
          updateProgress: 0
        });
      }
    }
  );

  // Handlers
  const handleFileUpload = useCallback((files) => {
    if (!files?.length) return;
    uploadMutation.mutate(files);
  }, [uploadMutation]);

  const handleDeleteDocument = useCallback((id) => {
    if (!id || !window.confirm('Are you sure you want to delete this document?')) return;
    deleteMutation.mutate(id);
  }, [deleteMutation]);

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
      updateState({
        snackbar: {
          open: true,
          message: 'Error downloading file',
          severity: 'error'
        }
      });
    }
  }, [updateState]);

  const handleFileDetails = useCallback((file) => {
    if (!file) return;
    updateState({
      selectedFile: file,
      isFileDetailsOpen: true
    });
  }, [updateState]);

  const handleUpdateDocument = useCallback((updatedFile) => {
    if (!updatedFile?.id) return;
    updateState({ isUpdating: true });
    updateMutation.mutate(updatedFile);
  }, [updateMutation, updateState]);

  // Context Menu Component
  const ContextMenu = useCallback(({ anchorEl, open, onClose }) => {
    const selectedDocument = documentsQuery.data?.find(
      doc => doc.id === state.selectedFileId
    );

    if (!selectedDocument) return null;

    return (
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem
          onClick={() => {
            handleDownload(selectedDocument.id, selectedDocument.name);
            onClose();
          }}
        >
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleToggleFavorite(selectedDocument.id);
            onClose();
          }}
        >
          <ListItemIcon>
            {selectedDocument.isFavorite ? (
              <StarIcon fontSize="small" color="warning" />
            ) : (
              <StarBorderIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {selectedDocument.isFavorite
              ? "Remove from Favorites"
              : "Add to Favorites"}
          </ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            handleDeleteDocument(selectedDocument.id);
            onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    );
  }, [documentsQuery.data, state.selectedFileId, handleDownload, handleToggleFavorite, handleDeleteDocument]);

  // Filtering and sorting
  const filteredAndSortedDocuments = useMemo(() => {
    if (!Array.isArray(documentsQuery.data)) return [];

    let result = documentsQuery.data.filter(doc =>
      doc?.name?.toLowerCase().includes(state.searchTerm?.toLowerCase() || '')
    );

    if (state.filterBy !== 'all') {
      result = result.filter(doc => doc.category === state.filterBy);
    }

    if (state.tabValue === 1) {
      result = result.filter(doc => doc.isFavorite);
    }

    const getSortValue = (doc, field) => {
      switch (field) {
        case 'name':
          return doc.name || '';
        case 'size':
          return doc.size || 0;
        case 'createdAt':
          return new Date(doc.createdAt || 0).getTime();
        default:
          return 0;
      }
    };

    const isDesc = state.sortBy.startsWith('-');
    const field = isDesc ? state.sortBy.slice(1) : state.sortBy;

    return result.sort((a, b) => {
      const aValue = getSortValue(a, field);
      const bValue = getSortValue(b, field);

      if (typeof aValue === 'string') {
        return isDesc ?
          bValue.localeCompare(aValue) :
          aValue.localeCompare(bValue);
      }
      return isDesc ? bValue - aValue : aValue - bValue;
    });
  }, [documentsQuery.data, state.searchTerm, state.sortBy, state.filterBy, state.tabValue]);

  // Render functions
  const renderHeader = useCallback(() => (
    <HeaderWrapper>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: '0 0 auto' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
            Documents
          </Typography>
          <Tooltip title="Your data is encrypted">
            <LockIcon color="action" />
          </Tooltip>
        </Box>

        <Box sx={{ flex: '1 1 auto', display: 'flex', justifyContent: 'center' }}>
          <Tabs
            value={state.tabValue}
            onChange={(_, newValue) => updateState({ tabValue: newValue })}
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

        <Box sx={{ flex: '0 0 auto' }}>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => updateState({ isUploadDialogOpen: true })}
          >
            Upload
          </Button>
        </Box>
      </Box>

      {storageQuery.data && (
        <Box sx={{ mt: 3, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Storage: {((storageQuery.data?.used || 0) / 1024 / 1024).toFixed(2)} MB /
            {((storageQuery.data?.limit || 0) / 1024 / 1024).toFixed(2)} MB
          </Typography>
          <LinearProgress
            variant="determinate"
            value={((storageQuery.data?.used || 0) / (storageQuery.data?.limit || 1)) * 100}
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
            value={state.searchTerm}
            onChange={(e) => updateState({ searchTerm: e.target.value })}
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
              value={state.sortBy}
              onChange={(e) => updateState({ sortBy: e.target.value })}
              startAdornment={<SortIcon sx={{ mr: 1 }} />}
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
              value={state.filterBy}
              onChange={(e) => updateState({ filterBy: e.target.value })}
              startAdornment={<FilterIcon sx={{ mr: 1 }} />}
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
  ), [theme.palette.primary.main, state.tabValue, storageQuery.data, state.searchTerm, state.sortBy, state.filterBy, updateState]);

  const renderContent = useCallback(() => {
    if (documentsQuery.isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (filteredAndSortedDocuments.length === 0) {
      return (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          minHeight: 400,
        }}>
          <FolderIcon sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {state.searchTerm ? "No documents match your search" : "No documents found"}
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 2 }}>
            {state.searchTerm
              ? "Try adjusting your search criteria"
              : "Upload some files to get started"}
          </Typography>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => updateState({ isUploadDialogOpen: true })}
          >
            Upload Files
          </Button>
        </Box>
      );
    }

    return (
      <Grid container spacing={isSmallScreen ? 2 : 3}>
        <AnimatePresence mode="sync">
          {filteredAndSortedDocuments.map((doc) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={doc.id}>
              <DocumentCard
                document={doc}
                onDetails={handleFileDetails}
                onDelete={handleDeleteDocument}
                onDownload={handleDownload}
                onToggleFavorite={handleToggleFavorite}
                onContextMenu={(e) => {
                  e.preventDefault();
                  updateState({
                    selectedFileId: doc.id,
                    menuAnchorEl: e.currentTarget
                  });
                }}
              />
            </Grid>
          ))}
        </AnimatePresence>
      </Grid>
    );
  }, [
    documentsQuery.isLoading,
    filteredAndSortedDocuments,
    state.searchTerm,
    isSmallScreen,
    handleFileDetails,
    handleDeleteDocument,
    handleDownload,
    handleToggleFavorite,
    updateState
  ]);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        queryClient.invalidateQueries(['documents', 'storage']);
        updateState({
          searchTerm: '',
          sortBy: 'name',
          filterBy: 'all',
          tabValue: 0
        });
      }}
    >
      <PageWrapper>
        {renderHeader()}
        {renderContent()}

        <UploadDialog
          open={state.isUploadDialogOpen}
          onClose={() => updateState({
            isUploadDialogOpen: false,
            uploadProgress: 0
          })}
          onUpload={handleFileUpload}
          isUploading={uploadMutation.isLoading}
          uploadProgress={state.uploadProgress}
        />

        <FileDetailsDialog
          open={state.isFileDetailsOpen}
          onClose={() => updateState({
            isFileDetailsOpen: false,
            selectedFile: null,
            updateProgress: 0
          })}
          file={state.selectedFile}
          onUpdate={handleUpdateDocument}
          isUpdating={state.isUpdating}
          updateProgress={state.updateProgress}
        />

        <ContextMenu
          anchorEl={state.menuAnchorEl}
          open={Boolean(state.menuAnchorEl)}
          onClose={() => updateState({ menuAnchorEl: null })}
        />

        <Snackbar
          open={state.snackbar.open}
          autoHideDuration={6000}
          onClose={() => updateState({
            snackbar: { ...state.snackbar, open: false }
          })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert
            onClose={() => updateState({
              snackbar: { ...state.snackbar, open: false }
            })}
            severity={state.snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {state.snackbar.message}
          </Alert>
        </Snackbar>
      </PageWrapper>
    </ErrorBoundary>
  );
};

// FileDetailsDialog Component (add this before the Documents component)
const FileDetailsDialog = React.memo(({
  open,
  onClose,
  file,
  onUpdate,
  isUpdating,
  updateProgress
}) => {
  const [editedFile, setEditedFile] = useState(file);
  const fileExtension = useMemo(() => file?.name?.split('.').pop() || '', [file?.name]);
  const [localUpdateProgress, setLocalUpdateProgress] = useState(0);

  useEffect(() => {
    if (open) {
      setEditedFile(file);
    }
  }, [open, file]);

  useEffect(() => {
    if (isUpdating) {
      const interval = setInterval(() => {
        setLocalUpdateProgress(prev => {
          if (prev < updateProgress) {
            return Math.min(prev + 2, updateProgress);
          }
          return prev;
        });
      }, 20);

      return () => clearInterval(interval);
    } else {
      setLocalUpdateProgress(0);
    }
  }, [isUpdating, updateProgress]);

  const isValidName = useMemo(() => {
    return editedFile?.name?.split('.')[0]?.trim().length > 0;
  }, [editedFile?.name]);

  if (!file) return null;

  return (
    <Dialog
      open={open}
      onClose={!isUpdating ? onClose : undefined}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          m: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>
        File Details
        {!isUpdating && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative', height: '300px' }}>
              <FilePreview file={file} />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="File Name"
              value={editedFile?.name?.split('.')[0] || ''}
              onChange={(e) => setEditedFile({
                ...editedFile,
                name: `${e.target.value}.${fileExtension}`
              })}
              sx={{ mb: 2 }}
              error={!isValidName}
              helperText={!isValidName ? "File name cannot be empty" : ""}
              disabled={isUpdating}
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
            <Typography variant="body1" gutterBottom>
              MIME Type: {file.mimeType}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isUpdating}>
          Cancel
        </Button>
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <Button
            onClick={() => onUpdate(editedFile)}
            disabled={isUpdating || !isValidName}
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
});

export default Documents;