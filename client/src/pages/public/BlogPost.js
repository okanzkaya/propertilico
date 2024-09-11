import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import DOMPurify from 'dompurify';
import { motion } from 'framer-motion';

const PostContainer = styled(motion.article)`
  padding: 2rem;
  max-width: 800px;
  margin: 2rem auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 1rem;
    margin: 1rem;
  }
`;

const PostTitle = styled.h1`
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const PostMeta = styled.div`
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const PostContent = styled.div`
  font-size: 1.1rem;
  color: #34495e;
  line-height: 1.8;
  margin-top: 2rem;

  h2, h3, h4 {
    margin-top: 2rem;
    margin-bottom: 1rem;
    color: #2c3e50;
  }

  p {
    margin-bottom: 1rem;
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 1rem 0;
  }

  blockquote {
    border-left: 4px solid #3498db;
    padding-left: 1rem;
    margin-left: 0;
    font-style: italic;
    color: #7f8c8d;
  }
`;

const AuthorContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 2rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
`;

const AuthorImage = styled.img`
  border-radius: 50%;
  width: 60px;
  height: 60px;
  margin-right: 1rem;
`;

const AuthorName = styled.div`
  font-size: 1.1rem;
  font-weight: bold;
  color: #2c3e50;
`;

const TagsContainer = styled.div`
  margin-top: 2rem;
`;

const Tag = styled.span`
  display: inline-block;
  background: #e0f2fe;
  color: #3498db;
  padding: 0.3rem 0.8rem;
  margin: 0 0.5rem 0.5rem 0;
  border-radius: 20px;
  font-size: 0.9rem;
  transition: background 0.3s, color 0.3s;

  &:hover {
    background: #3498db;
    color: #fff;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  text-align: center;
  font-size: 1.2rem;
  margin-top: 2rem;
`;

const LoadingSpinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 2rem auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const BlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPost = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:5000/api/blogs/${id}`);
      setPost(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch blog post:', err);
      setError('Failed to load the blog post. Please try again later.');
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;
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
      <PostContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <PostTitle>{post.title}</PostTitle>
        <PostMeta>
          Published on {new Date(post.date).toLocaleDateString()} by {post.author}
        </PostMeta>
        <AuthorContainer>
          <AuthorImage src={`https://i.pravatar.cc/60?u=${post.author}`} alt={post.author} />
          <AuthorName>{post.author}</AuthorName>
        </AuthorContainer>
        <PostContent dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
        <TagsContainer>
          {post.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
        </TagsContainer>
      </PostContainer>
    </>
  );
};

export default BlogPost;