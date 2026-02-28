// =====================================================
// Billing.jsx — Invoice Management Module (Global)
// =====================================================
import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import {
    Plus, Search, Eye, Trash2, Edit3, Printer,
    Download, X, Package, CheckCircle, DollarSign,
    FileText, Clock, AlertCircle, MessageCircle,
    Mail,
} from 'lucide-react';
import InvoicePreviewModal from '../components/InvoicePreviewModal';
import PaymentModal from '../components/PaymentModal';

const STATUS_CFG = {
    paid: { cls: 'badge-success', label: 'Paid', icon: CheckCircle },
    unpaid: { cls: 'badge-danger', label: 'Unpaid', icon: AlertCircle },
    partial: { cls: 'badge-warning', label: 'Partial', icon: Clock },
};

// ── Invoice Form Modal ──
function InvoiceFormModal({ invoice, onClose, onSave }) {
    const { products, customers, business, currency } = useApp();
    const [form, setForm] = useState(invoice || {
        date: new Date().toISOString().slice(0, 10),
        customerId: '',
        customer: '',
        items: [],
        discount: 0,
        notes: '',
        taxEnabled: true,
        paid: 0,
        payments: [],
        status: 'unpaid',
    });
    const [searchProduct, setSearchProduct] = useState('');
    const [showProductDD, setShowProductDD] = useState(false);

    const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const addItem = (product) => {
        const exists = form.items.find(i => i.productId === product.id);
        if (exists) {
            update('items', form.items.map(i =>
                i.productId === product.id ? { ...i, qty: i.qty + 1, amount: (i.qty + 1) * i.price } : i
            ));
        } else {
            update('items', [...form.items, {
                productId: product.id,
                name: product.name,
                unit: product.unit,
                qty: 1,
                price: product.salePrice,
                taxRate: product.taxRate ?? business.taxRate ?? 0,
                amount: product.salePrice,
            }]);
        }
        setShowProductDD(false);
        setSearchProduct('');
    };

    const updateItem = (idx, key, val) => {
        const items = [...form.items];
        items[idx] = { ...items[idx], [key]: val };
        if (key === 'qty' || key === 'price') {
            items[idx].amount = items[idx].qty * items[idx].price;
        }
        update('items', items);
    };

    const removeItem = (idx) => update('items', form.items.filter((_, i) => i !== idx));

    // Calculations
    const subtotal = form.items.reduce((s, i) => s + i.amount, 0);
    const discountAmt = parseFloat(form.discount) || 0;
    const taxable = subtotal - discountAmt;
    const taxAmount = form.taxEnabled
        ? form.items.reduce((s, i) => s + (i.amount * (i.taxRate || 0) / 100), 0)
        : 0;
    const total = taxable + taxAmount;

    const filteredProducts = products.filter(p =>
        searchProduct === '' ||
        p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchProduct.toLowerCase())
    );

    const handleSave = () => {
        if (!form.customerId || !form.customer) { toast.error('Please select a customer'); return; }
        if (form.items.length === 0) { toast.error('Please add at least one product'); return; }
        const paidAmt = parseFloat(form.paid) || 0;
        const status = paidAmt >= total ? 'paid' : paidAmt > 0 ? 'partial' : 'unpaid';
        onSave({ ...form, subtotal, taxAmount, total, status });
        onClose();
        toast.success(invoice ? 'Invoice updated!' : 'Invoice created!');
    };

    return (
        <div className="modal-overlay">
            <div className="modal modal-lg">
                <div className="modal-header">
                    <h3 className="modal-title">{invoice ? 'Edit Invoice' : 'Create New Invoice'}</h3>
                    <button className="modal-close" onClick={onClose}><X size={16} /></button>
                </div>

                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Invoice Meta */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                        <div className="form-group">
                            <label className="form-label">Invoice Date</label>
                            <input type="date" className="form-control" value={form.date} onChange={e => update('date', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Customer</label>
                            <select className="form-select" value={form.customerId} onChange={e => {
                                const c = customers.find(x => x.id === e.target.value);
                                update('customerId', e.target.value);
                                update('customer', c ? c.name : '');
                            }}>
                                <option value="">-- Select Customer --</option>
                                {customers.filter(c => c.type !== 'supplier').map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Tax Billing</label>
                            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                                <button type="button" className={`btn btn-sm ${form.taxEnabled ? 'btn-primary' : 'btn-ghost'}`} onClick={() => update('taxEnabled', true)}>With Tax ({business.taxLabel || 'VAT'})</button>
                                <button type="button" className={`btn btn-sm ${!form.taxEnabled ? 'btn-primary' : 'btn-ghost'}`} onClick={() => update('taxEnabled', false)}>No Tax</button>
                            </div>
                        </div>
                    </div>

                    {/* Product Search */}
                    <div>
                        <label className="form-label" style={{ marginBottom: 6, display: 'block' }}>Add Products / Services</label>
                        <div style={{ position: 'relative' }}>
                            <div className="search-input-wrap">
                                <Search />
                                <input
                                    value={searchProduct}
                                    onChange={e => { setSearchProduct(e.target.value); setShowProductDD(true); }}
                                    onFocus={() => setShowProductDD(true)}
                                    placeholder="Search product by name or SKU..."
                                />
                            </div>
                            {showProductDD && (
                                <div style={{
                                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                                    background: 'white', border: '1px solid #e5e7eb', borderRadius: 10,
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)', maxHeight: 240, overflowY: 'auto',
                                    marginTop: 4,
                                }}>
                                    {filteredProducts.length === 0 ? (
                                        <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>No products found</div>
                                    ) : filteredProducts.map(p => (
                                        <div
                                            key={p.id}
                                            onClick={() => addItem(p)}
                                            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f9fafb' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'white'}
                                        >
                                            <div style={{ width: 32, height: 32, background: '#eff6ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Package size={14} color="#3b82f6" />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1f2937' }}>{p.name}</div>
                                                <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{p.sku} · Stock: {p.stock} {p.unit}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: 700, color: '#1f2937' }}>{currency(p.salePrice)}</div>
                                                {form.taxEnabled && p.taxRate > 0 && <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>+{p.taxRate}% {business.taxLabel || 'VAT'}</div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Items Table */}
                    {form.items.length > 0 && (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ minWidth: 200 }}>Product</th>
                                        <th>Qty</th>
                                        <th>Unit</th>
                                        <th>Price</th>
                                        {form.taxEnabled && <th>Tax %</th>}
                                        <th>Amount</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {form.items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td style={{ fontWeight: 600, fontSize: '0.84rem' }}>{item.name}</td>
                                            <td>
                                                <input type="number" min="1" value={item.qty}
                                                    onChange={e => updateItem(idx, 'qty', parseFloat(e.target.value) || 1)}
                                                    className="form-control" style={{ width: 70, padding: '6px 8px' }} />
                                            </td>
                                            <td style={{ color: '#6b7280', fontSize: '0.8rem' }}>{item.unit}</td>
                                            <td>
                                                <input type="number" min="0" value={item.price}
                                                    onChange={e => updateItem(idx, 'price', parseFloat(e.target.value) || 0)}
                                                    className="form-control" style={{ width: 90, padding: '6px 8px' }} />
                                            </td>
                                            {form.taxEnabled && (
                                                <td>
                                                    <input type="number" min="0" max="100" step="0.5"
                                                        className="form-control" style={{ width: 70, padding: '6px 8px' }}
                                                        value={item.taxRate ?? 0}
                                                        onChange={e => updateItem(idx, 'taxRate', parseFloat(e.target.value) || 0)} />
                                                </td>
                                            )}
                                            <td style={{ fontWeight: 700, color: '#1f2937' }}>
                                                {currency(item.amount)}
                                                {form.taxEnabled && (item.taxRate || 0) > 0 && (
                                                    <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                                                        +{currency(item.amount * (item.taxRate || 0) / 100)} tax
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <button className="btn btn-icon" style={{ background: '#fef2f2', color: '#dc2626', border: 'none' }}
                                                    onClick={() => removeItem(idx)}>
                                                    <X size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Totals & Notes */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'start' }}>
                        <div className="form-group">
                            <label className="form-label">Notes / Terms</label>
                            <textarea className="form-control" rows={3} value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Payment terms, additional info..." style={{ minHeight: 80 }} />
                        </div>

                        <div style={{ background: '#f8fafc', borderRadius: 10, padding: '16px 20px', minWidth: 260, border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.85rem' }}>
                                <span style={{ color: '#6b7280' }}>Subtotal</span>
                                <span style={{ fontWeight: 600 }}>{currency(subtotal)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.85rem', alignItems: 'center' }}>
                                <span style={{ color: '#6b7280' }}>Discount</span>
                                <input
                                    type="number" min="0" value={form.discount}
                                    onChange={e => update('discount', e.target.value)}
                                    className="form-control" style={{ width: 90, padding: '4px 8px', textAlign: 'right' }}
                                    placeholder="0"
                                />
                            </div>
                            {form.taxEnabled && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.85rem' }}>
                                    <span style={{ color: '#6b7280' }}>{business.taxLabel || 'VAT'} Amount</span>
                                    <span style={{ fontWeight: 600, color: '#2563eb' }}>{currency(taxAmount)}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '2px solid #e2e8f0', fontSize: '1rem' }}>
                                <span style={{ fontWeight: 800, color: '#1f2937' }}>Total</span>
                                <span style={{ fontWeight: 800, color: '#1f2937', fontSize: '1.1rem' }}>{currency(total)}</span>
                            </div>
                            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', alignItems: 'center' }}>
                                <span style={{ color: '#6b7280' }}>Paid Amount</span>
                                <input
                                    type="number" min="0" max={total} value={form.paid}
                                    onChange={e => update('paid', e.target.value)}
                                    className="form-control" style={{ width: 90, padding: '4px 8px', textAlign: 'right' }}
                                    placeholder="0"
                                />
                            </div>
                            {parseFloat(form.paid) > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.85rem' }}>
                                    <span style={{ color: '#6b7280' }}>Balance Due</span>
                                    <span style={{ fontWeight: 700, color: '#dc2626' }}>{currency(Math.max(0, total - parseFloat(form.paid)))}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                    <button className="btn btn-outline" onClick={() => { handleSave(); }}>
                        <Download size={16} /> Save Draft
                    </button>
                    <button className="btn btn-primary" onClick={handleSave}>
                        <CheckCircle size={16} /> Save Invoice
                    </button>
                </div>
            </div>
        </div>
    );
}


// ── Main Billing Page ──
export default function Billing() {
    const { invoices, addInvoice, updateInvoice, deleteInvoice, business, currency } = useApp();
    const [showForm, setShowForm] = useState(false);
    const [editInvoice, setEditInvoice] = useState(null);
    const [previewInvoice, setPreviewInvoice] = useState(null);
    const [paymentInvoice, setPaymentInvoice] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const filtered = invoices.filter(inv => {
        const matchSearch = (inv.customer || '').toLowerCase().includes(search.toLowerCase()) ||
            (inv.invoiceNo || '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || inv.status === filterStatus;
        return matchSearch && matchStatus;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalRevenue = invoices.reduce((s, i) => s + i.total, 0);
    const totalPaid = invoices.reduce((s, i) => s + i.paid, 0);
    const totalPending = totalRevenue - totalPaid;

    const handleSave = (data) => {
        if (editInvoice) updateInvoice(editInvoice.id, data);
        else addInvoice(data);
        setEditInvoice(null);
    };

    return (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
                {[
                    { label: 'Total Revenue', value: currency(totalRevenue), cls: 'blue' },
                    { label: 'Amount Received', value: currency(totalPaid), cls: 'green' },
                    { label: 'Pending Amount', value: currency(totalPending), cls: 'orange' },
                    { label: 'Total Invoices', value: invoices.length, cls: 'purple' },
                ].map(s => (
                    <div key={s.label} className={`stat-card ${s.cls}`}>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-value" style={{ fontSize: '1.4rem' }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Main Card */}
            <div className="card">
                {/* Filter Bar */}
                <div className="filter-bar">
                    <div className="search-input-wrap" style={{ maxWidth: 300 }}>
                        <Search />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by customer or invoice #" />
                    </div>

                    <div className="tabs">
                        {['all', 'paid', 'unpaid', 'partial'].map(s => (
                            <button key={s} className={`tab-btn ${filterStatus === s ? 'active' : ''}`}
                                onClick={() => setFilterStatus(s)}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                                <span style={{ marginLeft: 4, fontWeight: 400, color: filterStatus === s ? '#9ca3af' : '#d1d5db' }}>
                                    ({invoices.filter(i => s === 'all' || i.status === s).length})
                                </span>
                            </button>
                        ))}
                    </div>

                    <div style={{ marginLeft: 'auto' }}>
                        <button className="btn btn-primary" onClick={() => { setEditInvoice(null); setShowForm(true); }}>
                            <Plus size={16} /> New Invoice
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="table-wrapper" style={{ borderRadius: 0, border: 'none' }}>
                    {filtered.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon"><FileText size={36} /></div>
                            <h3>No invoices found</h3>
                            <p>Create your first invoice to get started</p>
                            <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Create Invoice</button>
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Invoice #</th>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Paid</th>
                                    <th>Balance</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(inv => {
                                    const cfg = STATUS_CFG[inv.status];
                                    const balance = inv.total - inv.paid;
                                    return (
                                        <tr key={inv.id}>
                                            <td>
                                                <span style={{ fontWeight: 700, color: '#2563eb', fontSize: '0.84rem' }}>{inv.invoiceNo}</span>
                                                {inv.taxEnabled && <span style={{ marginLeft: 6, fontSize: '0.65rem', background: '#dbeafe', color: '#1d4ed8', padding: '1px 6px', borderRadius: 99, fontWeight: 700 }}>{business.taxLabel || 'VAT'}</span>}
                                            </td>
                                            <td style={{ color: '#6b7280', fontSize: '0.82rem' }}>{inv.date}</td>
                                            <td style={{ fontWeight: 600, color: '#1f2937' }}>{inv.customer || 'Unknown'}</td>
                                            <td style={{ color: '#6b7280', fontSize: '0.82rem' }}>{inv.items?.length || 0} item{inv.items?.length !== 1 ? 's' : ''}</td>
                                            <td style={{ fontWeight: 700 }}>{currency(inv.total)}</td>
                                            <td style={{ fontWeight: 600, color: '#16a34a' }}>{currency(inv.paid)}</td>
                                            <td style={{ fontWeight: 600, color: balance > 0 ? '#dc2626' : '#16a34a' }}>
                                                {balance > 0 ? currency(balance) : '—'}
                                            </td>
                                            <td><span className={`badge ${cfg.cls}`}>{cfg.label}</span></td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 4 }}>
                                                    <button className="btn btn-icon" style={{ width: 32, height: 32, background: '#f0fdf4', color: '#16a34a', border: 'none' }} onClick={() => setPaymentInvoice(inv)} title="Manage Payments">
                                                        <DollarSign size={14} />
                                                    </button>
                                                    <button className="btn btn-icon btn-ghost" style={{ width: 32, height: 32 }} onClick={() => setPreviewInvoice(inv)} title="View">
                                                        <Eye size={14} />
                                                    </button>
                                                    <button className="btn btn-icon btn-ghost" style={{ width: 32, height: 32 }} onClick={() => { setEditInvoice(inv); setShowForm(true); }} title="Edit">
                                                        <Edit3 size={14} />
                                                    </button>
                                                    <button className="btn btn-icon" style={{ width: 32, height: 32, background: '#fef2f2', color: '#dc2626', border: 'none' }}
                                                        onClick={() => { if (window.confirm('Delete this invoice?')) { deleteInvoice(inv.id); toast.success('Invoice deleted'); } }} title="Delete">
                                                        <Trash2 size={14} />
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
                <InvoiceFormModal
                    invoice={editInvoice}
                    onClose={() => { setShowForm(false); setEditInvoice(null); }}
                    onSave={handleSave}
                />
            )}
            {previewInvoice && (
                <InvoicePreviewModal
                    invoice={previewInvoice}
                    business={business}
                    onClose={() => setPreviewInvoice(null)}
                />
            )}
            {paymentInvoice && (
                <PaymentModal
                    invoice={paymentInvoice}
                    onClose={() => setPaymentInvoice(null)}
                    onSave={(updatedInvoice) => {
                        updateInvoice(updatedInvoice.id, updatedInvoice);
                        setPaymentInvoice(null);
                    }}
                />
            )}
        </div>
    );
}
