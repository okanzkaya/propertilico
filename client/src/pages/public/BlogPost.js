import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import { 
  Typography, Box, Avatar, Chip, CircularProgress, Container, 
  useTheme, useMediaQuery, Fade, Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { CalendarToday, AccessTime, Person } from '@mui/icons-material';

const PostContainer = styled(Container)(({ theme }) => ({
  maxWidth: '800px',
  padding: theme.spacing(3),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(5),
  },
}));

const HeaderImage = styled('img')(({ theme }) => ({
  width: '100%',
  height: 'auto',
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(4),
}));

const PostTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 300,
  marginBottom: theme.spacing(2),
  color: theme.palette.text.primary,
  [theme.breakpoints.up('md')]: {
    fontSize: '3rem',
  },
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
  },
  '& h2': {
    fontSize: '2rem',
    fontWeight: 400,
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
  },
  '& h3': {
    fontSize: '1.5rem',
    fontWeight: 400,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  '& p': {
    marginBottom: theme.spacing(3),
  },
  '& blockquote': {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    paddingLeft: theme.spacing(2),
    fontStyle: 'italic',
    margin: `${theme.spacing(3)} 0`,
    color: theme.palette.text.secondary,
  },
}));

const TagsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: theme.palette.background.default,
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
}));

const AuthorSection = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(3),
  marginTop: theme.spacing(6),
  borderRadius: theme.shape.borderRadius,
  boxShadow: 'none',
  backgroundColor: theme.palette.background.default,
}));

const AuthorAvatar = styled(Avatar)(({ theme }) => ({
  width: 60,
  height: 60,
  marginRight: theme.spacing(2),
}));

const ErrorMessage = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
  textAlign: 'center',
  marginTop: theme.spacing(4),
}));

const BlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/blogs/${id}`);
        setPost(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch blog post:', err);
        setError('Failed to load the blog post. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={40} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return <ErrorMessage variant="h6">{error}</ErrorMessage>;
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
      "name": post.author?.name || "Unknown"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Your Property Management Blog",
      "logo": {
        "@type": "ImageObject",
        "url": "https://yourdomain.com/logo.png"
      }
    },
    "description": post.excerpt,
    "keywords": post.tags.join(", ")
  };

  return (
    <>
      <Helmet>
        <title>{post.title} | Your Property Management Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta name="author" content={post.author?.name || "Unknown"} />
        <meta name="keywords" content={post.tags.join(", ")} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={post.coverImage} />
        <meta property="article:published_time" content={post.date} />
        <meta property="article:modified_time" content={post.lastModified || post.date} />
        <meta property="article:author" content={post.author?.name || "Unknown"} />
        {post.tags.map(tag => (
          <meta property="article:tag" content={tag} key={tag} />
        ))}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      <Fade in={true} timeout={1000}>
        <PostContainer component="article">
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
              <StyledChip key={tag} label={tag} />
            ))}
          </TagsContainer>
          <AuthorSection>
            <AuthorAvatar src={post.author?.avatar || `https://i.pravatar.cc/300?u=${post.author?.name}`} alt={post.author?.name || "Author"} />
            <Box>
              <Typography variant="h6">{post.author?.name || "Unknown"}</Typography>
              <Typography variant="body2" color="textSecondary">{post.author?.bio || "Author bio"}</Typography>
            </Box>
          </AuthorSection>
        </PostContainer>
      </Fade>
    </>
  );
};

export default BlogPost;