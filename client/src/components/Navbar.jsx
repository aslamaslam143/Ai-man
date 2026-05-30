import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home' },
  { to: '/submit', label: 'Submit Claim' },
  { to: '/dashboard', label: 'My Dashboard' },
  { to: '/reviewer', label: '🛡️ Reviewer' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-logo" onClick={closeMenu}>
          <div className="navbar-logo-icon">⚡</div>
          <span className="navbar-logo-text">AIMan Knowledge Commons</span>
        </NavLink>

        {/* Desktop Links */}
        <ul className="navbar-links desktop-only">
          {links.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `navbar-link${isActive ? ' active' : ''}`
                }
                end={to === '/'}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="navbar-actions desktop-only">
          <NavLink to="/submit" className="btn btn-primary btn-sm">
            + Submit Claim
          </NavLink>
        </div>

        {/* Mobile Toggle */}
        <button 
          className={`navbar-toggle mobile-only ${isOpen ? 'active' : ''}`} 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${isOpen ? 'open' : ''}`}>
        <ul className="mobile-links">
          {links.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `mobile-link${isActive ? ' active' : ''}`
                }
                onClick={closeMenu}
                end={to === '/'}
              >
                {label}
              </NavLink>
            </li>
          ))}
          <li style={{ marginTop: '1rem', padding: '0 1rem' }}>
            <NavLink to="/submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={closeMenu}>
              + Submit Claim
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
}
