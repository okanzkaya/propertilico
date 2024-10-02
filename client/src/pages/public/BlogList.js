import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaSearch, FaSortAmountDown, FaSortAmountUp, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import { ErrorBoundary } from 'react-error-boundary';
import { useInView } from 'react-intersection-observer';
import { debounce } from 'lodash';

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

const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SortButton = styled.button`
  background: #fff;
  border: 2px solid #007bff;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 0.9rem;
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

  @media (max-width: 768px) {
    margin-top: 1rem;
  }
`;

const CreateButton = styled(SortButton)`
  background: #28a745;
  border-color: #28a745;
  color: #fff;

  &:hover {
    background: #218838;
    border-color: #1e7e34;
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

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  font-size: 1rem;
  margin-left: 1rem;
  transition: color 0.3s;

  &:hover {
    color: #007bff;
  }
`;

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <ErrorMessage>
    <p>Something went wrong:</p>
    <pre>{error.message}</pre>
    <button onClick={resetErrorBoundary}>Try again</button>
  </ErrorMessage>
);

const BlogList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useUser();
  const navigate = useNavigate();
  const [ref, inView] = useInView({
    threshold: 0,
  });

  const debouncedSearch = useMemo(
    () => debounce((value) => {
      setSearchTerm(value);
      setPage(1);
    }, 300),
    []
  );

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/blogs`, {
        params: { page, limit: 10, search: searchTerm, sort: sortOption },
      });
      setPosts((prevPosts) => (page === 1 ? response.data : [...prevPosts, ...response.data]));
      setHasMore(response.data.length === 10);
    } catch (err) {
      console.error('Failed to fetch blog posts:', err);
      setError('Failed to load blog posts. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [page, searchTerm, sortOption]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (inView && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [inView, hasMore]);

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const toggleSortOption = useCallback(() => {
    setSortOption((prev) => (prev === 'newest' ? 'oldest' : 'newest'));
    setPage(1);
  }, []);

  const handleCreateBlog = () => navigate('/create-blog');
  const handleEditBlog = (id) => navigate(`/edit-blog/${id}`);

  const handleDeleteBlog = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/blogs/${id}`);
        setPosts((prevPosts) => prevPosts.filter((post) => post._id !== id));
      } catch (err) {
        console.error('Failed to delete blog post:', err);
        setError('Failed to delete blog post. Please try again later.');
      }
    }
  };

  const renderPosts = () => (
    <AnimatePresence>
      {posts.map((post) => (
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
          {user && user.isBlogger && (
            <ActionButtons>
              <ActionButton onClick={() => handleEditBlog(post._id)} aria-label="Edit blog post">
                <FaEdit />
              </ActionButton>
              <ActionButton onClick={() => handleDeleteBlog(post._id)} aria-label="Delete blog post">
                <FaTrash />
              </ActionButton>
            </ActionButtons>
          )}
        </PostCard>
      ))}
    </AnimatePresence>
  );

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => setPage(1)}>
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
            onChange={handleSearchChange}
            aria-label="Search blog posts"
          />
          <SearchIcon aria-hidden="true" />
        </SearchBarContainer>
        <ControlsContainer>
          <SortButton onClick={toggleSortOption} aria-label={`Sort by ${sortOption === 'newest' ? 'oldest' : 'newest'}`}>
            {sortOption === 'newest' ? 'Newest' : 'Oldest'}
            {sortOption === 'newest' ? <FaSortAmountDown aria-hidden="true" /> : <FaSortAmountUp aria-hidden="true" />}
          </SortButton>
          {user && user.isBlogger && (
            <CreateButton onClick={handleCreateBlog}>
              <FaPlus /> Create New Blog
            </CreateButton>
          )}
        </ControlsContainer>
        {isLoading && page === 1 && <LoadingSpinner />}
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {renderPosts()}
        {isLoading && page > 1 && <LoadingSpinner />}
        <div ref={ref} />
      </BlogListContainer>
    </ErrorBoundary>
  );
};

export default BlogList;