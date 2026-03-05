// =====================================================
// App.jsx — Root Application Component
// =====================================================
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './context/AppContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import Inventory from './pages/Inventory';
import Customers from './pages/Customers';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LowStockQuickViewModal from './components/LowStockQuickViewModal';
import { LayoutDashboard, FileText, Package, Users, BarChart3, Settings as SettingsIcon } from 'lucide-react';

// ── Breadcrumbs ── 
const BREADCRUMBS = {
  dashboard: ['Home', 'Dashboard'],
  billing: ['Home', 'Billing & Invoices'],
  inventory: ['Home', 'Inventory'],
  customers: ['Home', 'Customers & Suppliers'],
  reports: ['Home', 'Reports & Analytics'],
  settings: ['Home', 'Settings'],
  notifications: ['Home', 'Notifications'],
};

function AppContent() {
  const { isAuthenticated, loadAllData } = useApp();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('mbb_theme') || 'light');
  const [showLowStockQuickView, setShowLowStockQuickView] = useState(false);
  const [isOnline, setIsOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  const [showOnlineRestored, setShowOnlineRestored] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const enableDarkMode = isAuthenticated && theme === 'dark';
    document.body.classList.toggle('dark-mode', enableDarkMode);
    localStorage.setItem('mbb_theme', theme);

    return () => {
      document.body.classList.remove('dark-mode');
    };
  }, [theme, isAuthenticated]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    const handleOffline = () => {
      setIsOnline(false);
      setShowOnlineRestored(false);
    };

    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineRestored(true);
      window.setTimeout(() => setShowOnlineRestored(false), 2500);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const handleRetrySync = async () => {
    if (!isAuthenticated || !isOnline || isRetrying) return;
    setIsRetrying(true);
    try {
      await loadAllData(true);
      setShowOnlineRestored(true);
      window.setTimeout(() => setShowOnlineRestored(false), 2500);
    } finally {
      setIsRetrying(false);
    }
  };

  if (!isAuthenticated) return <Auth />;

  const crumbs = BREADCRUMBS[currentPage] || ['Home'];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard onNavigate={setCurrentPage} onOpenLowStock={() => setShowLowStockQuickView(true)} />;
      case 'billing': return <Billing />;
      case 'inventory': return <Inventory />;
      case 'customers': return <Customers />;
      case 'reports': return <Reports />;
      case 'settings': return <Settings />;
      case 'notifications': return <Notifications />;
      default: return <Dashboard onNavigate={setCurrentPage} onOpenLowStock={() => setShowLowStockQuickView(true)} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="main-content">
        <Header
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenLowStock={() => setShowLowStockQuickView(true)}
        />
        <main className="page-content">
          {(!isOnline || showOnlineRestored) && (
            <div className={`network-banner ${isOnline ? 'online' : 'offline'}`}>
              <div className="network-banner-main">
                <span className="network-dot" />
                <span>
                  {isOnline
                    ? 'Back online. Reconnected successfully.'
                    : 'You are offline. Reconnecting…'}
                </span>
              </div>
              {isAuthenticated && (
                <button
                  className="network-retry-btn"
                  onClick={handleRetrySync}
                  disabled={!isOnline || isRetrying}
                  title={!isOnline ? 'Connect to internet first' : 'Retry data sync now'}
                >
                  {isRetrying ? 'Retrying…' : 'Retry now'}
                </button>
              )}
            </div>
          )}

          {/* Breadcrumb */}
          <nav className="breadcrumb" aria-label="breadcrumb">
            {crumbs.map((crumb, i) => (
              <span key={i} className="breadcrumb-item">
                {i > 0 && <span className="breadcrumb-sep">/</span>}
                <span className={i === crumbs.length - 1 ? 'breadcrumb-current' : ''}>
                  {crumb}
                </span>
              </span>
            ))}
          </nav>

          {/* Page Content */}
          {renderPage()}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav currentPage={currentPage} onNavigate={setCurrentPage} />

        {showLowStockQuickView && (
          <LowStockQuickViewModal
            onClose={() => setShowLowStockQuickView(false)}
            onNavigate={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}

// ── Mobile Bottom Nav ──
const MOBILE_TABS = [
  { id: 'dashboard', label: 'Home', Icon: LayoutDashboard },
  { id: 'billing', label: 'Billing', Icon: FileText },
  { id: 'inventory', label: 'Inventory', Icon: Package },
  { id: 'customers', label: 'Contacts', Icon: Users },
  { id: 'reports', label: 'Reports', Icon: BarChart3 },
  { id: 'settings', label: 'Settings', Icon: SettingsIcon },
];

function MobileBottomNav({ currentPage, onNavigate }) {
  return (
    <nav className="mobile-nav">
      {MOBILE_TABS.map(tab => {
        const isActive = currentPage === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`mobile-nav-btn ${isActive ? 'active' : ''}`}
          >
            <tab.Icon size={20} />
            <span className="mobile-nav-label">{tab.label}</span>
            <div className="mobile-nav-active-bar" />
          </button>
        );
      })}
    </nav>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.875rem',
            borderRadius: '10px',
            background: 'var(--toast-bg)',
            color: 'var(--toast-text)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <AppContent />
    </AppProvider>
  );
}
