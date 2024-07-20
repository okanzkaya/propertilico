import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaSearch, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import axios from 'axios';

const BlogListContainer = styled.div`
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
  background: #f4f4f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Header = styled.h1`
  font-size: 3em;
  color: #333;
  text-align: center;
  margin-bottom: 40px;
`;

const SearchBarContainer = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 20px;
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 12px 40px 12px 20px;
  font-size: 1.2em;
  border: 1px solid #ccc;
  border-radius: 25px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #aaa;
  font-size: 1.2em;
`;

const SortingOptions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
`;

const SortButton = styled.button`
  background: #fff;
  border: 1px solid #ccc;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1em;
  margin-left: 10px;
  display: flex;
  align-items: center;
  transition: background 0.3s;

  &:hover {
    background: #f1f1f1;
  }

  svg {
    margin-left: 10px;
  }
`;

const PostCard = styled.div`
  background: #fff;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const PostTitle = styled(Link)`
  font-size: 1.8em;
  font-weight: bold;
  color: #007BFF;
  text-decoration: none;
  transition: color 0.3s;

  &:hover {
    color: #0056b3;
  }
`;

const PostMeta = styled.div`
  color: #666;
  font-size: 0.9em;
  margin-bottom: 10px;
`;

const PostExcerpt = styled.p`
  font-size: 1.1em;
  color: #333;
`;

const BlogList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/blogs');
        setPosts(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedPosts = filteredPosts.sort((a, b) => {
    if (sortOption === 'newest') {
      return new Date(b.date) - new Date(a.date);
    } else {
      return new Date(a.date) - new Date(b.date);
    }
  });

  return (
    <BlogListContainer>
      <Header>Blog</Header>
      <SearchBarContainer>
        <SearchBar
          type="text"
          placeholder="Search blog posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SearchIcon />
      </SearchBarContainer>
      <SortingOptions>
        <SortButton onClick={() => setSortOption('newest')}>
          Newest
          <FaSortAmountDown />
        </SortButton>
        <SortButton onClick={() => setSortOption('oldest')}>
          Oldest
          <FaSortAmountUp />
        </SortButton>
      </SortingOptions>
      {sortedPosts.map((post) => (
        <PostCard key={post._id}>
          <PostTitle to={`/blog/${post._id}`}>{post.title}</PostTitle>
          <PostMeta>
            By {post.author} on {new Date(post.date).toLocaleDateString()}
          </PostMeta>
          <PostExcerpt>{post.excerpt}</PostExcerpt>
          <PostMeta>
            Tags: {post.tags.join(', ')}
          </PostMeta>
        </PostCard>
      ))}
    </BlogListContainer>
  );
};

export default BlogList;
