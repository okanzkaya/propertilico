import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ChevronLeft } from 'lucide-react';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import styles from './BlogEditor.module.css';

const VALIDATION_RULES = {
  title: { min: 3, max: 100 },
  content: { min: 100, max: 50000 },
  excerpt: { min: 10, max: 300 }
};

const processImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${process.env.REACT_APP_API_URL.replace('/api', '')}${imageUrl}`;
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
  const [validation, setValidation] = useState({
    title: { isValid: true, message: '' },
    content: { isValid: true, message: '' },
    excerpt: { isValid: true, message: '' }
  });

  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  // Check permissions
  useEffect(() => {
    if (!user?.isBlogger && !user?.isAdmin) {
      navigate('/blog');
    }
  }, [user, navigate]);

  const validateField = (name, value) => {
    const rules = VALIDATION_RULES[name];
    if (!rules) return { isValid: true, message: '' };

    if (value.length < rules.min) {
      return {
        isValid: false,
        message: `Must be at least ${rules.min} characters`
      };
    }

    if (value.length > rules.max) {
      return {
        isValid: false,
        message: `Must not exceed ${rules.max} characters`
      };
    }

    return { isValid: true, message: '' };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBlog(prev => ({ ...prev, [name]: value }));
    
    if (VALIDATION_RULES[name]) {
      const validationResult = validateField(name, value);
      setValidation(prev => ({
        ...prev,
        [name]: validationResult
      }));
    }
  };

  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/uploads`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      return processImageUrl(response.data.url);
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  };

  const editorConfiguration = {
    toolbar: [
      'heading',
      '|',
      'bold',
      'italic',
      'link',
      'bulletedList',
      'numberedList',
      '|',
      'outdent',
      'indent',
      '|',
      'imageUpload',
      'blockQuote',
      'insertTable',
      'mediaEmbed',
      'undo',
      'redo'
    ],
    image: {
      upload: {
        types: ['jpeg', 'png', 'gif', 'webp']
      },
      toolbar: ['imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative']
    },
    table: {
      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
    },
    mediaEmbed: {
      previewsInData: true
    },
    heading: {
      options: [
        { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
        { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
        { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
        { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
      ]
    }
  };

  const fetchBlog = useCallback(async () => {
    if (!id) return;

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
        setImagePreview(processImageUrl(blogData.imageUrl));
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      setError('Failed to fetch blog post. Please try again.');
    }
  }, [id]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

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
    setImagePreview(URL.createObjectURL(file));
    setError('');
  };

  const validateForm = () => {
    const newValidation = {
      title: validateField('title', blog.title),
      content: validateField('content', blog.content),
      excerpt: validateField('excerpt', blog.excerpt)
    };

    setValidation(newValidation);
    return Object.values(newValidation).every(field => field.isValid);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!validateForm()) {
      setError('Please fix the validation errors before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', blog.title);
      formData.append('content', blog.content);
      formData.append('excerpt', blog.excerpt);
      formData.append('status', blog.status);

      const processedTags = blog.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean);
      formData.append('tags', JSON.stringify(processedTags));

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (blog.imageUrl) {
        formData.append('imageUrl', blog.imageUrl);
      }

      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      if (id) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/blogs/${id}`, formData, config);
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/blogs`, formData, config);
      }

      setSuccessMessage('Blog post saved successfully!');
      setTimeout(() => navigate('/blog'), 1500);
    } catch (error) {
      console.error('Error saving blog:', error);
      setError(error.response?.data?.message || 'Failed to save blog post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.editorContainer}>
      <button 
        onClick={handleGoBack}
        className={styles.backButton}
        aria-label="Go back"
      >
        <ChevronLeft size={24} />
      </button>

      <h1 className={styles.editorTitle}>
        {id ? 'Edit Blog Post' : 'Create New Blog Post'}
      </h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.imageSection}>
          <h3>Cover Image</h3>
          <div className={styles.imageUploadArea}>
            {imagePreview ? (
              <div className={styles.imagePreviewContainer}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className={styles.imagePreview}
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                    setBlog(prev => ({ ...prev, imageUrl: '' }));
                  }}
                  className={styles.removeImageButton}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className={styles.uploadPrompt}>
                <label className={styles.uploadButton}>
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={styles.hiddenInput}
                  />
                </label>
                <p className={styles.uploadHint}>
                  Recommended: 1200x630px, Max: 5MB
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            name="title"
            type="text"
            value={blog.title}
            onChange={handleInputChange}
            placeholder="Enter a compelling title..."
            className={`${styles.input} ${!validation.title.isValid ? styles.inputError : ''}`}
            required
          />
          {!validation.title.isValid && (
            <span className={styles.errorText}>{validation.title.message}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="content">Content *</label>
          <CKEditor
            editor={ClassicEditor}
            config={editorConfiguration}
            data={blog.content}
            onChange={(event, editor) => {
              const data = editor.getData();
              setBlog(prev => ({ ...prev, content: data }));
              const validationResult = validateField('content', data);
              setValidation(prev => ({
                ...prev,
                content: validationResult
              }));
            }}
            onReady={editor => {
              editor.plugins.get('FileRepository').createUploadAdapter = loader => {
                return {
                  upload: async () => {
                    const file = await loader.file;
                    const url = await handleImageUpload(file);
                    return { default: url };
                  }
                };
              };
            }}
          />
          {!validation.content.isValid && (
            <span className={styles.errorText}>{validation.content.message}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="excerpt">Excerpt *</label>
          <textarea
            id="excerpt"
            name="excerpt"
            value={blog.excerpt}
            onChange={handleInputChange}
            placeholder="Write a brief summary of your post..."
            className={`${styles.input} ${!validation.excerpt.isValid ? styles.inputError : ''}`}
            required
          />
          {!validation.excerpt.isValid && (
            <span className={styles.errorText}>{validation.excerpt.message}</span>
          )}
          <span className={styles.hint}>
            A brief summary that appears in blog listings ({VALIDATION_RULES.excerpt.min}-{VALIDATION_RULES.excerpt.max} characters)
          </span>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="tags">Tags</label>
          <input
            id="tags"
            name="tags"
            type="text"
            value={blog.tags}
            onChange={handleInputChange}
            placeholder="Enter tags separated by commas (e.g., property management, tips, maintenance)"
            className={styles.input}
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {successMessage && <div className={styles.success}>{successMessage}</div>}

        <div className={styles.buttonGroup}>
          <button
            type="button"
            onClick={() => navigate('/blog')}
            className={`${styles.button} ${styles.secondaryButton}`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`${styles.button} ${styles.primaryButton}`}
          >
            {isSubmitting ? 'Saving...' : 'Save Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogEditor;