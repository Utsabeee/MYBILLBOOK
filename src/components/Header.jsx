// =====================================================
// Header.jsx — Top Navigation Bar
// =====================================================
import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
    Search, Bell, Settings, ChevronDown, User,
    LogOut, HelpCircle, Menu, Package, TrendingUp
} from 'lucide-react';

const PAGE_TITLES = {
    dashboard: { title: 'Dashboard', sub: 'Overview of your business' },
    billing: { title: 'Billing & Invoices', sub: 'Create and manage invoices' },
    inventory: { title: 'Inventory', sub: 'Manage your products & stock' },
    customers: { title: 'Customers & Suppliers', sub: 'Track contacts and balances' },
    reports: { title: 'Reports & Analytics', sub: 'Insights into your business' },
    settings: { title: 'Settings', sub: 'Configure your account' },
};

export default function Header({ currentPage, onNavigate }) {
    const { business, user, logout, lowStockProducts, sidebarOpen, setSidebarOpen, currency } = useApp();
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

    const notifications = [
        ...lowStockProducts.slice(0, 3).map(p => ({
            type: 'warning',
            title: 'Low Stock Alert',
            body: `${p.name} — only ${p.stock} ${p.unit} left`,
            time: 'Now',
        })),
        { type: 'info', title: 'Invoice Paid', body: `INV-2024-004 received ${currency(1118.25)} from Priya Sharma`, time: '2h ago' },
        { type: 'success', title: 'Backup Complete', body: 'Your data has been backed up successfully', time: '4h ago' },
    ];

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
                {/* Notifications */}
                <div style={{ position: 'relative' }} ref={notifRef}>
                    <button className="header-btn" onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}>
                        <Bell size={18} />
                        {notifications.length > 0 && <span className="notification-dot" />}
                    </button>

                    {showNotif && (
                        <div className="notif-panel">
                            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Notifications</span>
                                <span style={{ fontSize: '0.72rem', color: '#3b82f6', cursor: 'pointer', fontWeight: 600 }}>Mark all read</span>
                            </div>
                            <div>
                                {notifications.map((n, i) => (
                                    <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid #f8fafc', display: 'flex', gap: 10 }}>
                                        <div style={{
                                            width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: n.type === 'warning' ? '#fef3c7' : n.type === 'success' ? '#dcfce7' : '#dbeafe',
                                        }}>
                                            {n.type === 'warning' ? <Package size={16} color="#d97706" /> :
                                                n.type === 'success' ? <TrendingUp size={16} color="#16a34a" /> :
                                                    <Bell size={16} color="#2563eb" />}
                                        </div>
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1f2937' }}>{n.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.body}</div>
                                        </div>
                                        <span style={{ fontSize: '0.7rem', color: '#9ca3af', flexShrink: 0 }}>{n.time}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ padding: '10px 16px', textAlign: 'center', borderTop: '1px solid #f1f5f9' }}>
                                <span style={{ fontSize: '0.78rem', color: '#3b82f6', cursor: 'pointer', fontWeight: 600 }}>View all notifications</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Settings shortcut */}
                <button className="header-btn" onClick={() => onNavigate('settings')}>
                    <Settings size={18} />
                </button>

                {/* Profile avatar */}
                <div style={{ position: 'relative' }} ref={profileRef}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                        onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}>
                        <div className="avatar">{(business?.name || 'M').charAt(0)}</div>
                        <ChevronDown size={14} color="#6b7280" />
                    </div>

                    {showProfile && (
                        <div className="notif-panel" style={{ width: 220, right: 0 }}>
                            <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1f2937' }}>{user?.displayName || business?.name || 'Business Owner'}</div>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 2 }}>{user?.email || business?.email || 'No email set'}</div>
                                <div style={{ marginTop: 2, fontSize: '0.68rem', color: '#94a3b8', fontStyle: 'italic' }}>Store: {business?.name || 'My Store'}</div>
                                <div style={{ marginTop: 6, fontSize: '0.7rem', background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: 99, display: 'inline-block', fontWeight: 700 }}>
                                    {business?.taxLabel || 'Tax ID'}: {business?.taxId || 'N/A'}
                                </div>
                            </div>
                            <div style={{ padding: '8px' }}>
                                {[
                                    { icon: User, label: 'My Profile', action: () => onNavigate('settings') },
                                    { icon: Settings, label: 'Settings', action: () => onNavigate('settings') },
                                    { icon: HelpCircle, label: 'Help & Support', action: () => { } },
                                ].map(m => (
                                    <div key={m.label}
                                        onClick={m.action}
                                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 6, cursor: 'pointer', color: '#374151', fontSize: '0.84rem', fontWeight: 500 }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <m.icon size={16} color="#6b7280" />
                                        {m.label}
                                    </div>
                                ))}
                                <div style={{ height: 1, background: '#f1f5f9', margin: '4px 0' }} />
                                <div onClick={logout}
                                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 6, cursor: 'pointer', color: '#dc2626', fontSize: '0.84rem', fontWeight: 500 }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
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
