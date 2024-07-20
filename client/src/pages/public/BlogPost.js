import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const PostContainer = styled.div`
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const PostTitle = styled.h1`
  font-size: 3em;
  color: #007BFF;
  margin-bottom: 20px;
`;

const PostMeta = styled.div`
  color: #666;
  font-size: 1em;
  margin-bottom: 20px;
`;

const PostContent = styled.div`
  font-size: 1.2em;
  color: #333;
  line-height: 1.6;
`;

const AuthorContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const AuthorImage = styled.img`
  border-radius: 50%;
  width: 50px;
  height: 50px;
  margin-right: 15px;
`;

const AuthorName = styled.div`
  font-size: 1em;
  color: #333;
`;

const PostTags = styled.div`
  margin: 20px 0;
  font-size: 1em;
  color: #007BFF;
`;

const Tag = styled.span`
  display: inline-block;
  background: #f1f1f1;
  padding: 5px 10px;
  margin: 0 5px 5px 0;
  border-radius: 3px;
  font-size: 0.9em;
`;

const BlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/blogs/${id}`);
        setPost(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPost();
  }, [id]);

  if (!post) return <div>Loading...</div>;

  return (
    <PostContainer>
      <PostTitle>{post.title}</PostTitle>
      <PostMeta>
        By {post.author} on {new Date(post.date).toLocaleDateString()}
      </PostMeta>
      <AuthorContainer>
        <AuthorImage src={`https://i.pravatar.cc/50?u=${post.author}`} alt={post.author} />
        <AuthorName>{post.author}</AuthorName>
      </AuthorContainer>
      <PostContent dangerouslySetInnerHTML={{ __html: post.content }} />
      <PostTags>
        Tags: {post.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
      </PostTags>
    </PostContainer>
  );
};

export default BlogPost;
