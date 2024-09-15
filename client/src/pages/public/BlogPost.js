import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import { Typography, Box, Avatar, Chip, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

const PostContainer = styled(Box)(({ theme }) => ({
  maxWidth: '800px',
  margin: '2rem auto',
  padding: '2rem',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
}));

const PostTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.main,
}));

const PostMeta = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: theme.palette.text.secondary,
}));

const PostContent = styled('div')(({ theme }) => ({
  '& img': {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2),
  },
  '& h2, & h3, & h4': {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  '& p': {
    marginBottom: theme.spacing(2),
  },
  '& blockquote': {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    paddingLeft: theme.spacing(2),
    fontStyle: 'italic',
    margin: `${theme.spacing(2)} 0`,
  },
}));

const AuthorContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(2),
}));

const AuthorAvatar = styled(Avatar)(({ theme }) => ({
  marginRight: theme.spacing(2),
}));

const TagsContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <ErrorMessage variant="h6">{error}</ErrorMessage>;
  }

  if (!post) return null;

  const sanitizedContent = DOMPurify.sanitize(post.content);

  return (
    <>
      <Helmet>
        <title>{post.title} | Your Property Management Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={post.date} />
        <meta property="article:author" content={post.author} />
        {post.tags.map(tag => (
          <meta property="article:tag" content={tag} key={tag} />
        ))}
      </Helmet>
      <PostContainer>
        <PostTitle variant="h2">{post.title}</PostTitle>
        <PostMeta variant="subtitle2">
          Published on {new Date(post.date).toLocaleDateString()} by {post.author}
        </PostMeta>
        <AuthorContainer>
          <AuthorAvatar src={`https://i.pravatar.cc/40?u=${post.author}`} alt={post.author} />
          <Typography variant="subtitle1">{post.author}</Typography>
        </AuthorContainer>
        <PostContent dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
        <TagsContainer>
          {post.tags.map(tag => (
            <Chip key={tag} label={tag} variant="outlined" style={{ marginRight: 8, marginBottom: 8 }} />
          ))}
        </TagsContainer>
      </PostContainer>
    </>
  );
};

export default BlogPost;