import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import DOMPurify from 'dompurify';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import { 
  FaUser, FaClock, FaCalendarAlt, FaFacebookF, FaTwitter, 
  FaLinkedinIn, FaWhatsapp, FaRedditAlien, FaCopy, FaArrowLeft,
  FaEdit, FaTrash, FaEye, FaBookmark, FaRegBookmark,
  FaPrint, FaEnvelope
} from 'react-icons/fa';
import './BlogPost.css';

// Utility functions
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '/default-blog-image.jpg';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${process.env.REACT_APP_API_URL}${imageUrl}`;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const calculateReadTime = (content) => {
  if (!content) return 0;
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

// Lazy Image Component
const LazyImage = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={className}>
      {!isLoaded && !error && <div className="image-placeholder" />}
      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        onError={(e) => {
          setError(true);
          e.target.src = '/default-blog-image.png';
        }}
        className={isLoaded ? 'loaded' : ''}
        loading="lazy"
      />
    </div>
  );
};

// Main Component
const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const contentRef = useRef(null);
  const [tableOfContents, setTableOfContents] = useState([]);

  // Generate table of contents
  useEffect(() => {
    if (post && contentRef.current) {
      const headings = contentRef.current.querySelectorAll('h2, h3');
      const toc = Array.from(headings).map(heading => ({
        id: heading.id || heading.textContent.toLowerCase().replace(/\s+/g, '-'),
        text: heading.textContent,
        level: parseInt(heading.tagName.charAt(1))
      }));
      setTableOfContents(toc);

      headings.forEach(heading => {
        if (!heading.id) {
          heading.id = heading.textContent.toLowerCase().replace(/\s+/g, '-');
        }
      });
    }
  }, [post]);

  const fetchPost = useCallback(async () => {
    setIsLoading(true);
    try {
      const [postResponse, relatedResponse] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/blogs/${id}`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/blogs/related/${id}`)
      ]);

      if (postResponse.data?.status === 'success') {
        setPost(postResponse.data.data.blog);
      }

      if (relatedResponse.data?.status === 'success') {
        setRelatedPosts(relatedResponse.data.data.relatedBlogs || []);
      }

      const bookmarks = JSON.parse(localStorage.getItem('blogBookmarks') || '[]');
      setIsBookmarked(bookmarks.includes(id));
      setError(null);

    } catch (err) {
      console.error('Error fetching blog post:', err);
      setError(err.response?.data?.message || 'Failed to load the blog post. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
    window.scrollTo(0, 0);
  }, [fetchPost]);

  const handleShare = useCallback((platform) => {
    if (!post) return;
    
    const url = window.location.href;
    const text = encodeURIComponent(`${post.title} - Property Management Insights`);
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}`,
      whatsapp: `https://wa.me/?text=${text} ${url}`,
      reddit: `https://reddit.com/submit?url=${url}&title=${text}`,
      email: `mailto:?subject=${text}&body=${url}`
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setNotification('Link copied to clipboard!');
      setTimeout(() => setNotification(null), 3000);
    } else if (platform === 'print') {
      window.print();
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
    }
  }, [post]);

  const toggleBookmark = useCallback(() => {
    const bookmarks = JSON.parse(localStorage.getItem('blogBookmarks') || '[]');
    if (isBookmarked) {
      const updatedBookmarks = bookmarks.filter(bookmarkId => bookmarkId !== id);
      localStorage.setItem('blogBookmarks', JSON.stringify(updatedBookmarks));
      setNotification('Post removed from bookmarks');
    } else {
      bookmarks.push(id);
      localStorage.setItem('blogBookmarks', JSON.stringify(bookmarks));
      setNotification('Post added to bookmarks');
    }
    setIsBookmarked(!isBookmarked);
    setTimeout(() => setNotification(null), 3000);
  }, [id, isBookmarked]);

  const handleEdit = () => {
    navigate(`/edit-blog/${id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/blogs/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/blog');
    } catch (err) {
      console.error('Failed to delete blog post:', err);
      setError('Failed to delete blog post. Please try again later.');
    }
  };

  const generateStructuredData = useCallback(() => {
    if (!post) return null;

    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": window.location.href
      },
      "headline": post.title,
      "description": post.excerpt,
      "image": post.imageUrl ? [getImageUrl(post.imageUrl)] : [],
      "author": {
        "@type": "Person",
        "name": post.author?.name || "Anonymous",
        "description": post.author?.bloggerDescription,
        "url": `${window.location.origin}/author/${post.author?.id}`
      },
      "publisher": {
        "@type": "Organization",
        "name": "Propertilico",
        "logo": {
          "@type": "ImageObject",
          "url": `${window.location.origin}/logo.png`
        }
      },
      "datePublished": post.createdAt,
      "dateModified": post.updatedAt || post.createdAt,
      "articleBody": post.content,
      "keywords": post.tags?.join(", "),
      "wordCount": post.content?.split(/\s+/).length || 0,
      "articleSection": "Property Management",
      "inLanguage": "en-US"
    };
  }, [post]);

  if (isLoading) {
    return (
      <div className="post-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="post-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!post) return null;

  const readTime = calculateReadTime(post.content);
  const sanitizedContent = DOMPurify.sanitize(post.content);

  return (
    <>
      <Helmet>
        <title>{`${post.title} | Property Management Insights`}</title>
        <meta name="description" content={post.excerpt} />
        <meta name="author" content={post.author?.name || "Anonymous"} />
        <meta name="keywords" content={post.tags?.join(", ")} />
        <meta property="article:published_time" content={post.createdAt} />
        <meta property="article:modified_time" content={post.updatedAt || post.createdAt} />
        <meta property="article:author" content={post.author?.name || "Anonymous"} />
        <meta property="article:section" content="Property Management" />
        {post.tags?.map(tag => (
          <meta property="article:tag" content={tag} key={tag} />
        ))}
        
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:image" content={getImageUrl(post.imageUrl)} />
        <meta property="og:site_name" content="Propertilico Blog" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        <meta name="twitter:image" content={getImageUrl(post.imageUrl)} />
        
        <link rel="canonical" href={window.location.href} />
        
        <script type="application/ld+json">
          {JSON.stringify(generateStructuredData())}
        </script>
      </Helmet>

      <motion.div
        className="post-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/blog" className="back-button">
          <FaArrowLeft /> Back to Blog List
        </Link>

        {post.imageUrl && (
          <LazyImage 
            src={getImageUrl(post.imageUrl)} 
            alt={post.title}
            className="header-image"
          />
        )}

        <h1 className="post-title">{post.title}</h1>

        <div className="meta-data">
          <div className="meta-item">
            <FaUser />
            <span>{post.author?.name || "Anonymous"}</span>
          </div>
          <div className="meta-item">
            <FaCalendarAlt />
            <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
          </div>
          <div className="meta-item">
            <FaClock />
            <span>{readTime} min read</span>
          </div>
          <div className="meta-item">
            <FaEye />
            <span>{post.viewCount || 0} views</span>
          </div>
        </div>

        <div className="tag-list">
          {post.tags?.map(tag => (
            <Link key={tag} to={`/blog/tag/${tag}`} className="tag">
              {tag}
            </Link>
          ))}
        </div>

        <div className="action-button-group">
          {user?.isBlogger && (
            <>
              <button 
                onClick={handleEdit} 
                className="action-button" 
                style={{ background: '#4CAF50', color: '#fff' }}
              >
                <FaEdit /> Edit Post
              </button>
              <button 
                onClick={handleDelete} 
                className="action-button" 
                style={{ background: '#f44336', color: '#fff' }}
              >
                <FaTrash /> Delete Post
              </button>
            </>
          )}
          <button onClick={toggleBookmark} className="action-button">
            {isBookmarked ? <FaBookmark /> : <FaRegBookmark />} 
            {isBookmarked ? 'Bookmarked' : 'Bookmark'}
          </button>
          <button onClick={() => handleShare('print')} className="action-button">
            <FaPrint /> Print
          </button>
        </div>

        {tableOfContents.length > 0 && (
          <nav className="table-of-contents">
            <h4>Table of Contents</h4>
            <ul>
              {tableOfContents.map(heading => (
                <li 
                  key={heading.id} 
                  style={{ marginLeft: `${(heading.level - 2) * 1}rem` }}
                >
                  <a href={`#${heading.id}`}>{heading.text}</a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div 
          className="post-content"
          ref={contentRef}
          dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
        />

        <div className="author-section">
          <img 
            src={post.author?.avatar || '/default-avatar.jpg'} 
            alt={post.author?.name || "Anonymous"}
            className="author-avatar"
            loading="lazy"
          />
          <div className="author-info">
            <h3 className="author-name">{post.author?.name || "Anonymous"}</h3>
            <p className="author-bio">
              {post.author?.bloggerDescription || "Property Management Expert"}
            </p>
          </div>
        </div>

        <div className="share-section">
          <h3 className="share-title">Share this article</h3>
          <div className="share-buttons">
            <button 
              onClick={() => handleShare('facebook')} 
              className="action-button"
              style={{ background: '#1877f2', color: '#fff' }}
            >
              <FaFacebookF /> Facebook
            </button>
            <button 
              onClick={() => handleShare('twitter')} 
              className="action-button"
              style={{ background: '#1da1f2', color: '#fff' }}
            >
              <FaTwitter /> Twitter
            </button>
            <button 
              onClick={() => handleShare('linkedin')} 
              className="action-button"
              style={{ background: '#0077b5', color: '#fff' }}
            >
              <FaLinkedinIn /> LinkedIn
            </button>
            <button 
              onClick={() => handleShare('whatsapp')} 
              className="action-button"
              style={{ background: '#25d366', color: '#fff' }}
            >
              <FaWhatsapp /> WhatsApp
            </button>
            <button 
              onClick={() => handleShare('reddit')} 
              className="action-button"
              style={{ background: '#ff4500', color: '#fff' }}
            >
              <FaRedditAlien /> Reddit
            </button>
            <button 
              onClick={() => handleShare('email')} 
              className="action-button"
              style={{ background: '#333333', color: '#fff' }}
            >
              <FaEnvelope /> Email
            </button>
            <button onClick={() => handleShare('copy')} className="action-button">
              <FaCopy /> Copy Link
            </button>
          </div>
        </div>

        {relatedPosts.length > 0 && (
          <section className="related-posts">
            <h2 className="related-posts-title">Related Articles</h2>
            <div className="related-posts-grid">
              {relatedPosts.map(relatedPost => (
                <Link 
                  key={relatedPost.id} 
                  to={`/blog/${relatedPost.id}`} 
                  className="related-post-card"
                >
                  {relatedPost.imageUrl && (
                    <LazyImage 
                      src={getImageUrl(relatedPost.imageUrl)} 
                      alt={relatedPost.title}
                      className="header-image"
                    />
                  )}
                  <div className="related-post-content">
                    <h3>{relatedPost.title}</h3>
                    <time dateTime={relatedPost.createdAt}>
                      {formatDate(relatedPost.createdAt)}
                    </time>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <AnimatePresence>
          {notification && (
            <motion.div
              className="notification"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3 }}
            >
              {notification}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default BlogPost;