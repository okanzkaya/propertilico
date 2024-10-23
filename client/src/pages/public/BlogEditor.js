import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { useUser } from '../../context/UserContext';

const EditorContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 200px;
  padding: 0.5rem;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  
  &:hover {
    background: #0056b3;
  }
`;

const BlogEditor = () => {
  const [blog, setBlog] = useState({ title: '', content: '', excerpt: '', tags: '' });
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser(); // Use the useUser hook to get the current user

  useEffect(() => {
    if (id) {
      const fetchBlog = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/blogs/${id}`);
          setBlog(response.data);
        } catch (error) {
          console.error('Error fetching blog:', error);
        }
      };
      fetchBlog();
    }
  }, [id]);

  const handleChange = (e) => {
    setBlog({ ...blog, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token'); // Get the token from localStorage
      if (!token) {
        throw new Error('No authentication token found');
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      let response;
      if (id) {
        response = await axios.put(`${process.env.REACT_APP_API_URL}/api/blogs/${id}`, blog, config);
      } else {
        response = await axios.post(`${process.env.REACT_APP_API_URL}/api/blogs`, blog, config);
      }
      
      console.log('Blog saved successfully:', response.data);
      navigate('/blog');
    } catch (error) {
      console.error('Error saving blog:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
    }
  };

  // Check if user is a blogger
  if (!user || !user.isBlogger) {
    return <div>You do not have permission to access this page.</div>;
  }

  return (
    <EditorContainer>
      <h2>{id ? 'Edit Blog' : 'Create New Blog'}</h2>
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          name="title"
          value={blog.title}
          onChange={handleChange}
          placeholder="Blog Title"
          required
        />
        <TextArea
          name="content"
          value={blog.content}
          onChange={handleChange}
          placeholder="Blog Content"
          required
        />
        <Input
          type="text"
          name="excerpt"
          value={blog.excerpt}
          onChange={handleChange}
          placeholder="Blog Excerpt"
          required
        />
        <Input
          type="text"
          name="tags"
          value={blog.tags}
          onChange={handleChange}
          placeholder="Tags (comma separated)"
        />
        <Button type="submit">Save Blog</Button>
      </form>
    </EditorContainer>
  );
};

export default BlogEditor;