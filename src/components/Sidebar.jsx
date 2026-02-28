// =====================================================
// Sidebar.jsx — Left Navigation Sidebar
// =====================================================
import { useApp } from '../context/AppContext';
import {
    LayoutDashboard, FileText, Package, Users, BarChart3,
    Settings, LogOut, TrendingUp, ShoppingCart, AlertTriangle,
    X, Zap
} from 'lucide-react';

const NAV_ITEMS = [
    {
        section: 'Main',
        items: [
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
            { id: 'billing', label: 'Billing', icon: FileText, badge: 'New' },
        ]
    },
    {
        section: 'Business',
        items: [
            { id: 'inventory', label: 'Inventory', icon: Package, badge: null },
            { id: 'customers', label: 'Customers', icon: Users, badge: null },
            { id: 'reports', label: 'Reports', icon: BarChart3, badge: null },
        ]
    },
    {
        section: 'Account',
        items: [
            { id: 'settings', label: 'Settings', icon: Settings, badge: null },
        ]
    }
];

export default function Sidebar({ currentPage, onNavigate }) {
    const { business, user, logout, lowStockProducts, sidebarOpen, setSidebarOpen } = useApp();

    const handleNav = (id) => {
        onNavigate(id);
        setSidebarOpen(false);
    };

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                {/* Logo */}
                <div className="sidebar-logo">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <div style={{
                            width: 36, height: 36,
                            background: 'linear-gradient(135deg,#3b82f6,#14b8a6)',
                            borderRadius: 8,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Zap size={20} color="white" />
                        </div>
                        <div>
                            <div className="sidebar-logo-text">MyBillBook</div>
                            <div className="sidebar-logo-sub">v2.0 Pro</div>
                        </div>
                    </div>

                    {/* Business name chip */}
                    <div style={{
                        marginTop: 8,
                        background: 'rgba(255,255,255,0.07)',
                        borderRadius: 6,
                        padding: '6px 10px',
                        display: 'flex', alignItems: 'center', gap: 6
                    }}>
                        <div style={{
                            width: 24, height: 24, borderRadius: '50%',
                            background: 'linear-gradient(135deg,#3b82f6,#14b8a6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.65rem', fontWeight: 700, color: 'white', flexShrink: 0,
                        }}>
                            {(business?.name || 'M').charAt(0)}
                        </div>
                        <span style={{ fontSize: '0.76rem', color: '#cbd5e1', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {business?.name || 'My Store'}
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {NAV_ITEMS.map(section => (
                        <div key={section.section}>
                            <div className="sidebar-section-label">{section.section}</div>
                            {section.items.map(item => {
                                const Icon = item.icon;
                                const isActive = currentPage === item.id;
                                return (
                                    <a
                                        key={item.id}
                                        className={`sidebar-item ${isActive ? 'active' : ''}`}
                                        onClick={() => handleNav(item.id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <Icon size={18} />
                                        <span style={{ flex: 1 }}>{item.label}</span>
                                        {/* Low stock alert badge on Inventory */}
                                        {item.id === 'inventory' && lowStockProducts.length > 0 && (
                                            <span className="sidebar-badge">{lowStockProducts.length}</span>
                                        )}
                                        {item.badge && item.id !== 'inventory' && (
                                            <span style={{
                                                background: 'linear-gradient(135deg,#3b82f6,#14b8a6)',
                                                color: 'white', fontSize: '0.6rem', fontWeight: 700,
                                                padding: '2px 7px', borderRadius: 99,
                                            }}>{item.badge}</span>
                                        )}
                                    </a>
                                );
                            })}
                        </div>
                    ))}

                    {/* Low stock alert */}
                    {lowStockProducts.length > 0 && (
                        <div style={{
                            marginTop: 12,
                            background: 'rgba(239,68,68,0.12)',
                            border: '1px solid rgba(239,68,68,0.25)',
                            borderRadius: 8,
                            padding: '10px 12px',
                            display: 'flex', alignItems: 'flex-start', gap: 8,
                        }}>
                            <AlertTriangle size={14} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
                            <div>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fca5a5' }}>Low Stock Alert</div>
                                <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 2 }}>
                                    {lowStockProducts.length} item{lowStockProducts.length > 1 ? 's' : ''} need restocking
                                </div>
                            </div>
                        </div>
                    )}
                </nav>

                {/* Footer */}
                <div className="sidebar-footer">
                    <div style={{ padding: '8px 12px', marginBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>{user?.displayName || 'User'}</div>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
                    </div>
                    <button
                        className="sidebar-item logout-btn"
                        onClick={logout}
                        style={{ width: '100%', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', gap: 10, alignItems: 'center' }}
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
