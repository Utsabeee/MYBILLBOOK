// =====================================================
// Dashboard.jsx — Main Analytics Dashboard (Global)
// =====================================================
import { useApp } from '../context/AppContext';
import {
    TrendingUp, TrendingDown, ShoppingCart, Package,
    Users, AlertTriangle, DollarSign, ArrowUpRight,
    ArrowDownRight, Clock, CheckCircle, FileText, Eye
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

// Tooltip that uses the business currency
const CustomTooltip = ({ active, payload, label, currency }) => {
    if (!active || !payload.length) return null;
    return (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div style={{ fontWeight: 700, marginBottom: 4, color: '#1f2937', fontSize: '0.85rem' }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.78rem' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                    <span style={{ color: '#6b7280', textTransform: 'capitalize' }}>{p.dataKey}:</span>
                    <span style={{ fontWeight: 600, color: '#1f2937' }}>{currency(p.value)}</span>
                </div>
            ))}
        </div>
    );
};

export default function Dashboard({ onNavigate, onOpenLowStock }) {
    const { invoices, products, customers, lowStockProducts, pendingPayments, business, currency, user } = useApp();

    // Log for verification
    console.log('📊 Dashboard - Pending Payments:', pendingPayments);

    // ── DATA COMPUTATION ────────────────────────────

    // 1. Monthly Revenue (Last 6 months)
    const getMonthlyData = () => {
        const months = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mLabel = d.toLocaleString('default', { month: 'short' });
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

            const monthInvoices = invoices.filter(inv => inv.date.startsWith(key));
            const sales = monthInvoices.reduce((sum, inv) => sum + inv.total, 0);
            const expenses = monthInvoices.reduce((sum, inv) => sum + (inv.subtotal * 0.6), 0); // Mock expenses as 60% of subtotal if not tracked

            months.push({ month: mLabel, sales, expenses });
        }
        return months;
    };
    const monthlyData = getMonthlyData();
    const totalRevMonth = monthlyData[5].sales;
    const lastMonthRev = monthlyData[4].sales;
    const revGrowth = lastMonthRev > 0 ? (((totalRevMonth - lastMonthRev) / lastMonthRev) * 100).toFixed(1) : '0.0';

    // 2. Daily Sales (This Week)
    const getDailyData = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const data = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dLabel = days[d.getDay()];
            const dStr = d.toISOString().split('T')[0];
            const amount = invoices.filter(inv => inv.date === dStr).reduce((sum, inv) => sum + inv.total, 0);
            data.push({ day: dLabel, amount });
        }
        return data;
    };
    const dailyData = getDailyData();
    const salesToday = dailyData[6].amount;

    // 3. Top Products
    const getTopProducts = () => {
        const productSales = {};
        invoices.forEach(inv => {
            inv.items?.forEach(item => {
                const name = item.name || 'Unknown Item';
                if (!productSales[name]) productSales[name] = { sales: 0, qty: 0 };
                productSales[name].sales += item.amount;
                productSales[name].qty += item.qty;
            });
        });
        return Object.entries(productSales)
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);
    };
    const topProducts = getTopProducts();

    // 4. Category Pie
    const getCategoryData = () => {
        const categories = {};
        products.forEach(p => {
            const cat = p.category || 'Other';
            if (!categories[cat]) categories[cat] = 0;
            categories[cat]++;
        });
        const total = products.length || 1;
        const colors = ['#3b82f6', '#14b8a6', '#a855f7', '#f59e0b', '#6b7280', '#ef4444'];
        return Object.entries(categories).map(([name, count], i) => ({
            name,
            value: Math.round((count / total) * 100),
            color: colors[i % colors.length]
        })).sort((a, b) => b.value - a.value).slice(0, 5);
    };
    const categoryData = getCategoryData();

    const paidInvoices = invoices.filter(i => i.status === 'paid').length;
    const pendingCount = invoices.filter(i => i.status !== 'paid').length;
    const recentInvoices = [...invoices].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    const statusConfig = {
        paid: { cls: 'badge-success', label: 'Paid' },
        unpaid: { cls: 'badge-danger', label: 'Due' },
        partial: { cls: 'badge-warning', label: 'Partial' },
    };

    return (
        <div className="anim-fade-in dashboard-page">
            {/* Welcome Bar */}
            <div className="dashboard-welcome">
                <div className="dashboard-welcome-orb orb-1" />
                <div className="dashboard-welcome-orb orb-2" />
                <div>
                    <div className="dashboard-welcome-sub">
                        Welcome back, {user?.displayName || (business?.name?.split(' ')[0] || 'Friend')} 👋
                    </div>
                    <div className="dashboard-welcome-title">
                        This Month's Revenue: {currency(totalRevMonth)}
                    </div>
                    <div className="dashboard-welcome-growth">
                        📈 {revGrowth}% growth vs last month — Great work!
                    </div>
                </div>
                <button className="btn dashboard-welcome-btn" onClick={() => onNavigate('billing')}>
                    + New Invoice
                </button>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid section-space-24">
                <div className="stat-card blue">
                    <div className="stat-card-header">
                        <div>
                            <div className="stat-label">Monthly Revenue</div>
                            <div className="stat-value stat-value-amount">{currency(totalRevMonth)}</div>
                        </div>
                        <div className="stat-icon blue"><DollarSign size={22} /></div>
                    </div>
                    <div className="stat-foot-row">
                        <span className="stat-change up"><ArrowUpRight size={12} /> {revGrowth}%</span>
                        <span className="stat-foot-note">vs last month</span>
                    </div>
                </div>

                <div className="stat-card green">
                    <div className="stat-card-header">
                        <div>
                            <div className="stat-label">Sales Today</div>
                            <div className="stat-value stat-value-amount">{currency(salesToday)}</div>
                        </div>
                        <div className="stat-icon green"><TrendingUp size={22} /></div>
                    </div>
                    <div className="stat-foot-row">
                        <span className="stat-change up"><ArrowUpRight size={12} /> 8.4%</span>
                        <span className="stat-foot-note">vs yesterday</span>
                    </div>
                </div>

                <div className="stat-card orange">
                    <div className="stat-card-header">
                        <div>
                            <div className="stat-label">Pending Payments</div>
                            <div className="stat-value stat-value-amount">{currency(pendingPayments)}</div>
                        </div>
                        <div className="stat-icon orange"><Clock size={22} /></div>
                    </div>
                    <div className="stat-foot-row">
                        <span className="stat-change down"><ArrowDownRight size={12} /> {pendingCount} invoices</span>
                        <span className="stat-foot-note">overdue</span>
                    </div>
                </div>

                <div className="stat-card purple">
                    <div className="stat-card-header">
                        <div>
                            <div className="stat-label">Total Invoices</div>
                            <div className="stat-value stat-value-amount">{invoices.length}</div>
                        </div>
                        <div className="stat-icon purple"><FileText size={22} /></div>
                    </div>
                    <div className="stat-foot-row">
                        <span className="stat-change up"><CheckCircle size={12} /> {paidInvoices} paid</span>
                        <span className="stat-foot-note">{pendingCount} pending</span>
                    </div>
                </div>

                <div className="stat-card teal">
                    <div className="stat-card-header">
                        <div>
                            <div className="stat-label">Products</div>
                            <div className="stat-value stat-value-amount">{products.length}</div>
                        </div>
                        <div className="stat-icon teal"><Package size={22} /></div>
                    </div>
                    <div className="stat-foot-row">
                        {lowStockProducts.length > 0 ? (
                            <span className="stat-change down"><AlertTriangle size={12} /> {lowStockProducts.length} LS</span>
                        ) : (
                            <span className="stat-change up"><CheckCircle size={12} /> All stocked</span>
                        )}
                    </div>
                </div>

                <div className="stat-card red">
                    <div className="stat-card-header">
                        <div>
                            <div className="stat-label">Customers</div>
                            <div className="stat-value stat-value-amount">{customers.filter(c => c.type !== 'supplier').length}</div>
                        </div>
                        <div className="stat-icon red"><Users size={22} /></div>
                    </div>
                    <div className="stat-foot-row">
                        <span className="stat-change up"><ArrowUpRight size={12} /> 2 new</span>
                        <span className="stat-foot-note">this month</span>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid-2 section-space-24">
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Revenue vs Expenses</span>
                        <span className="card-subtle">Last 6 months</span>
                    </div>
                    <div className="chart-body-pad">
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={monthlyData}>
                                <defs>
                                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                                    tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                                <Tooltip content={<CustomTooltip currency={currency} />} />
                                <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2.5} fill="url(#salesGrad)" name="Sales" />
                                <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fill="url(#expGrad)" name="Expenses" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Daily Sales — This Week</span>
                    </div>
                    <div className="chart-body-pad">
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={dailyData} barSize={28}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                                    tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                                <Tooltip content={<CustomTooltip currency={currency} />} />
                                <Bar dataKey="amount" name="Sales" radius={[6, 6, 0, 0]}>
                                    {dailyData.map((_, i) => (
                                        <Cell key={i} fill={i === 6 ? '#3b82f6' : '#93c5fd'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid-2 section-space-24">
                {/* Recent Transactions */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Recent Transactions</span>
                        <button className="btn btn-ghost btn-sm dashboard-inline-btn" onClick={() => onNavigate('billing')}>
                            <Eye size={14} /> View All
                        </button>
                    </div>
                    <div className="dashboard-recent-list-wrap">
                        {recentInvoices.map((inv, i) => {
                            const cfg = statusConfig[inv.status];
                            return (
                                <div key={inv.id} className={`dashboard-recent-row ${i < recentInvoices.length - 1 ? 'with-border' : ''}`}>
                                    <div className="dashboard-recent-icon">
                                        <FileText size={16} color="#3b82f6" />
                                    </div>
                                    <div className="dashboard-recent-meta">
                                        <div className="dashboard-recent-name">{inv.customer || 'Unknown'}</div>
                                        <div className="dashboard-recent-sub">{inv.invoiceNo} · {inv.date}</div>
                                    </div>
                                    <div className="dashboard-recent-amount-wrap">
                                        <div className="dashboard-recent-amount">{currency(inv.total)}</div>
                                        <span className={`badge ${cfg.cls} dashboard-recent-badge`}>{cfg.label}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="dashboard-side-stack">
                    {/* Category Distribution */}
                    <div className="card dashboard-flex-fill">
                        <div className="card-header">
                            <span className="card-title">Sales by Category</span>
                        </div>
                        <div className="dashboard-category-wrap">
                            <ResponsiveContainer width="50%" height={140}>
                                <PieChart>
                                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={3}>
                                        {categoryData.map((entry, idx) => (
                                            <Cell key={idx} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="dashboard-category-list">
                                {categoryData.length > 0 ? categoryData.map(c => (
                                    <div key={c.name} className="dashboard-category-item">
                                        <div className="dashboard-category-dot" style={{ background: c.color }} />
                                        <span className="dashboard-category-name">{c.name}</span>
                                        <span className="dashboard-category-val">{c.value}%</span>
                                    </div>
                                )) : (
                                    <div className="dashboard-empty-subtle">Add products to see data</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Low Stock Alert */}
                    {lowStockProducts.length > 0 && (
                        <div className="card dashboard-lowstock-card dashboard-lowstock-clickable" onClick={() => onOpenLowStock?.()} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenLowStock?.(); }}>
                            <div className="card-header dashboard-lowstock-header">
                                <div className="dashboard-lowstock-title-wrap">
                                    <AlertTriangle size={16} color="#dc2626" />
                                    <div>
                                        <span className="card-title dashboard-lowstock-title">LS Alert</span>
                                        <div className="dashboard-lowstock-subtitle">{lowStockProducts.length} items need restocking</div>
                                    </div>
                                </div>
                                <button className="btn btn-ghost btn-sm dashboard-lowstock-btn" onClick={(e) => { e.stopPropagation(); onNavigate('inventory'); }}>Fix Now</button>
                            </div>
                            <div className="dashboard-lowstock-list">
                                {lowStockProducts.slice(0, 3).map(p => (
                                    <div key={p.id} className="dashboard-lowstock-row">
                                        <div className="dashboard-lowstock-dot" style={{ background: p.stock === 0 ? '#ef4444' : '#f59e0b' }} />
                                        <span className="dashboard-lowstock-name">{p.name}</span>
                                        <span className="dashboard-lowstock-value" style={{ color: p.stock === 0 ? '#dc2626' : '#d97706' }}>{p.stock} {p.unit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Top Products Table */}
            <div className="card">
                <div className="card-header">
                    <span className="card-title">Top Selling Products</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('inventory')}>View Inventory</button>
                </div>
                <div className="table-wrapper table-flat">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Product Name</th>
                                <th className="align-right">Units Sold</th>
                                <th className="align-right">Revenue</th>
                                <th className="align-right">Trend</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topProducts.length > 0 ? topProducts.map((p, i) => (
                                <tr key={p.name}>
                                    <td><span style={{ fontWeight: 700, color: '#9ca3af', fontSize: '0.8rem' }}>#{i + 1}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Package size={14} color="#3b82f6" />
                                            </div>
                                            <span style={{ fontWeight: 600, color: '#1f2937' }}>{p.name}</span>
                                        </div>
                                    </td>
                                    <td className="amount-cell" style={{ color: '#374151', fontWeight: 500 }}>{p.qty} units</td>
                                    <td className="amount-cell" style={{ fontWeight: 700, color: '#1f2937' }}>{currency(p.sales)}</td>
                                    <td className="amount-cell">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden', minWidth: 80 }}>
                                                <div style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(90deg,#3b82f6,#14b8a6)', width: `${Math.round((p.sales / topProducts[0].sales) * 100)}%` }} />
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: '#6b7280', width: 36, textAlign: 'right' }}>
                                                {Math.round((p.sales / topProducts[0].sales) * 100)}%
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#9ca3af', fontSize: '0.875rem' }}>No sales data yet. Create your first invoice!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
