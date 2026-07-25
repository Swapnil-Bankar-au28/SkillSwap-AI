// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, User, MessageSquare, LayoutDashboard, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 36, height: 36,
            background: 'var(--gradient-primary)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={20} color="white" />
          </div>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.125rem' }}>
            Skill<span className="gradient-text">Swap AI</span>
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {user ? (
            <>
              <Link to="/dashboard">
                <button className="btn btn-ghost btn-sm">
                  <LayoutDashboard size={16} /> Dashboard
                </button>
              </Link>
              <Link to="/chat">
                <button className="btn btn-ghost btn-sm">
                  <MessageSquare size={16} /> AI Chat
                </button>
              </Link>
              <Link to="/profile">
                <button className="btn btn-secondary btn-sm">
                  <User size={16} /> {user.name.split(' ')[0]}
                </button>
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Logout">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="btn btn-ghost btn-sm">Sign In</button>
              </Link>
              <Link to="/register">
                <button className="btn btn-primary btn-sm">Get Started</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
