import React, { useState, useMemo } from "react";
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
  Avatar,
  Tooltip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  AddCircle as AddCircleIcon,
  Delete as DeleteIcon,
  UploadFile as UploadFileIcon,
  FileCopy as FileCopyIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  Sort as SortIcon,
} from "@mui/icons-material";
import { styled } from "@mui/system";
import moment from "moment";

const PageWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4, 2),
  backgroundColor: theme.palette.background.default,
  minHeight: "100vh",
}));

const DocumentList = styled(List)(({ theme }) => ({
  width: "100%",
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

const ListItemStyled = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: "flex",
  alignItems: "center",
  "&:last-child": {
    borderBottom: "none",
  },
}));

const AvatarStyled = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  marginRight: theme.spacing(2),
}));

const MAX_TOTAL_SIZE_MB = 128;
const DOCUMENTS_PER_PAGE = 9;

const exampleDocuments = [
  {
    id: 1,
    name: "Lease Agreement",
    extension: "pdf",
    size: "0.22 MB",
    uploadDate: moment().subtract(2, "days").format("YYYY-MM-DD HH:mm"),
  },
  {
    id: 2,
    name: "Invoice",
    extension: "docx",
    size: "0.15 MB",
    uploadDate: moment().subtract(1, "days").format("YYYY-MM-DD HH:mm"),
  },
  {
    id: 3,
    name: "Property Layout",
    extension: "pdf",
    size: "1.1 MB",
    uploadDate: moment().subtract(3, "hours").format("YYYY-MM-DD HH:mm"),
  },
];

const Documents = () => {
  const [dialogState, setDialogState] = useState({
    addDocumentOpen: false,
    deleteDocumentId: null,
    isUploading: false,
    editingDocumentId: null,
  });
  const [uploadedDocuments, setUploadedDocuments] = useState(exampleDocuments);
  const [file, setFile] = useState(null);
  const [totalSize, setTotalSize] = useState(
    exampleDocuments.reduce((total, doc) => total + parseFloat(doc.size), 0)
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("alphabetical");
  const [filterType, setFilterType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: "",
  });
  const [editedName, setEditedName] = useState("");

  const availableExtensions = useMemo(
    () => [...new Set(uploadedDocuments.map((doc) => doc.extension))],
    [uploadedDocuments]
  );

  const handleClose = () => setDialogState({ ...dialogState, addDocumentOpen: false, deleteDocumentId: null, editingDocumentId: null });

  const handleDeleteDocument = () => {
    const updatedDocuments = uploadedDocuments.filter(
      (doc) => doc.id !== dialogState.deleteDocumentId
    );
    setUploadedDocuments(updatedDocuments);
    setTotalSize(
      updatedDocuments.reduce((total, doc) => total + parseFloat(doc.size), 0)
    );
    setSnackbarState({ open: true, message: "Document deleted successfully!" });
    handleClose();
  };

  const handleUpload = () => {
    if (!file) return;
    setDialogState({ ...dialogState, isUploading: true });
    const fileSizeMB = file.size / 1024 / 1024;
    if (totalSize + fileSizeMB > MAX_TOTAL_SIZE_MB) {
      alert("Total file size exceeds the limit of 128 MB.");
      setDialogState({ ...dialogState, isUploading: false });
      return;
    }
    setTimeout(() => {
      const [name, extension] = file.name.split(".");
      const newDocument = {
        id: uploadedDocuments.length + 1,
        name,
        extension,
        size: `${fileSizeMB.toFixed(2)} MB`,
        uploadDate: moment().format("YYYY-MM-DD HH:mm"),
      };
      const updatedDocuments = [...uploadedDocuments, newDocument];
      setUploadedDocuments(updatedDocuments);
      setTotalSize(
        updatedDocuments.reduce((total, doc) => total + parseFloat(doc.size), 0)
      );
      setSnackbarState({ open: true, message: "Document uploaded successfully!" });
      setFile(null);
      handleClose();
    }, 2000);
  };

  const handleRename = () => {
    const updatedDocuments = uploadedDocuments.map((doc) =>
      doc.id === dialogState.editingDocumentId ? { ...doc, name: editedName } : doc
    );
    setUploadedDocuments(updatedDocuments);
    setSnackbarState({ open: true, message: "Document renamed successfully!" });
    handleClose();
  };

  const filteredDocuments = useMemo(
    () =>
      uploadedDocuments
        .filter(
          (document) =>
            document.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            document.extension.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .filter((document) => (filterType ? document.extension === filterType : true))
        .sort((a, b) => {
          if (sortOrder === "alphabetical") return a.name.localeCompare(b.name);
          if (sortOrder === "sizeAsc") return parseFloat(a.size) - parseFloat(b.size);
          if (sortOrder === "sizeDesc") return parseFloat(b.size) - parseFloat(a.size);
          if (sortOrder === "dateAsc") return new Date(a.uploadDate) - new Date(b.uploadDate);
          if (sortOrder === "dateDesc") return new Date(b.uploadDate) - new Date(a.uploadDate);
          return 0;
        }),
    [searchTerm, sortOrder, filterType, uploadedDocuments]
  );

  const paginatedDocuments = useMemo(
    () => filteredDocuments.slice((currentPage - 1) * DOCUMENTS_PER_PAGE, currentPage * DOCUMENTS_PER_PAGE),
    [currentPage, filteredDocuments]
  );

  return (
    <PageWrapper>
      <Typography variant="h4" gutterBottom>Documents</Typography>
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setDialogState({ ...dialogState, addDocumentOpen: true })}
            startIcon={<AddCircleIcon />}
            sx={{ maxWidth: "220px", flexShrink: 0 }}
          >
            Upload New Document
          </Button>

          <FormControl variant="outlined" sx={{ minWidth: 120 }}>
            <InputLabel>Sort By</InputLabel>
            <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} startAdornment={<InputAdornment position="start"><SortIcon /></InputAdornment>}>
              <MenuItem value="alphabetical">Alphabetical</MenuItem>
              <MenuItem value="sizeAsc">Size (Ascending)</MenuItem>
              <MenuItem value="sizeDesc">Size (Descending)</MenuItem>
              <MenuItem value="dateAsc">Date (Oldest First)</MenuItem>
              <MenuItem value="dateDesc">Date (Newest First)</MenuItem>
            </Select>
          </FormControl>

          <FormControl variant="outlined" sx={{ minWidth: 120 }}>
            <InputLabel>Filter By Type</InputLabel>
            <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <MenuItem value=""><em>None</em></MenuItem>
              {availableExtensions.map((ext) => (
                <MenuItem key={ext} value={ext}>{ext.toUpperCase()}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <TextField
          variant="outlined"
          placeholder="Search Documents"
          sx={{ maxWidth: "300px", flexGrow: 1, ml: 2 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      <DocumentList>
        {paginatedDocuments.map((document) => (
          <ListItemStyled key={document.id}>
            <AvatarStyled><FileCopyIcon /></AvatarStyled>
            <Box flex="1" display="flex" alignItems="center">
              {dialogState.editingDocumentId === document.id ? (
                <TextField
                  variant="outlined"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={(e) => e.key === "Enter" && handleRename()}
                  sx={{ flexGrow: 1 }}
                />
              ) : (
                <ListItemText
                  primary={
                    <Tooltip title="Click to edit">
                      <Box onClick={() => setDialogState({ ...dialogState, editingDocumentId: document.id })} sx={{ cursor: "pointer" }}>
                        {document.name}.{document.extension}
                      </Box>
                    </Tooltip>
                  }
                  secondary={`Size: ${document.size} | Uploaded: ${document.uploadDate}`}
                />
              )}
            </Box>
            <IconButton onClick={() => console.log("Downloading", document.name)}><DownloadIcon /></IconButton>
            <IconButton onClick={() => setDialogState({ ...dialogState, deleteDocumentId: document.id })}><DeleteIcon /></IconButton>
          </ListItemStyled>
        ))}
      </DocumentList>

      {filteredDocuments.length > DOCUMENTS_PER_PAGE && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination count={Math.ceil(filteredDocuments.length / DOCUMENTS_PER_PAGE)} page={currentPage} onChange={(e, val) => setCurrentPage(val)} color="primary" />
        </Box>
      )}

      <Dialog open={dialogState.addDocumentOpen} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Upload New Document</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" mb={2}>
            <input
              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              style={{ display: "none" }}
              id="upload-file"
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <label htmlFor="upload-file">
              <Button variant="contained" color="primary" component="span" startIcon={<UploadFileIcon />}>Choose File</Button>
            </label>
            {file && <Typography variant="body1" mt={2}>{file.name}</Typography>}
            <Typography variant="body2" color="textSecondary" mt={1}>Accepted file types: PDF, DOC, DOCX. Max upload size: 128 MB total.</Typography>
          </Box>
          {dialogState.isUploading && <CircularProgress />}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Cancel</Button>
          <Button onClick={handleUpload} color="primary" disabled={!file || dialogState.isUploading}>Upload</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!dialogState.deleteDocumentId} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent><Typography>Are you sure you want to delete this document? This action cannot be undone.</Typography></DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Cancel</Button>
          <Button onClick={handleDeleteDocument} color="primary">Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarState.open} autoHideDuration={3000} onClose={() => setSnackbarState({ ...snackbarState, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "left" }}>
        <Alert onClose={() => setSnackbarState({ ...snackbarState, open: false })} severity="success">{snackbarState.message}</Alert>
      </Snackbar>
    </PageWrapper>
  );
};

export default Documents;
