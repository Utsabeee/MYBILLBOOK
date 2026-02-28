// =====================================================
// App.jsx — Root Application Component
// =====================================================
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './context/AppContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import Inventory from './pages/Inventory';
import Customers from './pages/Customers';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { LayoutDashboard, FileText, Package, Users, BarChart3, Settings as SettingsIcon } from 'lucide-react';

// ── Breadcrumbs ── 
const BREADCRUMBS = {
  dashboard: ['Home', 'Dashboard'],
  billing: ['Home', 'Billing & Invoices'],
  inventory: ['Home', 'Inventory'],
  customers: ['Home', 'Customers & Suppliers'],
  reports: ['Home', 'Reports & Analytics'],
  settings: ['Home', 'Settings'],
};

function AppContent() {
  const { isAuthenticated } = useApp();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!isAuthenticated) return <Auth />;

  const crumbs = BREADCRUMBS[currentPage] || ['Home'];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard onNavigate={setCurrentPage} />;
      case 'billing': return <Billing />;
      case 'inventory': return <Inventory />;
      case 'customers': return <Customers />;
      case 'reports': return <Reports />;
      case 'settings': return <Settings />;
      default: return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="main-content">
        <Header currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="page-content">
          {/* Breadcrumb */}
          <nav className="breadcrumb" aria-label="breadcrumb">
            {crumbs.map((crumb, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
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
    <nav style={{
      display: 'none',
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      background: 'white',
      borderTop: '1px solid #e5e7eb',
      zIndex: 150,
      boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
    }} className="mobile-nav">
      {MOBILE_TABS.map(tab => {
        const isActive = currentPage === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 3, padding: '8px 4px', background: 'none', border: 'none',
              cursor: 'pointer', color: isActive ? '#2563eb' : '#9ca3af',
              transition: 'all 0.15s',
            }}
          >
            <tab.Icon size={20} />
            <span style={{ fontSize: '0.62rem', fontWeight: isActive ? 700 : 500 }}>{tab.label}</span>
            {isActive && (
              <div style={{ position: 'absolute', top: 0, width: 24, height: 3, background: '#2563eb', borderRadius: '0 0 4px 4px' }} />
            )}
          </button>
        );
      })}
      <style>{`
        @media (max-width: 768px) {
          .mobile-nav { display: flex !important; }
          .page-content { padding-bottom: 72px !important; }
        }
      `}</style>
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
