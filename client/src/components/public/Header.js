import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FaBars, FaTimes, FaSignOutAlt, FaHome, FaInfoCircle, FaDollarSign, FaBlog, FaQuestionCircle, FaFileAlt, FaShieldAlt, FaChevronDown } from 'react-icons/fa';
import LogoImage from '../../assets/public/logo.svg';
import { useUser } from '../../context/UserContext';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 5%;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  height: 70px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: all 0.3s ease;

  @media (max-width: 1024px) {
    padding: 0 3%;
    height: 60px;
  }
`;

const MainContent = styled.main`
  padding-top: 70px;

  @media (max-width: 1024px) {
    padding-top: 60px;
  }
`;

const Logo = styled(Link)`
  img {
    height: 40px;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05) rotate(-2deg);
    }

    @media (max-width: 1024px) {
      height: 30px;
    }
  }
`;

const NavLinks = styled.nav`
  display: flex;
  align-items: center;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  margin: 0 15px;
  color: #333;
  font-size: 1em;
  font-weight: 500;
  text-decoration: none;
  position: relative;
  transition: all 0.3s ease;

  &:after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: -5px;
    left: 0;
    background-color: #3498db;
    transition: width 0.3s ease;
  }

  &:hover, &.active, &:focus {
    color: #3498db;
    outline: none;

    &:after {
      width: 100%;
    }
  }

  &.active {
    font-weight: 700;
  }
`;

const Button = styled(Link)`
  background-color: #3498db;
  color: white;
  padding: 10px 20px;
  border-radius: 25px;
  margin-left: 15px;
  transition: all 0.3s ease;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  box-shadow: 0 4px 6px rgba(52, 152, 219, 0.2);

  &:hover, &:focus {
    background-color: #2980b9;
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(52, 152, 219, 0.3);
    outline: none;
  }
`;

const LogoutButton = styled.button`
  background-color: white;
  color: #333;
  padding: 10px 20px;
  border-radius: 25px;
  margin-left: 15px;
  border: 2px solid #333;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1em;
  font-weight: 600;

  &:hover, &:focus {
    background-color: #333;
    color: white;
    outline: none;
  }
`;

const MobileMenuIcon = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5em;
  color: #333;
  transition: color 0.3s ease;

  &:hover, &:focus {
    color: #3498db;
    outline: none;
  }

  @media (max-width: 1024px) {
    display: block;
  }
`;

const MobileMenu = styled.div`
  display: none;
  flex-direction: column;
  background-color: white;
  position: fixed;
  top: 0;
  right: 0;
  width: 280px;
  height: 100%;
  padding: 20px;
  box-shadow: -4px 0 15px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  transform: ${({ $isOpen }) => ($isOpen ? 'translateX(0)' : 'translateX(100%)')};
  transition: transform 0.3s ease-in-out;
  overflow-y: auto;

  @media (max-width: 1024px) {
    display: flex;
  }
`;

const MobileNavLink = styled(NavLink)`
  margin: 10px 0;
  font-size: 1.2em;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover, &:focus, &.active {
    background-color: #f0f0f0;
    outline: none;
  }

  & > svg {
    margin-right: 10px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5em;
  color: #333;
  cursor: pointer;
  align-self: flex-end;
  transition: color 0.3s ease;

  &:hover, &:focus {
    color: #3498db;
    outline: none;
  }
`;

const ResourcesDropdown = styled.div`
  position: relative;
  display: inline-block;
`;

const ResourcesButton = styled.button`
  background: none;
  border: none;
  font-size: 1em;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;

  &:hover, &:focus {
    color: #3498db;
    outline: none;
  }

  svg {
    margin-left: 5px;
    transition: transform 0.3s ease;
  }

  ${ResourcesDropdown}:hover & svg {
    transform: rotate(180deg);
  }
`;

const DropdownContent = styled.div`
  display: none;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
  border-radius: 8px;
  overflow: hidden;
  animation: ${fadeIn} 0.3s ease;

  ${ResourcesDropdown}:hover & {
    display: block;
  }
`;

const DropdownLink = styled(Link)`
  color: #333;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  transition: all 0.3s ease;

  &:hover, &:focus {
    background-color: #ddd;
    color: #3498db;
    outline: none;
  }
`;

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (mobileMenuOpen && !event.target.closest('.mobile-menu')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [mobileMenuOpen]);

  const navItems = [
    { to: "/", text: "Home", icon: <FaHome /> },
    { to: "/features", text: "Features", icon: <FaInfoCircle /> },
    { to: "/pricing", text: "Pricing", icon: <FaDollarSign /> },
  ];

  const resourceItems = [
    { to: "/blog", text: "Blog", icon: <FaBlog /> },
    { to: "/help-center", text: "Help Center", icon: <FaQuestionCircle /> },
    { to: "/privacy-policy", text: "Privacy Policy", icon: <FaShieldAlt /> },
    { to: "/tos", text: "Terms of Service", icon: <FaFileAlt /> },
  ];

  return (
    <>
      <HeaderContainer>
        <Logo to="/">
          <img src={LogoImage} alt="Propertilico Logo" />
        </Logo>
        <NavLinks>
          {navItems.map(({ to, text }) => (
            <NavLink key={to} to={to} className={location.pathname === to ? 'active' : ''}>
              {text}
            </NavLink>
          ))}
          <ResourcesDropdown>
            <ResourcesButton>
              Resources <FaChevronDown />
            </ResourcesButton>
            <DropdownContent>
              {resourceItems.map(({ to, text }) => (
                <DropdownLink key={to} to={to}>{text}</DropdownLink>
              ))}
            </DropdownContent>
          </ResourcesDropdown>
          {user ? (
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
        <MobileMenuIcon onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
          <FaBars />
        </MobileMenuIcon>
        <MobileMenu $isOpen={mobileMenuOpen} className="mobile-menu">
          <CloseButton onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
            <FaTimes />
          </CloseButton>
          {navItems.concat(resourceItems).map(({ to, text, icon }) => (
            <MobileNavLink key={to} to={to} onClick={() => setMobileMenuOpen(false)} className={location.pathname === to ? 'active' : ''}>
              {icon}
              {text}
            </MobileNavLink>
          ))}
          {user ? (
            <>
              <MobileNavLink to="/my-plan" onClick={() => setMobileMenuOpen(false)} className={location.pathname === '/my-plan' ? 'active' : ''}>
                <FaDollarSign /> My Plan
              </MobileNavLink>
              <Button to="/app/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <FaHome /> Dashboard
              </Button>
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
              <Button to="/get-started" onClick={() => setMobileMenuOpen(false)}>
                <FaDollarSign /> Get Started - Free
              </Button>
            </>
          )}
        </MobileMenu>
      </HeaderContainer>
      <MainContent />
    </>
  );
};

export default Header;