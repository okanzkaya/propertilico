import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import axiosInstance from '../../axiosSetup';
import { 
  Share2, Clock, Edit3, Trash2, ChevronLeft, 
  Bookmark, BookmarkCheck, Eye, Calendar,
  Facebook, Twitter, Linkedin, Mail, Link as LinkIcon
} from 'lucide-react';
import { Alert } from '@mui/material';
import styles from './BlogPost.module.css';

const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const calculateReadTime = (content) => {
  if (!content) return 0;
  const wordsPerMinute = 200;
  const wordCount = content?.trim().split(/\s+/).length || 0;
  return Math.ceil(wordCount / wordsPerMinute);
};

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '/default-blog-image.jpg';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${process.env.REACT_APP_API_URL?.replace('/api', '')}${imageUrl}`;
};

const BlogPost = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const contentRef = useRef(null);
  const shareMenuRef = useRef(null);
  const viewIncrementedRef = useRef(false);

  const fetchPost = useCallback(async () => {
    const controller = new AbortController();
    
    if (viewIncrementedRef.current || !id) return;
    
    try {
      setIsLoading(true);
      setError(null);

      const [postResponse, relatedResponse] = await Promise.all([
        axiosInstance.get(`/api/blogs/${id}`, {
          params: { increment: !viewIncrementedRef.current },
          signal: controller.signal
        }),
        axiosInstance.get(`/api/blogs/related/${id}`, {
          signal: controller.signal
        })
      ]);

      if (postResponse.data.status === 'success' && relatedResponse.data.status === 'success') {
        setPost(postResponse.data.data.blog);
        setRelatedPosts(relatedResponse.data.data.relatedBlogs);
        
        const bookmarks = new Set(JSON.parse(localStorage.getItem('blogBookmarks') || '[]'));
        setIsBookmarked(bookmarks.has(id));
        
        viewIncrementedRef.current = true;
      }
    } catch (err) {
      if (!err.name === 'AbortError') {
        console.error('Error fetching blog:', err);
        setError(err?.response?.data?.message || 'Failed to load the blog post');
      }
    } finally {
      setIsLoading(false);
    }

    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    fetchPost();
    window.scrollTo(0, 0);
    viewIncrementedRef.current = false;
  }, [fetchPost]);

  const handleScroll = useCallback(() => {
    if (!contentRef.current) return;
    
    const totalHeight = contentRef.current.clientHeight;
    const windowHeight = window.innerHeight;
    const scrolled = window.scrollY;
    const progress = (scrolled / (totalHeight - windowHeight)) * 100;
    setReadProgress(Math.min(100, Math.max(0, progress)));
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = useCallback((message) => {
    setToastMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  }, []);

  const handleShare = async (platform) => {
    if (!post) return;
    
    const url = window.location.href;
    const text = encodeURIComponent(post.title);
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}`,
      email: `mailto:?subject=${text}&body=${url}`
    };

    try {
      if (platform === 'copy') {
        await navigator.clipboard.writeText(url);
        showToast('Link copied to clipboard!');
      } else {
        window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      showToast('Failed to share. Please try again.');
    }
  };

  const handleBackNavigation = () => {
    navigate('/blog');
  };

  const toggleBookmark = useCallback(() => {
    try {
      const bookmarks = new Set(JSON.parse(localStorage.getItem('blogBookmarks') || '[]'));
      const newIsBookmarked = !isBookmarked;
      
      if (newIsBookmarked) {
        bookmarks.add(id);
        showToast('Article bookmarked!');
      } else {
        bookmarks.delete(id);
        showToast('Bookmark removed!');
      }
      
      localStorage.setItem('blogBookmarks', JSON.stringify([...bookmarks]));
      setIsBookmarked(newIsBookmarked);
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      showToast('Failed to update bookmark');
    }
  }, [id, isBookmarked, showToast]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const response = await axiosInstance.delete(`/api/blogs/${id}`);
      if (response.data.status === 'success') {
        showToast('Blog post deleted successfully');
        setTimeout(() => navigate('/blog'), 1500);
      }
    } catch (err) {
      console.error('Error deleting blog:', err);
      showToast(err?.response?.data?.message || 'Failed to delete blog post');
    }
  };

  const structuredData = useMemo(() => {
    if (!post) return null;

    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": truncateText(post.title, 110),
      "description": truncateText(post.excerpt, 160),
      "image": getImageUrl(post.imageUrl),
      "datePublished": post.publishedAt,
      "dateModified": post.updatedAt || post.publishedAt,
      "author": {
        "@type": "Person",
        "name": post.author?.name,
        "description": post.author?.bloggerDescription
      },
      "publisher": {
        "@type": "Organization",
        "name": "Propertilico",
        "logo": {
          "@type": "ImageObject",
          "url": `${window.location.origin}/logo.png`
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": window.location.href
      }
    };
  }, [post]);

  const pageTitle = useMemo(() => 
    post ? truncateText(`${post.title} | Property Management Blog`, 60) : 'Loading...',
    [post]
  );

  const metaDescription = useMemo(() => 
    post ? truncateText(post.excerpt, 160) : '',
    [post]
  );

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.skeleton}>
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonMeta} />
          <div className={styles.skeletonImage} />
          <div className={styles.skeletonText} />
          <div className={styles.skeletonText} />
          <div className={styles.skeletonText} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <Alert severity="error" sx={{ width: '100%', marginBottom: 2 }}>
          {error}
        </Alert>
        <button onClick={fetchPost} className={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  if (!post) return null;

  const readTime = calculateReadTime(post.content);

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="author" content={post.author?.name} />
        <meta name="keywords" content={post.tags?.join(', ')} />
        
        <meta property="og:title" content={truncateText(post.title, 60)} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={getImageUrl(post.imageUrl)} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={truncateText(post.title, 60)} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={getImageUrl(post.imageUrl)} />

        <meta property="article:published_time" content={post.publishedAt} />
        <meta property="article:modified_time" content={post.updatedAt || post.publishedAt} />
        {post.tags?.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}

        <link rel="canonical" href={window.location.href} />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className={styles.container}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressIndicator}
            style={{ width: `${readProgress}%` }}
          />
        </div>

        <main className={styles.main}>
          <button 
            onClick={handleBackNavigation}
            className={styles.backButton}
            aria-label="Go back"
          >
            <ChevronLeft size={24} />
          </button>

          <article className={styles.article}>
            <header className={styles.header}>
              <h1 className={styles.title}>{post.title}</h1>
              
              <div className={styles.meta}>
                <div className={styles.authorInfo}>
                  <img
                    src={post.author?.avatar || '/default-avatar.jpg'}
                    alt={post.author?.name}
                    className={styles.avatar}
                    loading="lazy"
                  />
                  <div className={styles.authorMeta}>
                    <span className={styles.authorName}>{post.author?.name}</span>
                    <div className={styles.postMeta}>
                      <span className={styles.metaItem}>
                        <Calendar className={styles.icon} />
                        {formatDate(post.publishedAt)}
                      </span>
                      <span className={styles.metaItem}>
                        <Clock className={styles.icon} />
                        {readTime} min read
                      </span>
                      <span className={styles.metaItem}>
                        <Eye className={styles.icon} />
                        {post.viewCount?.toLocaleString()} views
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.actions}>
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className={styles.actionButton}
                    aria-label="Share article"
                  >
                    <Share2 />
                  </button>
                  <button
                    onClick={toggleBookmark}
                    className={`${styles.actionButton} ${isBookmarked ? styles.active : ''}`}
                    aria-label={isBookmarked ? "Remove bookmark" : "Bookmark article"}
                  >
                    {isBookmarked ? <BookmarkCheck /> : <Bookmark />}
                  </button>
                  {user?.isAdmin && (
                    <>
                      <Link
                        to={`/edit-blog/${id}`}
                        className={styles.actionButton}
                        aria-label="Edit article"
                      >
                        <Edit3 />
                      </Link>
                      <button
                        onClick={handleDelete}
                        className={styles.actionButton}
                        aria-label="Delete article"
                      >
                        <Trash2 />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </header>

            {post.imageUrl && (
              <figure className={styles.featuredImage}>
                <img 
                  src={getImageUrl(post.imageUrl)} 
                  alt={post.title}
                  loading="lazy"
                />
                {post.imageCaption && (
                  <figcaption>{post.imageCaption}</figcaption>
                )}
              </figure>
            )}

            <div 
              ref={contentRef}
              className={styles.content}
              dangerouslySetInnerHTML={{ 
                __html: DOMPurify.sanitize(post.content, {
                  ADD_TAGS: ['iframe'],
                  ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling']
                })
              }}
            />

            {post.tags?.length > 0 && (<div className={styles.tags}>
                {post.tags.map(tag => (
                  <Link key={tag} to={`/blog/tag/${tag}`} className={styles.tag}>
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            <div className={styles.articleFooter}>
              <div className={styles.authorBio}>
                <img
                  src={post.author?.avatar || '/default-avatar.jpg'}
                  alt={post.author?.name}
                  className={styles.authorAvatar}
                  loading="lazy"
                />
                <div>
                  <h3>About {post.author?.name}</h3>
                  <p>{post.author?.bio || post.author?.bloggerDescription || 'Property Management Expert'}</p>
                </div>
              </div>
            </div>
          </article>

          {relatedPosts.length > 0 && (
            <section className={styles.relatedPosts}>
              <h2>Related Articles</h2>
              <div className={styles.relatedGrid}>
                {relatedPosts.map(relatedPost => (
                  <Link
                    key={relatedPost.id}
                    to={`/blog/${relatedPost.id}`}
                    className={styles.relatedPost}
                  >
                    <div className={styles.relatedImageWrapper}>
                      <img
                        src={getImageUrl(relatedPost.imageUrl)}
                        alt={relatedPost.title}
                        loading="lazy"
                      />
                    </div>
                    <div className={styles.relatedContent}>
                      <h3>{truncateText(relatedPost.title, 70)}</h3>
                      <p>{truncateText(relatedPost.excerpt, 160)}</p>
                      <div className={styles.relatedMeta}>
                        <span>
                          <Calendar className={styles.icon} />
                          {formatDate(relatedPost.publishedAt)}
                        </span>
                        <span>
                          <Eye className={styles.icon} />
                          {relatedPost.viewCount?.toLocaleString()} views
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>

        <AnimatePresence>
          {showShareMenu && (
            <motion.div
              ref={shareMenuRef}
              className={styles.shareMenu}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <button onClick={() => handleShare('facebook')} className={styles.shareButton}>
                <Facebook />
                <span>Share on Facebook</span>
              </button>
              <button onClick={() => handleShare('twitter')} className={styles.shareButton}>
                <Twitter />
                <span>Share on Twitter</span>
              </button>
              <button onClick={() => handleShare('linkedin')} className={styles.shareButton}>
                <Linkedin />
                <span>Share on LinkedIn</span>
              </button>
              <button onClick={() => handleShare('email')} className={styles.shareButton}>
                <Mail />
                <span>Share via Email</span>
              </button>
              <button onClick={() => handleShare('copy')} className={styles.shareButton}>
                <LinkIcon />
                <span>Copy Link</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSuccessToast && (
            <motion.div
              className={styles.toast}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default BlogPost;