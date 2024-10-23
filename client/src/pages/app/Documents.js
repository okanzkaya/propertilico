import React, { useState, useMemo, useCallback, useEffect, forwardRef } from 'react';
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

import { styled, alpha } from '@mui/material/styles';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { formatDistanceToNow } from 'date-fns';
import axiosInstance from '../../axiosSetup';

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_TOTAL_FILES = 10;
const MAX_TOTAL_SIZE = MAX_FILE_SIZE * MAX_TOTAL_FILES;
const ALLOWED_FILE_TYPES = {
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
};

// Priority Queue for Preview Loading
class PriorityQueue {
  constructor() {
    this.values = [];
  }

  enqueue(element, priority) {
    this.values.push({ element, priority, timestamp: Date.now() });
    this.sort();
  }

  dequeue() {
    return this.values.shift()?.element;
  }

  sort() {
    this.values.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return a.timestamp - b.timestamp;
    });
  }

  isEmpty() {
    return this.values.length === 0;
  }
}

// Preview Queue System
const previewQueue = {
  queue: new Map(),
  inProgress: new Set(),
  maxConcurrent: 3,
  priorityQueue: new PriorityQueue(),

  async add(fileId, loadFn, priority = 1) {
    if (this.queue.has(fileId)) {
      return this.queue.get(fileId);
    }

    if (this.inProgress.has(fileId)) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!this.inProgress.has(fileId)) {
            clearInterval(checkInterval);
            resolve(this.queue.get(fileId));
          }
        }, 100);
      });
    }

    const promise = new Promise((resolve, reject) => {
      if (this.inProgress.size >= this.maxConcurrent) {
        this.priorityQueue.enqueue({
          fileId,
          loadFn,
          resolve,
          reject,
          priority,
        }, priority);
      } else {
        this.process(fileId, loadFn).then(resolve).catch(reject);
      }
    });

    this.queue.set(fileId, promise);
    return promise;
  },

  async process(fileId, loadFn) {
    this.inProgress.add(fileId);
    try {
      const result = await loadFn();
      return result;
    } finally {
      this.inProgress.delete(fileId);
      setTimeout(() => this.processNext(), 50);
    }
  },

  processNext() {
    if (this.inProgress.size >= this.maxConcurrent || this.priorityQueue.isEmpty()) {
      return;
    }

    while (this.inProgress.size < this.maxConcurrent && !this.priorityQueue.isEmpty()) {
      const { fileId, loadFn, resolve, reject } = this.priorityQueue.dequeue();
      this.process(fileId, loadFn).then(resolve).catch(reject);
    }
  },

  clear() {
    this.queue.clear();
    this.inProgress.clear();
    this.priorityQueue = new PriorityQueue();
  }
};

// Utility Functions
const validateFiles = (files) => {
  const results = {
    valid: [],
    errors: []
  };

  let totalSize = 0;

  Array.from(files).forEach(file => {
    const errors = [];
    totalSize += file.size;

    // Check individual file size
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
    }

    // Check file type
    const isAllowedType = Object.values(ALLOWED_FILE_TYPES)
      .flatMap(type => type.mimeTypes)
      .includes(file.type);

    if (!isAllowedType) {
      errors.push('File type not supported');
    }

    if (errors.length === 0) {
      results.valid.push(file);
    } else {
      results.errors.push({
        name: file.name,
        errors
      });
    }
  });

  // Check total size
  if (totalSize > MAX_TOTAL_SIZE) {
    results.errors.push({
      name: 'Total Size',
      errors: [`Total size exceeds ${MAX_TOTAL_SIZE / 1024 / 1024}MB limit`]
    });
    results.valid = [];
  }

  return results;
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Styled Components
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

const PageWrapper = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
}));

const HeaderWrapper = styled(Box)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(2),
}));

// Alert Component
const Alert = forwardRef((props, ref) => (
  <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));

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
      Something went wrong
    </Typography>
    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
      {error.message}
    </Typography>
    <Button
      variant="contained"
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
    previewUrl: '',
    showPlaceholder: false
  });

  // Cleanup function
  useEffect(() => {
    return () => {
      if (state.previewUrl && !state.previewUrl.startsWith('data:')) {
        URL.revokeObjectURL(state.previewUrl);
      }
    };
  }, [state.previewUrl]);

  // Load preview only for images
  useEffect(() => {
    let mounted = true;
    
    const loadPreview = async () => {
      if (!file?.id || file.category !== 'image') {
        setState(prev => ({
          ...prev,
          isLoading: false,
          showPlaceholder: true
        }));
        return;
      }
      
      try {
        setState(prev => ({ ...prev, isLoading: true, error: false }));

        const response = await axiosInstance.get(`/api/documents/${file.id}/preview`, {
          responseType: 'arraybuffer',
          headers: {
            'Accept': 'image/jpeg,image/svg+xml,*/*',
          }
        });

        if (!mounted) return;

        const contentType = response.headers['content-type'];
        const blob = new Blob([response.data], { type: contentType });
        const url = URL.createObjectURL(blob);

        // Verify the image loads correctly
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });

        if (mounted) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            previewUrl: url,
            showPlaceholder: false
          }));
        }
      } catch (error) {
        console.error('Preview loading error:', {
          error,
          fileId: file.id
        });
        if (mounted) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: true,
            showPlaceholder: true
          }));
          onLoadError?.(file.id);
        }
      }
    };

    loadPreview();

    return () => {
      mounted = false;
    };
  }, [file?.id, file?.category, onLoadError]);

  // Enhanced placeholder with better styling
  const renderPlaceholder = () => (
    <Box sx={{ 
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: theme => theme.palette.text.secondary
    }}>
      {file.category === 'document' ? (
        <DescriptionIcon sx={{ fontSize: 64, color: 'primary.main' }} />
      ) : file.category === 'video' ? (
        <VideoFileIcon sx={{ fontSize: 64, color: 'error.main' }} />
      ) : (
        <FileIcon sx={{ fontSize: 64, color: 'action.active' }} />
      )}
      <Typography 
        variant="caption" 
        display="block" 
        sx={{ 
          mt: 1,
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          px: 2
        }}
      >
        {file.name}
      </Typography>
      <Typography 
        variant="caption" 
        color="textSecondary"
        sx={{ mt: 0.5 }}
      >
        {formatFileSize(file.size)}
      </Typography>
    </Box>
  );

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

      {!state.isLoading && state.previewUrl && !state.error && file.category === 'image' && (
        <Box sx={{ 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <PreviewImage
            src={state.previewUrl}
            alt={file.name}
            onLoad={() => console.log('Preview rendered:', file.id)}
            onError={(e) => {
              console.error('Preview render error:', {
                fileId: file.id,
                error: e
              });
              setState(prev => ({
                ...prev,
                error: true,
                showPlaceholder: true
              }));
            }}
            sx={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain'
            }}
          />
        </Box>
      )}

      {(file.category !== 'image' || state.error || state.showPlaceholder) && !state.isLoading && renderPlaceholder()}
    </PreviewContainer>
  );
});

// Update PreviewContainer styled component
const PreviewContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '200px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.action.hover,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  padding: theme.spacing(2),
}));

// Update PreviewImage styled component
const PreviewImage = styled('img')({
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain',
  transition: 'opacity 0.3s ease-in-out',
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
    fileRejections
  } = useDropzone({
    accept: Object.values(ALLOWED_FILE_TYPES).reduce((acc, curr) => {
      curr.mimeTypes.forEach(type => {
        acc[type] = curr.extensions;
      });
      return acc;
    }, {}),
    maxSize: MAX_FILE_SIZE,
    maxFiles: MAX_TOTAL_FILES,
    onDropRejected: (rejections) => {
      console.log('Drop rejected:', rejections);
    }
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
      PaperProps={{
        sx: {
          m: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>
        Upload Files
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
          <Typography variant="body2" color="textSecondary" gutterBottom>
            or click to select files
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Supported formats: {Object.values(ALLOWED_FILE_TYPES)
              .flatMap(type => type.extensions)
              .join(', ')}
          </Typography>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            Maximum file size: {formatFileSize(MAX_FILE_SIZE)}
          </Typography>
        </StyledDropzone>

        {acceptedFiles.length > 0 && (
          <Paper variant="outlined" sx={{ mt: 2, maxHeight: 200, overflow: 'auto' }}>
            <List dense>
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
          <Alert severity="error" sx={{ mt: 2 }}>
            {fileRejections.length} file(s) were rejected:
            <List dense>
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
          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
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
              Uploading... {uploadProgress}%
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
            Upload {acceptedFiles.length > 0 ? `(${acceptedFiles.length})` : ''}
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

// File Details Dialog Component
const FileDetailsDialog = React.memo(({
  open,
  onClose,
  file,
  onUpdate,
  isUpdating,
  updateProgress
}) => {
  const theme = useTheme();
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
      PaperProps={{
        sx: {
          m: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">File Details</Typography>
          {!isUpdating && (
            <IconButton
              aria-label="close"
              onClick={onClose}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FilePreview 
              file={file}
              onLoadError={(fileId) => {
                console.error(`Failed to load preview for file ${fileId}`);
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="File Name"
              value={editedFile?.name?.split('.')[0] || ''}
              onChange={(e) => setEditedFile({
                ...editedFile,
                name: `${e.target.value.trim()}.${fileExtension}`
              })}
              sx={{ mb: 2 }}
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

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Type
                </Typography>
                <Typography variant="body1">
                  {file.category.charAt(0).toUpperCase() + file.category.slice(1)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Size
                </Typography>
                <Typography variant="body1">
                  {formatFileSize(file.size)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">
                  Created
                </Typography>
                <Typography variant="body1">
                  {formatDistanceToNow(new Date(file.createdAt))} ago
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">
                  Last Modified
                </Typography>
                <Typography variant="body1">
                  {formatDistanceToNow(new Date(file.updatedAt))} ago
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">
                  MIME Type
                </Typography>
                <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                  {file.mimeType}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {isUpdating && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={localUpdateProgress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                }
              }}
            />
            <Typography variant="caption" color="textSecondary" align="center" sx={{ mt: 1, display: 'block' }}>
              Updating... {localUpdateProgress}%
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isUpdating}>
          Cancel
        </Button>
        <Box sx={{ position: 'relative' }}>
          <Button
            onClick={() => onUpdate(editedFile)}
            disabled={isUpdating || !isValidName}
            variant="contained"
            startIcon={<SaveIcon />}
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

// Main Documents Component
const Documents = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

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
      console.log('Storage response:', response.data); // Add debugging
      return {
        used: parseInt(response.data.used) || 0,
        limit: parseInt(response.data.limit) || 256 * 1024 * 1024, // 256MB default
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
        
        // Update cache with new files
        queryClient.setQueryData('documents', (oldData = []) => {
          return [...newFiles, ...oldData];
        });

        // Show status message
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

        // Refresh queries
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

  const updateMutation = useMutation(
    async (document) => {
      const response = await axiosInstance.put(`/api/documents/${document.id}`, document);
      return response.data;
    },
    {
      onSuccess: (updatedDoc) => {
        queryClient.setQueryData('documents', (old = []) =>
          old.map(doc =>
            doc.id === updatedDoc.id ? updatedDoc : doc
          )
        );

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
      onError: (error) => {
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

  // Handle document selection and details
  const handleFileDetails = useCallback((file) => {
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

  // Filter and sort documents
  const filteredAndSortedDocuments = useMemo(() => {
    if (!documentsQuery.data) return [];

    let result = documentsQuery.data;

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

    return result.sort((a, b) => {
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
  }, [documentsQuery.data, state.searchTerm, state.filterBy, state.tabValue, state.sortBy]);

  // Context menu component
  const ContextMenu = useCallback(({ anchorEl, onClose }) => {
    const selectedDocument = documentsQuery.data?.find(
      doc => doc.id === state.selectedFileId
    );

    if (!selectedDocument) return null;

    return (
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => {
          handleDownload(selectedDocument.id, selectedDocument.name);
          onClose();
        }}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handleToggleFavorite(selectedDocument.id);
          onClose();
        }}>
          <ListItemIcon>
            {selectedDocument.isFavorite ? (
              <StarIcon fontSize="small" color="warning" />
            ) : (
              <StarBorderIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {selectedDocument.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          </ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          handleDeleteDocument(selectedDocument.id);
          onClose();
        }} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    );
  }, [documentsQuery.data, state.selectedFileId, handleDownload, handleToggleFavorite, handleDeleteDocument]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      previewQueue.clear();
    };
  }, []);

  // Main render
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
        <HeaderWrapper>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Documents
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
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
  <Box sx={{ mt: 3 }}>
    <Typography variant="subtitle2" gutterBottom>
      Storage Used: {formatFileSize(storageQuery.data.used)} of {formatFileSize(storageQuery.data.limit)}
    </Typography>
    <LinearProgress
      variant="determinate"
      value={Math.min(((storageQuery.data.used / storageQuery.data.limit) || 0) * 100, 100)}
      sx={{ height: 8, borderRadius: 4 }}
    />
  </Box>
)}

          <Tabs
            value={state.tabValue}
            onChange={(_, newValue) => updateState({ tabValue: newValue })}
            sx={{ mb: 2, mt: 3 }}
          >
            <Tab label="All Documents" />
            <Tab label="Favorites" />
          </Tabs>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
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
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </HeaderWrapper>

        {documentsQuery.isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredAndSortedDocuments.length === 0 ? (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 400,
            p: 4
          }}>
            <FolderIcon sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {state.searchTerm
                ? "No documents match your search"
                : state.tabValue === 1
                  ? "No favorite documents"
                  : "No documents found"}
            </Typography>
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 2 }}>
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
            >
              Upload Files
            </Button>
          </Box>
        ) : (
          <Grid container spacing={isSmallScreen ? 2 : 3}>
            <AnimatePresence mode="sync">
              {filteredAndSortedDocuments.map((doc) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={doc.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <StyledCard
                      onClick={() => handleFileDetails(doc)}
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
                      <CardContent>
                        <Typography variant="subtitle1" noWrap title={doc.name}>
                          {doc.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {formatFileSize(doc.size)}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={doc.category}
                            size="small"
                            color={
                              doc.category === 'document' ? 'primary' :
                              doc.category === 'image' ? 'secondary' :
                              doc.category === 'video' ? 'error' : 'default'
                            }
                          />
                          {doc.isFavorite && (
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
                        <Tooltip title={doc.isFavorite ? "Remove from Favorites" : "Add to Favorites"}>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(doc.id);
                            }}
                            size="small"
                            color={doc.isFavorite ? "warning" : "default"}
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
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </CardActions>
                    </StyledCard>
                  </motion.div>
                </Grid>
              ))}
            </AnimatePresence>
          </Grid>
        )}

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

export default Documents;