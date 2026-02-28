// =====================================================
// Reports.jsx — Analytics & Reports Module
// =====================================================
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
    Download, BarChart3, TrendingUp, FileText, Filter,
    Calendar, DollarSign, Activity, ArrowUpRight, ArrowDownRight,
    PieChart as PieIcon
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import toast from 'react-hot-toast';

// Mock data moved inside component for dynamic computation

const CustomTooltip = ({ active, payload, label, currency }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
            <div style={{ fontWeight: 700, marginBottom: 8, color: '#1f2937', fontSize: '0.85rem', borderBottom: '1px solid #f1f5f9', paddingBottom: 4 }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.78rem', marginBottom: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color || p.fill }} />
                    <span style={{ color: '#6b7280' }}>{p.name}:</span>
                    <span style={{ fontWeight: 700, color: '#1f2937' }}>{currency(p.value)}</span>
                </div>
            ))}
        </div>
    );
};

export default function Reports() {
    const { products, invoices, business, currency } = useApp();
    const [period, setPeriod] = useState('6m');
    const [reportType, setReportType] = useState('sales');

    // ── DATA COMPUTATION ────────────────────────────

    // 1. Monthly Data
    const getMonthlyData = () => {
        const months = [];
        const now = new Date();
        const count = period === '1y' ? 12 : period === '3m' ? 3 : 6;
        for (let i = count - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mLabel = d.toLocaleString('default', { month: 'short', year: '2-digit' });
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

            const monthInvoices = invoices.filter(inv => inv.date.startsWith(key));
            const sales = monthInvoices.reduce((sum, inv) => sum + inv.total, 0);
            const gst = monthInvoices.reduce((sum, inv) => sum + (inv.taxAmount || 0), 0);
            const purchases = monthInvoices.reduce((sum, inv) => sum * 0.6, 0); // Placeholder
            const profit = sales * 0.35; // Placeholder

            months.push({
                month: mLabel,
                sales,
                purchases: sales * 0.6,
                expenses: sales * 0.05,
                profit: sales * 0.35,
                invoices: monthInvoices.length,
                gst
            });
        }
        return months;
    };
    const monthlyData = getMonthlyData();

    // 2. Category Data
    const getCategoryData = () => {
        const categories = {};
        invoices.forEach(inv => {
            inv.items?.forEach(item => {
                const prod = products.find(p => p.id === item.productId);
                const cat = prod?.category || item.category || 'Uncategorized';
                if (!categories[cat]) categories[cat] = 0;
                categories[cat] += item.amount;
            });
        });
        const colors = ['#3b82f6', '#14b8a6', '#a855f7', '#f59e0b', '#22c55e', '#6b7280'];
        return Object.entries(categories).map(([name, value], i) => ({
            name, value, color: colors[i % colors.length]
        })).sort((a, b) => b.value - a.value).slice(0, 5);
    };
    const categoryData = getCategoryData();

    // 3. Payment Status
    const getPaymentStatus = () => {
        const stats = { paid: 0, partial: 0, unpaid: 0 };
        invoices.forEach(inv => {
            if (inv.status === 'paid') stats.paid++;
            else if (inv.status === 'partial') stats.partial++;
            else stats.unpaid++;
        });
        const total = invoices.length || 1;
        return [
            { name: 'Paid', value: Math.round((stats.paid / total) * 100), color: '#22c55e' },
            { name: 'Partial', value: Math.round((stats.partial / total) * 100), color: '#f59e0b' },
            { name: 'Unpaid', value: Math.round((stats.unpaid / total) * 100), color: '#ef4444' },
        ];
    };
    const paymentStatus = getPaymentStatus();

    const currentMonth = monthlyData[monthlyData.length - 1];
    const prevMonth = monthlyData[monthlyData.length - 2] || { sales: 0, profit: 0 };

    const salesGrowth = prevMonth.sales > 0 ? (((currentMonth.sales - prevMonth.sales) / prevMonth.sales) * 100).toFixed(1) : '0.0';
    const profitGrowth = prevMonth.profit > 0 ? (((currentMonth.profit - prevMonth.profit) / prevMonth.profit) * 100).toFixed(1) : '0.0';
    const totalTax = monthlyData.reduce((s, m) => s + m.gst, 0);
    const totalProfit = monthlyData.reduce((s, m) => s + m.profit, 0);

    const handleExport = (type) => {
        toast.success(`${type.toUpperCase()} report downloaded successfully!\n\nFile: MyBillBook_Report_Feb2024.${type}`);
    };

    return (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
            {/* Page Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div className="tabs">
                    {[
                        { id: 'sales', label: 'Sales Report' },
                        { id: 'pl', label: 'P&L' },
                        { id: 'tax', label: 'Tax Summary' },
                        { id: 'stock', label: 'Stock Report' },
                    ].map(t => (
                        <button key={t.id} className={`tab-btn ${reportType === t.id ? 'active' : ''}`}
                            onClick={() => setReportType(t.id)}>
                            {t.label}
                        </button>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <select className="form-select" style={{ width: 150 }} value={period} onChange={e => setPeriod(e.target.value)}>
                        <option value="1m">This Month</option>
                        <option value="3m">Last 3 Months</option>
                        <option value="6m">Last 6 Months</option>
                        <option value="1y">This Year</option>
                    </select>
                    <button className="btn btn-outline btn-sm" onClick={() => handleExport('pdf')}>
                        <Download size={14} /> PDF
                    </button>
                    <button className="btn btn-success btn-sm" onClick={() => handleExport('xlsx')}>
                        <Download size={14} /> Excel
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="stats-grid" style={{ marginBottom: 20 }}>
                {[
                    {
                        label: `Total Sales (${currentMonth.month})`,
                        value: currency(currentMonth.sales),
                        change: `${salesGrowth >= 0 ? '+' : ''}${salesGrowth}%`, up: salesGrowth >= 0, cls: 'blue',
                    },
                    {
                        label: `Net Profit (${currentMonth.month})`,
                        value: currency(currentMonth.profit),
                        change: `${profitGrowth >= 0 ? '+' : ''}${profitGrowth}%`, up: profitGrowth >= 0, cls: 'green',
                    },
                    {
                        label: `Total ${business.taxLabel || 'Tax'} Collected`,
                        value: currency(totalTax),
                        change: '+0.0%', up: true, cls: 'purple',
                    },
                    {
                        label: 'Cumulative Profit',
                        value: currency(totalProfit),
                        change: '+28.5%', up: true, cls: 'teal',
                    },
                ].map(s => (
                    <div key={s.label} className={`stat-card ${s.cls}`}>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-value" style={{ fontSize: '1.3rem', marginTop: 4 }}>{s.value}</div>
                        <span className={`stat-change ${s.up ? 'up' : 'down'}`} style={{ width: 'fit-content', marginTop: 4 }}>
                            {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {s.change}
                        </span>
                    </div>
                ))}
            </div>

            {/* ── SALES REPORT ── */}
            {reportType === 'sales' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Revenue Area Chart */}
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">Monthly Sales Trend</span>
                        </div>
                        <div style={{ padding: '16px 8px' }}>
                            <ResponsiveContainer width="100%" height={260}>
                                <AreaChart data={monthlyData}>
                                    <defs>
                                        <linearGradient id="salesGrad2" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                                        tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip content={(props) => <CustomTooltip {...props} currency={currency} />} />
                                    <Area type="monotone" dataKey="sales" name="Sales" stroke="#3b82f6" strokeWidth={2.5} fill="url(#salesGrad2)" />
                                    <Area type="monotone" dataKey="purchases" name="Purchases" stroke="#a855f7" strokeWidth={2} strokeDasharray="4 2" fill="none" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid-2">
                        {/* Category Breakdown */}
                        <div className="card">
                            <div className="card-header"><span className="card-title">Revenue by Category</span></div>
                            <div style={{ display: 'flex', alignItems: 'center', padding: '16px' }}>
                                <ResponsiveContainer width="50%" height={180}>
                                    <PieChart>
                                        <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                                            {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                        </Pie>
                                        <Tooltip formatter={v => currency(v)} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ flex: 1 }}>
                                    {categoryData.length > 0 ? categoryData.map(c => (
                                        <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                                            <span style={{ fontSize: '0.78rem', flex: 1, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                                            <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{currency(c.value)}</span>
                                        </div>
                                    )) : (
                                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic', padding: '20px 0' }}>No category data</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Payment Status */}
                        <div className="card">
                            <div className="card-header"><span className="card-title">Payment Status</span></div>
                            <div style={{ display: 'flex', alignItems: 'center', padding: '16px' }}>
                                <ResponsiveContainer width="50%" height={180}>
                                    <PieChart>
                                        <Pie data={paymentStatus} cx="50%" cy="50%" outerRadius={70} dataKey="value">
                                            {paymentStatus.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                        </Pie>
                                        <Tooltip formatter={v => `${v}%`} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ flex: 1 }}>
                                    {paymentStatus.map(s => (
                                        <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                                            <span style={{ fontSize: '0.78rem', flex: 1, color: '#374151' }}>{s.name}</span>
                                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: s.color }}>{s.value}%</span>
                                        </div>
                                    ))}
                                    <div style={{ marginTop: 12, padding: '10px', background: '#f8fafc', borderRadius: 8 }}>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total Invoices</div>
                                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1f2937' }}>
                                            {invoices.length}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Summary Table */}
                    <div className="card">
                        <div className="card-header"><span className="card-title">Monthly Summary</span></div>
                        <div className="table-wrapper" style={{ borderRadius: 0, border: 'none' }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Month</th>
                                        <th>Sales</th>
                                        <th>Purchases</th>
                                        <th>Expenses</th>
                                        <th>Net Profit</th>
                                        <th>Invoices</th>
                                        <th>GST Collected</th>
                                        <th>Margin</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthlyData.map((row) => {
                                        const margin = ((row.profit / row.sales) * 100).toFixed(1);
                                        return (
                                            <tr key={row.month}>
                                                <td style={{ fontWeight: 700, color: '#1f2937' }}>{row.month}</td>
                                                <td style={{ fontWeight: 600, color: '#2563eb' }}>{currency(row.sales)}</td>
                                                <td>{currency(row.purchases)}</td>
                                                <td style={{ color: '#dc2626' }}>{currency(row.expenses)}</td>
                                                <td style={{ fontWeight: 700, color: '#16a34a' }}>{currency(row.profit)}</td>
                                                <td>{row.invoices}</td>
                                                <td style={{ color: '#7c3aed' }}>{currency(row.gst)}</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3, minWidth: 60, overflow: 'hidden' }}>
                                                            <div style={{ height: '100%', background: '#22c55e', borderRadius: 3, width: `${margin}%` }} />
                                                        </div>
                                                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#16a34a' }}>{margin}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ── P&L REPORT ── */}
            {reportType === 'pl' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="card">
                        <div className="card-header"><span className="card-title">Profit & Loss — Bar Chart</span></div>
                        <div style={{ padding: '16px 8px' }}>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={monthlyData} barSize={20}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip content={(props) => <CustomTooltip {...props} currency={currency} />} />
                                    <Bar dataKey="sales" name="Sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="profit" name="Profit" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header"><span className="card-title">P&L Statement — {currentMonth.month}</span></div>
                        <div style={{ padding: '20px 24px' }}>
                            {[
                                {
                                    label: 'INCOME', rows: [
                                        { label: 'Sales Revenue', value: 89000 },
                                        { label: 'Other Income', value: 1200 },
                                    ], total: 90200, isIncome: true
                                },
                                {
                                    label: 'COST OF GOODS SOLD', rows: [
                                        { label: 'Purchases', value: 52000 },
                                        { label: 'Freight Inward', value: 800 },
                                    ], total: 52800, isIncome: false
                                },
                                {
                                    label: 'OPERATING EXPENSES', rows: [
                                        { label: 'Rent', value: 8000 },
                                        { label: 'Salary', value: 12000 },
                                        { label: 'Utilities', value: 1200 },
                                        { label: 'Miscellaneous', value: 600 },
                                    ], total: 21800, isIncome: false
                                },
                            ].map(section => (
                                <div key={section.label} style={{ marginBottom: 20 }}>
                                    <div style={{ fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, color: '#6b7280' }}>
                                        {section.label}
                                    </div>
                                    {section.rows.map(row => (
                                        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 12px', fontSize: '0.875rem', borderBottom: '1px solid #f8fafc' }}>
                                            <span style={{ color: '#374151' }}>{row.label}</span>
                                            <span style={{ fontWeight: 600 }}>{currency(row.value)}</span>
                                        </div>
                                    ))}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', background: '#f8fafc', borderRadius: 6, fontWeight: 800, marginTop: 4 }}>
                                        <span>Total {section.label.split(' ')[0]}</span>
                                        <span style={{ color: section.isIncome ? '#16a34a' : '#dc2626' }}>
                                            {section.isIncome ? '' : '- '}{section.total.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 12px', background: 'linear-gradient(135deg,#dcfce7,#f0fdf4)', borderRadius: 10, borderLeft: '4px solid #22c55e', fontSize: '1.1rem', fontWeight: 900 }}>
                                <span style={{ color: '#1f2937' }}>NET PROFIT</span>
                                <span style={{ color: '#16a34a' }}>{currency(16600)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── TAX SUMMARY ── */}
            {reportType === 'tax' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="card">
                        <div className="card-header"><span className="card-title">GST Summary — February 2024</span></div>
                        <div style={{ padding: '20px 24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                                {[
                                    { label: 'Output GST (Collected)', value: currency(8010), sub: 'From sales', color: '#22c55e' },
                                    { label: 'Input GST (Paid)', value: currency(4680), sub: 'On purchases', color: '#3b82f6' },
                                    { label: 'Net GST Payable', value: currency(3330), sub: 'To file with GSTN', color: '#f59e0b' },
                                    { label: 'IGST', value: currency(0), sub: 'Interstate supply', color: '#a855f7' },
                                ].map(s => (
                                    <div key={s.label} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px', borderLeft: `4px solid ${s.color}` }}>
                                        <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>{s.label}</div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color, marginTop: 6 }}>{s.value}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4 }}>{s.sub}</div>
                                    </div>
                                ))}
                            </div>

                            {/* GST rate-wise table */}
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>GST Rate</th>
                                            <th>Taxable Amount</th>
                                            <th>CGST</th>
                                            <th>SGST</th>
                                            <th>IGST</th>
                                            <th>Total Tax</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { rate: '0%', taxable: 12400, cgst: 0, sgst: 0, igst: 0 },
                                            { rate: '5%', taxable: 42000, cgst: 1050, sgst: 1050, igst: 0 },
                                            { rate: '12%', taxable: 18000, cgst: 1080, sgst: 1080, igst: 0 },
                                            { rate: '18%', taxable: 8200, cgst: 738, sgst: 738, igst: 0 },
                                            { rate: '28%', taxable: 1200, cgst: 168, sgst: 168, igst: 0 },
                                        ].map(row => (
                                            <tr key={row.rate}>
                                                <td style={{ fontWeight: 700 }}>{row.rate}</td>
                                                <td>{currency(row.taxable)}</td>
                                                <td>{currency(row.cgst)}</td>
                                                <td>{currency(row.sgst)}</td>
                                                <td>{currency(row.igst)}</td>
                                                <td style={{ fontWeight: 700, color: '#7c3aed' }}>{currency(row.cgst + row.sgst + row.igst)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── STOCK REPORT ── */}
            {reportType === 'stock' && (
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Stock Valuation Report</span>
                        <button className="btn btn-outline btn-sm" onClick={() => handleExport('pdf')}><Download size={14} /> Export</button>
                    </div>
                    <div className="table-wrapper" style={{ borderRadius: 0, border: 'none' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Product Name</th>
                                    <th>Category</th>
                                    <th>Current Stock</th>
                                    <th>Unit</th>
                                    <th>Purchase Price</th>
                                    <th>Sale Price</th>
                                    <th>Stock Value</th>
                                    <th>Potential Revenue</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.id}>
                                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                                        <td><span className="badge badge-gray">{p.category}</span></td>
                                        <td style={{ fontWeight: 700, color: p.stock <= p.minStock ? '#dc2626' : '#1f2937' }}>{p.stock}</td>
                                        <td style={{ color: '#6b7280', fontSize: '0.82rem' }}>{p.unit}</td>
                                        <td>{currency(p.purchasePrice)}</td>
                                        <td>{currency(p.salePrice)}</td>
                                        <td style={{ fontWeight: 700 }}>{currency(p.stock * p.purchasePrice)}</td>
                                        <td style={{ fontWeight: 700, color: '#16a34a' }}>{currency(p.stock * p.salePrice)}</td>
                                        <td>
                                            {p.stock === 0 ? <span className="badge badge-danger">Out of Stock</span> :
                                                p.stock <= p.minStock ? <span className="badge badge-warning">Low Stock</span> :
                                                    <span className="badge badge-success">In Stock</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
