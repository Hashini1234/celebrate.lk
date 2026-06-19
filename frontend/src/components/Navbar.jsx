import React from 'react';
import { CalendarDays, LayoutDashboard, LogIn, LogOut, Sparkles } from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isPortal = location.pathname === '/customer' || location.pathname === '/admin' || location.pathname === '/vendor';

  if (location.pathname === '/admin') return null;

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className={`site-header ${isPortal ? 'portal-header' : ''}`}>
      <Link className="brand" to="/">
        <span>Celebrate.lk</span>
        <small>Plan. Celebrate. Cherish.</small>
      </Link>
      <nav className="nav-links">
        <NavLink to="/">Home</NavLink>
        {isPortal && user?.role === 'customer' ? (
          <>
            <a href="/customer#packages">Packages</a>
            <a href="/customer#bookings">My Bookings</a>
            <a href="/customer#bookings">Notifications</a>
          </>
        ) : (
          <>
            <a href="/#services">Services</a>
            <a href="/#feedback">Feedback</a>
            <NavLink to="/partner">Become a Partner</NavLink>
          </>
        )}
        {user && (
          <NavLink to={user.role === 'admin' ? '/admin' : '/customer'}>
            <LayoutDashboard size={17} /> Dashboard
          </NavLink>
        )}
      </nav>
      <div className="nav-actions">
        {user ? (
          <button className="icon-button" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
            Logout
          </button>
        ) : (
          <Link className="primary-button small" to="/login">
            <LogIn size={18} />
            Login
          </Link>
        )}
      </div>
      <div className="mobile-mark">
        <Sparkles size={22} />
        <CalendarDays size={22} />
      </div>
    </header>
  );
}
