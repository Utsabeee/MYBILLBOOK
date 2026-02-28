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

export default function Dashboard({ onNavigate }) {
    const { invoices, products, customers, lowStockProducts, pendingPayments, business, currency, user } = useApp();

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
        unpaid: { cls: 'badge-danger', label: 'Unpaid' },
        partial: { cls: 'badge-warning', label: 'Partial' },
    };

    return (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
            {/* Welcome Bar */}
            <div style={{
                background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 40%, #0d9488 100%)',
                borderRadius: 'var(--radius-lg)', padding: '20px 28px', marginBottom: 24,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: '0 8px 24px rgba(37,99,235,0.25)', overflow: 'hidden', position: 'relative',
            }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: -30, right: 120, width: 80, height: 80, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
                <div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 500, marginBottom: 4 }}>
                        Welcome back, {user?.displayName || (business?.name?.split(' ')[0] || 'Friend')} 👋
                    </div>
                    <div style={{ color: 'white', fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Poppins,sans-serif' }}>
                        This Month's Revenue: {currency(totalRevMonth)}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginTop: 4 }}>
                        📈 {revGrowth}% growth vs last month — Great work!
                    </div>
                </div>
                <button className="btn" onClick={() => onNavigate('billing')} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 10, backdropFilter: 'blur(4px)', flexShrink: 0 }}>
                    + New Invoice
                </button>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid" style={{ marginBottom: 24 }}>
                <div className="stat-card blue">
                    <div className="stat-card-header">
                        <div>
                            <div className="stat-label">Monthly Revenue</div>
                            <div className="stat-value">{currency(totalRevMonth)}</div>
                        </div>
                        <div className="stat-icon blue"><DollarSign size={22} /></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="stat-change up"><ArrowUpRight size={12} /> {revGrowth}%</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>vs last month</span>
                    </div>
                </div>

                <div className="stat-card green">
                    <div className="stat-card-header">
                        <div>
                            <div className="stat-label">Sales Today</div>
                            <div className="stat-value">{currency(salesToday)}</div>
                        </div>
                        <div className="stat-icon green"><TrendingUp size={22} /></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="stat-change up"><ArrowUpRight size={12} /> 8.4%</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>vs yesterday</span>
                    </div>
                </div>

                <div className="stat-card orange">
                    <div className="stat-card-header">
                        <div>
                            <div className="stat-label">Pending Payments</div>
                            <div className="stat-value">{currency(pendingPayments)}</div>
                        </div>
                        <div className="stat-icon orange"><Clock size={22} /></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="stat-change down"><ArrowDownRight size={12} /> {pendingCount} invoices</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>overdue</span>
                    </div>
                </div>

                <div className="stat-card purple">
                    <div className="stat-card-header">
                        <div>
                            <div className="stat-label">Total Invoices</div>
                            <div className="stat-value">{invoices.length}</div>
                        </div>
                        <div className="stat-icon purple"><FileText size={22} /></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="stat-change up"><CheckCircle size={12} /> {paidInvoices} paid</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pendingCount} pending</span>
                    </div>
                </div>

                <div className="stat-card teal">
                    <div className="stat-card-header">
                        <div>
                            <div className="stat-label">Products</div>
                            <div className="stat-value">{products.length}</div>
                        </div>
                        <div className="stat-icon teal"><Package size={22} /></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {lowStockProducts.length > 0 ? (
                            <span className="stat-change down"><AlertTriangle size={12} /> {lowStockProducts.length} low stock</span>
                        ) : (
                            <span className="stat-change up"><CheckCircle size={12} /> All stocked</span>
                        )}
                    </div>
                </div>

                <div className="stat-card red">
                    <div className="stat-card-header">
                        <div>
                            <div className="stat-label">Customers</div>
                            <div className="stat-value">{customers.filter(c => c.type !== 'supplier').length}</div>
                        </div>
                        <div className="stat-icon red"><Users size={22} /></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="stat-change up"><ArrowUpRight size={12} /> 2 new</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>this month</span>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid-2" style={{ marginBottom: 24 }}>
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Revenue vs Expenses</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Last 6 months</span>
                    </div>
                    <div style={{ padding: '16px 8px' }}>
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
                    <div style={{ padding: '16px 8px' }}>
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
            <div className="grid-2" style={{ marginBottom: 24 }}>
                {/* Recent Transactions */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Recent Transactions</span>
                        <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('billing')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Eye size={14} /> View All
                        </button>
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        {recentInvoices.map((inv, i) => {
                            const cfg = statusConfig[inv.status];
                            return (
                                <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: i < recentInvoices.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.15s', cursor: 'pointer' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <FileText size={16} color="#3b82f6" />
                                    </div>
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.84rem', color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.customer || 'Unknown'}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{inv.invoiceNo} · {inv.date}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1f2937' }}>{currency(inv.total)}</div>
                                        <span className={`badge ${cfg.cls}`} style={{ marginTop: 2 }}>{cfg.label}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Category Distribution */}
                    <div className="card" style={{ flex: 1 }}>
                        <div className="card-header">
                            <span className="card-title">Sales by Category</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px' }}>
                            <ResponsiveContainer width="50%" height={140}>
                                <PieChart>
                                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={3}>
                                        {categoryData.map((entry, idx) => (
                                            <Cell key={idx} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ flex: 1 }}>
                                {categoryData.length > 0 ? categoryData.map(c => (
                                    <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                                        <span style={{ fontSize: '0.75rem', color: '#374151', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1f2937' }}>{c.value}%</span>
                                    </div>
                                )) : (
                                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic' }}>Add products to see data</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Low Stock Alert */}
                    {lowStockProducts.length > 0 && (
                        <div className="card" style={{ border: '1px solid #fee2e2' }}>
                            <div className="card-header" style={{ background: '#fef2f2', borderBottom: '1px solid #fee2e2' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <AlertTriangle size={16} color="#dc2626" />
                                    <span className="card-title" style={{ color: '#dc2626' }}>Low Stock Alert</span>
                                </div>
                                <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('inventory')} style={{ fontSize: '0.75rem' }}>Fix Now</button>
                            </div>
                            <div style={{ padding: '8px 0' }}>
                                {lowStockProducts.slice(0, 3).map(p => (
                                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px' }}>
                                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.stock === 0 ? '#ef4444' : '#f59e0b', flexShrink: 0 }} />
                                        <span style={{ flex: 1, fontSize: '0.8rem', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: p.stock === 0 ? '#dc2626' : '#d97706' }}>{p.stock} {p.unit}</span>
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
                <div className="table-wrapper" style={{ borderRadius: 0, border: 'none' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Product Name</th>
                                <th>Units Sold</th>
                                <th>Revenue</th>
                                <th>Trend</th>
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
                                    <td style={{ color: '#374151', fontWeight: 500 }}>{p.qty} units</td>
                                    <td style={{ fontWeight: 700, color: '#1f2937' }}>{currency(p.sales)}</td>
                                    <td>
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
