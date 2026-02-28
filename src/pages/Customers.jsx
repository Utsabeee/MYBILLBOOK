// =====================================================
// Customers.jsx — Customers & Suppliers Module
// =====================================================
import { useState } from 'react';
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
        name: '', phone: '', email: '', gst: '',
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
                                <input className="form-control" value={form.gst} onChange={e => update('gst', e.target.value)} placeholder="Optional Tax ID" />
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
                <div className="modal-body" style={{ padding: 0 }}>
                    {/* Header */}
                    <div style={{ padding: '24px', background: 'linear-gradient(135deg,#eff6ff,#f0fdf4)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div className="contact-avatar" style={{ width: 56, height: 56, background: AVATAR_COLORS[contact.colorIdx] || AVATAR_COLORS[0], fontSize: '1.2rem' }}>
                                {contact.name.charAt(0)}
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1f2937' }}>{contact.name}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                    <span className={`badge ${contact.type === 'customer' ? 'badge-primary' : 'badge-teal'}`}>
                                        {contact.type === 'customer' ? 'Customer' : 'Supplier'}
                                    </span>
                                    {contact.gst && (
                                        <span style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 700 }}>Tax Reg.</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Balance */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 20 }}>
                            {[
                                { label: 'Total Billed', value: totalBilled, color: '#1f2937' },
                                { label: 'Amount Paid', value: totalPaid, color: '#16a34a' },
                                { label: 'Balance Due', value: balance, color: balance > 0 ? '#dc2626' : '#16a34a' },
                            ].map(s => (
                                <div key={s.label} style={{ background: 'white', borderRadius: 10, padding: '12px 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: s.color, marginTop: 4 }}>{s.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10, borderBottom: '1px solid #f1f5f9' }}>
                        {[
                            { icon: Phone, label: contact.phone },
                            { icon: Mail, label: contact.email || 'No email added' },
                            { icon: MapPin, label: contact.address || 'No address added' },
                            contact.gst && { icon: Building2, label: `${business.taxLabel || 'Tax ID'}: ${contact.gst}` },
                        ].filter(Boolean).map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.84rem' }}>
                                <item.icon size={16} style={{ color: '#9ca3af', marginTop: 2, flexShrink: 0 }} />
                                <span style={{ color: '#374151' }}>{item.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Transaction History */}
                    <div style={{ padding: '16px 24px' }}>
                        <div style={{ fontWeight: 700, color: '#1f2937', marginBottom: 12, fontSize: '0.9rem' }}>
                            Transaction History ({relatedInvoices.length})
                        </div>
                        {relatedInvoices.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', fontSize: '0.85rem' }}>
                                No transactions yet
                            </div>
                        ) : (
                            relatedInvoices.map(inv => {
                                const invPayments = payments.filter(p => p.invoiceId === inv.id);
                                const invTotalPaid = invPayments.reduce((s, p) => s + (p.amount || 0), 0);
                                return (
                                <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
                                    <div style={{ width: 32, height: 32, background: '#eff6ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <FileText size={14} color="#3b82f6" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#1f2937' }}>{inv.invoiceNo}</div>
                                        <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{inv.date}</div>
                                    </div>
                                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>{currency(inv.total)}</div>
                                        <span style={{ fontSize: '0.7rem' }}>
                                            {inv.status === 'paid' ? 'Paid' : `Due: ${currency(inv.total - invTotalPaid)}`}
                                        </span>
                                    </div>
                                    <button className="btn btn-icon btn-ghost" style={{ width: 32, height: 32, marginLeft: 8 }} onClick={() => setPreviewInvoice(inv)} title="View Invoice">
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
    const { customers, addCustomer, updateCustomer, deleteCustomer, invoices, payments, AVATAR_COLORS, currency } = useApp();
    const [tab, setTab] = useState('customer');
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editContact, setEditContact] = useState(null);
    const [viewContact, setViewContact] = useState(null);

    const filtered = customers.filter(c => {
        const matchTab = c.type === tab;
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.phone.includes(search) ||
            (c.email && c.email.toLowerCase().includes(search.toLowerCase()));
        return matchTab && matchSearch;
    });

    const totalReceivable = customers
        .filter(c => c.type === 'customer')
        .reduce((s, c) => {
            const cInv = invoices.filter(i => i.customerId === c.id);
            const totalBilled = cInv.reduce((a, i) => a + i.total, 0);
            const totalPaid = payments
                .filter(p => cInv.some(i => i.id === p.invoiceId))
                .reduce((a, p) => a + p.amount, 0);
            return s + (totalBilled - totalPaid);
        }, 0);

    const getContactBalance = (contact) => {
        const cInv = invoices.filter(i => i.customerId === contact.id);
        const billed = cInv.reduce((s, i) => s + i.total, 0);
        const paid = payments
            .filter(p => cInv.some(i => i.id === p.invoiceId))
            .reduce((s, p) => s + p.amount, 0);
        return billed - paid;
    };

    return (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
                {[
                    { label: 'Total Customers', value: customers.filter(c => c.type === 'customer').length, cls: 'blue' },
                    { label: 'Total Suppliers', value: customers.filter(c => c.type === 'supplier').length, cls: 'teal' },
                    { label: 'Total Receivable', value: currency(totalReceivable), cls: 'orange' },
                    { label: 'GST Registered', value: customers.filter(c => !!c.gst).length, cls: 'purple' },
                ].map(s => (
                    <div key={s.label} className={`stat-card ${s.cls}`}>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-value" style={{ fontSize: '1.4rem' }}>{s.value}</div>
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

                    <div className="search-input-wrap" style={{ maxWidth: 280 }}>
                        <Search />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone, email..." />
                    </div>

                    <div style={{ marginLeft: 'auto' }}>
                        <button className="btn btn-primary" onClick={() => { setEditContact(null); setShowForm(true); }}>
                            <Plus size={16} /> Add {tab === 'customer' ? 'Customer' : 'Supplier'}
                        </button>
                    </div>
                </div>

                {/* Contact Grid */}
                <div style={{ padding: '16px' }}>
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
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
                            {filtered.map(contact => {
                                const balance = getContactBalance(contact);
                                const cInvCount = invoices.filter(i => i.customerId === contact.id).length;

                                return (
                                    <div
                                        key={contact.id}
                                        style={{
                                            background: 'white', borderRadius: 12, padding: '16px',
                                            border: '1px solid #e5e7eb', cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
                                        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
                                        onClick={() => setViewContact(contact)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                            <div className="contact-avatar" style={{ background: AVATAR_COLORS[contact.colorIdx] || AVATAR_COLORS[0] }}>
                                                {contact.name.charAt(0)}
                                            </div>
                                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                                <div style={{ fontWeight: 700, color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {contact.name}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                                                    <span style={{ fontSize: '0.78rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 3 }}>
                                                        <Phone size={11} /> {contact.phone}
                                                    </span>
                                                    {contact.gst && (
                                                        <span style={{ fontSize: '0.65rem', background: '#dbeafe', color: '#1d4ed8', padding: '1px 6px', borderRadius: 99, fontWeight: 700 }}>GST</span>
                                                    )}
                                                </div>
                                                {contact.email && (
                                                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        <Mail size={11} /> {contact.email}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                <button className="btn btn-icon btn-ghost" style={{ width: 28, height: 28 }}
                                                    onClick={e => { e.stopPropagation(); setEditContact(contact); setShowForm(true); }}>
                                                    <Edit3 size={13} />
                                                </button>
                                                <button className="btn btn-icon" style={{ width: 28, height: 28, background: '#fef2f2', color: '#dc2626', border: 'none' }}
                                                    onClick={e => { e.stopPropagation(); if (confirm(`Delete "${contact.name}"?`)) deleteCustomer(contact.id); }}>
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Balance & Invoices */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                                            <div style={{ display: 'flex', gap: 12 }}>
                                                <div>
                                                    <div style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Balance</div>
                                                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: balance > 0 ? '#dc2626' : balance < 0 ? '#16a34a' : '#6b7280' }}>
                                                        {balance === 0 ? currency(0) : balance > 0 ? `${balance.toLocaleString(undefined, { maximumFractionDigits: 0 })} due` : `${Math.abs(balance).toLocaleString(undefined, { maximumFractionDigits: 0 })} credit`}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Invoices</div>
                                                    <div style={{ fontWeight: 700, color: '#374151', fontSize: '0.9rem' }}>{cInvCount} bills</div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                {balance > 5000 && (
                                                    <button className="btn btn-sm" style={{ background: '#fef3c7', color: '#92400e', border: 'none', padding: '4px 8px', fontSize: '0.72rem' }}
                                                        onClick={e => { e.stopPropagation(); toast.success(`📱 Payment reminder sent to ${contact.name}!`); }}>
                                                        <Bell size={11} /> Remind
                                                    </button>
                                                )}
                                                <ChevronRight size={16} color="#9ca3af" />
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
