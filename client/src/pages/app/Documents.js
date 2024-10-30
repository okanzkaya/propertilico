import styles from './Documents.module.css';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Typography,
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
  Image as ImageIcon,
  VideoFile as VideoFileIcon,
  Description as DescriptionIcon,
  Folder as FolderIcon,
  Close as CloseIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  CloudUploadOutlined,
  InsertDriveFile as FileIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { formatDistanceToNow } from 'date-fns';
import axiosInstance from '../../axiosSetup';

// Constants
const FILE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_TOTAL_FILES: 10,
  MAX_TOTAL_SIZE: 10 * 1024 * 1024 * 10,
  ALLOWED_TYPES: {
    documents: {
      mimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ],
      extensions: ['.pdf', '.doc', '.docx', '.txt']
    },
    images: {
      mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    },
    videos: {
      mimeTypes: ['video/mp4', 'video/webm', 'video/avi'],
      extensions: ['.mp4', '.webm', '.avi']
    }
  }
};

// Utility functions
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const validateFiles = (files) => {
  const results = { valid: [], errors: [] };
  let totalSize = 0;

  Array.from(files).forEach(file => {
    const errors = [];
    totalSize += file.size;

    if (file.size > FILE_CONFIG.MAX_SIZE) {
      errors.push(`File size exceeds ${FILE_CONFIG.MAX_SIZE / 1024 / 1024}MB limit`);
    }

    const isAllowedType = Object.values(FILE_CONFIG.ALLOWED_TYPES)
      .flatMap(type => type.mimeTypes)
      .includes(file.type);

    if (!isAllowedType) {
      errors.push('File type not supported');
    }

    errors.length === 0 ? results.valid.push(file) : results.errors.push({ name: file.name, errors });
  });

  if (totalSize > FILE_CONFIG.MAX_TOTAL_SIZE) {
    results.errors.push({
      name: 'Total Size',
      errors: [`Total size exceeds ${FILE_CONFIG.MAX_TOTAL_SIZE / 1024 / 1024}MB limit`]
    });
    results.valid = [];
  }

  return results;
};

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="error-fallback">
    <ErrorIcon className="error-icon" />
    <Typography variant="h6" className="error-message">
      {error.message}
    </Typography>
    <Button
      variant="contained"
      onClick={resetErrorBoundary}
      startIcon={<RefreshIcon />}
    >
      Try Again
    </Button>
  </div>
);

// File Preview Component
const FilePreview = React.memo(({ file, onLoadError }) => {
  const [previewState, setPreviewState] = useState({
    loading: true,
    error: false,
    url: '',
    showPlaceholder: false
  });

  // Modify the FilePreview component's useEffect
useEffect(() => {
  let mounted = true;
  let currentUrl = '';
  
  const loadPreview = async () => {
    if (!file?.id || file.category !== 'image') {
      setPreviewState(prev => ({
        ...prev,
        loading: false,
        showPlaceholder: true
      }));
      return;
    }
    
    try {
      const response = await axiosInstance.get(`/api/documents/${file.id}/preview`, {
        responseType: 'blob',
        headers: { 'Accept': 'image/*' }
      });

      if (!mounted) return;

      // Create URL and store it 
      currentUrl = URL.createObjectURL(new Blob([response.data]));
      
      setPreviewState({
        loading: false,
        error: false,
        url: currentUrl,
        showPlaceholder: false
      });
    } catch (error) {
      console.error('Preview error:', { error, fileId: file.id });
      if (mounted) {
        setPreviewState({
          loading: false,
          error: true,
          url: '',
          showPlaceholder: true
        });
        onLoadError?.(file.id);
      }
    }
  };

  loadPreview();

  return () => {
    mounted = false;
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
    }
  };
}, [file?.id, file?.category, onLoadError]);

  const renderPlaceholder = () => (
    <div className={styles.previewPlaceholder}>
      {file.category === 'document' ? (
        <DescriptionIcon className="placeholder-icon" />
      ) : file.category === 'video' ? (
        <VideoFileIcon className="placeholder-icon" />
      ) : (
        <FileIcon className="placeholder-icon" />
      )}
      <Typography variant="caption" className="placeholder-text">
        {file.name}
      </Typography>
      <Typography variant="caption" className="placeholder-size">
        {formatFileSize(file.size)}
      </Typography>
    </div>
  );

  if (previewState.loading) {
    return (
      <div className={styles.previewContainer}>
        <CircularProgress size={24} />
      </div>
    );
  }

  return (
    <div className={styles.previewContainer}>
      {previewState.url && !previewState.error && file.category === 'image' ? (
        <img
          src={previewState.url}
          alt={file.name}
          className={styles.previewImage}
          onError={() => {
            setPreviewState(prev => ({
              ...prev,
              error: true,
              showPlaceholder: true
            }));
          }}
        />
      ) : (
        renderPlaceholder()
      )}
    </div>
  );
});

// Upload Dialog Component
const UploadDialog = React.memo(({
  open,
  onClose,
  onUpload,
  isUploading,
  uploadProgress
}) => {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    acceptedFiles,
    fileRejections
  } = useDropzone({
    accept: Object.values(FILE_CONFIG.ALLOWED_TYPES).reduce((acc, curr) => {
      curr.mimeTypes.forEach(type => {
        acc[type] = curr.extensions;
      });
      return acc;
    }, {}),
    maxSize: FILE_CONFIG.MAX_SIZE,
    maxFiles: FILE_CONFIG.MAX_TOTAL_FILES
  });

  useEffect(() => {
    if (!open) {
      acceptedFiles.splice(0, acceptedFiles.length);
    }
  }, [open, acceptedFiles]);

  return (
    <Dialog
      open={open}
      onClose={!isUploading ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      className={styles.uploadDialog}
    >
      <DialogTitle className={styles.dialogTitle}>
        Upload Files
        {!isUploading && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            className="close-button"
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent>
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? styles.active : ''} ${isDragReject ? 'reject' : ''}`}
        >
          <input {...getInputProps()} />
          <CloudUploadOutlined className="upload-icon" />
          <Typography variant="h6">
            Drag & Drop Files Here
          </Typography>
          <Typography variant="body2" color="textSecondary">
            or click to select files
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Supported formats: {Object.values(FILE_CONFIG.ALLOWED_TYPES)
              .flatMap(type => type.extensions)
              .join(', ')}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Maximum file size: {formatFileSize(FILE_CONFIG.MAX_SIZE)}
          </Typography>
        </div>

        {acceptedFiles.length > 0 && (
          <Paper className="accepted-files">
            <List>
              {acceptedFiles.map((file, index) => (
                <ListItem key={index}>
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
                    primary={file.name}
                    secondary={formatFileSize(file.size)}
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

        {fileRejections.length > 0 && (
          <Alert severity="error" className="rejection-alert">
            {fileRejections.length} file(s) were rejected:
            <List>
              {fileRejections.map(({ file, errors }) => (
                <ListItem key={file.path}>
                  <ListItemText
                    primary={file.name}
                    secondary={errors.map(e => e.message).join(', ')}
                  />
                </ListItem>
              ))}
            </List>
          </Alert>
        )}

        {isUploading && (
          <div className="upload-progress">
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
            />
            <Typography variant="caption" align="center">
              Uploading... {uploadProgress}%
            </Typography>
          </div>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isUploading}>
          Cancel
        </Button>
        <Button
          onClick={() => onUpload(acceptedFiles)}
          disabled={acceptedFiles.length === 0 || isUploading}
          variant="contained"
          startIcon={<UploadIcon />}
        >
          Upload {acceptedFiles.length > 0 ? `(${acceptedFiles.length})` : ''}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

// FileDetailsDialog Component
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
    setEditedFile(file);
  }, [file]);

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
    if (!editedFile?.name) return false;
    const name = editedFile.name.split('.')[0].trim();
    return name.length > 0 && name.length <= 255;
  }, [editedFile?.name]);

  if (!file) return null;

  return (
    <Dialog
      open={open}
      onClose={!isUpdating ? onClose : undefined}
      maxWidth="md"
      fullWidth
      className="file-details-dialog"
    >
      <DialogTitle className={styles.dialogTitle}>
        <div className="dialog-title-content">
          <Typography variant="h6">File Details</Typography>
          {!isUpdating && (
            <IconButton
              aria-label="close"
              onClick={onClose}
              size="small"
              className="close-button"
            >
              <CloseIcon />
            </IconButton>
          )}
        </div>
      </DialogTitle>
      <DialogContent dividers className="dialog-content">
        <div className="file-details-grid">
          <div className="preview-section">
            <FilePreview 
              file={file}
              onLoadError={(fileId) => {
                console.error(`Failed to load preview for file ${fileId}`);
              }}
            />
          </div>
          <div className="details-section">
            <TextField
              fullWidth
              label="File Name"
              value={editedFile?.name?.split('.')[0] || ''}
              onChange={(e) => setEditedFile({
                ...editedFile,
                name: `${e.target.value.trim()}.${fileExtension}`
              })}
              className="filename-input"
              error={!isValidName}
              helperText={!isValidName ? "File name cannot be empty" : ""}
              disabled={isUpdating}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="caption" color="textSecondary">
                      .{fileExtension}
                    </Typography>
                  </InputAdornment>
                ),
              }}
            />

            <div className="file-metadata-grid">
              <div className="metadata-item">
                <Typography variant="subtitle2" color="textSecondary">
                  Type
                </Typography>
                <Typography variant="body1">
                  {file.category.charAt(0).toUpperCase() + file.category.slice(1)}
                </Typography>
              </div>
              <div className="metadata-item">
                <Typography variant="subtitle2" color="textSecondary">
                  Size
                </Typography>
                <Typography variant="body1">
                  {formatFileSize(file.size)}
                </Typography>
              </div>
              <div className="metadata-item">
                <Typography variant="subtitle2" color="textSecondary">
                  Created
                </Typography>
                <Typography variant="body1">
                  {formatDistanceToNow(new Date(file.createdAt))} ago
                </Typography>
              </div>
              <div className="metadata-item">
                <Typography variant="subtitle2" color="textSecondary">
                  Last Modified
                </Typography>
                <Typography variant="body1">
                  {formatDistanceToNow(new Date(file.updatedAt))} ago
                </Typography>
              </div>
              <div className="metadata-item">
                <Typography variant="subtitle2" color="textSecondary">
                  MIME Type
                </Typography>
                <Typography variant="body1" className="mime-type">
                  {file.mimeType}
                </Typography>
              </div>
            </div>
          </div>
        </div>

        {isUpdating && (
          <div className="update-progress">
            <LinearProgress
              variant="determinate"
              value={localUpdateProgress}
              className="progress-bar"
            />
            <Typography variant="caption" className="progress-text">
              Updating... {localUpdateProgress}%
            </Typography>
          </div>
        )}
      </DialogContent>
      <DialogActions className="dialog-actions">
        <Button onClick={onClose} disabled={isUpdating} className="cancel-button">
          Cancel
        </Button>
        <div className="save-button-container">
          <Button
            onClick={() => onUpdate(editedFile)}
            disabled={isUpdating || !isValidName}
            variant="contained"
            startIcon={<SaveIcon />}
            className="save-button"
          >
            Save Changes
          </Button>
          {isUpdating && (
            <CircularProgress size={24} className="save-progress" />
          )}
        </div>
      </DialogActions>
    </Dialog>
  );
});
// Main Documents Component
const Documents = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
  const { data: documents = [], isLoading: isLoadingDocuments } = useQuery(
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

  const { data: storageData } = useQuery(
    'storage',
    async () => {
      const response = await axiosInstance.get('/api/documents/storage');
      return {
        used: parseInt(response.data.used) || 0,
        limit: parseInt(response.data.limit) || 256 * 1024 * 1024,
        available: parseInt(response.data.available) || 256 * 1024 * 1024
      };
    },
    {
      staleTime: 30000,
      cacheTime: 3600000,
      retry: 2,
      onError: (error) => {
        console.error('Storage query error:', error);
      }
    }
  );

  // Mutations
  const uploadMutation = useMutation(
    async (files) => {
      const { valid, errors } = validateFiles(files);
      
      if (valid.length === 0) {
        throw new Error(
          'No valid files to upload.\n' +
          errors.map(e => `${e.name}: ${e.errors.join(', ')}`).join('\n')
        );
      }

      const formData = new FormData();
      valid.forEach(file => formData.append('files', file));

      const response = await axiosInstance.post('/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          updateState({ uploadProgress: percentCompleted });
        }
      });

      return { response: response.data, validationErrors: errors };
    },
    {
      onSuccess: ({ response, validationErrors }) => {
        const newFiles = response.data?.files || [];
        queryClient.setQueryData('documents', (oldData = []) => {
          return [...newFiles, ...oldData];
        });

        updateState({
          snackbar: {
            open: true,
            message: validationErrors.length > 0
              ? `Uploaded ${newFiles.length} files. ${validationErrors.length} files failed.`
              : 'Files uploaded successfully',
            severity: validationErrors.length > 0 ? 'warning' : 'success'
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
            message: error.message || 'Error uploading files',
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
      const response = await axiosInstance.put(`/api/documents/${id}/favorite`);
      return response.data;
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

  // Event Handlers
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
  
      const url = URL.createObjectURL(new Blob([response.data]));
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

  // Filter and sort documents
  const filteredAndSortedDocuments = useMemo(() => {
    if (!documents) return [];

    let result = [...documents];

    // Apply search filter
    if (state.searchTerm) {
      const searchLower = state.searchTerm.toLowerCase();
      result = result.filter(doc =>
        doc.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (state.filterBy !== 'all') {
      result = result.filter(doc => doc.category === state.filterBy);
    }

    // Apply favorites filter
    if (state.tabValue === 1) {
      result = result.filter(doc => doc.isFavorite);
    }

    // Apply sorting
    const isDesc = state.sortBy.startsWith('-');
    const sortField = isDesc ? state.sortBy.slice(1) : state.sortBy;

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        default:
          comparison = 0;
      }
      return isDesc ? -comparison : comparison;
    });

    return result;
  }, [documents, state.searchTerm, state.filterBy, state.tabValue, state.sortBy]);

  const renderDocumentCard = useCallback((doc) => (
    <motion.div
      key={doc.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="document-card-container"
    >
      <Card 
        className={styles.documentCard}
        onClick={() => updateState({
          selectedFile: doc,
          isFileDetailsOpen: true
        })}
        onContextMenu={(e) => {
          e.preventDefault();
          updateState({
            selectedFileId: doc.id,
            menuAnchorEl: e.currentTarget
          });
        }}
      >
        <FilePreview
          file={doc}
          onLoadError={(fileId) => {
            console.error(`Failed to load preview for file ${fileId}`);
          }}
        />
        <CardContent className="card-content">
          <Typography variant="subtitle1" className="document-name">
            {doc.name}
          </Typography>
          <Typography variant="body2" className="document-size">
            {formatFileSize(doc.size)}
          </Typography>
          <div className="document-tags">
            <Chip
              label={doc.category}
              size="small"
              color={
                doc.category === 'document' ? 'primary' :
                doc.category === 'image' ? 'secondary' :
                doc.category === 'video' ? 'error' : 'default'
              }
              className={styles.categoryChip}
            />
            {doc.isFavorite && (
              <Chip
                label="Favorite"
                size="small"
                color="warning"
                icon={<StarIcon />}
                className={styles.favoriteChip}
              />
            )}
          </div>
        </CardContent>
        <CardActions className="card-actions">
          <Tooltip title={doc.isFavorite ? "Remove from Favorites" : "Add to Favorites"}>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite(doc.id);
              }}
              size="small"
              className={`favorite-button ${doc.isFavorite ? styles.active : ''}`}
            >
              {doc.isFavorite ? <StarIcon /> : <StarBorderIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(doc.id, doc.name);
              }}
              size="small"
              className="download-button"
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
              size="small"
              className="delete-button"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
    </motion.div>
  ), [handleToggleFavorite, handleDownload, handleDeleteDocument, updateState]);

  // Render
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
      <div className={styles.documentsPage}>
        <div className={styles.documentsContainer}>
          <div className={styles.documentsHeader}>
            <div className={styles.headerTitle}>
              <Typography variant="h4" className={styles.titleText}>
                Documents
              </Typography>
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={() => updateState({ isUploadDialogOpen: true })}
                className="upload-button"
              >
                Upload
              </Button>
            </div>

            {storageData && (
              <div className={styles.storageInfo}>
                <Typography variant="subtitle2">
                  Storage Used: {formatFileSize(storageData.used)} of {formatFileSize(storageData.limit)}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(((storageData.used / storageData.limit) || 0) * 100, 100)}
                  className={styles.storageProgress}
                />
              </div>
            )}

            <Tabs
              value={state.tabValue}
              onChange={(_, newValue) => updateState({ tabValue: newValue })}
              className="document-tabs"
              variant={isMobile ? "fullWidth" : "standard"}
            >
              <Tab label="All Documents" />
              <Tab label="Favorites" />
            </Tabs>

            <div className={styles.searchFilterSection}>
              <TextField
                fullWidth
                placeholder="Search documents..."
                value={state.searchTerm}
                onChange={(e) => updateState({ searchTerm: e.target.value })}
                className={styles.searchField}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl fullWidth>
                <Select
                  value={state.sortBy}
                  onChange={(e) => updateState({ sortBy: e.target.value })}
                  className="sort-select"
                  startAdornment={<SortIcon className="select-icon" />}
                >
                  <MenuItem value="name">Name (A-Z)</MenuItem>
                  <MenuItem value="-name">Name (Z-A)</MenuItem>
                  <MenuItem value="size">Size (Smallest)</MenuItem>
                  <MenuItem value="-size">Size (Largest)</MenuItem>
                  <MenuItem value="-createdAt">Date (Newest)</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <Select
                  value={state.filterBy}
                  onChange={(e) => updateState({ filterBy: e.target.value })}
                  className="filter-select"
                  startAdornment={<FilterIcon className="select-icon" />}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="document">Documents</MenuItem>
                  <MenuItem value="image">Images</MenuItem>
                  <MenuItem value="video">Videos</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>

          <div className="documents-content">
            {isLoadingDocuments ? (
              <div className={styles.loadingState}>
                <CircularProgress />
              </div>
            ) : filteredAndSortedDocuments.length === 0 ? (
              <div className={styles.emptyState}>
                <FolderIcon className={styles.emptyIcon} />
                <Typography variant="h6" className="empty-title">
                  {state.searchTerm
                    ? "No documents match your search"
                    : state.tabValue === 1
                      ? "No favorite documents"
                      : "No documents found"}
                </Typography>
                <Typography variant="body2" className="empty-description">
                  {state.searchTerm
                    ? "Try adjusting your search criteria"
                    : state.tabValue === 1
                      ? "Mark some documents as favorites to see them here"
                      : "Upload some files to get started"}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={() => updateState({ isUploadDialogOpen: true })}
                  className="empty-upload-button"
                >
                  Upload Files
                </Button>
              </div>
            ) : (
              <div className={styles.documentsGrid}>
                <AnimatePresence mode="sync">
                  {filteredAndSortedDocuments.map(renderDocumentCard)}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Context Menu */}
          <Menu
            anchorEl={state.menuAnchorEl}
            open={Boolean(state.menuAnchorEl)}
            onClose={() => updateState({ menuAnchorEl: null })}
            className="context-menu"
          >
            <MenuItem 
              onClick={() => {
                handleDownload(state.selectedFileId, 
                  documents.find(doc => doc.id === state.selectedFileId)?.name
                );
                updateState({ menuAnchorEl: null });
              }}
            >
              <ListItemIcon>
                <DownloadIcon className="menu-icon" />
              </ListItemIcon>
              <ListItemText>Download</ListItemText>
            </MenuItem>
            <MenuItem 
              onClick={() => {
                handleToggleFavorite(state.selectedFileId);
                updateState({ menuAnchorEl: null });
              }}
            >
              <ListItemIcon>
                {documents.find(doc => doc.id === state.selectedFileId)?.isFavorite ? (
                  <StarIcon className="menu-icon favorite" />
                ) : (
                  <StarBorderIcon className="menu-icon" />
                )}
              </ListItemIcon>
              <ListItemText>
                {documents.find(doc => doc.id === state.selectedFileId)?.isFavorite
                  ? "Remove from Favorites"
                  : "Add to Favorites"}
              </ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                handleDeleteDocument(state.selectedFileId);
                updateState({ menuAnchorEl: null });
              }}
              className="delete-menu-item"
            >
              <ListItemIcon>
                <DeleteIcon className="menu-icon delete" />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </Menu>

          {/* Upload Dialog */}
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

          {/* File Details Dialog */}
          {state.selectedFile && (
            <FileDetailsDialog
              open={state.isFileDetailsOpen}
              onClose={() => updateState({
                isFileDetailsOpen: false,
                selectedFile: null,
                updateProgress: 0
              })}
              file={state.selectedFile}
              onUpdate={(file) => {
                updateState({ isUpdating: true });
                // Implement file update logic here
              }}
              isUpdating={state.isUpdating}
              updateProgress={state.updateProgress}
            />
          )}

          {/* Snackbar for notifications */}
          <Snackbar
            open={state.snackbar.open}
            autoHideDuration={6000}
            onClose={() => updateState({
              snackbar: { ...state.snackbar, open: false }
            })}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            className="snackbar"
          >
            <Alert
              onClose={() => updateState({
                snackbar: { ...state.snackbar, open: false }
              })}
              severity={state.snackbar.severity}
              variant="filled"
              className="alert"
            >
              {state.snackbar.message}
            </Alert>
          </Snackbar>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Documents;