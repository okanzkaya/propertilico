import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import { 
  Typography, Box, Chip, Container, Fade, 
  IconButton, Snackbar, Alert, Skeleton, Avatar, Card, CardContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  CalendarToday, AccessTime, Person, Facebook, Twitter, LinkedIn,
  WhatsApp, Reddit, ContentCopy, ArrowBack
} from '@mui/icons-material';

const PostContainer = styled(Container)(({ theme }) => ({
  maxWidth: '800px',
  padding: theme.spacing(3),
  [theme.breakpoints.up('md')]: { padding: theme.spacing(5) },
}));

const HeaderImage = styled('img')(({ theme }) => ({
  width: '100%',
  height: '400px',
  objectFit: 'cover',
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(4),
  boxShadow: theme.shadows[5],
}));

const PostTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 700,
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.main,
  [theme.breakpoints.up('md')]: { fontSize: '3rem' },
}));

const PostMeta = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  marginBottom: theme.spacing(4),
  '& > *': {
    display: 'flex',
    alignItems: 'center',
    marginRight: theme.spacing(3),
    marginBottom: theme.spacing(1),
    color: theme.palette.text.secondary,
  },
  '& svg': {
    marginRight: theme.spacing(0.5),
    fontSize: '1.2rem',
  },
}));

const PostContent = styled('div')(({ theme }) => ({
  fontSize: '1.125rem',
  lineHeight: 1.8,
  color: theme.palette.text.primary,
  '& img': {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(3),
    boxShadow: theme.shadows[3],
  },
  '& h2': {
    fontSize: '2rem',
    fontWeight: 600,
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
    color: theme.palette.primary.main,
  },
  '& h3': {
    fontSize: '1.5rem',
    fontWeight: 500,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
    color: theme.palette.secondary.main,
  },
  '& p': { marginBottom: theme.spacing(3) },
  '& blockquote': {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    padding: theme.spacing(2),
    fontStyle: 'italic',
    margin: `${theme.spacing(3)} 0`,
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
  },
}));

const TagsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  margin: `${theme.spacing(4)} 0`,
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
  transition: theme.transitions.create(['background-color', 'color']),
}));

const SocialShareContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  flexWrap: 'wrap',
  marginTop: theme.spacing(4),
  '& > *': { margin: theme.spacing(0, 1, 1, 1) },
}));

const AuthorCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(6),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
  borderRadius: theme.shape.borderRadius,
}));

const AuthorAvatar = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  marginRight: theme.spacing(2),
}));

const BackButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  top: theme.spacing(2),
  left: theme.spacing(2),
  zIndex: 1000,
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
}));

const BlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const fetchPost = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/blogs/${id}`);
      setPost(response.data);
    } catch (err) {
      console.error('Error fetching blog post:', err);
      setError('Failed to load the blog post. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleShare = useCallback((platform) => {
    if (!post) return;
    const url = window.location.href;
    const text = `Check out this article: ${post.title}`;
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${post.title}`,
      whatsapp: `https://wa.me/?text=${text} ${url}`,
      reddit: `https://reddit.com/submit?url=${url}&title=${post.title}`,
    };
    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setSnackbar({ open: true, message: 'Link copied to clipboard!', severity: 'success' });
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank');
    }
  }, [post]);

  if (isLoading) {
    return (
      <PostContainer>
        <Skeleton variant="rectangular" width="100%" height={400} />
        <Skeleton variant="text" width="80%" height={60} sx={{ mt: 2 }} />
        <Skeleton variant="text" width="60%" height={30} sx={{ mt: 1 }} />
        <Skeleton variant="text" width="100%" height={200} sx={{ mt: 2 }} />
      </PostContainer>
    );
  }

  if (error) {
    return (
      <PostContainer>
        <Typography variant="h6" color="error" align="center" mt={4}>{error}</Typography>
      </PostContainer>
    );
  }

  if (!post) return null;

  const sanitizedContent = DOMPurify.sanitize(post.content);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "image": post.coverImage,
    "datePublished": post.date,
    "dateModified": post.lastModified || post.date,
    "author": { 
      "@type": "Person", 
      "name": post.author?.name || "Unknown",
      "description": post.author?.bloggerDescription || ""
    },
    "publisher": {
      "@type": "Organization",
      "name": "Propertilico",
      "logo": { "@type": "ImageObject", "url": "https://propertilico.com/logo.png" }
    },
    "description": post.excerpt,
    "keywords": post.tags.join(", "),
    "mainEntityOfPage": { "@type": "WebPage", "@id": window.location.href }
  };

  return (
    <>
      <Helmet>
        <title>{post.title} | Propertilico Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta name="author" content={post.author?.name || "Unknown"} />
        <meta name="keywords" content={post.tags.join(", ")} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={post.coverImage} />
        <meta property="og:url" content={window.location.href} />
        <meta property="article:published_time" content={post.date} />
        <meta property="article:modified_time" content={post.lastModified || post.date} />
        <meta property="article:author" content={post.author?.name || "Unknown"} />
        {post.tags.map(tag => (
          <meta property="article:tag" content={tag} key={tag} />
        ))}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        <meta name="twitter:image" content={post.coverImage} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>
      <Fade in={true} timeout={1000}>
        <PostContainer component="article">
          <BackButton component={Link} to="/blog" aria-label="Back to blog list">
            <ArrowBack />
          </BackButton>
          {post.coverImage && <HeaderImage src={post.coverImage} alt={post.title} />}
          <PostTitle variant="h1">{post.title}</PostTitle>
          <PostMeta>
            <Box>
              <Person />
              <Typography variant="body2">{post.author?.name || "Unknown"}</Typography>
            </Box>
            <Box>
              <CalendarToday />
              <Typography variant="body2">
                {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
            </Box>
            {post.readTime && (
              <Box>
                <AccessTime />
                <Typography variant="body2">{post.readTime} min read</Typography>
              </Box>
            )}
          </PostMeta>
          <PostContent dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
          <TagsContainer>
            {post.tags.map(tag => (
              <StyledChip key={tag} label={tag} component={Link} to={`/blog/tag/${tag}`} clickable />
            ))}
          </TagsContainer>
          <SocialShareContainer>
            {['facebook', 'twitter', 'linkedin', 'whatsapp', 'reddit', 'copy'].map((platform) => (
              <IconButton key={platform} onClick={() => handleShare(platform)} color="primary" aria-label={`Share on ${platform}`}>
                {platform === 'facebook' && <Facebook />}
                {platform === 'twitter' && <Twitter />}
                {platform === 'linkedin' && <LinkedIn />}
                {platform === 'whatsapp' && <WhatsApp />}
                {platform === 'reddit' && <Reddit />}
                {platform === 'copy' && <ContentCopy />}
              </IconButton>
            ))}
          </SocialShareContainer>
          <AuthorCard>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <AuthorAvatar src={post.author?.avatar || '/default-avatar.png'} alt={post.author?.name} />
              <Box>
                <Typography variant="h6">{post.author?.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {post.author?.bloggerDescription || "Property Management Expert"}
                </Typography>
              </Box>
            </CardContent>
          </AuthorCard>
        </PostContainer>
      </Fade>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BlogPost;