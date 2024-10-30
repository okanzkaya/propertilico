import styles from './BlogList.module.css';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaSortAmountDown, FaSortAmountUp, FaPlus, 
  FaEdit, FaTrash, FaClock, FaUser, FaEye } from 'react-icons/fa';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import { debounce } from 'lodash';
import { Helmet } from 'react-helmet';

const getImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return `${process.env.REACT_APP_API_URL.replace('/api', '')}/public/default-blog-image.png`;
  }
  
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  const baseUrl = process.env.REACT_APP_API_URL.replace('/api', '').replace(/\/$/, '');
  const cleanImagePath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  
  return `${baseUrl}${cleanImagePath}`;
};

const BlogImage = ({ src, alt }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    let isMounted = true;
    const img = new Image();
    const imageUrl = getImageUrl(src);
    
    img.onload = () => {
      if (isMounted) {
        setImageSrc(imageUrl);
        setIsLoading(false);
      }
    };

    img.onerror = () => {
      if (isMounted) {
        const defaultImage = `${process.env.REACT_APP_API_URL.replace('/api', '')}/public/default-blog-image.png`;
        setImageSrc(defaultImage);
        setIsLoading(false);
      }
    };

    img.src = imageUrl;

    return () => {
      isMounted = false;
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return (
    <div className={styles.postImageWrapper}>
      {isLoading && <div className={styles.imagePlaceholder} />}
      {!isLoading && (
        <img
          className={styles.postImage}
          src={imageSrc}
          alt={alt}
          onError={(e) => {
            e.target.src = `${process.env.REACT_APP_API_URL.replace('/api', '')}/default-blog-image.png`;
          }}
          style={{ display: 'block' }}
        />
      )}
    </div>
  );
};

const BlogList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user, loading: userLoading } = useUser();
  const navigate = useNavigate();
  const [isUserInitialized, setIsUserInitialized] = useState(false);

  useEffect(() => {
    if (!userLoading) {
      setIsUserInitialized(true);
    }
  }, [userLoading]);

  const debouncedSearch = useMemo(
    () => debounce((term) => setSearchTerm(term), 300),
    []
  );

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/blogs`,
        {
          params: { page: currentPage, limit: 10, search: searchTerm, sort: sortOption }
        }
      );

      if (response.data?.status === 'success') {
        setPosts(response.data.data.blogs);
        setTotalPages(response.data.data.pagination.totalPages);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to fetch blog posts:', err);
      setError('Failed to load blog posts. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, sortOption]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
    setCurrentPage(1);
  };

  const toggleSortOption = () => {
    setSortOption(prev => prev === 'newest' ? 'oldest' : 'newest');
    setCurrentPage(1);
  };

  const handleCreateBlog = () => navigate('/create-blog');
  const handleEditBlog = (id) => navigate(`/edit-blog/${id}`);

  const handleDeleteBlog = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/blogs/${id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      await fetchPosts();
    } catch (err) {
      console.error('Failed to delete blog post:', err);
      setError('Failed to delete blog post. Please try again later.');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className={styles.blogListContainer}>
        <div className={styles.loadingSpinner} />
      </div>
    );
  }

  const showCreateButton = isUserInitialized && !userLoading && user?.isBlogger;
  return (
    <>
      <Helmet>
        <title>Property Management Blog | Expert Insights & Strategies</title>
        <meta name="description" content="Discover expert property management tips, strategies, and insights." />
        <meta property="og:title" content="Property Management Blog | Expert Insights" />
        <meta property="og:description" content="Expert property management insights and strategies." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
      </Helmet>

      <motion.div
        className={styles.blogListContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <header className={styles.header}>
          <h1 className={styles.title}>Property Management Insights</h1>
          <p className={styles.subtitle}>Expert tips, trends, and strategies to excel in property management</p>
        </header>

        <div className={styles.controlsContainer}>
          <div className={styles.searchBarContainer}>
            <input
              type="text"
              className={styles.searchBar}
              placeholder="Search blog posts..."
              onChange={handleSearchChange}
              aria-label="Search blog posts"
            />
            <FaSearch className={styles.searchIcon} aria-hidden="true" />
          </div>
          <div className={styles.buttonGroup}>
            <button className={styles.button} onClick={toggleSortOption}>
              {sortOption === 'newest' ? <FaSortAmountDown /> : <FaSortAmountUp />}
              {sortOption === 'newest' ? 'Newest' : 'Oldest'}
            </button>
            {showCreateButton && (
  <button className={`${styles.button} ${styles.primary}`} onClick={handleCreateBlog}>
    <FaPlus /> Create New Blog
  </button>
)}
          </div>
        </div>

        {error ? (
          <div className={styles.errorMessage} role="alert">{error}</div>
        ) : posts.length === 0 ? (
          <div className={styles.noResults}>No blog posts found matching your criteria.</div>
        ) : (
          <div className={styles.postsGrid}>
            <AnimatePresence>
              {posts.map((post, index) => (
                <motion.article
                  key={post.id}
                  className={styles.postCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <BlogImage 
                    src={post.imageUrl}
                    alt={post.title}
                  />
                  <div className={styles.postContent}>
                    <Link to={`/blog/${post.id}`} className={styles.postTitle}>
                      {post.title}
                    </Link>
                    <div className={styles.postMeta}>
                      <span className={styles.metaItem}>
                        <FaUser />
                        {post.author?.name || "Anonymous"}
                      </span>
                      <span className={styles.metaItem}>
                        <FaClock />
                        {formatDate(post.createdAt)}
                      </span>
                      <span className={styles.metaItem}>
                        <FaEye />
                        {post.viewCount || 0} views
                      </span>
                    </div>
                    <p className={styles.postExcerpt}>{post.excerpt}</p>
                    <div className={styles.tagList}>
                      {post.tags?.map((tag, index) => (
                        <Link
                          key={`${post.id}-${tag}-${index}`}
                          to={`/blog/tag/${tag}`}
                          className={styles.tag}
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                    {showCreateButton && (
                      <div className={styles.actionButtons}>
                        <button 
                          className={styles.actionButton}
                          onClick={(e) => {
                            e.preventDefault();
                            handleEditBlog(post.id);
                          }}
                          aria-label="Edit blog post"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className={styles.actionButton}
                          onClick={(e) => handleDeleteBlog(post.id, e)}
                          aria-label="Delete blog post"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.button}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              className={styles.button}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default BlogList;  