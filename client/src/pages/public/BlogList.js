import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaSearch, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';

const BlogListContainer = styled(motion.div)`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.h1`
  font-size: 2.5rem;
  color: #343a40;
  text-align: center;
  margin-bottom: 2rem;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const SearchBarContainer = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 1.5rem;
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1.25rem;
  font-size: 1rem;
  border: 2px solid #ced4da;
  border-radius: 25px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: border-color 0.3s, box-shadow 0.3s;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 1.2rem;
`;

const SortingOptions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const SortButton = styled.button`
  background: #fff;
  border: 2px solid #007bff;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-left: 0.5rem;
  display: flex;
  align-items: center;
  transition: all 0.3s;
  color: #007bff;

  &:hover {
    background: #007bff;
    color: #fff;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    margin-left: 0.5rem;
  }
`;

const PostCard = styled(motion.article)`
  background: #fff;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const PostTitle = styled(Link)`
  font-size: 1.5rem;
  font-weight: 700;
  color: #007bff;
  text-decoration: none;
  transition: color 0.3s;

  &:hover {
    color: #0056b3;
  }
`;

const PostMeta = styled.div`
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0.5rem 0;
`;

const PostExcerpt = styled.p`
  font-size: 1rem;
  color: #495057;
  line-height: 1.6;
`;

const TagList = styled.ul`
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Tag = styled.li`
  background: #e9ecef;
  color: #495057;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  transition: background 0.3s, color 0.3s;

  &:hover {
    background: #007bff;
    color: #fff;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  text-align: center;
  margin: 2rem 0;
  font-size: 1.2rem;
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

const BlogList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:5000/api/blogs');
        setPosts(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch blog posts:', err);
        setError('Failed to load blog posts. Please try again later.');
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const filteredAndSortedPosts = useMemo(() => {
    return posts
      .filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortOption === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }, [posts, searchTerm, sortOption]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const toggleSortOption = useCallback(() => {
    setSortOption(prev => prev === 'newest' ? 'oldest' : 'newest');
  }, []);

  return (
    <>
      <Helmet>
        <title>Blog | Your Property Management Insights</title>
        <meta name="description" content="Explore our latest articles on property management tips, industry trends, and expert advice for property managers." />
      </Helmet>
      <BlogListContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Header>Property Management Insights</Header>
        <SearchBarContainer>
          <SearchBar
            type="text"
            placeholder="Search blog posts..."
            value={searchTerm}
            onChange={handleSearchChange}
            aria-label="Search blog posts"
          />
          <SearchIcon aria-hidden="true" />
        </SearchBarContainer>
        <SortingOptions>
          <SortButton onClick={toggleSortOption} aria-label={`Sort by ${sortOption === 'newest' ? 'oldest' : 'newest'}`}>
            {sortOption === 'newest' ? 'Newest' : 'Oldest'}
            {sortOption === 'newest' ? <FaSortAmountDown aria-hidden="true" /> : <FaSortAmountUp aria-hidden="true" />}
          </SortButton>
        </SortingOptions>
        {isLoading && <LoadingSpinner />}
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <AnimatePresence>
          {filteredAndSortedPosts.map((post) => (
            <PostCard
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PostTitle to={`/blog/${post._id}`}>{post.title}</PostTitle>
              <PostMeta>
                By {post.author} on {new Date(post.date).toLocaleDateString()}
              </PostMeta>
              <PostExcerpt>{post.excerpt}</PostExcerpt>
              <TagList>
                {post.tags.map((tag, index) => (
                  <Tag key={index}>{tag}</Tag>
                ))}
              </TagList>
            </PostCard>
          ))}
        </AnimatePresence>
      </BlogListContainer>
    </>
  );
};

export default BlogList;