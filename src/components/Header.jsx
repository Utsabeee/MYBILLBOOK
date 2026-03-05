// =====================================================
// Header.jsx — Top Navigation Bar
// =====================================================
import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
    Search, Bell, Settings, ChevronDown, User,
    LogOut, HelpCircle, Package, TrendingUp
} from 'lucide-react';

const PAGE_TITLES = {
    dashboard: { title: 'Dashboard', sub: 'Overview of your business' },
    billing: { title: 'Billing & Invoices', sub: 'Create and manage invoices' },
    inventory: { title: 'Inventory', sub: 'Manage your products & stock' },
    customers: { title: 'Customers & Suppliers', sub: 'Track contacts and balances' },
    reports: { title: 'Reports & Analytics', sub: 'Insights into your business' },
    settings: { title: 'Settings', sub: 'Configure your account' },
};

export default function Header({ currentPage, onNavigate, theme, onToggleTheme, onOpenLowStock }) {
    const { business, user, logout, lowStockProducts, sidebarOpen, setSidebarOpen, currency, notifications, markAllAsRead } = useApp();
    const [showNotif, setShowNotif] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [searchVal, setSearchVal] = useState('');
    const notifRef = useRef(null);
    const profileRef = useRef(null);

    const pageInfo = PAGE_TITLES[currentPage] || {};

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
            if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Combine real notifications with low stock alerts
    const allNotifications = [
        ...lowStockProducts.slice(0, 3).map(p => ({
            type: 'warning',
            title: 'LS Alert',
            body: `${p.name} — only ${p.stock} ${p.unit} left`,
            time: 'Now',
            read: false,
            onClick: () => {
                setShowNotif(false);
                onOpenLowStock?.();
            },
        })),
        ...notifications.slice(0, 5).map(n => ({
            ...n,
            time: getRelativeTime(n.createdAt),
            onClick: n.onClick || (() => {
                setShowNotif(false);
                onNavigate?.('notifications');
            })
        }))
    ];

    const unreadCount = allNotifications.filter(n => !n.read).length;

    function getRelativeTime(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }

    return (
        <header className="header">
            {/* Hamburger (mobile) */}
            <button
                className="hamburger"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle sidebar"
            >
                <span /><span /><span />
            </button>

            {/* Page title */}
            <div className="header-title">
                <h4>{pageInfo.title}</h4>
                <p>{pageInfo.sub}</p>
            </div>

            {/* Search */}
            <div className="header-search">
                <Search />
                <input
                    value={searchVal}
                    onChange={e => setSearchVal(e.target.value)}
                    placeholder="Search invoices, products..."
                />
            </div>

            {/* Actions */}
            <div className="header-actions">
                <button
                    className="theme-toggle-btn"
                    onClick={onToggleTheme}
                    aria-label="Toggle dark mode"
                    title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    <span className={`theme-toggle-icon ${theme === 'dark' ? 'sun' : 'moon'}`}>
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </span>
                </button>

                {/* Notifications */}
                <div className="header-popover" ref={notifRef}>
                    <button className="header-btn" onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}>
                        <Bell size={18} />
                        {unreadCount > 0 && <span className="notification-dot" />}
                    </button>

                    {showNotif && (
                        <div className="notif-panel">
                            <div className="notif-header-row">
                                <span className="notif-heading">Notifications</span>
                                {unreadCount > 0 && (
                                    <span 
                                        className="notif-link" 
                                        onClick={() => {
                                            markAllAsRead();
                                            setShowNotif(false);
                                        }}
                                    >
                                        Mark all read
                                    </span>
                                )}
                            </div>
                            <div className="notif-list">
                                {allNotifications.length === 0 ? (
                                    <div style={{ padding: '32px 16px', textAlign: 'center', color: '#9ca3af' }}>
                                        <Bell size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
                                        <div>No notifications</div>
                                    </div>
                                ) : (
                                    allNotifications.map((n, i) => (
                                        <div
                                            key={i}
                                            className={`notif-row ${n.onClick ? 'clickable' : ''} ${!n.read ? 'unread' : ''}`}
                                            onClick={n.onClick}
                                            role={n.onClick ? 'button' : undefined}
                                            tabIndex={n.onClick ? 0 : undefined}
                                            onKeyDown={(e) => {
                                                if (n.onClick && (e.key === 'Enter' || e.key === ' ')) n.onClick();
                                            }}
                                        >
                                            <div className={`notif-icon ${n.type}`}>
                                                {n.type === 'warning' ? <Package size={16} color="#d97706" /> :
                                                    n.type === 'success' ? <TrendingUp size={16} color="#16a34a" /> :
                                                        <Bell size={16} color="#2563eb" />}
                                            </div>
                                            <div className="notif-content">
                                                <div className="notif-title">{n.title}</div>
                                                <div className="notif-body">{n.body}</div>
                                            </div>
                                            <span className="notif-time">{n.time}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="notif-footer-row">
                                <span 
                                    className="notif-link" 
                                    onClick={() => { 
                                        setShowNotif(false); 
                                        onNavigate?.('notifications'); 
                                    }}
                                >
                                    View all notifications
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Settings shortcut */}
                <button className="header-btn" onClick={() => onNavigate('settings')}>
                    <Settings size={18} />
                </button>

                {/* Profile avatar */}
                <div className="header-popover" ref={profileRef}>
                    <div className="profile-toggle"
                        onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}>
                        {business?.logoUrl ? (
                            <img src={business.logoUrl} alt="Profile" className="avatar" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                            <div className="avatar">{(business?.name || 'M').charAt(0)}</div>
                        )}
                        <ChevronDown size={14} className="profile-chevron" />
                    </div>

                    {showProfile && (
                        <div className="notif-panel profile-panel">
                            <div className="profile-header">
                                {business?.logoUrl && (
                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                                        <img src={business.logoUrl} alt="Business Logo" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                                    </div>
                                )}
                                <div className="profile-name">{user?.displayName || business?.name || 'Business Owner'}</div>
                                <div className="profile-email">{user?.email || business?.email || 'No email set'}</div>
                                <div className="profile-store">Store: {business?.name || 'My Store'}</div>
                                <div className="profile-tax-pill">
                                    {business?.taxLabel || 'Tax ID'}: {business?.taxId || 'N/A'}
                                </div>
                            </div>
                            <div className="profile-menu">
                                {[
                                    { icon: User, label: 'My Profile', action: () => onNavigate('settings') },
                                    { icon: Settings, label: 'Settings', action: () => onNavigate('settings') },
                                    { icon: HelpCircle, label: 'Help & Support', action: () => { } },
                                ].map(m => (
                                    <div key={m.label}
                                        onClick={m.action}
                                        className="profile-menu-item">
                                        <m.icon size={16} />
                                        {m.label}
                                    </div>
                                ))}
                                <div className="profile-divider" />
                                <div onClick={logout}
                                    className="profile-menu-item danger">
                                    <LogOut size={16} />
                                    Logout
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
