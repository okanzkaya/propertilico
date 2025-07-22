import React, { useState, useCallback, useEffect, memo, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  FaDashcube,
  FaCrown,
} from "react-icons/fa";
import LogoImage from "../../assets/public/logo.svg";
import { useUser } from "../../context/UserContext";
import styles from "./Header.module.css";

const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Propertilico",
  url: "https://propertilico.com",
  description: "Professional property management software solution",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://propertilico.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Propertilico",
  logo: "https://propertilico.com/logo.svg",
  url: "https://propertilico.com",
};

const NAV_ITEMS = [
  {
    to: "/",
    text: "Home",
    icon: <FaHome />,
    description: "Property management solutions homepage",
  },
  {
    to: "/features",
    text: "Features",
    icon: <FaInfoCircle />,
    description: "Explore our platform features",
  },
  {
    to: "/pricing",
    text: "Pricing",
    icon: <FaDollarSign />,
    description: "View our pricing plans",
  },
];

const RESOURCE_ITEMS = [
  {
    to: "/blog",
    text: "Blog",
    icon: <FaBlog />,
    description: "Latest property management insights",
    badge: "New",
  },
  {
    to: "/help-center",
    text: "Help Center",
    icon: <FaQuestionCircle />,
    description: "Get support and guidance",
  },
  {
    to: "/documentation",
    text: "Documentation",
    icon: <FaFileAlt />,
    description: "Technical guides and API docs",
  },
  {
    to: "/privacy-policy",
    text: "Privacy Policy",
    icon: <FaShieldAlt />,
    description: "Our data protection commitments",
  },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileResourcesOpen, setIsMobileResourcesOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const headerRef = useRef(null);
  const resourcesTimeoutRef = useRef(null);
  const resourcesBtnRef = useRef(null);
  const resourcesDropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUser();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
    setIsMobileResourcesOpen(false);
    setIsResourcesOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setIsMobileResourcesOpen(false);
        setIsResourcesOpen(false);
      }
    };

    const handleClickOutside = (event) => {
      if (
        isResourcesOpen &&
        !resourcesBtnRef.current?.contains(event.target) &&
        !resourcesDropdownRef.current?.contains(event.target)
      ) {
        setIsResourcesOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isResourcesOpen]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setIsOpen(false);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [logout, navigate]);

  const handleResourcesEnter = useCallback(() => {
    if (resourcesTimeoutRef.current) {
      clearTimeout(resourcesTimeoutRef.current);
    }
    setIsResourcesOpen(true);
  }, []);

  const handleResourcesLeave = useCallback(() => {
    resourcesTimeoutRef.current = setTimeout(() => {
      setIsResourcesOpen(false);
    }, 300);
  }, []);

  return (
    <header
      ref={headerRef}
      className={`${styles.header} ${isOpen ? styles.menuOpen : ""}`}
      role="banner"
      itemScope
      itemType="https://schema.org/WPHeader"
    >
      <script type="application/ld+json">
        {JSON.stringify(WEBSITE_SCHEMA)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(ORGANIZATION_SCHEMA)}
      </script>

      <div className={styles.wrapper}>
        <Link
          to="/"
          className={styles.logo}
          aria-label="Propertilico home"
          title="Go to Propertilico homepage"
        >
          <img
            src={LogoImage}
            alt="Propertilico"
            width="200"
            height="72"
            loading="eager"
          />
        </Link>

        <nav
          className={styles.desktopNav}
          role="navigation"
          aria-label="Main navigation"
          itemScope
          itemType="https://schema.org/SiteNavigationElement"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`${styles.navItem} ${
                location.pathname === item.to ? styles.active : ""
              }`}
              aria-label={item.description}
              aria-current={location.pathname === item.to ? "page" : undefined}
              itemProp="url"
              title={item.description}
            >
              <span itemProp="name">{item.text}</span>
            </Link>
          ))}

          <div
            className={`${styles.dropdown} ${isResourcesOpen ? styles.open : ""}`}
            onMouseEnter={handleResourcesEnter}
            onMouseLeave={handleResourcesLeave}
          >
            <button
              ref={resourcesBtnRef}
              className={`${styles.navItem} ${isResourcesOpen ? styles.active : ""}`}
              aria-haspopup="true"
              aria-expanded={isResourcesOpen}
              onClick={() => setIsResourcesOpen(!isResourcesOpen)}
              title="Access resources"
            >
              <span>Resources</span>
              <FaChevronDown className={isResourcesOpen ? styles.rotate : ""} />
            </button>

            <div
              ref={resourcesDropdownRef}
              className={`${styles.dropdownContent} ${
                isResourcesOpen ? styles.show : ""
              }`}
              role="menu"
              aria-label="Resource menu items"
            >
              {RESOURCE_ITEMS.map((item, index) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={styles.dropdownItem}
                  style={{ "--item-index": index }}
                  role="menuitem"
                  onClick={() => setIsResourcesOpen(false)}
                  title={item.description}
                >
                  {item.icon}
                  <div>
                    <div className={styles.dropdownItemTitle}>
                      {item.text}
                      {item.badge && (
                        <span className={styles.badge} aria-label="New feature">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className={styles.dropdownItemDesc}>
                      {item.description}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className={styles.desktopAuth}>
          {user ? (
            <>
              <Link
                to="/my-plan"
                className={styles.secondaryBtn}
                title="View your plan"
              >
                <FaCrown aria-hidden="true" />
                <span>My Plan</span>
              </Link>
              <Link
                to="/app/dashboard"
                className={styles.primaryBtn}
                title="Access your dashboard"
              >
                <FaDashcube aria-hidden="true" />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={handleLogout}
                className={styles.secondaryBtn}
                title="Sign out of your account"
              >
                <FaSignOutAlt aria-hidden="true" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/signin"
                className={styles.secondaryBtn}
                title="Sign in to your account"
              >
                <FaUser aria-hidden="true" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/get-started"
                className={styles.primaryBtn}
                title="Create a new account"
              >
                <FaUserPlus aria-hidden="true" />
                <span>Get Started</span>
              </Link>
            </>
          )}
        </div>

        <button
          className={`${styles.menuBtn} ${isOpen ? styles.active : ""}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          <span className={styles.menuIcon} aria-hidden="true">
            <span className={styles.line} />
            <span className={styles.line} />
            <span className={styles.line} />
          </span>
        </button>
      </div>

      <div
        id="mobile-menu"
        className={`${styles.mobileMenu} ${isOpen ? styles.open : ""}`}
        aria-hidden={!isOpen}
      >
        <div className={styles.mobileMenuInner}>
          <nav className={styles.mobileNav} role="navigation" aria-label="Mobile navigation">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`${styles.mobileNavItem} ${
                  location.pathname === item.to ? styles.active : ""
                }`}
                aria-label={item.description}
                aria-current={location.pathname === item.to ? "page" : undefined}
                title={item.description}
              >
                {item.icon}
                <span>{item.text}</span>
              </Link>
            ))}

            <div className={styles.mobileDropdown}>
              <button
                className={`${styles.mobileNavItem} ${
                  isMobileResourcesOpen ? styles.active : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMobileResourcesOpen(!isMobileResourcesOpen);
                }}
                aria-expanded={isMobileResourcesOpen}
                title="Toggle resources menu"
              >
                <FaBuilding aria-hidden="true" />
                <span>Resources</span>
                <FaChevronDown
                  className={`${styles.chevron} ${
                    isMobileResourcesOpen ? styles.rotate : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {isMobileResourcesOpen && (
                <div
                  className={styles.mobileDropdownContent}
                  role="menu"
                  aria-label="Mobile resources menu items"
                >
                  {RESOURCE_ITEMS.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={styles.mobileDropdownItem}
                      role="menuitem"
                      onClick={() => {
                        setIsMobileResourcesOpen(false);
                        setIsOpen(false);
                      }}
                      title={item.description}
                    >
                      {item.icon}
                      <div>
                        <div className={styles.mobileDropdownTitle}>
                          {item.text}
                          {item.badge && (
                            <span className={styles.badge} aria-label="New feature">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <span className={styles.mobileDropdownDesc}>
                          {item.description}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className={styles.mobileAuth}>
            {user ? (
              <>
                <Link
                  to="/my-plan"
                  className={styles.mobileSecondaryBtn}
                  title="View your plan"
                >
                  <FaCrown aria-hidden="true" />
                  <span>My Plan</span>
                </Link>
                <Link
                  to="/app/dashboard"
                  className={styles.mobilePrimaryBtn}
                  title="Access your dashboard"
                >
                  <FaDashcube aria-hidden="true" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className={styles.mobileSecondaryBtn}
                  title="Sign out of your account"
                >
                  <FaSignOutAlt aria-hidden="true" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className={styles.mobileSecondaryBtn}
                  title="Sign in to your account"
                >
                  <FaUser aria-hidden="true" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/get-started"
                  className={styles.mobilePrimaryBtn}
                  title="Create a new account"
                >
                  <FaUserPlus aria-hidden="true" />
                  <span>Get Started</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default memo(Header);