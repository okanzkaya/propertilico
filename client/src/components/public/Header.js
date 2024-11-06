import React, { useState, useCallback, useEffect, memo, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaBars, 
  FaTimes, 
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
    ariaLabel: "Go to Home page",
    description: "Return to homepage"
  },
  { 
    to: "/features", 
    text: "Features", 
    icon: <FaInfoCircle />, 
    ariaLabel: "View Features",
    description: "Explore our features"
  },
  { 
    to: "/pricing", 
    text: "Pricing", 
    icon: <FaDollarSign />, 
    ariaLabel: "View Pricing plans",
    description: "See our pricing plans"
  },
];

const RESOURCE_ITEMS = [
  { 
    to: "/blog", 
    text: "Blog", 
    icon: <FaBlog />, 
    ariaLabel: "Read our Blog",
    description: "Latest property management insights",
    badge: "New"
  },
  { 
    to: "/help-center", 
    text: "Help Center", 
    icon: <FaQuestionCircle />, 
    ariaLabel: "Visit Help Center",
    description: "Get support and guidance"
  },
  { 
    to: "/documentation", 
    text: "Documentation", 
    icon: <FaFileAlt />, 
    ariaLabel: "Read Documentation",
    description: "Technical guides and API docs"
  },
  { 
    to: "/resources", 
    text: "Resources", 
    icon: <FaBuilding />, 
    ariaLabel: "View Resources",
    description: "Property management resources"
  },
  { 
    to: "/privacy-policy", 
    text: "Privacy Policy", 
    icon: <FaShieldAlt />, 
    ariaLabel: "Read Privacy Policy",
    description: "Our data protection commitments"
  },
  { 
    to: "/terms", 
    text: "Terms of Service", 
    icon: <FaFileAlt />, 
    ariaLabel: "View Terms of Service",
    description: "Service terms and conditions"
  },
];

const MemoizedLink = memo(({ to, className, children, onClick, ariaLabel, ariaCurrent }) => (
  <Link
    to={to}
    className={className}
    onClick={onClick}
    aria-label={ariaLabel}
    aria-current={ariaCurrent}
  >
    {children}
  </Link>
));

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState('up');
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUser();
  
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const headerRef = useRef(null);
  const resourcesTimeoutRef = useRef(null);

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY.current;
        
        // Determine scroll direction and threshold
        if (currentScrollY < 100) {
          setIsHeaderVisible(true);
          setScrollDirection('up');
        } else if (Math.abs(scrollDelta) > 10) { // Threshold to prevent tiny movements
          const newDirection = scrollDelta > 0 ? 'down' : 'up';
          setScrollDirection(newDirection);
          setIsHeaderVisible(newDirection === 'up');
        }

        // Handle scroll state
        setIsScrolled(currentScrollY > 20);
        lastScrollY.current = currentScrollY;
        ticking.current = false;
      });
      
      ticking.current = true;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/', { replace: true });
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout, navigate]);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
    setIsResourcesOpen(false);
  }, []);

  const handleResourcesHover = useCallback((isHovering) => {
    if (resourcesTimeoutRef.current) {
      clearTimeout(resourcesTimeoutRef.current);
    }

    if (isHovering) {
      setIsResourcesOpen(true);
    } else {
      resourcesTimeoutRef.current = setTimeout(() => {
        setIsResourcesOpen(false);
      }, 150); // Slight delay before closing
    }
  }, []);

  useEffect(() => {
    return () => {
      if (resourcesTimeoutRef.current) {
        clearTimeout(resourcesTimeoutRef.current);
      }
    };
  }, []);

  const headerClass = `${styles.header} 
    ${isScrolled ? styles.scrolled : ''} 
    ${isHeaderVisible ? styles.visible : styles.hidden}
    ${scrollDirection === 'up' ? styles.scrollUp : styles.scrollDown}`;

  return (
    <header 
      ref={headerRef}
      className={headerClass}
      role="banner"
      aria-label="Main navigation"
    >
      <div className={styles.headerContainer}>
        <div className={styles.leftSection}>
          <MemoizedLink 
            to="/" 
            className={styles.logoLink}
            ariaLabel="Propertilico Home"
          >
            <img 
              src={LogoImage} 
              alt="Propertilico Logo" 
              className={styles.logo}
              width="180"
              height="45"
              loading="eager"
            />
          </MemoizedLink>
        </div>

        <nav className={styles.centerSection} aria-label="Main navigation">
          {NAV_ITEMS.map(({ to, text, ariaLabel }, index) => (
            <MemoizedLink
              key={to}
              to={to}
              className={`${styles.navLink} ${location.pathname === to ? styles.active : ''}`}
              ariaLabel={ariaLabel}
              ariaCurrent={location.pathname === to ? 'page' : undefined}
              style={{ '--item-index': index }}
            >
              {text}
            </MemoizedLink>
          ))}
          
          <div 
            className={styles.resourcesWrapper}
            onMouseEnter={() => handleResourcesHover(true)}
            onMouseLeave={() => handleResourcesHover(false)}
          >
            <div className={styles.resourcesButton}>
              Resources
              <FaChevronDown className={isResourcesOpen ? styles.rotate : ''} />
            </div>
            <div 
              className={`${styles.resourcesDropdown} ${isResourcesOpen ? styles.show : ''}`}
              role="menu"
              aria-label="Resources menu"
            >
              {RESOURCE_ITEMS.map(({ to, text, icon, ariaLabel, description, badge }, index) => (
                <MemoizedLink
                  key={to}
                  to={to}
                  className={styles.dropdownLink}
                  ariaLabel={ariaLabel}
                  onClick={closeMobileMenu}
                  style={{ '--item-index': index }}
                >
                  {icon}
                  <div className={styles.dropdownContent}>
                    <div className={styles.dropdownHeader}>
                      <span className={styles.dropdownTitle}>{text}</span>
                      {badge && <span className={styles.badge}>{badge}</span>}
                    </div>
                    <span className={styles.dropdownDescription}>{description}</span>
                  </div>
                </MemoizedLink>
              ))}
            </div>
          </div>
        </nav>

        <div className={styles.rightSection}>
          {user ? (
            <>
              <MemoizedLink 
                to="/my-plan" 
                className={styles.navLink}
                ariaLabel="View my plan"
              >
                <FaDashcube className={styles.buttonIcon} />
                <span>My Plan</span>
              </MemoizedLink>
              <MemoizedLink
                to={user.hasActiveSubscription ? "/app/dashboard" : "/subscription"}
                className={styles.primaryButton}
                ariaLabel={user.hasActiveSubscription ? "Go to Dashboard" : "Get Subscription"}
              >
                {user.hasActiveSubscription ? (
                  <>
                    <FaDashcube className={styles.buttonIcon} />
                    <span>Dashboard</span>
                  </>
                ) : (
                  <>
                    <FaDollarSign className={styles.buttonIcon} />
                    <span>Get Subscription</span>
                  </>
                )}
              </MemoizedLink>
              <button 
                onClick={handleLogout} 
                className={styles.logoutButton}
                aria-label="Log out"
                type="button"
              >
                <FaSignOutAlt className={styles.buttonIcon} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <MemoizedLink 
                to="/signin" 
                className={styles.loginButton}
                ariaLabel="Sign in to your account"
              >
                <FaUser className={styles.buttonIcon} />
                <span>Sign In</span>
              </MemoizedLink>
              <MemoizedLink 
                to="/get-started" 
                className={styles.primaryButton}
                ariaLabel="Create a new account"
              >
                <FaUserPlus className={styles.buttonIcon} />
                <span>Get Started</span>
              </MemoizedLink>
            </>
          )}
        </div>

        <button 
          className={styles.mobileMenuButton}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          type="button"
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Mobile Menu */}
        <div 
          className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}
          aria-hidden={!isMobileMenuOpen}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <nav className={styles.mobileNav}>
            {NAV_ITEMS.map(({ to, text, icon, ariaLabel }, index) => (
              <MemoizedLink
                key={to}
                to={to}
                className={`${styles.mobileLink} ${location.pathname === to ? styles.active : ''}`}
                onClick={closeMobileMenu}
                ariaLabel={ariaLabel}
                style={{ '--item-index': index }}
              >
                {icon}
                <span>{text}</span>
              </MemoizedLink>
            ))}
            
            <div 
              className={`${styles.mobileResourcesSection} ${isResourcesOpen ? styles.open : ''}`}
            >
              <button 
                className={styles.mobileResourcesButton}
                onClick={() => setIsResourcesOpen(!isResourcesOpen)}
                aria-expanded={isResourcesOpen}
                type="button"
              >
                Resources
                <FaChevronDown className={isResourcesOpen ? styles.rotate : ''} />
              </button>
              
              <div className={styles.mobileResourcesDropdown}>
                {RESOURCE_ITEMS.map(({ to, text, icon, ariaLabel, description, badge }, index) => (
                  <MemoizedLink
                    key={to}
                    to={to}
                    className={styles.mobileDropdownLink}
                    onClick={closeMobileMenu}
                    ariaLabel={ariaLabel}
                    style={{ '--item-index': index }}
                  >
                    {icon}
                    <div className={styles.mobileDropdownContent}>
                      <div className={styles.mobileDropdownHeader}>
                        <span>{text}</span>
                        {badge && <span className={styles.mobileBadge}>{badge}</span>}
                      </div>
                      <span className={styles.mobileDropdownDescription}>
                        {description}
                      </span>
                    </div>
                  </MemoizedLink>
                ))}
              </div>
            </div>

            {user ? (
              <>
                <MemoizedLink
                  to="/my-plan"
                  className={styles.mobileLink}
                  onClick={closeMobileMenu}
                  ariaLabel="View my plan"
                >
                  <FaDashcube />
                  <span>My Plan</span>
                </MemoizedLink>
                <MemoizedLink
                  to={user.hasActiveSubscription ? "/app/dashboard" : "/subscription"}
                  className={styles.mobilePrimaryButton}
                  onClick={closeMobileMenu}
                  ariaLabel={user.hasActiveSubscription ? "Go to Dashboard" : "Get Subscription"}
                >
                  {user.hasActiveSubscription ? (
                    <>
                      <FaDashcube />
                      <span>Dashboard</span>
                    </>
                  ) : (
                    <>
                      <FaDollarSign />
                      <span>Get Subscription</span>
                    </>
                  )}
                </MemoizedLink>
                <button 
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                  className={styles.mobileLogoutButton}
                  type="button"
                  aria-label="Log out"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <MemoizedLink
                  to="/signin"
                  className={styles.mobileLoginButton}
                  onClick={closeMobileMenu}
                  ariaLabel="Sign in to your account"
                >
                  <FaUser />
                  <span>Sign In</span>
                </MemoizedLink>
                <MemoizedLink
                  to="/get-started"
                  className={styles.mobilePrimaryButton}
                  onClick={closeMobileMenu}
                  ariaLabel="Create a new account"
                >
                  <FaUserPlus />
                  <span>Get Started</span>
                </MemoizedLink>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

// Memoize the entire component for performance
export default memo(Header);