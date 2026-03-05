// =====================================================
// Inventory.jsx — Product & Stock Management
// =====================================================
import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
    Plus, Search, Edit3, Trash2, X, Package, AlertTriangle,
    ArrowUp, ArrowDown, Filter, TrendingUp, BarChart3,
    ChevronDown, Tag, ChevronRight
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell
} from 'recharts';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Food & Grocery', 'Beverages', 'Dairy', 'Personal Care', 'Cooking Essentials', 'Other'];
const GST_RATES = [0, 5, 12, 18, 28];
const UNITS = ['PCS', 'KG', 'LTR', 'PKT', 'BOX', 'TUBE', 'GRM', 'METER'];

const AVATAR_COLORS_PROD = [
    '#3b82f6', '#14b8a6', '#a855f7', '#f59e0b', '#ef4444', '#22c55e', '#ec4899', '#0ea5e9',
];

function StockTooltip({ active, payload, label }) {
    if (!active || !payload || payload.length === 0) return null;

    const currentStock = payload.find(p => p.dataKey === 'stock')?.value ?? 0;
    const minStock = payload.find(p => p.dataKey === 'min')?.value ?? 0;

    return (
        <div className="stock-tooltip">
            <div className="stock-tooltip-title">{label}</div>
            <div className="stock-tooltip-row">
                <span className="stock-tooltip-key">Current</span>
                <span className="stock-tooltip-val">{currentStock}</span>
            </div>
            <div className="stock-tooltip-row">
                <span className="stock-tooltip-key">Minimum</span>
                <span className="stock-tooltip-val muted">{minStock}</span>
            </div>
        </div>
    );
}

// ── Product Form Modal ──
function ProductModal({ product, onClose, onSave }) {
    const [form, setForm] = useState(product || {
        name: '', sku: '', category: 'Food & Grocery', unit: 'PCS',
        salePrice: '', purchasePrice: '', stock: '', minStock: 10,
        taxRate: 5, barcode: '',
    });
    const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleSave = (e) => {
        e.preventDefault();
        if (!form.name || !form.salePrice) { toast.error('Name and Sale Price are required'); return; }
        onSave({
            ...form,
            salePrice: parseFloat(form.salePrice),
            purchasePrice: parseFloat(form.purchasePrice) || 0,
            stock: parseInt(form.stock) || 0,
            minStock: parseInt(form.minStock) || 10,
            sku: form.sku || `SKU-${Date.now().toString().slice(-6)}`,
        });
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h3 className="modal-title">{product ? 'Edit Product' : 'Add New Product'}</h3>
                    <button className="modal-close" onClick={onClose}><X size={16} /></button>
                </div>
                <form onSubmit={handleSave}>
                    <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Product Name *</label>
                                <input className="form-control" value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Basmati Rice 1KG" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">SKU / Item Code</label>
                                <input className="form-control" value={form.sku} onChange={e => update('sku', e.target.value)} placeholder="Auto-generated if blank" />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select className="form-select" value={form.category} onChange={e => update('category', e.target.value)}>
                                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Unit</label>
                                <select className="form-select" value={form.unit} onChange={e => update('unit', e.target.value)}>
                                    {UNITS.map(u => <option key={u}>{u}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="form-row-3">
                            <div className="form-group">
                                <label className="form-label">Sale Price (currency) *</label>
                                <input className="form-control" type="number" min="0" step="0.01" value={form.salePrice} onChange={e => update('salePrice', e.target.value)} placeholder="0.00" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Purchase Price (currency)</label>
                                <input className="form-control" type="number" min="0" step="0.01" value={form.purchasePrice} onChange={e => update('purchasePrice', e.target.value)} placeholder="0.00" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Tax Rate</label>
                                <select className="form-select" value={form.taxRate} onChange={e => update('taxRate', parseInt(e.target.value))}>
                                    {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Opening Stock</label>
                                <input className="form-control" type="number" min="0" value={form.stock} onChange={e => update('stock', e.target.value)} placeholder="0" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Minimum Stock Alert</label>
                                <input className="form-control" type="number" min="0" value={form.minStock} onChange={e => update('minStock', e.target.value)} placeholder="10" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Barcode <span style={{ color: '#9ca3af', fontWeight: 400 }}>(Optional)</span></label>
                            <input className="form-control" value={form.barcode} onChange={e => update('barcode', e.target.value)} placeholder="Scan or enter barcode" />
                        </div>

                        {form.salePrice > 0 && form.purchasePrice > 0 && (
                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', fontSize: '0.84rem' }}>
                                <span style={{ color: '#15803d', fontWeight: 700 }}>
                                    Profit Margin: {(parseFloat(form.salePrice) - parseFloat(form.purchasePrice)).toFixed(2)}
                                    ({(((parseFloat(form.salePrice) - parseFloat(form.purchasePrice)) / parseFloat(form.purchasePrice)) * 100).toFixed(1)}%)
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary"><Plus size={16} />{product ? 'Update Product' : 'Add Product'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Stock Adjust Modal ──
function StockAdjustModal({ product, onClose, onAdjust }) {
    const [mode, setMode] = useState('in');
    const [qty, setQty] = useState('');
    const [note, setNote] = useState('');

    const handle = () => {
        const q = parseInt(qty);
        if (!q || q <= 0) { toast.error('Enter valid quantity'); return; }
        onAdjust(product.id, mode === 'in' ? q : -q);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal modal-sm">
                <div className="modal-header">
                    <h3 className="modal-title">Adjust Stock</h3>
                    <button className="modal-close" onClick={onClose}><X size={16} /></button>
                </div>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#1f2937' }}>{product.name}</div>
                        <div style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: 2 }}>
                            Current Stock: <b style={{ color: product.stock <= product.minStock ? '#dc2626' : '#16a34a' }}>{product.stock} {product.unit}</b>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className={`btn ${mode === 'in' ? 'btn-success' : 'btn-ghost'}`} style={{ flex: 1 }} onClick={() => setMode('in')}>
                            <ArrowUp size={16} /> Stock In
                        </button>
                        <button className={`btn ${mode === 'out' ? 'btn-danger' : 'btn-ghost'}`} style={{ flex: 1 }} onClick={() => setMode('out')}>
                            <ArrowDown size={16} /> Stock Out
                        </button>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Quantity ({product.unit})</label>
                        <input type="number" min="1" className="form-control" value={qty} onChange={e => setQty(e.target.value)} placeholder="Enter quantity" style={{ fontSize: '1.2rem', textAlign: 'center', fontWeight: 700 }} />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Reason / Note</label>
                        <input className="form-control" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Purchase from supplier, Damaged goods..." />
                    </div>

                    {qty && (
                        <div style={{ background: mode === 'in' ? '#f0fdf4' : '#fef2f2', border: `1px solid ${mode === 'in' ? '#bbf7d0' : '#fee2e2'}`, borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
                            <span style={{ fontWeight: 700, color: mode === 'in' ? '#15803d' : '#dc2626', fontSize: '0.9rem' }}>
                                New Stock: {mode === 'in' ? product.stock + parseInt(qty) : Math.max(0, product.stock - parseInt(qty))} {product.unit}
                            </span>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                    <button className={`btn ${mode === 'in' ? 'btn-success' : 'btn-danger'}`} onClick={handle}>
                        {mode === 'in' ? '+ Add Stock' : '- Remove Stock'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Inventory Page ──
export default function Inventory() {
    const { products, addProduct, updateProduct, deleteProduct, adjustStock, lowStockProducts , currency } = useApp();
    const [category, setCategory] = useState('All');
    const [stockTab, setStockTab] = useState('all');
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [adjustProd, setAdjustProd] = useState(null);
    const [sortBy, setSortBy] = useState('name');
    const [chartStartIndex, setChartStartIndex] = useState(0);

    // Memoized filtered list to prevent lag
    const filtered = useMemo(() =>
        products.filter(p => {
            const matchCat = category === 'All' || p.category === category;
            const matchStockTab = stockTab === 'all' || p.stock <= p.minStock;
            const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.sku.toLowerCase().includes(search.toLowerCase());
            return matchCat && matchStockTab && matchSearch;
        }).sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'stock') return a.stock - b.stock;
            if (sortBy === 'price') return b.salePrice - a.salePrice;
            return 0;
        }),
    [products, category, stockTab, search, sortBy]);

    // Memoized stock chart data - configurable chart display limit
    const CHART_ITEMS = 8; // Adjust based on screen size or make responsive
    const stockChartData = useMemo(() => {
        const start = Math.min(chartStartIndex, Math.max(0, products.length - CHART_ITEMS));
        return products.slice(start, start + CHART_ITEMS).map(p => ({
            name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name, // Dynamic truncation
            stock: p.stock,
            min: p.minStock,
        }));
    }, [products, chartStartIndex]);

    // Memoized total stock value - with null/undefined safety
    const totalStockValue = useMemo(() =>
        products.reduce((s, p) => s + ((p.stock || 0) * (p.purchasePrice || 0)), 0),
    [products]);

    return (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
                {[
                    { label: 'Total Products', value: products.length, cls: 'blue' },
                    { label: 'LS Items', value: lowStockProducts.length, cls: lowStockProducts.length > 0 ? 'red' : 'green' },
                    { label: 'Total Stock Value', value: currency(totalStockValue), cls: 'teal' },
                    { label: 'O/S', value: products.filter(p => p.stock === 0).length, cls: 'orange' },
                ].map(s => (
                    <div key={s.label} className={`stat-card ${s.cls}`}>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-value stat-value-amount" style={{ fontSize: '1.4rem' }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Stock Chart with Slider */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                    <span className="card-title">Stock Level Overview</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Products {chartStartIndex + 1}-{Math.min(chartStartIndex + CHART_ITEMS, products.length)} of {products.length}</span>
                </div>
                <div style={{ padding: '8px' }}>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={stockChartData} barSize={35}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<StockTooltip />} cursor={{ fill: 'rgba(59,130,246,0.12)' }} />
                            <Bar dataKey="stock" name="Current Stock" radius={[4, 4, 0, 0]}>
                                {stockChartData.map((entry, i) => (
                                    <Cell key={i} fill={entry.stock <= entry.min ? '#ef4444' : '#3b82f6'} />
                                ))}
                            </Bar>
                            <Bar dataKey="min" name="Min Stock" radius={[4, 4, 0, 0]} fill="#fbbf24" opacity={0.5} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                {products.length > CHART_ITEMS && (
                    <div style={{ padding: '12px 16px' }}>
                        <input
                            type="range"
                            min="0"
                            max={Math.max(0, products.length - CHART_ITEMS)}
                            value={chartStartIndex}
                            onChange={(e) => setChartStartIndex(parseInt(e.target.value))}
                            style={{ width: '100%', cursor: 'pointer' }}
                        />
                    </div>
                )}
            </div>

            {/* Products Table Card */}
            <div className="card">
                {/* Filters */}
                <div className="filter-bar inventory-filter-bar">
                    <div className="search-input-wrap inventory-search-wrap">
                        <Search />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products or SKU..." />
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setStockTab('all')}
                            className={`btn btn-sm ${stockTab === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                        >
                            All Items ({products.length})
                        </button>
                        <button
                            onClick={() => setStockTab('low')}
                            className={`btn btn-sm ${stockTab === 'low' ? 'btn-primary' : 'btn-ghost'}`}
                        >
                            Low Stock ({lowStockProducts.length})
                        </button>
                    </div>

                    {/* Category pills */}
                    <div className="inventory-cat-pills">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`btn btn-sm inventory-cat-btn ${category === cat ? 'btn-primary' : 'btn-ghost'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="inventory-actions-wrap">
                        <select className="form-select inventory-sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                            <option value="name">Sort: Name</option>
                            <option value="stock">Sort: Stock</option>
                            <option value="price">Sort: Price</option>
                        </select>
                        <button className="btn btn-primary" onClick={() => { setEditProduct(null); setShowForm(true); }}>
                            <Plus size={16} /> Add Product
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="table-wrapper table-flat">
                    {filtered.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon"><Package size={36} /></div>
                            <h3>No products found</h3>
                            <p>
                                {stockTab === 'low'
                                    ? 'No low stock items match the current filters.'
                                    : 'Add your first product to start managing inventory'}
                            </p>
                            {stockTab !== 'low' && (
                                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                                    <Plus size={16} /> Add Product
                                </button>
                            )}
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>SKU</th>
                                    <th className="align-right">Sale Price</th>
                                    <th className="align-right">Purchase Price</th>
                                    <th>Stock</th>
                                    <th className="align-right">Tax %</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((p, pidx) => {
                                    const isLow = p.stock <= p.minStock;
                                    const isOut = p.stock === 0;
                                    const stockPct = Math.min(100, Math.round((p.stock / (p.minStock * 3)) * 100));
                                    const colorIdx = pidx % AVATAR_COLORS_PROD.length;

                                    return (
                                        <tr key={p.id}>
                                            <td>
                                                <div className="inventory-product-cell">
                                                    <div className="inventory-product-icon" style={{ background: `${AVATAR_COLORS_PROD[colorIdx]}20` }}>
                                                        <Package size={16} style={{ color: AVATAR_COLORS_PROD[colorIdx] }} />
                                                    </div>
                                                    <div>
                                                        <div className="inventory-product-name">{p.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge badge-gray">{p.category}</span>
                                            </td>
                                            <td className="inventory-sku-cell">{p.sku}</td>
                                            <td className="amount-cell" style={{ fontWeight: 700 }}>{currency(p.salePrice)}</td>
                                            <td className="amount-cell inventory-purchase-cell">{currency(p.purchasePrice)}</td>
                                            <td>
                                                <div className="inventory-stock-wrap">
                                                    <div className="inventory-stock-top">
                                                        {isOut ? (
                                                            <AlertTriangle size={12} color="#ef4444" />
                                                        ) : isLow ? (
                                                            <AlertTriangle size={12} color="#f59e0b" />
                                                        ) : null}
                                                        <span className={`inventory-stock-val ${isOut ? 'out' : isLow ? 'low' : 'normal'}`}>
                                                            {p.stock} {p.unit}
                                                        </span>
                                                    </div>
                                                    <div className="stock-bar">
                                                        <div className="stock-bar-fill" style={{
                                                            width: `${stockPct}%`,
                                                            background: isOut ? '#ef4444' : isLow ? '#f59e0b' : '#22c55e',
                                                        }} />
                                                    </div>
                                                    <div className="inventory-stock-min">Min: {p.minStock}</div>
                                                </div>
                                            </td>
                                            <td className="amount-cell">
                                                <span className="badge badge-primary inventory-tax-badge">{p.taxRate ?? 0}%</span>
                                            </td>
                                            <td>
                                                {isOut ? <span className="badge badge-danger inventory-status-badge">O/S</span> :
                                                    isLow ? <span className="badge badge-warning inventory-status-badge">LS</span> :
                                                        <span className="badge badge-success inventory-status-badge">STK</span>}
                                            </td>
                                            <td>
                                                <div className="inventory-row-actions">
                                                    <button className="btn btn-sm inventory-stock-btn inventory-adjust-btn"
                                                        onClick={() => setAdjustProd(p)} title="Adjust Stock">
                                                        <ArrowUp size={12} /> Adjust
                                                    </button>
                                                    <button className="btn btn-icon btn-ghost inventory-icon-btn"
                                                        onClick={() => { setEditProduct(p); setShowForm(true); }}>
                                                        <Edit3 size={13} />
                                                    </button>
                                                    <button className="btn btn-icon inventory-delete-btn"
                                                        onClick={() => { if (confirm(`Delete "${p.name}"?`)) deleteProduct(p.id); }}>
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showForm && (
                <ProductModal
                    product={editProduct}
                    onClose={() => { setShowForm(false); setEditProduct(null); }}
                    onSave={(data) => { if (editProduct) updateProduct(editProduct.id, data); else addProduct(data); }}
                />
            )}
            {adjustProd && (
                <StockAdjustModal
                    product={adjustProd}
                    onClose={() => setAdjustProd(null)}
                    onAdjust={adjustStock}
                />
            )}
        </div>
    );
}
