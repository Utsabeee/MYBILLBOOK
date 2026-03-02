// =====================================================
// Sidebar.jsx — Left Navigation Sidebar
// =====================================================
import { useApp } from '../context/AppContext';
import {
    LayoutDashboard, FileText, Package, Users, BarChart3,
    Settings, LogOut, AlertTriangle, Zap, Bell
} from 'lucide-react';
import logoImage from './image/ChatGPT Image Mar 2, 2026, 04_20_16 PM.png';

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
            { id: 'notifications', label: 'Notifications', icon: Bell, badge: null },
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
                    <div className="sidebar-logo-row">
                        <img 
                            src={logoImage} 
                            alt="MyBillBook Logo" 
                            className="sidebar-logo-img"
                            style={{
                                width: 50,
                                height: 50,
                                borderRadius: 12,
                                objectFit: 'cover',
                                marginRight: 8
                            }}
                        />
                        <div>
                            <div className="sidebar-logo-text">MyBillBook</div>
                        </div>
                    </div>

                    {/* Business name chip */}
                    <div className="sidebar-business-chip">
                        <img 
                            src={business?.logo || logoImage} 
                            alt="Business Logo" 
                            className="sidebar-business-avatar-img"
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                objectFit: 'cover'
                            }}
                        />
                        <span className="sidebar-business-name">
                            {business?.name || 'My General Store'}
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
                                    >
                                        <Icon size={18} />
                                        <span className="sidebar-item-label">{item.label}</span>
                                        {/* Low stock alert badge on Inventory */}
                                        {item.id === 'inventory' && lowStockProducts.length > 0 && (
                                            <span className="sidebar-badge">{lowStockProducts.length}</span>
                                        )}
                                        {item.badge && item.id !== 'inventory' && (
                                            <span className="sidebar-new-badge">{item.badge}</span>
                                        )}
                                    </a>
                                );
                            })}
                        </div>
                    ))}

                    {/* Low stock alert */}
                    {lowStockProducts.length > 0 && (
                        <div className="sidebar-lowstock-card">
                            <AlertTriangle size={14} color="#f87171" className="sidebar-lowstock-icon" />
                            <div>
                                <div className="sidebar-lowstock-title">LS Alert</div>
                                <div className="sidebar-lowstock-sub">
                                    {lowStockProducts.length} item{lowStockProducts.length > 1 ? 's' : ''} need restocking
                                </div>
                            </div>
                        </div>
                    )}
                </nav>

                {/* Footer */}
                <div className="sidebar-footer">
                    <div className="sidebar-user-block">
                        <div className="sidebar-user-name">{user?.displayName || 'User'}</div>
                        <div className="sidebar-user-email">{user?.email}</div>
                    </div>
                    <button
                        className="sidebar-item logout-btn"
                        onClick={logout}
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
