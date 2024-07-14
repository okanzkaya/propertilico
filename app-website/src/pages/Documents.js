import React, { useState } from 'react';
import {
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
} from '@mui/material';
import { styled } from '@mui/system';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import DownloadIcon from '@mui/icons-material/Download';
import moment from 'moment';

const PageWrapper = styled(Box)({
  padding: '2rem',
  backgroundColor: '#f4f6f8',
  minHeight: '100vh',
});

const FileUploadWrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1rem',
});

const DocumentList = styled(List)({
  width: '100%',
  backgroundColor: 'white',
  borderRadius: '8px',
});

const MAX_TOTAL_SIZE_MB = 128;

const exampleDocuments = [
  {
    id: 1,
    name: 'Lease Agreement.pdf',
    type: 'PDF',
    size: '0.22 MB',
    uploadDate: moment().subtract(2, 'days').format('YYYY-MM-DD HH:mm'),
  },
  {
    id: 2,
    name: 'Invoice.docx',
    type: 'DOCX',
    size: '0.15 MB',
    uploadDate: moment().subtract(1, 'days').format('YYYY-MM-DD HH:mm'),
  },
  {
    id: 3,
    name: 'Property Layout.pdf',
    type: 'PDF',
    size: '1.1 MB',
    uploadDate: moment().subtract(3, 'hours').format('YYYY-MM-DD HH:mm'),
  },
];

const Documents = () => {
  const [addDocumentOpen, setAddDocumentOpen] = useState(false);
  const [deleteDocumentId, setDeleteDocumentId] = useState(null);
  const [uploadedDocuments, setUploadedDocuments] = useState(exampleDocuments);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [totalSize, setTotalSize] = useState(
    exampleDocuments.reduce((total, doc) => total + parseFloat(doc.size), 0)
  );

  const handleClose = () => {
    setAddDocumentOpen(false);
    setDeleteDocumentId(null);
  };

  const handleAddDocumentOpen = () => {
    setAddDocumentOpen(true);
  };

  const handleDeleteDocument = (documentId) => {
    const updatedDocuments = uploadedDocuments.filter((doc) => doc.id !== documentId);
    setUploadedDocuments(updatedDocuments);
    setTotalSize(updatedDocuments.reduce((total, doc) => total + parseFloat(doc.size), 0));
    setDeleteDocumentId(null);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (file) {
      setIsUploading(true);
      const fileSizeMB = file.size / 1024 / 1024;
      if (totalSize + fileSizeMB > MAX_TOTAL_SIZE_MB) {
        alert('Total file size exceeds the limit of 128 MB.');
        setIsUploading(false);
        return;
      }
      setTimeout(() => {
        const newDocument = {
          id: uploadedDocuments.length + 1,
          name: file.name,
          type: file.type.split('/')[1].toUpperCase(),
          size: `${fileSizeMB.toFixed(2)} MB`,
          uploadDate: moment().format('YYYY-MM-DD HH:mm'),
        };
        const updatedDocuments = [...uploadedDocuments, newDocument];
        setUploadedDocuments(updatedDocuments);
        setTotalSize(updatedDocuments.reduce((total, doc) => total + parseFloat(doc.size), 0));
        setFile(null);
        setIsUploading(false);
        setAddDocumentOpen(false);
      }, 2000); // Simulate upload delay
    }
  };

  return (
    <PageWrapper>
      <Typography variant="h4" gutterBottom>
        Documents
      </Typography>

      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Button variant="contained" color="primary" onClick={handleAddDocumentOpen} startIcon={<AddCircleIcon />}>
          Upload New Document
        </Button>
      </Box>

      <DocumentList>
        {uploadedDocuments.map((document) => (
          <ListItem key={document.id}>
            <Avatar sx={{ marginRight: 2 }}>
              <FileCopyIcon />
            </Avatar>
            <ListItemText
              primary={document.name}
              secondary={`Type: ${document.type} | Size: ${document.size} | Uploaded: ${document.uploadDate}`}
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => console.log('Downloading', document.name)}>
                <DownloadIcon />
              </IconButton>
              <IconButton edge="end" onClick={() => setDeleteDocumentId(document.id)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </DocumentList>

      <Dialog open={addDocumentOpen} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Upload New Document</DialogTitle>
        <DialogContent>
          <FileUploadWrapper>
            <input
              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              style={{ display: 'none' }}
              id="upload-file"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="upload-file">
              <Button variant="contained" color="primary" component="span" startIcon={<UploadFileIcon />}>
                Choose File
              </Button>
            </label>
            {file && (
              <Typography variant="body1" style={{ marginTop: '1rem', textAlign: 'center' }}>
                {file.name}
              </Typography>
            )}
            <Typography variant="body2" color="textSecondary" style={{ marginTop: '0.5rem', textAlign: 'center' }}>
              Accepted file types: PDF, DOC, DOCX. Maximum upload size: 128 MB total.
            </Typography>
          </FileUploadWrapper>
          {isUploading && <CircularProgress />}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleUpload} color="primary" disabled={!file || isUploading}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {deleteDocumentId && (
        <Dialog open={!!deleteDocumentId} onClose={handleClose} fullWidth maxWidth="sm">
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this document? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={() => handleDeleteDocument(deleteDocumentId)} color="primary">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </PageWrapper>
  );
};

export default Documents;
