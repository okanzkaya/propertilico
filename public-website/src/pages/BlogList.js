// src/pages/BlogList.js
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const BlogContainer = styled.div`
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
`;

const BlogTitle = styled.h1`
  text-align: center;
  margin-bottom: 20px;
  color: #007BFF;
`;

const BlogPost = styled.div`
  border-bottom: 1px solid #e0e0e0;
  padding: 20px 0;
  margin-bottom: 20px;
`;

const PostTitle = styled.h2`
  color: #007BFF;
  margin-bottom: 10px;
`;

const PostLink = styled(Link)`
  text-decoration: none;
  color: #007BFF;
  transition: color 0.3s;

  &:hover {
    color: #0056b3;
  }
`;

const BlogList = () => {
  const posts = [
    {
      id: 1,
      title: "First Blog Post",
      summary: "This is the summary of the first blog post.",
    },
    {
      id: 2,
      title: "Second Blog Post",
      summary: "This is the summary of the second blog post.",
    },
    // Add more posts as needed
  ];

  return (
    <BlogContainer>
      <BlogTitle>Blog</BlogTitle>
      {posts.map((post) => (
        <BlogPost key={post.id}>
          <PostTitle>{post.title}</PostTitle>
          <p>{post.summary}</p>
          <PostLink to={`/blog/${post.id}`}>Read more</PostLink>
        </BlogPost>
      ))}
    </BlogContainer>
  );
};

export default BlogList;
