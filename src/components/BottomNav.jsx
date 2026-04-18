import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { Sprout, ShoppingCart, Truck, User, LayoutDashboard, TrendingUp, HelpCircle, Bot } from 'lucide-react';

const FARMER_NAV = [
  { path: '/dashboard',     icon: Sprout,          labelKey: 'nav.dashboard' },
  { path: '/price-tracker', icon: TrendingUp,      labelKey: 'nav.prices'    },
  { path: '/marketplace',   icon: ShoppingCart,    labelKey: 'nav.marketplace' },
  { path: '/transport',     icon: Truck,           labelKey: 'nav.transport' },
  { path: '/profile',       icon: User,            labelKey: 'nav.profile'   },
];

const BUYER_NAV = [
  { path: '/wholesaler',  icon: LayoutDashboard, labelKey: 'nav.dashboard'   },
  { path: '/marketplace', icon: ShoppingCart,    labelKey: 'nav.marketplace' },
  { path: '/transport',   icon: Truck,           labelKey: 'nav.transport'   },
  { path: '/ai-insights', icon: Bot,             labelKey: 'nav.aiInsights'  },
  { path: '/profile',     icon: User,            labelKey: 'nav.profile'     },
];

const MIDDLEMAN_NAV = [
  { path: '/ai-insights', icon: Bot,             labelKey: 'nav.aiInsights'  },
  { path: '/marketplace', icon: ShoppingCart,    labelKey: 'nav.marketplace' },
  { path: '/wholesaler',  icon: LayoutDashboard, labelKey: 'roles.wholesaler'},
  { path: '/help',        icon: HelpCircle,      labelKey: 'nav.help'        },
  { path: '/profile',     icon: User,            labelKey: 'nav.profile'     },
];

export default function BottomNav() {
  const { user } = useApp();
  const { t } = useTranslation();
  const location = useLocation();
  const role = user?.role || 'farmer';

  const items =
    (role === 'wholesaler' || role === 'retailer' || role === 'cold' || role === 'transport' || role === 'export')
      ? BUYER_NAV
      : role === 'middleman'
        ? MIDDLEMAN_NAV
        : FARMER_NAV;

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 900,
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      height: 60,
    }} className="show-mobile">
      {items.map(({ path, icon: Icon, labelKey }) => {
        const active = location.pathname === path;
        return (
          <Link key={path} to={path} style={{
            flex: 1,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '6px 4px', textDecoration: 'none',
            color: active ? 'var(--brand-700)' : 'var(--text-muted)',
            transition: 'color 0.15s',
            gap: 3,
          }}>
            <div style={{
              width: 36, height: 26, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: active ? '#dcfce7' : 'transparent',
              transition: 'all 0.15s',
            }}>
              <Icon size={active ? 19 : 17} strokeWidth={active ? 2.5 : 1.8} />
            </div>
            <span style={{
              fontSize: '0.5625rem', fontWeight: active ? 700 : 500,
              lineHeight: 1, letterSpacing: '0.01em',
            }}>
              {t(labelKey)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
