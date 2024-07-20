import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FaCaretDown, FaBars, FaTimes } from 'react-icons/fa';
import LogoImage from '../../assets/public/logo.svg'; // Import the logo SVG

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 100px;
  background-color: white;
  color: black;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: 70px;
  border-bottom: 1px solid #e0e0e0;

  @media (max-width: 768px) {
    padding: 15px 20px;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;

  img {
    height: 40px;
    transition: transform 0.3s;

    @media (max-width: 768px) {
      height: 30px;
    }

    &:hover {
      transform: scale(1.05);
    }
  }
`;

const NavLinks = styled.nav`
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  margin-left: 30px;
  text-decoration: none;
  color: black;
  font-size: 1.1em;
  transition: color 0.3s, transform 0.3s;

  &:hover {
    color: blue;
    transform: scale(1.05);
  }

  &.active {
    font-weight: bold;
    color: blue;
  }
`;

const Separator = styled.div`
  height: 20px;
  width: 1px;
  background-color: black;
  margin: 0 20px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const GetStartedButton = styled(Link)`
  background-color: blue;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  text-decoration: none;
  margin-left: 20px;
  font-size: 1.1em;
  transition: background-color 0.3s, transform 0.3s;

  &:hover {
    background-color: darkblue;
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;

  &:hover .dropdown-content {
    display: block;
    animation: fadeIn 0.3s;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const DropdownButton = styled.button`
  margin-left: 30px;
  text-decoration: none;
  color: black;
  font-size: 1.1em;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: color 0.3s, transform 0.3s;

  &:hover {
    color: blue;
    transform: scale(1.05);
  }
`;

const DropdownContent = styled.div`
  display: none;
  position: absolute;
  background-color: white;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
  z-index: 1;
  min-width: 200px;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  overflow: hidden;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const DropdownItem = styled(Link)`
  color: black;
  padding: 12px 16px;
  font-size: 1em;
  text-decoration: none;
  display: block;
  transition: background-color 0.3s, transform 0.3s;

  &:hover {
    background-color: #f1f1f1;
    transform: translateX(10px);
  }
`;

const MobileMenuIcon = styled.div`
  display: none;
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenuOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
`;

const MobileMenu = styled.div`
  display: none;
  flex-direction: column;
  align-items: flex-start;
  background-color: white;
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  height: 100%;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 999;
  transform: ${({ $isOpen }) => ($isOpen ? 'translateX(0)' : 'translateX(-100%)')};
  transition: transform 0.3s ease-in-out;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileMenuCloseIcon = styled.div`
  align-self: flex-end;
  cursor: pointer;
`;

const MobileNavLink = styled(Link)`
  margin: 10px 0;
  text-decoration: none;
  color: black;
  font-size: 1em;
  transition: color 0.3s, transform 0.3s;

  &:hover {
    color: blue;
    transform: scale(1.05);
  }
`;

const MobileGetStartedButton = styled(Link)`
  background-color: blue;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  text-decoration: none;
  margin-top: 10px;
  transition: background-color 0.3s, transform 0.3s;

  &:hover {
    background-color: darkblue;
    transform: scale(1.05);
  }
`;

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  return (
    <HeaderContainer>
      <Logo>
        <Link to="/">
          <img src={LogoImage} alt="Propertilico Logo" />
        </Link>
      </Logo>
      <NavLinks>
        <NavLink to="/" className={location.pathname === '/' ? 'active' : ''}>Home</NavLink>
        <NavLink to="/features" className={location.pathname === '/features' ? 'active' : ''}>Features</NavLink>
        <DropdownContainer>
          <DropdownButton>
            Resources <FaCaretDown />
          </DropdownButton>
          <DropdownContent className="dropdown-content">
            <DropdownItem to="/blog">Blog</DropdownItem>
            <DropdownItem to="/faq">FAQ</DropdownItem>
            <DropdownItem to="/tos">Terms of Service</DropdownItem>
            <DropdownItem to="/privacy-policy">Privacy Policy</DropdownItem>
          </DropdownContent>
        </DropdownContainer>
        <NavLink to="/pricing" className={location.pathname === '/pricing' ? 'active' : ''}>Pricing</NavLink>
        <Separator />
        <NavLink to="/signin" className={location.pathname === '/signin' ? 'active' : ''}>Sign In</NavLink>
        <GetStartedButton to="/get-started">Get Started - Free</GetStartedButton>
      </NavLinks>
      <MobileMenuIcon onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        <FaBars />
      </MobileMenuIcon>
      {mobileMenuOpen && <MobileMenuOverlay onClick={() => setMobileMenuOpen(false)} />}
      <MobileMenu $isOpen={mobileMenuOpen} ref={menuRef}>
        <MobileMenuCloseIcon onClick={() => setMobileMenuOpen(false)}>
          <FaTimes />
        </MobileMenuCloseIcon>
        <MobileNavLink to="/" className={location.pathname === '/' ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Home</MobileNavLink>
        <MobileNavLink to="/features" className={location.pathname === '/features' ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Features</MobileNavLink>
        <MobileNavLink to="/blog" onClick={() => setMobileMenuOpen(false)}>Blog</MobileNavLink>
        <MobileNavLink to="/faq" onClick={() => setMobileMenuOpen(false)}>FAQ</MobileNavLink>
        <MobileNavLink to="/tos" onClick={() => setMobileMenuOpen(false)}>Terms of Service</MobileNavLink>
        <MobileNavLink to="/privacy-policy" onClick={() => setMobileMenuOpen(false)}>Privacy Policy</MobileNavLink>
        <MobileNavLink to="/pricing" className={location.pathname === '/pricing' ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Pricing</MobileNavLink>
        <MobileNavLink to="/signin" className={location.pathname === '/signin' ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Sign In</MobileNavLink>
        <MobileGetStartedButton to="/get-started" onClick={() => setMobileMenuOpen(false)}>Get Started - Free</MobileGetStartedButton>
      </MobileMenu>
    </HeaderContainer>
  );
}

export default Header;
