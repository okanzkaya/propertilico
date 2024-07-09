// src/pages/BlogPost.js
import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

const PostContainer = styled.div`
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
`;

const PostTitle = styled.h1`
  text-align: center;
  margin-bottom: 20px;
  color: #007BFF;
`;

const PostContent = styled.div`
  line-height: 1.6;
  color: #333;
`;

const BlogPost = () => {
  const { id } = useParams();

  // Mock data for now, replace with API call in the future
  const posts = [
    {
      id: 1,
      title: "First Blog Post",
      content: "<p>This is the content of the first blog post.</p>",
    },
    {
      id: 2,
      title: "Second Blog Post",
      content: "<p>This is the content of the second blog post.</p>",
    },
    // Add more posts as needed
  ];

  const post = posts.find((post) => post.id === parseInt(id));

  return (
    <PostContainer>
      {post ? (
        <>
          <PostTitle>{post.title}</PostTitle>
          <PostContent dangerouslySetInnerHTML={{ __html: post.content }} />
        </>
      ) : (
        <p>Post not found</p>
      )}
    </PostContainer>
  );
};

export default BlogPost;
