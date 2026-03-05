// =====================================================
// Notifications.jsx — Notifications Center Page
// =====================================================
import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Trash2, Check, CheckCheck, Package, TrendingUp, AlertCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Notifications() {
    const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications, addNotification } = useApp();
    const [filter, setFilter] = useState('all'); // all, unread, read

    // Add sample notifications for demo
    const handleAddSampleNotifications = () => {
        const samples = [
            {
                type: 'error',
                title: 'Overdue Invoice',
                body: 'Invoice #INV-001 from ABC Corp is 5 days overdue - Total: $5,500',
            },
            {
                type: 'warning',
                title: 'Low Stock Alert',
                body: 'iPhone 15 Pro is low in stock (3 remaining, min: 5)',
            },
            {
                type: 'warning',
                title: 'Invoice Due Soon',
                body: 'Invoice #INV-002 from XYZ Ltd is due in 2 days - Total: $8,200',
            },
            {
                type: 'info',
                title: 'Payment Received',
                body: 'Payment of $3,500 received for Invoice #INV-003',
            },
            {
                type: 'error',
                title: 'Out of Stock',
                body: 'Samsung Galaxy S24 is out of stock!',
            },
        ];
        
        samples.forEach(sample => {
            addNotification(sample);
        });
        
        toast.success('5 sample notifications added!');
    };

    // Group notifications by date
    const groupedNotifications = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const thisWeek = new Date(today);
        thisWeek.setDate(thisWeek.getDate() - 7);

        // Always show unread in red, but filter based on tab selection
        // 'all' = show everything | 'unread' = only unread | 'read' = only read
        let filtered;
        if (filter === 'unread') {
            filtered = notifications.filter(n => !n.read);
        } else if (filter === 'read') {
            filtered = notifications.filter(n => n.read);
        } else {
            // 'all' - show everything
            filtered = notifications;
        }

        const groups = {
            today: [],
            yesterday: [],
            thisWeek: [],
            older: []
        };

        filtered.forEach(notif => {
            const notifDate = new Date(notif.createdAt);
            if (notifDate >= today) {
                groups.today.push(notif);
            } else if (notifDate >= yesterday) {
                groups.yesterday.push(notif);
            } else if (notifDate >= thisWeek) {
                groups.thisWeek.push(notif);
            } else {
                groups.older.push(notif);
            }
        });

        return groups;
    }, [notifications, filter]);

    const unreadCount = notifications.filter(n => !n.read).length;
    const hasFilteredNotifications = 
        groupedNotifications.today.length +
        groupedNotifications.yesterday.length +
        groupedNotifications.thisWeek.length +
        groupedNotifications.older.length > 0;

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'warning': return <Package size={20} color="#d97706" />;
            case 'success': return <Check size={20} color="#16a34a" />;
            case 'error': return <AlertCircle size={20} color="#dc2626" />;
            case 'info':
            default: return <Bell size={20} color="#2563eb" />;
        }
    };

    const formatTime = (date) => {
        const d = new Date(date);
        return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const formatFullDate = (date) => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const handleMarkAllRead = () => {
        markAllAsRead();
        toast.success('All notifications marked as read');
    };

    const handleClearAll = () => {
        if (window.confirm('Are you sure you want to delete all notifications?')) {
            clearAllNotifications();
            toast.success('All notifications cleared');
        }
    };

    const handleDelete = (id) => {
        deleteNotification(id);
        toast.success('Notification deleted');
    };

    const renderNotificationGroup = (title, notifs) => {
        if (notifs.length === 0) return null;

        return (
            <div key={title} style={{ marginBottom: 32 }}>
                <div style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    textTransform: 'uppercase', 
                    color: 'var(--text-muted)', 
                    marginBottom: 12,
                    letterSpacing: '0.05em'
                }}>
                    {title}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {notifs.map(notif => (
                        <div
                            key={notif.id}
                            className="notification-card"
                            style={{
                                background: notif.read ? 'var(--bg-card)' : 'var(--primary-50)',
                                border: `1px solid ${notif.read ? 'var(--border-color)' : 'var(--primary-200)'}`,
                                borderRadius: 10,
                                padding: 16,
                                display: 'flex',
                                gap: 12,
                                alignItems: 'flex-start',
                                transition: 'all 0.2s ease',
                                cursor: notif.onClick ? 'pointer' : 'default'
                            }}
                            onClick={notif.onClick}
                        >
                            <div style={{ 
                                width: 40, 
                                height: 40, 
                                borderRadius: 10, 
                                background: notif.read ? 'var(--gray-100)' : 'var(--primary-100)',
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                {getNotificationIcon(notif.type)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 8, 
                                    marginBottom: 4 
                                }}>
                                    <span style={{ 
                                        fontWeight: 700, 
                                        fontSize: '0.875rem', 
                                        color: 'var(--text-primary)' 
                                    }}>
                                        {notif.title}
                                    </span>
                                    {!notif.read && (
                                        <span style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            background: '#3b82f6',
                                            flexShrink: 0
                                        }} />
                                    )}
                                </div>
                                <div style={{ 
                                    fontSize: '0.8rem', 
                                    color: 'var(--text-secondary)', 
                                    marginBottom: 6 
                                }}>
                                    {notif.body}
                                </div>
                                <div style={{ 
                                    fontSize: '0.7rem', 
                                    color: 'var(--text-muted)' 
                                }}>
                                    {formatTime(notif.createdAt)} • {formatFullDate(notif.createdAt)}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                {!notif.read && (
                                    <button
                                        className="btn btn-icon"
                                        style={{ 
                                            width: 32, 
                                            height: 32, 
                                            background: 'var(--primary-100)', 
                                            color: 'var(--primary-600)', 
                                            border: 'none' 
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markAsRead(notif.id);
                                            toast.success('Marked as read');
                                        }}
                                        title="Mark as read"
                                    >
                                        <Check size={14} />
                                    </button>
                                )}
                                <button
                                    className="btn btn-icon"
                                    style={{ 
                                        width: 32, 
                                        height: 32, 
                                        background: 'var(--danger-100)', 
                                        color: 'var(--danger-600)', 
                                        border: 'none' 
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(notif.id);
                                    }}
                                    title="Delete"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                        Notifications
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                        className="btn btn-ghost" 
                        onClick={handleAddSampleNotifications}
                        title="Add sample notifications to see the feature in action"
                    >
                        <Bell size={16} />
                        Sample
                    </button>
                    {unreadCount > 0 && (
                        <button className="btn btn-ghost" onClick={handleMarkAllRead}>
                            <CheckCheck size={16} />
                            Mark all read
                        </button>
                    )}
                    {notifications.length > 0 && (
                        <button 
                            className="btn btn-ghost" 
                            onClick={handleClearAll}
                            style={{ color: '#dc2626' }}
                        >
                            <X size={16} />
                            Clear all
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Tabs */}
            <div style={{ 
                display: 'flex', 
                gap: 8, 
                marginBottom: 24, 
                borderBottom: '2px solid var(--border-color)',
                paddingBottom: 2
            }}>
                {[
                    { id: 'all', label: 'All', count: notifications.length },
                    { id: 'unread', label: 'Unread', count: unreadCount },
                    { id: 'read', label: 'Read', count: notifications.filter(n => n.read).length }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        style={{
                            padding: '8px 16px',
                            border: 'none',
                            background: 'transparent',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: filter === tab.id ? 'var(--primary-600)' : 'var(--text-secondary)',
                            borderBottom: filter === tab.id ? '2px solid var(--primary-600)' : '2px solid transparent',
                            marginBottom: -2,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {/* Notifications List */}
            {notifications.length === 0 ? (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '80px 20px',
                    color: 'var(--text-muted)'
                }}>
                    <Bell size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>
                        No notifications yet
                    </div>
                    <div style={{ fontSize: '0.875rem' }}>
                        You'll see updates about your business here
                    </div>
                </div>
            ) : !hasFilteredNotifications ? (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '80px 20px',
                    color: 'var(--text-muted)'
                }}>
                    <Bell size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>
                        No {filter} notifications
                    </div>
                    <div style={{ fontSize: '0.875rem' }}>
                        Switch to another tab to see notifications
                    </div>
                </div>
            ) : (
                <>
                    {renderNotificationGroup('Today', groupedNotifications.today)}
                    {renderNotificationGroup('Yesterday', groupedNotifications.yesterday)}
                    {renderNotificationGroup('This Week', groupedNotifications.thisWeek)}
                    {renderNotificationGroup('Older', groupedNotifications.older)}
                </>
            )}
        </div>
    );
}
