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

const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

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
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const img = new Image();
    const imageUrl = getImageUrl(src);
    
    img.onload = () => {
      if (isMounted) {
        setImageSrc(imageUrl);
        setIsLoading(false);
        setError(false);
      }
    };

    img.onerror = () => {
      if (isMounted) {
        const defaultImage = `${process.env.REACT_APP_API_URL.replace('/api', '')}/public/default-blog-image.png`;
        setImageSrc(defaultImage);
        setIsLoading(false);
        setError(true);
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
    <div 
      className={styles.postImageWrapper}
      aria-busy={isLoading}
      aria-label={error ? "Failed to load image" : undefined}
    >
      {isLoading && <div className={styles.imagePlaceholder} role="presentation" />}
      {!isLoading && (
        <img
          className={styles.postImage}
          src={imageSrc}
          alt={alt}
          loading="lazy"
          onError={(e) => {
            e.target.src = `${process.env.REACT_APP_API_URL.replace('/api', '')}/public/default-blog-image.png`;
            setError(true);
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
  const [searchInputValue, setSearchInputValue] = useState('');
  
  const { user, loading: userLoading, isInitialized } = useUser();
  const navigate = useNavigate();

  const showCreateButton = useMemo(() => {
    return isInitialized && !userLoading && user?.isBlogger;
  }, [isInitialized, userLoading, user?.isBlogger]);

  const debouncedSearch = useMemo(
    () => debounce((term) => setSearchTerm(term), 300),
    []
  );

  const fetchPosts = useCallback(async () => {
    if (!isInitialized) return;
    
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/blogs`,
        {
          params: { 
            page: currentPage, 
            limit: 10, 
            search: searchTerm, 
            sort: sortOption 
          }
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
  }, [currentPage, searchTerm, sortOption, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      fetchPosts();
    }
  }, [fetchPosts, isInitialized]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInputValue(value);
    debouncedSearch(value);
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
        { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}` 
          } 
        }
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

  const getStructuredData = () => ({
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Property Management Insights",
    "description": "Expert property management tips, strategies, and insights.",
    "url": window.location.href,
    "blogPost": posts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "author": {
        "@type": "Person",
        "name": post.author?.name || "Anonymous"
      },
      "datePublished": post.createdAt,
      "image": getImageUrl(post.imageUrl),
      "url": `${window.location.origin}/blog/${post.id}`,
      "keywords": post.tags?.join(', ')
    }))
  });

  if (!isInitialized || userLoading) {
    return (
      <div className={styles.blogListContainer}>
        <div className={styles.loadingSpinner} role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Property Management Blog | Expert Insights & Strategies</title>
        <meta name="description" content="Discover expert property management tips, strategies, and insights for property managers and landlords." />
        <meta name="keywords" content="property management, landlord tips, real estate management, property maintenance" />
        <meta property="og:title" content="Property Management Blog | Expert Insights" />
        <meta property="og:description" content="Expert property management insights and strategies." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <link rel="canonical" href={window.location.href} />
        <script type="application/ld+json">
          {JSON.stringify(getStructuredData())}
        </script>
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
              value={searchInputValue}
              aria-label="Search blog posts"
            />
            <FaSearch className={styles.searchIcon} aria-hidden="true" />
          </div>
          <div className={styles.buttonGroup}>
            <button 
              className={styles.button} 
              onClick={toggleSortOption}
              aria-label={`Sort by ${sortOption === 'newest' ? 'oldest' : 'newest'} first`}
            >
              {sortOption === 'newest' ? <FaSortAmountDown /> : <FaSortAmountUp />}
              {sortOption === 'newest' ? 'Newest' : 'Oldest'}
            </button>
            {showCreateButton && (
              <button 
                className={`${styles.button} ${styles.primary}`} 
                onClick={handleCreateBlog}
                aria-label="Create new blog post"
              >
                <FaPlus /> Create New Blog
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className={styles.loadingSpinner} role="status">
            <span className="sr-only">Loading posts...</span>
          </div>
        ) : error ? (
          <div className={styles.errorMessage} role="alert">{error}</div>
        ) : posts.length === 0 ? (
          <div className={styles.noResults}>No blog posts found matching your criteria.</div>
        ) : (
          <div className={styles.postsGrid} role="feed" aria-busy={isLoading}>
            <AnimatePresence mode="popLayout">
              {posts.map((post, index) => (
                <motion.article
                  key={post.id}
                  className={styles.postCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  itemScope
                  itemType="http://schema.org/BlogPosting"
                >
                  <meta itemProp="datePublished" content={post.createdAt} />
                  <meta itemProp="author" content={post.author?.name || "Anonymous"} />
                  <meta itemProp="description" content={post.excerpt} />
                  
                  <BlogImage 
                    src={post.imageUrl}
                    alt={post.title}
                  />
                  
                  <div className={styles.postContent}>
                    <Link 
                      to={`/blog/${post.id}`} 
                      className={styles.postTitle}
                      itemProp="name headline"
                      title={post.title}
                    >
                      {post.title}
                    </Link>
                    
                    <div className={styles.postMeta}>
                      <span className={styles.metaItem} itemProp="author">
                        <FaUser aria-hidden="true" />
                        <span>{post.author?.name || "Anonymous"}</span>
                      </span>
                      <span className={styles.metaItem}>
                        <FaClock aria-hidden="true" />
                        <time dateTime={post.createdAt} itemProp="datePublished">
                          {formatDate(post.createdAt)}
                        </time>
                      </span>
                      <span className={styles.metaItem}>
                        <FaEye aria-hidden="true" />
                        <span>{post.viewCount || 0} views</span>
                      </span>
                    </div>

                    <p 
                      className={styles.postExcerpt}
                      itemProp="abstract"
                      title={post.excerpt}
                    >
                      {post.excerpt}
                    </p>

                    <div className={styles.tagList} itemProp="keywords">
                      {post.tags?.map((tag, index) => (
                        <Link
                          key={`${post.id}-${tag}-${index}`}
                          to={`/blog/tag/${encodeURIComponent(tag)}`}
                          className={styles.tag}
                          title={tag}
                        >
                          {truncateText(tag, 20)}
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
                          aria-label={`Edit blog post: ${post.title}`}
                        >
                          <FaEdit aria-hidden="true" />
                        </button>
                        <button 
                          className={styles.actionButton}
                          onClick={(e) => handleDeleteBlog(post.id, e)}
                          aria-label={`Delete blog post: ${post.title}`}
                        >
                          <FaTrash aria-hidden="true" />
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
          <nav 
            className={styles.pagination}
            aria-label="Blog posts navigation"
          >
            <button
              className={styles.button}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              Previous
            </button>
            <span aria-current="page">Page {currentPage} of {totalPages}</span>
            <button
              className={styles.button}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              Next
            </button>
          </nav>
        )}
      </motion.div>
    </>
  );
};

export default BlogList;