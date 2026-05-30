import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home' },
  { to: '/submit', label: 'Submit Claim' },
  { to: '/dashboard', label: 'My Dashboard' },
  { to: '/reviewer', label: '🛡️ Reviewer' },
];

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-logo">
          <div className="navbar-logo-icon">⚡</div>
          <span className="navbar-logo-text">AIMan Knowledge Commons</span>
        </NavLink>

        <ul className="navbar-links">
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

        <NavLink to="/submit" className="btn btn-primary btn-sm navbar-cta">
          + Submit Claim
        </NavLink>
      </div>
    </nav>
  );
}
