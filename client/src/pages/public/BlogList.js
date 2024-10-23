import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaSearch, FaSortAmountDown, FaSortAmountUp, FaPlus, FaEdit, FaTrash, FaClock, FaUser } from 'react-icons/fa';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import { ErrorBoundary } from 'react-error-boundary';
import { debounce } from 'lodash';
import { Helmet } from 'react-helmet';

const BlogListContainer = styled(motion.main)`
  max-width: 1400px;
  margin: 0 auto;
  padding: 4rem 2rem;
  background: #fff;
  color: #333;
  font-family: 'Playfair Display', serif;

  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 4rem;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 1rem;
  letter-spacing: -1px;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
`;

const SearchBarContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 0.8rem 2.5rem 0.8rem 1rem;
  font-size: 1rem;
  border: none;
  border-bottom: 2px solid #ddd;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #1a1a1a;
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
`;

const Button = styled.button`
  background: ${props => props.primary ? '#1a1a1a' : 'transparent'};
  color: ${props => props.primary ? '#fff' : '#1a1a1a'};
  border: 2px solid #1a1a1a;
  padding: 0.8rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.primary ? '#333' : '#f0f0f0'};
  }

  svg {
    margin-right: 0.5rem;
  }
`;

const PostsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 2rem;
`;

const FeaturedPost = styled(motion.article)`
  grid-column: span 8;
  display: flex;
  background: #f9f9f9;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

  @media (max-width: 1024px) {
    grid-column: span 12;
  }
`;

const FeaturedImage = styled.div`
  flex: 1;
  background-image: url(${props => props.src || 'https://via.placeholder.com/600x400'});
  background-size: cover;
  background-position: center;
`;

const FeaturedContent = styled.div`
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const RegularPost = styled(motion.article)`
  grid-column: span 4;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  @media (max-width: 1024px) {
    grid-column: span 6;
  }

  @media (max-width: 768px) {
    grid-column: span 12;
  }
`;

const PostImage = styled.div`
  height: 200px;
  background-image: url(${props => props.src || 'https://via.placeholder.com/400x200'});
  background-size: cover;
  background-position: center;
`;

const PostContent = styled.div`
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const PostTitle = styled(Link)`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  text-decoration: none;
  margin-bottom: 0.5rem;
  transition: color 0.3s;

  &:hover {
    color: #666;
  }
`;

const PostMeta = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  margin-right: 1rem;

  svg {
    margin-right: 0.3rem;
  }
`;

const PostExcerpt = styled.p`
  font-size: 1rem;
  color: #333;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const TagList = styled.ul`
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
`;

const Tag = styled.li`
  background: #f0f0f0;
  color: #666;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  transition: all 0.3s ease;

  &:hover {
    background: #1a1a1a;
    color: #fff;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 1rem;
  transition: color 0.3s;

  &:hover {
    color: #1a1a1a;
  }
`;

const ErrorMessage = styled.div`
  background: #fff0f0;
  color: #d63031;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin: 2rem 0;
  font-size: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const LoadingSpinner = styled.div`
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1a1a1a;
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

const PullQuote = styled.blockquote`
  font-size: 1.5rem;
  font-style: italic;
  color: #1a1a1a;
  border-left: 4px solid #1a1a1a;
  padding-left: 1rem;
  margin: 2rem 0;
`;

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <ErrorMessage>
    <h2>Oops! Something went wrong</h2>
    <p>{error.message}</p>
    <Button onClick={resetErrorBoundary}>Try again</Button>
  </ErrorMessage>
);

const BlogList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const navigate = useNavigate();

  const debouncedSearch = useMemo(() => debounce(setSearchTerm, 300), []);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/blogs`, {
        params: { page: 1, limit: 10, search: searchTerm, sort: sortOption },
      });
      setPosts(Array.isArray(data.blogs) ? data.blogs : []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch blog posts:', err);
      setError(err.response?.data?.message || 'Failed to load blog posts. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, sortOption]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearchChange = (e) => debouncedSearch(e.target.value);

  const toggleSortOption = () => {
    setSortOption(prev => prev === 'newest' ? 'oldest' : 'newest');
  };

  const handleCreateBlog = () => navigate('/create-blog');

  const handleEditBlog = (id) => navigate(`/edit-blog/${id}`);

  const handleDeleteBlog = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/blogs/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPosts(prevPosts => prevPosts.filter(post => post.id !== id));
      } catch (err) {
        console.error('Failed to delete blog post:', err);
        setError('Failed to delete blog post. Please try again later.');
      }
    }
  };

  const renderPosts = () => {
    if (posts.length === 0 && !isLoading) {
      return <ErrorMessage>No blog posts found.</ErrorMessage>;
    }

    return (
      <PostsGrid>
        <AnimatePresence>
          {posts.map((post, index) => (
            index === 0 ? (
              <FeaturedPost
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <FeaturedImage src={post.imageUrl} />
                <FeaturedContent>
                  <PostTitle to={`/blog/${post.id}`}>{post.title}</PostTitle>
                  <PostMeta>
                    <MetaItem><FaUser /> {post.author?.name || 'Unknown'}</MetaItem>
                    <MetaItem><FaClock /> {new Date(post.createdAt).toLocaleDateString()}</MetaItem>
                  </PostMeta>
                  <PostExcerpt>{post.excerpt}</PostExcerpt>
                  <TagList>
                    {post.tags?.map((tag, index) => (
                      <Tag key={index}>{tag}</Tag>
                    ))}
                  </TagList>
                  {user?.isBlogger && (
                    <ActionButtons>
                      <ActionButton onClick={() => handleEditBlog(post.id)} aria-label="Edit blog post">
                        <FaEdit />
                      </ActionButton>
                      <ActionButton onClick={() => handleDeleteBlog(post.id)} aria-label="Delete blog post">
                        <FaTrash />
                      </ActionButton>
                    </ActionButtons>
                  )}
                </FeaturedContent>
              </FeaturedPost>
            ) : (
              <RegularPost
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <PostImage src={post.imageUrl} />
                <PostContent>
                  <PostTitle to={`/blog/${post.id}`}>{post.title}</PostTitle>
                  <PostMeta>
                    <MetaItem><FaUser /> {post.author?.name || 'Unknown'}</MetaItem>
                    <MetaItem><FaClock /> {new Date(post.createdAt).toLocaleDateString()}</MetaItem>
                  </PostMeta>
                  <PostExcerpt>{post.excerpt}</PostExcerpt>
                  <TagList>
                    {post.tags?.map((tag, index) => (
                      <Tag key={index}>{tag}</Tag>
                    ))}
                  </TagList>
                  {user?.isBlogger && (
                    <ActionButtons>
                      <ActionButton onClick={() => handleEditBlog(post.id)} aria-label="Edit blog post">
                        <FaEdit />
                      </ActionButton>
                      <ActionButton onClick={() => handleDeleteBlog(post.id)} aria-label="Delete blog post">
                        <FaTrash />
                      </ActionButton>
                    </ActionButtons>
                  )}
                </PostContent>
              </RegularPost>
            )
          ))}
        </AnimatePresence>
      </PostsGrid>
    );
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={fetchPosts}>
      <Helmet>
        <title>Property Management Insights - Latest Blog Posts</title>
        <meta name="description" content="Explore the latest insights and trends in property management. Our expert bloggers share valuable tips and strategies to help you succeed in real estate." />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "http://schema.org",
            "@type": "Blog",
            "name": "Property Management Insights",
            "description": "Expert insights and trends in property management",
            "url": window.location.href,
            "blogPost": posts.map(post => ({
              "@type": "BlogPosting",
              "headline": post.title,
              "datePublished": post.createdAt,
              "author": {
                "@type": "Person",
                "name": post.author?.name || "Unknown"
              },
              "url": `${window.location.origin}/blog/${post.id}`
            }))
          })}
        </script>
      </Helmet>
      <BlogListContainer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Header>
          <Title>Property Management Insights</Title>
          <Subtitle>Discover expert tips, trends, and strategies to excel in property management</Subtitle>
        </Header>
        <ControlsContainer>
          <SearchBarContainer>
            <SearchBar
              type="text"
              placeholder="Search blog posts..."
              onChange={handleSearchChange}
              aria-label="Search blog posts"
            />
            <SearchIcon aria-hidden="true" />
          </SearchBarContainer>
          <div>
            <Button onClick={toggleSortOption} aria-label={`Sort by ${sortOption === 'newest' ? 'oldest' : 'newest'}`}>
              {sortOption === 'newest' ? <FaSortAmountDown /> : <FaSortAmountUp />}
              {sortOption === 'newest' ? 'Newest' : 'Oldest'}
            </Button>
            {user?.isBlogger && (
              <Button primary onClick={handleCreateBlog}>
                <FaPlus /> Create New Blog
              </Button>
            )}
          </div>
        </ControlsContainer>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {isLoading ? <LoadingSpinner /> : renderPosts()}
        <PullQuote>
          "Effective property management is the cornerstone of successful real estate investment. Stay informed, stay ahead."
        </PullQuote>
      </BlogListContainer>
    </ErrorBoundary>
  );
};

export default BlogList;