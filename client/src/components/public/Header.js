import React, { useState, useCallback, useEffect, memo, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaSignOutAlt, 
  FaHome, 
  FaInfoCircle, 
  FaDollarSign, 
  FaBlog, 
  FaQuestionCircle, 
  FaFileAlt, 
  FaShieldAlt, 
  FaChevronDown,
  FaUser,
  FaUserPlus,
  FaBuilding,
  FaDashcube
} from 'react-icons/fa';
import LogoImage from '../../assets/public/logo.svg';
import { useUser } from '../../context/UserContext';
import styles from './Header.module.css';

const NAV_ITEMS = [
  { 
    to: "/", 
    text: "Home", 
    icon: <FaHome />, 
    description: "Return to homepage"
  },
  { 
    to: "/features", 
    text: "Features", 
    icon: <FaInfoCircle />, 
    description: "Explore our platform features"
  },
  { 
    to: "/pricing", 
    text: "Pricing", 
    icon: <FaDollarSign />, 
    description: "View our pricing plans"
  },
];

const RESOURCE_ITEMS = [
  { 
    to: "/blog", 
    text: "Blog", 
    icon: <FaBlog />, 
    description: "Latest property management insights",
    badge: "New"
  },
  { 
    to: "/help-center", 
    text: "Help Center", 
    icon: <FaQuestionCircle />, 
    description: "Get support and guidance"
  },
  { 
    to: "/documentation", 
    text: "Documentation", 
    icon: <FaFileAlt />, 
    description: "Technical guides and API docs"
  },
  { 
    to: "/privacy-policy", 
    text: "Privacy Policy", 
    icon: <FaShieldAlt />, 
    description: "Our data protection commitments"
  },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);
  const [isResourcesHovered, setIsResourcesHovered] = useState(false);
  const [isMobileResourcesOpen, setIsMobileResourcesOpen] = useState(false);
  const resourcesTimeoutRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUser();
  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle click outside for desktop dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(`.${styles.dropdown}`)) {
        setExpandedItem(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  // Add this effect to handle clicks outside
useEffect(() => {
  const handleClickOutside = (event) => {
    if (!event.target.closest(`.${styles.mobileDropdown}`)) {
      setExpandedItem(null);
    }
  };

  if (expandedItem) {
    document.addEventListener('mousedown', handleClickOutside);
  }

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [expandedItem]);
  // Close mobile menu on navigation
  useEffect(() => {
    setIsOpen(false);
    setExpandedItem(null);
  }, [location.pathname]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setExpandedItem(null);
        setIsResourcesHovered(false);
      }
    };

    if (isOpen || isResourcesHovered) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isResourcesHovered]);

  // Handle resources hover
  const handleResourcesMouseEnter = useCallback(() => {
    if (resourcesTimeoutRef.current) {
      clearTimeout(resourcesTimeoutRef.current);
    }
    setIsResourcesHovered(true);
  }, []);

  const handleResourcesMouseLeave = useCallback(() => {
    resourcesTimeoutRef.current = setTimeout(() => {
      setIsResourcesHovered(false);
    }, 200);
  }, []);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (resourcesTimeoutRef.current) {
        clearTimeout(resourcesTimeoutRef.current);
      }
    };
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setIsOpen(false);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout, navigate]);

  const toggleMobileResources = useCallback((e) => {
    e.stopPropagation();
    setIsMobileResourcesOpen(prev => !prev);
  }, []);
  return (
    <>
      <header className={`${styles.header} ${isOpen ? styles.menuOpen : ''}`}>
        <div className={styles.wrapper}>
          {/* Logo */}
          <Link to="/" className={styles.logo}>
            <img src={LogoImage} alt="Propertilico" />
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.desktopNav}>
            {NAV_ITEMS.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className={`${styles.navItem} ${location.pathname === item.to ? styles.active : ''}`}
              >
                <span>{item.text}</span>
              </Link>
            ))}
            <div 
              className={styles.dropdown}
              onMouseEnter={handleResourcesMouseEnter}
              onMouseLeave={handleResourcesMouseLeave}
            >
              <button className={`${styles.navItem} ${isResourcesHovered ? styles.active : ''}`}>
                <span>Resources</span>
                <FaChevronDown className={isResourcesHovered ? styles.rotate : ''} />
              </button>
              {isResourcesHovered && (
                <div className={styles.dropdownContent}>
                  {RESOURCE_ITEMS.map(item => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={styles.dropdownItem}
                    >
                      {item.icon}
                      <div>
                        <div className={styles.dropdownItemTitle}>
                          {item.text}
                          {item.badge && <span className={styles.badge}>{item.badge}</span>}
                        </div>
                        <span className={styles.dropdownItemDesc}>{item.description}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Desktop Auth */}
          <div className={styles.desktopAuth}>
            {user ? (
              <>
                <Link to="/app/dashboard" className={styles.primaryBtn}>
                  <FaDashcube />
                  <span>Dashboard</span>
                </Link>
                <button onClick={handleLogout} className={styles.secondaryBtn}>
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/signin" className={styles.secondaryBtn}>
                  <FaUser />
                  <span>Sign In</span>
                </Link>
                <Link to="/get-started" className={styles.primaryBtn}>
                  <FaUserPlus />
                  <span>Get Started</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`${styles.menuBtn} ${isOpen ? styles.active : ''}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            <span className={styles.menuIcon}>
              <span className={styles.line} />
              <span className={styles.line} />
              <span className={styles.line} />
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${isOpen ? styles.open : ''}`}>
        <div className={styles.mobileMenuInner}>
          {/* Mobile Navigation */}
          <nav className={styles.mobileNav}>
            {NAV_ITEMS.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className={`${styles.mobileNavItem} ${location.pathname === item.to ? styles.active : ''}`}
              >
                {item.icon}
                <span>{item.text}</span>
              </Link>
            ))}

            {/* Mobile Resources Section */}
            <div className={styles.mobileDropdown}>
  <button
    className={`${styles.mobileNavItem} ${isMobileResourcesOpen ? styles.active : ''}`}
    onClick={toggleMobileResources}
    aria-expanded={isMobileResourcesOpen}
  >
    <FaBuilding />
    <span>Resources</span>
    <FaChevronDown className={`${styles.chevron} ${isMobileResourcesOpen ? styles.rotate : ''}`} />
  </button>

  {isMobileResourcesOpen && (
    <div className={styles.mobileDropdownContent}>
      {RESOURCE_ITEMS.map(item => (
        <Link
          key={item.to}
          to={item.to}
          className={styles.mobileDropdownItem}
          onClick={() => {
            setIsMobileResourcesOpen(false);
            setIsOpen(false);
          }}
        >
          {item.icon}
          <div>
            <div className={styles.mobileDropdownTitle}>
              {item.text}
              {item.badge && <span className={styles.badge}>{item.badge}</span>}
            </div>
            <span className={styles.mobileDropdownDesc}>{item.description}</span>
          </div>
        </Link>
      ))}
    </div>
  )}
</div>
          </nav>

          {/* Mobile Auth */}
          <div className={styles.mobileAuth}>
            {user ? (
              <>
                <Link 
                  to="/app/dashboard" 
                  className={styles.mobilePrimaryBtn}
                >
                  <FaDashcube />
                  <span>Dashboard</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className={styles.mobileSecondaryBtn}
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/signin" 
                  className={styles.mobileSecondaryBtn}
                >
                  <FaUser />
                  <span>Sign In</span>
                </Link>
                <Link 
                  to="/get-started" 
                  className={styles.mobilePrimaryBtn}
                >
                  <FaUserPlus />
                  <span>Get Started</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(Header);