import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { LANGUAGES } from '../i18n';
import {
  Bell, ChevronDown, Globe, LogOut, Menu, X,
  Sprout, TrendingUp, Snowflake, Truck, Star, LifeBuoy, FlaskConical, Users, BarChart2,
} from 'lucide-react';

const ROLE_NAV = {
  farmer: [
    { path: '/dashboard',     labelKey: 'nav.dashboard',   icon: Sprout    },
    { path: '/price-tracker', labelKey: 'nav.prices',       icon: BarChart2 },
    { path: '/marketplace',   labelKey: 'nav.marketplace', icon: TrendingUp},
    { path: '/cold-storage',  labelKey: 'nav.coldStorage', icon: Snowflake },
    { path: '/transport',     labelKey: 'nav.transport',   icon: Truck     },
    { path: '/ai-insights',   labelKey: 'nav.aiInsights',  icon: Star      },
    { path: '/help',          labelKey: 'nav.help',        icon: LifeBuoy  },
  ],
  wholesaler: [
    { path: '/wholesaler',  labelKey: 'nav.dashboard',  icon: TrendingUp },
    { path: '/marketplace', labelKey: 'nav.marketplace',icon: Sprout     },
    { path: '/transport',   labelKey: 'nav.transport',   icon: Truck      },
    { path: '/ai-insights', labelKey: 'nav.aiInsights', icon: Star       },
    { path: '/help',        labelKey: 'nav.help',        icon: LifeBuoy   },
  ],
  retailer: [
    { path: '/wholesaler',  labelKey: 'nav.dashboard',   icon: TrendingUp },
    { path: '/marketplace', labelKey: 'nav.marketplace',     icon: Sprout    },
    { path: '/help',        labelKey: 'nav.help',         icon: LifeBuoy   },
  ],
  middleman: [
    { path: '/ai-insights', labelKey: 'nav.aiInsights',  icon: Star       },
    { path: '/marketplace', labelKey: 'nav.marketplace', icon: TrendingUp },
    { path: '/wholesaler',  labelKey: 'roles.wholesaler',icon: Users      },
    { path: '/help',        labelKey: 'nav.help',        icon: LifeBuoy   },
  ],
};

const ROLE_META = {
  farmer:     { label: 'Farmer',     color: '#15803d' },
  wholesaler: { label: 'Wholesaler', color: '#1d4ed8' },
  retailer:   { label: 'Retailer',   color: '#7c3aed' },
  middleman:  { label: 'Agent',      color: '#92400e' },
};

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout, unreadCount, notifications, showNotifications, setShowNotifications, markAllRead, darkMode, toggleDarkMode } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[1];
  const role = user?.role || 'farmer';
  const navLinks = ROLE_NAV[role] || ROLE_NAV.farmer;
  const roleMeta = ROLE_META[role] || ROLE_META.farmer;

  const handleLang = (code) => { i18n.changeLanguage(code); localStorage.setItem('preferred-language', code); setLangOpen(false); };
  const handleLogout = () => { logout(); };

  const isActive = (path) => location.pathname === path;

  const dropdownStyle = {
    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
    background: 'var(--bg-card)',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid var(--border)',
    zIndex: 2000,
    overflow: 'hidden',
    animation: 'slideUp 0.15s ease',
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderBottom: '1px solid var(--border)',
      boxShadow: '0 1px 0 var(--border)',
      transition: 'background 0.3s ease',
      height: 64,
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: '100%', gap: 8 }}>

        {/* Logo */}
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #15803d, #16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, boxShadow: '0 2px 8px rgba(21,128,61,0.35)',
            flexShrink: 0,
          }}>🌾</div>
          <div>
            <div style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.2, letterSpacing: '-0.03em' }}>
              Aarohan Agri
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              AgriPlatform
            </div>
          </div>
        </Link>

        {/* Nav Divider */}
        <div className="hide-mobile" style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 4px' }} />

        {/* Desktop Nav Links */}
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, overflow: 'hidden' }}>
          {navLinks.map(({ path, labelKey, label, icon: Icon }) => (
            <Link key={path} to={path} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 11px', borderRadius: 7, fontSize: '0.8375rem',
              fontWeight: isActive(path) ? 600 : 400,
              color: isActive(path) ? 'var(--brand-700)' : 'var(--text-secondary)',
              background: isActive(path) ? 'var(--brand-50)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              letterSpacing: '-0.01em',
            }}
            onMouseEnter={e => { if (!isActive(path)) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}}
            onMouseLeave={e => { if (!isActive(path)) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}}
            >
              <Icon size={14} />
              {label || t(labelKey)}
            </Link>
          ))}
        </div>

        {/* Right section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>

          {/* Language Selector */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => { setLangOpen(!langOpen); setShowNotifications(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'transparent', border: '1px solid var(--border)',
                borderRadius: 7, padding: '5px 10px', color: 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500,
                transition: 'all 0.15s', minHeight: 32,
              }}>
              <Globe size={13} />
              <span className="hide-mobile">{currentLang.flag} {currentLang.native}</span>
              <span className="show-mobile">{currentLang.flag}</span>
              <ChevronDown size={12} />
            </button>
            {langOpen && (
              <div style={{ ...dropdownStyle, minWidth: 200, maxHeight: 360, overflowY: 'auto' }}>
                <div style={{ padding: '8px 14px 6px', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)' }}>
                  Language
                </div>
                {LANGUAGES.map(lang => (
                  <button key={lang.code} onClick={() => handleLang(lang.code)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 14px',
                    border: 'none', background: lang.code === i18n.language ? 'var(--brand-50)' : 'transparent',
                    cursor: 'pointer', fontSize: '0.875rem', textAlign: 'left',
                    color: lang.code === i18n.language ? 'var(--brand-700)' : 'var(--text-primary)',
                    fontWeight: lang.code === i18n.language ? 600 : 400,
                    transition: 'background 0.1s',
                    minHeight: 38,
                  }}>
                    <span style={{ fontSize: '1.1rem' }}>{lang.flag}</span>
                    <span>{lang.native}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{lang.name}</span>
                    {lang.code === i18n.language && <span style={{ color: 'var(--brand-600)', fontWeight: 800 }}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => { setShowNotifications(!showNotifications); setLangOpen(false); markAllRead(); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'transparent', border: '1px solid var(--border)',
                borderRadius: 7, width: 34, height: 34, position: 'relative',
                cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.15s',
              }}>
              <Bell size={15} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: -3, right: -3,
                  background: '#ef4444', color: 'white', fontSize: '0.6rem',
                  fontWeight: 700, borderRadius: '9999px',
                  width: 16, height: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--bg-card)',
                }}>{unreadCount}</span>
              )}
            </button>
            {showNotifications && (
              <div style={{ ...dropdownStyle, width: 300 }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Notifications</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>Mark all read</span>
                </div>
                {notifications.map(n => (
                  <div key={n.id} style={{
                    padding: '11px 16px', borderBottom: '1px solid var(--border)',
                    background: n.read ? 'transparent' : 'var(--brand-50)', cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}>
                    <div style={{ fontSize: '0.8375rem', fontWeight: n.read ? 400 : 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>{n.text}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 3 }}>{n.time}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile */}
          <Link to="/profile" style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '5px 10px 5px 5px',
            borderRadius: 8, textDecoration: 'none',
            background: 'var(--bg-sunken)',
            border: '1px solid var(--border)',
            cursor: 'pointer', transition: 'all 0.15s',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'linear-gradient(135deg, #15803d, #22c55e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.7rem', fontWeight: 700, color: 'white', flexShrink: 0,
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hide-mobile">
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                {user?.name?.split(' ')[0] || 'User'}
              </div>
              <div style={{ fontSize: '0.625rem', color: roleMeta.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {roleMeta.label}
              </div>
            </div>
          </Link>

          {/* Logout */}
          <button onClick={handleLogout} title="Sign out"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', border: '1px solid var(--border)',
              borderRadius: 7, width: 34, height: 34, cursor: 'pointer',
              color: 'var(--text-muted)', transition: 'all 0.15s',
            }}
            className="hide-mobile"
            onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.borderColor = '#fecaca'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <LogOut size={14} />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            title={darkMode ? 'Light mode' : 'Dark mode'}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: darkMode ? '#1c2128' : 'var(--bg-sunken)',
              border: `1px solid ${darkMode ? '#30363d' : 'var(--border)'}`,
              borderRadius: 7, padding: '5px 9px', cursor: 'pointer',
              color: 'var(--text-secondary)', fontSize: '0.8rem',
              transition: 'all 0.2s ease', minHeight: 34, fontWeight: 500,
            }}
          >
            <span style={{ fontSize: 13 }}>{darkMode ? '🌙' : '☀️'}</span>
          </button>

          {/* Mobile Hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', border: '1px solid var(--border)',
              borderRadius: 7, width: 34, height: 34, cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
            className="show-mobile">
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>

        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          background: 'var(--bg-card)', borderTop: '1px solid var(--border)',
          padding: '8px 16px 16px',
          display: 'flex', flexDirection: 'column', gap: 2,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        }}>
          {navLinks.map(({ path, labelKey, label, icon: Icon }) => (
            <Link key={path} to={path} onClick={() => setMenuOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8,
              fontSize: '0.9rem', fontWeight: 500,
              color: isActive(path) ? 'var(--brand-700)' : 'var(--text-secondary)',
              background: isActive(path) ? 'var(--brand-50)' : 'transparent',
              textDecoration: 'none', letterSpacing: '-0.01em',
            }}>
              <Icon size={16} /> {label || t(labelKey)}
            </Link>
          ))}
          <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8,
            fontSize: '0.9rem', fontWeight: 500, color: '#dc2626',
            background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
          }}>
            <LogOut size={16} /> {t('nav.signOut')}
          </button>
        </div>
      )}
    </nav>
  );
}
