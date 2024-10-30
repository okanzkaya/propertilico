import styles from './BlogPost.module.css';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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

// Constants
const ALLOWED_TAGS = {
  HEADINGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  TEXT: ['p', 'span', 'strong', 'em', 'u', 'blockquote'],
  LISTS: ['ul', 'ol', 'li'],
  MEDIA: ['img', 'video', 'audio'],
  OTHER: ['br', 'hr', 'a', 'table', 'tr', 'td', 'th', 'thead', 'tbody']
};

// Utility functions
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '/default-blog-image.jpg';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${process.env.REACT_APP_API_URL}${imageUrl}`;
};

const formatDate = (date) => {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  };
  return new Date(date).toLocaleDateString('en-US', options);
};

const calculateReadTime = (content) => {
  if (!content) return 0;
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

// Lazy Image Component with loading and error states
const LazyImage = React.memo(({ src, alt, className, onLoad }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && imageRef.current) {
            imageRef.current.src = src;
          }
        });
      },
      { rootMargin: '50px' }
    );

    const currentImageRef = imageRef.current;

    if (currentImageRef) {
      observer.observe(currentImageRef);
    }

    return () => {
      if (currentImageRef) {
        observer.unobserve(currentImageRef);
      }
    };
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = (e) => {
    setError(true);
    e.target.src = '/default-blog-image.png';
  };

  return (
    <div className={className}>
      {!isLoaded && !error && (
        <div className={styles.imagePlaceholder} role="presentation" />
      )}
      <img
        ref={imageRef}
        alt={alt}
        className={isLoaded ? styles.loaded : ''}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        data-src={src}
      />
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

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
  const [activeHeading, setActiveHeading] = useState('');

  // SEO Optimization
  const seoData = useMemo(() => {
    if (!post) return null;
    
    return {
      title: `${post.title} | Property Management Insights`,
      description: post.excerpt,
      author: post.author?.name || "Anonymous",
      keywords: post.tags?.join(", "),
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt || post.createdAt,
      image: getImageUrl(post.imageUrl),
      url: window.location.href
    };
  }, [post]);

  // Table of contents generation and scroll spy
  useEffect(() => {
    if (post && contentRef.current) {
      const generateId = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const headings = contentRef.current.querySelectorAll('h2, h3');
      
      const toc = Array.from(headings).map(heading => {
        const text = heading.textContent;
        const id = heading.id || generateId(text);
        heading.id = id;
        return {
          id,
          text,
          level: parseInt(heading.tagName.charAt(1))
        };
      });
      
      setTableOfContents(toc);

      // Scroll spy
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setActiveHeading(entry.target.id);
            }
          });
        },
        { rootMargin: '-100px 0px -66% 0px' }
      );

      headings.forEach(heading => observer.observe(heading));

      return () => {
        headings.forEach(heading => observer.unobserve(heading));
      };
    }
  }, [post]);

  // Fetch post data
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
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchPost]);

  // Share functionality
  const handleShare = useCallback(async (platform) => {
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

    try {
      if (platform === 'copy') {
        await navigator.clipboard.writeText(url);
        setNotification('Link copied to clipboard!');
      } else if (platform === 'print') {
        window.print();
      } else if (shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Share failed:', error);
      setNotification('Failed to share. Please try again.');
    }

    if (platform !== 'print') {
      setTimeout(() => setNotification(null), 3000);
    }
  }, [post]);

  // Bookmark functionality
  const toggleBookmark = useCallback(() => {
    const bookmarks = JSON.parse(localStorage.getItem('blogBookmarks') || '[]');
    let newBookmarks;
    
    if (isBookmarked) {
      newBookmarks = bookmarks.filter(bookmarkId => bookmarkId !== id);
      setNotification('Post removed from bookmarks');
    } else {
      newBookmarks = [...bookmarks, id];
      setNotification('Post added to bookmarks');
    }
    
    localStorage.setItem('blogBookmarks', JSON.stringify(newBookmarks));
    setIsBookmarked(!isBookmarked);
    setTimeout(() => setNotification(null), 3000);
  }, [id, isBookmarked]);

  // Edit and Delete handlers
  const handleEdit = useCallback(() => {
    navigate(`/edit-blog/${id}`);
  }, [navigate, id]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/blogs/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/blog', { replace: true });
    } catch (err) {
      console.error('Failed to delete blog post:', err);
      setError('Failed to delete blog post. Please try again later.');
    }
  }, [id, navigate]);

  // Structured data generation
  const generateStructuredData = useCallback(() => {
    if (!post) return null;

    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": window.location.href,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": window.location.href
      },
      "headline": post.title,
      "name": post.title,
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
      "inLanguage": "en-US",
      "timeRequired": `PT${calculateReadTime(post.content)}M`
    };
  }, [post]);

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.postContainer}>
        <div className={styles.loadingSpinner} role="status">
          <span className="sr-only">Loading post...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.postContainer}>
        <div className={styles.errorMessage} role="alert">
          {error}
          <button
            onClick={() => fetchPost()}
            className={styles.retryButton}
            aria-label="Retry loading post"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No post found
  if (!post) return null;

  const readTime = calculateReadTime(post.content);
  const sanitizedContent = DOMPurify.sanitize(post.content, {
    ALLOWED_TAGS: [...Object.values(ALLOWED_TAGS).flat()],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class', 'id'],
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allowfullscreen', 'frameborder', 'target'],
    FORCE_BODY: true
  });

  return (
    <>
      <Helmet>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <meta name="author" content={seoData.author} />
        <meta name="keywords" content={seoData.keywords} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:image" content={seoData.image} />
        <meta property="og:url" content={seoData.url} />
        <meta property="og:site_name" content="Propertilico Blog" />
        <meta property="article:published_time" content={seoData.publishedTime} />
        <meta property="article:modified_time" content={seoData.modifiedTime} />
        <meta property="article:author" content={seoData.author} />
        <meta property="article:section" content="Property Management" />
        {post.tags?.map(tag => (
          <meta property="article:tag" content={tag} key={tag} />
        ))}
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoData.title} />
        <meta name="twitter:description" content={seoData.description} />
        <meta name="twitter:image" content={seoData.image} />
        
        {/* Additional SEO */}
        <link rel="canonical" href={seoData.url} />
        
        <script type="application/ld+json">
          {JSON.stringify(generateStructuredData())}
        </script>
      </Helmet>

      <motion.div
        className={styles.postContainer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.mainContent}>
          <Link to="/blog" className={styles.backButton}>
            <FaArrowLeft aria-hidden="true" /> Back to Blog List
          </Link>

          <article>
            {post.imageUrl && (
              <LazyImage 
                src={getImageUrl(post.imageUrl)} 
                alt={post.title}
                className={styles.headerImage}
              />
            )}

            <header>
              <h1 className={styles.postTitle} itemProp="headline">
                {post.title}
              </h1>

              <div className={styles.metaData}>
                <div className={styles.metaItem} itemProp="author">
                  <FaUser aria-hidden="true" />
                  <span>{post.author?.name || "Anonymous"}</span>
                </div>
                <div className={styles.metaItem}>
                  <FaCalendarAlt aria-hidden="true" />
                  <time dateTime={post.createdAt} itemProp="datePublished">
                    {formatDate(post.createdAt)}
                  </time>
                </div>
                <div className={styles.metaItem}>
                  <FaClock aria-hidden="true" />
                  <span>{readTime} min read</span>
                </div>
                <div className={styles.metaItem}>
                  <FaEye aria-hidden="true" />
                  <span>{post.viewCount || 0} views</span>
                </div>
              </div>

              <div className={styles.tagList} itemProp="keywords">
                {post.tags?.map(tag => (
                  <Link 
                    key={tag} 
                    to={`/blog/tag/${encodeURIComponent(tag)}`} 
                    className={styles.tag}
                    title={tag} // Show full tag on hover
                  >
                    {tag}
                  </Link>
                ))}
              </div>

              <div className={styles.actionButtonGroup}>
                {user?.isBlogger && (
                  <>
                    <button 
                      onClick={handleEdit} 
                      className={`${styles.actionButton} ${styles.editButton}`}
                      aria-label="Edit blog post"
                    >
                      <FaEdit aria-hidden="true" /> Edit Post
                    </button>
                    <button 
                      onClick={handleDelete} 
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      aria-label="Delete blog post"
                    >
                      <FaTrash aria-hidden="true" /> Delete Post
                    </button>
                  </>
                )}
                <button 
                  onClick={toggleBookmark} 
                  className={`${styles.actionButton} ${styles.bookmarkButton}`}
                  aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                >
                  {isBookmarked ? (
                    <>
                      <FaBookmark aria-hidden="true" /> Bookmarked
                    </>
                  ) : (
                    <>
                      <FaRegBookmark aria-hidden="true" /> Bookmark
                    </>
                  )}
                </button>
                <button 
                  onClick={() => handleShare('print')} 
                  className={styles.actionButton}
                  aria-label="Print article"
                >
                  <FaPrint aria-hidden="true" /> Print
                </button>
              </div>
            </header>

            <div 
              className={styles.postContent}
              ref={contentRef}
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              itemProp="articleBody"
            />

            <footer>
              <div className={styles.authorSection}>
                <img 
                  src={post.author?.avatar || '/default-avatar.jpg'} 
                  alt={`${post.author?.name || "Anonymous"}'s avatar`}
                  className={styles.authorAvatar}
                  loading="lazy"
                />
                <div className={styles.authorInfo}>
                  <h3 className={styles.authorName}>
                    {post.author?.name || "Anonymous"}
                  </h3>
                  <p className={styles.authorBio}>
                    {post.author?.bloggerDescription || "Property Management Expert"}
                  </p>
                </div>
              </div>

              <div className={styles.shareSection}>
                <h3 className={styles.shareTitle}>Share this article</h3>
                <div className={styles.shareButtons}>
                  <button 
                    onClick={() => handleShare('facebook')} 
                    className={`${styles.actionButton} ${styles.facebookButton}`}
                    aria-label="Share on Facebook"
                  >
                    <FaFacebookF aria-hidden="true" /> Facebook
                  </button>
                  <button 
                    onClick={() => handleShare('twitter')} 
                    className={`${styles.actionButton} ${styles.twitterButton}`}
                    aria-label="Share on Twitter"
                  >
                    <FaTwitter aria-hidden="true" /> Twitter
                  </button>
                  <button 
                    onClick={() => handleShare('linkedin')} 
                    className={`${styles.actionButton} ${styles.linkedinButton}`}
                    aria-label="Share on LinkedIn"
                  >
                    <FaLinkedinIn aria-hidden="true" /> LinkedIn
                  </button>
                  <button 
                    onClick={() => handleShare('whatsapp')} 
                    className={`${styles.actionButton} ${styles.whatsappButton}`}
                    aria-label="Share on WhatsApp"
                  >
                    <FaWhatsapp aria-hidden="true" /> WhatsApp
                  </button>
                  <button 
                    onClick={() => handleShare('reddit')} 
                    className={`${styles.actionButton} ${styles.redditButton}`}
                    aria-label="Share on Reddit"
                  >
                    <FaRedditAlien aria-hidden="true" /> Reddit
                  </button>
                  <button 
                    onClick={() => handleShare('email')} 
                    className={`${styles.actionButton} ${styles.emailButton}`}
                    aria-label="Share via Email"
                  >
                    <FaEnvelope aria-hidden="true" /> Email
                  </button>
                  <button 
                    onClick={() => handleShare('copy')} 
                    className={styles.actionButton}
                    aria-label="Copy link"
                  >
                    <FaCopy aria-hidden="true" /> Copy Link
                  </button>
                </div>
              </div>
            </footer>
          </article>

          {relatedPosts.length > 0 && (
            <section className={styles.relatedPosts}>
              <h2 className={styles.relatedPostsTitle}>Related Articles</h2>
              <div className={styles.relatedPostsGrid}>
                {relatedPosts.map(relatedPost => (
                  <Link 
                    key={relatedPost.id} 
                    to={`/blog/${relatedPost.id}`} 
                    className={styles.relatedPostCard}
                    onClick={() => window.scrollTo(0, 0)}
                  >
                    <LazyImage 
                      src={getImageUrl(relatedPost.imageUrl)} 
                      alt={relatedPost.title}
                      className={styles.headerImage}
                    />
                    <div className={styles.relatedPostContent}>
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
        </div>

        <aside className={styles.sidebar}>
          {tableOfContents.length > 0 && (
            <nav 
              className={styles.tableOfContents}
              aria-label="Table of contents"
            >
              <h4>Table of Contents</h4>
              <ul>
                {tableOfContents.map(heading => (
                  <li 
                    key={heading.id} 
                    style={{ marginLeft: `${(heading.level - 2) * 1}rem` }}
                  >
                    <a 
                      href={`#${heading.id}`}
                      className={activeHeading === heading.id ? styles.active : ''}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(heading.id)?.scrollIntoView({
                          behavior: 'smooth'
                        });
                      }}
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </aside>

        <AnimatePresence>
          {notification && (
            <motion.div
              className={styles.notification}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3 }}
              role="alert"
            >
              {notification}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default React.memo(BlogPost);