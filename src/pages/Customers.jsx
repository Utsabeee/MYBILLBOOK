// =====================================================
// Customers.jsx — Customers & Suppliers Module
// =====================================================
import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
    Plus, Search, Edit3, Trash2, X, User, Phone, Mail,
    MapPin, Building2, TrendingUp, TrendingDown,
    FileText, Bell, ChevronRight, Users, Filter, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import InvoicePreviewModal from '../components/InvoicePreviewModal';

// ── Contact Form Modal ──
function ContactModal({ contact, onClose, onSave, defaultType = 'customer' }) {
    const { business } = useApp();
    const [form, setForm] = useState(contact || {
        name: '', phone: '', email: '', taxId: '',
        address: '', type: defaultType,
    });
    const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleSave = (e) => {
        e.preventDefault();
        if (!form.name || !form.phone) { toast.error('Name and phone are required'); return; }
        onSave(form);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h3 className="modal-title">{contact ? 'Edit Contact' : 'Add New Contact'}</h3>
                    <button className="modal-close" onClick={onClose}><X size={16} /></button>
                </div>
                <form onSubmit={handleSave}>
                    <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Type selector */}
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button type="button" onClick={() => update('type', 'customer')}
                                className={`btn ${form.type === 'customer' ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1 }}>
                                <User size={16} /> Customer
                            </button>
                            <button type="button" onClick={() => update('type', 'supplier')}
                                className={`btn ${form.type === 'supplier' ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1 }}>
                                <Building2 size={16} /> Supplier
                            </button>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Full Name / Business Name *</label>
                                <input className="form-control" value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. John Doe Consulting" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Mobile Number *</label>
                                <input className="form-control" type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+1 234 567 890" required />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input className="form-control" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="email@example.com" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{business.taxLabel || 'Tax ID'}</label>
                                <input className="form-control" value={form.taxId} onChange={e => update('taxId', e.target.value)} placeholder="Optional Tax ID" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Address</label>
                            <textarea className="form-control" value={form.address} onChange={e => update('address', e.target.value)} placeholder="Full address..." style={{ minHeight: 72 }} />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">
                            <Plus size={16} /> {contact ? 'Update' : 'Save Contact'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Contact Detail Panel ──
function ContactDetail({ contact, onClose, invoices, payments, AVATAR_COLORS }) {
    const { business, currency } = useApp();
    const [previewInvoice, setPreviewInvoice] = useState(null);

    const relatedInvoices = invoices.filter(i => i.customerId === contact.id);
    const totalBilled = relatedInvoices.reduce((s, i) => s + i.total, 0);
    
    // Calculate paid from payments collection instead of invoice.paid
    const totalPaid = payments
        .filter(p => relatedInvoices.some(i => i.id === p.invoiceId))
        .reduce((s, p) => s + p.amount, 0);
    
    const balance = totalBilled - totalPaid;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h3 className="modal-title">Contact Profile</h3>
                    <button className="modal-close" onClick={onClose}><X size={16} /></button>
                </div>
                <div className="modal-body contact-profile-body">
                    {/* Header */}
                    <div className="contact-profile-header">
                        <div className="contact-profile-main">
                            <div className="contact-avatar contact-profile-avatar" style={{ background: AVATAR_COLORS[contact.colorIdx] || AVATAR_COLORS[0] }}>
                                {contact.name.charAt(0)}
                            </div>
                            <div>
                                <div className="contact-profile-name">{contact.name}</div>
                                <div className="contact-profile-tags">
                                    <span className={`badge ${contact.type === 'customer' ? 'badge-primary' : 'badge-teal'}`}>
                                        {contact.type === 'customer' ? 'Customer' : 'Supplier'}
                                    </span>
                                    {contact.taxId && (
                                        <span className="contact-profile-tax">Tax Reg.</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Balance */}
                        <div className="contact-profile-stats">
                            {[
                                { label: 'Total Billed', value: totalBilled, cls: 'neutral' },
                                { label: 'Amount Paid', value: totalPaid, cls: 'paid' },
                                { label: 'Balance Due', value: balance, cls: balance > 0 ? 'due' : 'paid' },
                            ].map(s => (
                                <div key={s.label} className="contact-profile-stat-card">
                                    <div className="contact-profile-stat-label">{s.label}</div>
                                    <div className={`contact-profile-stat-value ${s.cls}`}>{currency(s.value)}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="contact-profile-info">
                        {[
                            { icon: Phone, label: contact.phone },
                            { icon: Mail, label: contact.email || 'No email added' },
                            { icon: MapPin, label: contact.address || 'No address added' },
                            contact.taxId && { icon: Building2, label: `${business.taxLabel || 'Tax ID'}: ${contact.taxId}` },
                        ].filter(Boolean).map((item, i) => (
                            <div key={i} className="contact-profile-info-row">
                                <item.icon size={16} className="contact-profile-info-icon" />
                                <span className="contact-profile-info-text">{item.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Transaction History */}
                    <div className="contact-profile-history">
                        <div className="contact-profile-history-title">
                            Transaction History ({relatedInvoices.length})
                        </div>
                        {relatedInvoices.length === 0 ? (
                            <div className="contact-profile-history-empty">
                                No transactions yet
                            </div>
                        ) : (
                            relatedInvoices.map(inv => {
                                const invPayments = payments.filter(p => p.invoiceId === inv.id);
                                const invTotalPaid = invPayments.reduce((s, p) => s + (p.amount || 0), 0);
                                return (
                                <div key={inv.id} className="contact-profile-invoice-row">
                                    <div className="contact-profile-invoice-icon-wrap">
                                        <FileText size={14} color="#3b82f6" />
                                    </div>
                                    <div className="contact-profile-invoice-meta">
                                        <div className="contact-profile-invoice-no">{inv.invoiceNo}</div>
                                        <div className="contact-profile-invoice-date">{inv.date}</div>
                                    </div>
                                    <div className="contact-profile-invoice-amount-wrap">
                                        <div className="contact-profile-invoice-total">{currency(inv.total)}</div>
                                        <span className="contact-profile-invoice-due">
                                            {inv.status === 'paid' ? 'Paid' : `Due: ${currency(inv.total - invTotalPaid)}`}
                                        </span>
                                    </div>
                                    <button className="btn btn-icon btn-ghost contact-profile-view-btn" onClick={() => setPreviewInvoice(inv)} title="View Invoice">
                                        <Eye size={14} />
                                    </button>
                                </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {previewInvoice && (
                <InvoicePreviewModal
                    invoice={previewInvoice}
                    business={business}
                    onClose={() => setPreviewInvoice(null)}
                />
            )}
        </div>
    );
}

// ── Main Customers Page ──
export default function Customers() {
    const { customers, addCustomer, updateCustomer, deleteCustomer, invoices, payments, AVATAR_COLORS, currency, compactCurrency, getCustomerBalance } = useApp();
    const [tab, setTab] = useState('customer');
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editContact, setEditContact] = useState(null);
    const [viewContact, setViewContact] = useState(null);
    const [showReceivableExact, setShowReceivableExact] = useState(false);

    // Memoized filtered list to prevent lag
    const filtered = useMemo(() => 
        customers.filter(c => {
            const matchTab = c.type === tab;
            const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                c.phone.includes(search) ||
                (c.email && c.email.toLowerCase().includes(search.toLowerCase()));
            return matchTab && matchSearch;
        }),
    [customers, tab, search]);

    // Memoized total receivable calculation
    const totalReceivable = useMemo(() => {
        const customerBalances = customers
            .filter(c => c.type === 'customer')
            .map(customer => ({
                name: customer.name,
                balance: getCustomerBalance(customer.id)
            }));
        
        const total = customerBalances.reduce((sum, c) => sum + c.balance, 0);
        
        return total;
    }, [customers, getCustomerBalance]);

    // Memoized balance calculator
    const getContactBalance = useMemo(() => (contact) => getCustomerBalance(contact.id), [getCustomerBalance]);

    return (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
                {[
                    { label: 'Total Customers', value: customers.filter(c => c.type === 'customer').length, cls: 'blue' },
                    { label: 'Total Suppliers', value: customers.filter(c => c.type === 'supplier').length, cls: 'teal' },
                    {
                        label: 'Total Receivable',
                        value: compactCurrency(totalReceivable),
                        raw: currency(totalReceivable),
                        cls: 'orange'
                    },
                    { label: 'Tax Registered', value: customers.filter(c => !!c.taxId).length, cls: 'purple' },
                ].map(s => (
                    <div
                        key={s.label}
                        className={`stat-card ${s.cls}`}
                        onClick={s.label === 'Total Receivable' ? () => setShowReceivableExact(prev => !prev) : undefined}
                        style={s.label === 'Total Receivable' ? { cursor: 'pointer' } : undefined}
                        title={s.label === 'Total Receivable'
                            ? (showReceivableExact ? 'Showing full amount. Click to compact.' : `Click to show exact amount (${s.raw}).`)
                            : undefined}
                    >
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-value stat-value-amount" style={{ fontSize: '1.4rem' }}>{s.value}</div>
                        {s.label === 'Total Receivable' && showReceivableExact && (
                            <div
                                style={{
                                    fontSize: '0.72rem',
                                    color: '#6b7280',
                                    marginTop: 4,
                                    lineHeight: 1.3,
                                    overflowWrap: 'anywhere',
                                }}
                            >
                                Exact: {s.raw}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="card">
                {/* Filter Bar */}
                <div className="filter-bar">
                    <div className="tabs">
                        <button className={`tab-btn ${tab === 'customer' ? 'active' : ''}`} onClick={() => setTab('customer')}>
                            Customers ({customers.filter(c => c.type === 'customer').length})
                        </button>
                        <button className={`tab-btn ${tab === 'supplier' ? 'active' : ''}`} onClick={() => setTab('supplier')}>
                            Suppliers ({customers.filter(c => c.type === 'supplier').length})
                        </button>
                    </div>

                    <div className="search-input-wrap customers-search-wrap">
                        <Search />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone, email..." />
                    </div>

                    <div className="customers-add-wrap">
                        <button className="btn btn-primary" onClick={() => { setEditContact(null); setShowForm(true); }}>
                            <Plus size={16} /> Add {tab === 'customer' ? 'Customer' : 'Supplier'}
                        </button>
                    </div>
                </div>

                {/* Contact Grid */}
                <div className="customers-grid-shell">
                    {filtered.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon"><Users size={36} /></div>
                            <h3>No {tab}s found</h3>
                            <p>Add your first {tab} to start tracking transactions</p>
                            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                                <Plus size={16} /> Add {tab === 'customer' ? 'Customer' : 'Supplier'}
                            </button>
                        </div>
                    ) : (
                        <div className="customers-grid">
                            {filtered.map(contact => {
                                const balance = getContactBalance(contact);
                                const cInvCount = invoices.filter(i => i.customerId === contact.id).length;

                                return (
                                    <div
                                        key={contact.id}
                                        className="customer-card"
                                        onClick={() => setViewContact(contact)}
                                    >
                                        <div className="customer-main-row">
                                            <div className="contact-avatar" style={{ background: AVATAR_COLORS[contact.colorIdx] || AVATAR_COLORS[0] }}>
                                                {contact.name.charAt(0)}
                                            </div>
                                            <div className="customer-main-meta">
                                                <div className="customer-name">
                                                    {contact.name}
                                                </div>
                                                <div className="customer-phone-row">
                                                    <span className="customer-phone-pill">
                                                        <Phone size={11} /> {contact.phone}
                                                    </span>
                                                    {contact.taxId && (
                                                        <span className="customer-tax-pill">Tax Reg.</span>
                                                    )}
                                                </div>
                                                {contact.email && (
                                                    <div className="customer-email-row">
                                                        <Mail size={11} /> {contact.email}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="customer-action-row">
                                                <button className="btn btn-icon btn-ghost customer-icon-btn"
                                                    onClick={e => { e.stopPropagation(); setEditContact(contact); setShowForm(true); }}>
                                                    <Edit3 size={13} />
                                                </button>
                                                <button className="btn btn-icon customer-delete-btn"
                                                    onClick={e => { e.stopPropagation(); if (confirm(`Delete "${contact.name}"?`)) deleteCustomer(contact.id); }}>
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Balance & Invoices */}
                                        <div className="customer-footer-row">
                                            <div className="customer-stats-row">
                                                <div className="customer-stat-col customer-balance-col">
                                                    <div className="customer-stat-label">Balance</div>
                                                    <div className={`customer-balance-val ${balance > 0 ? 'due' : balance < 0 ? 'credit' : 'neutral'}`}>
                                                        {balance === 0 ? currency(0) : balance > 0 ? `${currency(balance)} due` : `${currency(Math.abs(balance))} credit`}
                                                    </div>
                                                </div>
                                                <div className="customer-stat-col customer-invoices-col">
                                                    <div className="customer-stat-label">Invoices</div>
                                                    <div className="customer-invoice-val">{cInvCount} bills</div>
                                                </div>
                                            </div>

                                            <div className="customer-endcap-row">
                                                {balance > 5000 && (
                                                    <button className="btn btn-sm customer-remind-btn"
                                                        onClick={e => { e.stopPropagation(); toast.success(`📱 Payment reminder sent to ${contact.name}!`); }}>
                                                        <Bell size={11} /> Remind
                                                    </button>
                                                )}
                                                <ChevronRight size={16} className="customer-chevron" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showForm && (
                <ContactModal
                    contact={editContact}
                    defaultType={tab}
                    onClose={() => { setShowForm(false); setEditContact(null); }}
                    onSave={(data) => { if (editContact) updateCustomer(editContact.id, data); else addCustomer(data); }}
                />
            )}
            {viewContact && (
                <ContactDetail
                    contact={viewContact}
                    onClose={() => setViewContact(null)}
                    invoices={invoices}
                    payments={payments}
                    AVATAR_COLORS={AVATAR_COLORS}
                />
            )}
        </div>
    );
}
