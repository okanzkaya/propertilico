import React from 'react';
import styled from 'styled-components';

const StyledImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 20px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const LazyImage = ({ src, alt }) => {
  return <StyledImage src={src} alt={alt} loading="lazy" />;
};

export default LazyImage;