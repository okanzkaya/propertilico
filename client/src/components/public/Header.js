import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaBars, FaTimes, FaSignOutAlt, FaHome, FaInfoCircle, FaDollarSign, FaBlog, FaQuestionCircle, FaFileAlt, FaShieldAlt } from 'react-icons/fa';
import LogoImage from '../../assets/public/logo.svg';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 50px;
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: 60px;
  border-bottom: 1px solid #e0e0e0;

  @media (max-width: 768px) {
    padding: 10px 20px;
  }
`;

const Logo = styled(Link)`
  img {
    height: 35px;
    transition: transform 0.3s;

    &:hover {
      transform: scale(1.05);
    }

    @media (max-width: 768px) {
      height: 25px;
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
  margin-left: 15px;
  color: black;
  font-size: 1em;
  transition: color 0.3s, transform 0.3s;
  text-decoration: none;

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
  margin: 0 10px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Button = styled(Link)`
  background-color: blue;
  color: white;
  padding: 6px 12px;
  border-radius: 5px;
  margin-left: 7.5px;
  transition: background-color 0.3s, transform 0.3s;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;  /* Changed width to min-width */
  height: 30px;

  &:hover {
    background-color: darkblue;
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 1em;
    width: 100%;
  }
`;

const LogoutButton = styled.button`
  background-color: white;
  color: black;
  padding: 6px 12px;
  border-radius: 5px;
  margin-left: 7.5px;
  border: 2px solid black;
  transition: background-color 0.3s, transform 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 97.5px;
  height: 30px;
  cursor: pointer;
  font-size: 1em;

  &:hover {
    background-color: #f1f1f1;
    color: black;
  }

  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 1em;
    width: 100%;
    justify-content: center;
    margin: 5px 0;
  }
`;

const MobileMenuIcon = styled.div`
  display: none;
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
    font-size: 1.5em;
    margin-left: 15px;
  }
`;

const MobileMenu = styled.div`
  display: none;
  flex-direction: column;
  background-color: white;
  position: fixed;
  top: 0;
  right: 0;
  width: 250px;
  height: 100%;
  padding: 10px;
  box-shadow: -4px 0 6px rgba(0, 0, 0, 0.1);
  z-index: 999;
  transform: ${({ $isOpen }) => ($isOpen ? 'translateX(0)' : 'translateX(100%)')};
  transition: transform 0.3s ease-in-out;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const MobileNavLink = styled(Link)`
  margin: 5px 0;
  color: black;
  font-size: 1.2em;
  transition: color 0.3s, transform 0.3s;
  text-decoration: none;
  padding: 8px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: blue;
    transform: scale(1.05);
  }

  & > svg {
    margin-right: 8px;
  }

  @media (min-width: 769px) {
    display: none;
  }
`;

const MobileButton = styled(Button)`
  margin: 5px 0;
  width: 100%;
  justify-content: center;
`;

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const isLoggedIn = !!localStorage.getItem('token') || !!sessionStorage.getItem('token');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMobileMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    navigate('/');
  };

  return (
    <HeaderContainer>
      <Logo to="/">
        <img src={LogoImage} alt="Propertilico Logo" />
      </Logo>
      <NavLinks>
        {[
          { to: "/", text: "Home" },
          { to: "/features", text: "Features" },
          { to: "/pricing", text: "Pricing" }
        ].map(({ to, text }, idx) => (
          <NavLink key={idx} to={to} className={location.pathname === to ? 'active' : ''}>
            {text}
          </NavLink>
        ))}
        <Separator />
        {isLoggedIn ? (
          <>
            <NavLink to="/my-plan" className={location.pathname === '/my-plan' ? 'active' : ''}>My Plan</NavLink>
            <Button to="/app/dashboard">Dashboard</Button>
            <LogoutButton onClick={handleLogout}>
              <FaSignOutAlt style={{ marginRight: '5px' }} />
              Logout
            </LogoutButton>
          </>
        ) : (
          <>
            <NavLink to="/signin" className={location.pathname === '/signin' ? 'active' : ''}>Sign In</NavLink>
            <Button to="/get-started">Get Started - Free</Button>
          </>
        )}
      </NavLinks>
      <MobileMenuIcon onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        {mobileMenuOpen ? <FaTimes /> : <FaBars />}
      </MobileMenuIcon>
      <MobileMenu ref={menuRef} $isOpen={mobileMenuOpen}>
        {[
          { to: "/", text: "Home", icon: <FaHome /> },
          { to: "/features", text: "Features", icon: <FaInfoCircle /> },
          { to: "/pricing", text: "Pricing", icon: <FaDollarSign /> },
          { to: "/blog", text: "Blog", icon: <FaBlog /> },
          { to: "/faq", text: "FAQ", icon: <FaQuestionCircle /> },
          { to: "/tos", text: "Terms of Service", icon: <FaFileAlt /> },
          { to: "/privacy-policy", text: "Privacy Policy", icon: <FaShieldAlt /> }
        ].map(({ to, text, icon }, idx) => (
          <MobileNavLink key={idx} to={to} onClick={() => setMobileMenuOpen(false)} className={location.pathname === to ? 'active' : ''}>
            {icon}
            {text}
          </MobileNavLink>
        ))}
        {isLoggedIn ? (
          <>
            <MobileNavLink to="/my-plan" onClick={() => setMobileMenuOpen(false)} className={location.pathname === '/my-plan' ? 'active' : ''}>
              <FaDollarSign /> My Plan
            </MobileNavLink>
            <MobileButton to="/app/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <FaHome /> Dashboard
            </MobileButton>
            <LogoutButton onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
              <FaSignOutAlt style={{ marginRight: '5px' }} />
              Logout
            </LogoutButton>
          </>
        ) : (
          <>
            <MobileNavLink to="/signin" onClick={() => setMobileMenuOpen(false)} className={location.pathname === '/signin' ? 'active' : ''}>
              <FaSignOutAlt /> Sign In
            </MobileNavLink>
            <MobileButton to="/get-started" style={{ width: '100%', marginTop: '10px' }}>
              <FaDollarSign /> Get Started - Free
            </MobileButton>
          </>
        )}
      </MobileMenu>
    </HeaderContainer>
  );
};

export default Header;
