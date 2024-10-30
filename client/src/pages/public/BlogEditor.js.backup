import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import { FaSpinner, FaImage, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './BlogEditor.css';

const CHAR_LIMITS = {
  title: 3,
  content: 100,
  excerpt: { min: 10, max: 300 }
};

const BlogEditor = () => {
  const [blog, setBlog] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: '',
    status: 'published',
    imageUrl: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [validationDetails, setValidationDetails] = useState({
    title: { valid: true, message: '' },
    content: { valid: true, message: '' },
    excerpt: { valid: true, message: '' }
  });

  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const fetchBlog = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/blogs/${id}`);
      const blogData = response.data.data.blog;
      setBlog({
        title: blogData.title,
        content: blogData.content,
        excerpt: blogData.excerpt,
        tags: Array.isArray(blogData.tags) ? blogData.tags.join(', ') : blogData.tags,
        status: blogData.status || 'published',
        imageUrl: blogData.imageUrl || ''
      });
      if (blogData.imageUrl) {
        setImagePreview(blogData.imageUrl);
      }
    } catch (error) {
      setError('Failed to fetch blog post. Please try again.');
      console.error('Error fetching blog:', error);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchBlog();
    }
  }, [id, fetchBlog]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('File must be an image');
      return;
    }

    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setError('');
  };

  const removeImage = useCallback(() => {
    setImageFile(null);
    if (imagePreview && !imagePreview.startsWith('/')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setBlog(prev => ({ ...prev, imageUrl: '' }));
  }, [imagePreview]);

  const validateField = useCallback((name, value) => {
    switch (name) {
      case 'title':
        return {
          valid: value.length >= CHAR_LIMITS.title,
          message: value.length < CHAR_LIMITS.title ? `Title must be at least ${CHAR_LIMITS.title} characters long` : ''
        };
      case 'content':
        return {
          valid: value.length >= CHAR_LIMITS.content,
          message: value.length < CHAR_LIMITS.content ? `${CHAR_LIMITS.content - value.length} more characters needed` : ''
        };
      case 'excerpt':
        return {
          valid: value.length >= CHAR_LIMITS.excerpt.min && value.length <= CHAR_LIMITS.excerpt.max,
          message: value.length < CHAR_LIMITS.excerpt.min ? `Excerpt must be at least ${CHAR_LIMITS.excerpt.min} characters` : 
                  value.length > CHAR_LIMITS.excerpt.max ? `Excerpt must be less than ${CHAR_LIMITS.excerpt.max} characters` : ''
        };
      default:
        return { valid: true, message: '' };
    }
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setBlog(prev => ({ ...prev, [name]: value }));
    setValidationDetails(prev => ({
      ...prev,
      [name]: validateField(name, value)
    }));
    setError('');
  }, [validateField]);

  const validateForm = useCallback(() => {
    const validations = {
      title: validateField('title', blog.title),
      content: validateField('content', blog.content),
      excerpt: validateField('excerpt', blog.excerpt)
    };

    setValidationDetails(validations);

    return Object.entries(validations)
      .filter(([_, value]) => !value.valid)
      .map(([field, value]) => `${field.charAt(0).toUpperCase() + field.slice(1)}: ${value.message}`);
  }, [blog.title, blog.content, blog.excerpt, validateField]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const validationErrors = validateForm();
    if (validationErrors.length) {
      setError('Please fix the following errors:');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please log in to create or edit blog posts');

      const formData = new FormData();
      formData.append('title', blog.title);
      formData.append('content', blog.content);
      formData.append('excerpt', blog.excerpt);
      formData.append('status', blog.status);

      // Process tags
      const processedTags = blog.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      formData.append('tags', JSON.stringify(processedTags));

      // Handle image upload
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (blog.imageUrl) {
        formData.append('imageUrl', blog.imageUrl);
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      if (id) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/blogs/${id}`,
          formData,
          config
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/blogs`,
          formData,
          config
        );
      }

      setSuccessMessage('Blog post saved successfully! Redirecting...');
      setTimeout(() => navigate('/blog'), 1500);
    } catch (error) {
      console.error('Error saving blog:', error);
      let errorMessage = 'Failed to save blog post. ';

      if (error.response?.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage += 'Please try again.';
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user?.isBlogger) {
    return (
      <motion.div
        className="editor-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="error-message">You do not have permission to access this page.</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="editor-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2>{id ? 'Edit Blog Post' : 'Create New Blog Post'}</h2>
      <p className="info-text">
        <FaInfoCircle /> Fill out the form below to create your blog post. All fields marked with * are required.
      </p>

      <form className="blog-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <label className="form-label">Cover Image</label>
          <label className="image-upload-button">
            <FaImage /> {imageFile ? 'Change Cover Image' : 'Upload Cover Image'}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isSubmitting}
            />
          </label>
          <p className="info-text">Recommended size: 1200x630px, Maximum size: 5MB</p>
          {(imagePreview || blog.imageUrl) && (
            <div className="image-preview">
              <img
                className="preview-image"
                src={imagePreview || blog.imageUrl}
                alt="Cover preview"
              />
              <button
                type="button"
                className="remove-image-button"
                onClick={removeImage}
                aria-label="Remove image"
              >
                <FaTimesCircle />
              </button>
            </div>
          )}
        </div>

        <div className="form-section">
          <label className="form-label">Title *</label>
          <input
            className={`input ${validationDetails.title.valid ? '' : 'invalid'}`}
            type="text"
            name="title"
            value={blog.title}
            onChange={handleChange}
            placeholder="Enter a compelling title..."
            required
            aria-label="Blog title"
          />
          <span className={`character-count ${validationDetails.title.valid ? 'valid' : 'invalid'}`}>
            {blog.title.length} / {CHAR_LIMITS.title}+ characters
          </span>
        </div>

        <div className="form-section">
          <label className="form-label">Content *</label>
          <textarea
            className={`textarea ${validationDetails.content.valid ? '' : 'invalid'}`}
            name="content"
            value={blog.content}
            onChange={handleChange}
            placeholder="Write your blog content here..."
            required
            aria-label="Blog content"
          />
          <span className={`character-count ${validationDetails.content.valid ? 'valid' : 'invalid'}`}>
            {blog.content.length} / {CHAR_LIMITS.content}+ characters
          </span>
        </div>

        <div className="form-section">
          <label className="form-label">Excerpt *</label>
          <input
            className={`input ${validationDetails.excerpt.valid ? '' : 'invalid'}`}
            type="text"
            name="excerpt"
            value={blog.excerpt}
            onChange={handleChange}
            placeholder="Write a brief summary of your blog post..."
            required
            aria-label="Blog excerpt"
          />
          <span className={`character-count ${validationDetails.excerpt.valid ? 'valid' : 'invalid'}`}>
            {blog.excerpt.length} / {CHAR_LIMITS.excerpt.min}-{CHAR_LIMITS.excerpt.max} characters
          </span>
        </div>

        <div className="form-section">
          <label className="form-label">Tags</label>
          <input
            className="input"
            type="text"
            name="tags"
            value={blog.tags}
            onChange={handleChange}
            placeholder="Enter tags separated by commas (e.g., property, management, tips)"
            aria-label="Blog tags"
          />
          <p className="info-text">
            <FaInfoCircle /> Separate tags with commas. Good tags help readers find your content.
          </p>
        </div>

        <button
          className={`button ${isSubmitting ? 'disabled' : ''}`}
          type="submit"
          disabled={isSubmitting}
          aria-label={isSubmitting ? 'Saving blog post...' : 'Save blog post'}
        >
          {isSubmitting ? (
            <>
              <FaSpinner className="spinner" /> Saving...
            </>
          ) : (
            'Save Blog Post'
          )}
        </button>

        {error && (
          <div className="error-message" role="alert">
            {error}
            {validationDetails && (
              <ul className="error-details">
                {Object.entries(validationDetails)
                  .filter(([_, value]) => !value.valid)
                  .map(([field, value]) => (
                    <li key={field}>{value.message}</li>
                  ))}
              </ul>
            )}
          </div>
        )}

        {successMessage && (
          <div className="success-message" role="status">
            {successMessage}
          </div>
        )}
      </form>
    </motion.div>
  );
};

export default BlogEditor;