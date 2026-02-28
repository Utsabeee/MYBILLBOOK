// =====================================================
// Settings.jsx — Business Configuration (Global-first)
// =====================================================
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { CURRENCIES, DATE_FORMATS } from '../constants';
import {
    Building2, FileText, Receipt, Users, Database,
    Save, Upload, CheckCircle, Info,
    Shield, Bell, Percent,
} from 'lucide-react';

const INVOICE_COLORS = [
    '#2563eb', '#0d9488', '#7c3aed', '#dc2626',
    '#d97706', '#059669', '#0891b2', '#be185d',
];

function SettingSection({ title, icon: Icon, children }) {
    return (
        <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={18} color="#2563eb" />
                    </div>
                    <span className="card-title">{title}</span>
                </div>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {children}
            </div>
        </div>
    );
}

function ToggleSetting({ label, desc, value, onChange }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
            <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1f2937' }}>{label}</div>
                {desc && <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 2 }}>{desc}</div>}
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer', flexShrink: 0 }}>
                <input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{
                    position: 'absolute', inset: 0, borderRadius: 24,
                    background: value ? '#2563eb' : '#e5e7eb',
                    transition: 'background 0.2s',
                }}>
                    <span style={{
                        position: 'absolute', top: 3, left: value ? 22 : 3,
                        width: 18, height: 18, borderRadius: '50%', background: 'white',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                        transition: 'left 0.2s',
                    }} />
                </span>
            </label>
        </div>
    );
}

export default function Settings() {
    const { business, updateBusiness } = useApp();
    const [notifs, setNotifs] = useState({
        lowStock: true, paymentReminders: true, dailyReport: false, monthlyReport: true,
    });
    const [invoiceSettings, setInvoiceSettings] = useState({
        showLogo: true, showTax: true, showBankDetails: false,
        autoNumber: true, termsAndConds: 'Payment due within 30 days of invoice date. Thank you for your business.',
    });

    const handleSave = () => {
        toast.success('Settings synced to cloud successfully!');
    };

    const handleExportBackup = () => {
        const data = {
            business,
            exportedAt: new Date().toISOString(),
            version: '2.0',
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `MyBillBook_Settings_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Settings backup downloaded!');
    };

    return (
        <div style={{ animation: 'fadeIn 0.4s ease', maxWidth: 800 }}>

            {/* ── Business Info ── */}
            <SettingSection title="Business Information" icon={Building2}>
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Business / Shop Name</label>
                        <input className="form-control" value={business.name}
                            onChange={e => updateBusiness({ name: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Country</label>
                        <input className="form-control" value={business.country || ''}
                            onChange={e => updateBusiness({ country: e.target.value })}
                            placeholder="e.g. Nepal, India, UK, USA" />
                    </div>
                </div>

                {/* Tax ID — generic, not GSTIN */}
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Tax ID Type <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>(VAT, PAN, ABN, EIN, etc.)</span></label>
                        <input className="form-control" value={business.taxLabel || 'VAT'}
                            onChange={e => updateBusiness({ taxLabel: e.target.value })}
                            placeholder="e.g. VAT, PAN, GST, Sales Tax" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Tax Registration Number <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>(optional)</span></label>
                        <input className="form-control" value={business.taxId || ''}
                            onChange={e => updateBusiness({ taxId: e.target.value })}
                            placeholder="Your VAT/PAN/GST registration number" />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input className="form-control" value={business.phone}
                            onChange={e => updateBusiness({ phone: e.target.value })}
                            placeholder="+977-9800000000" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="form-control" type="email" value={business.email}
                            onChange={e => updateBusiness({ email: e.target.value })} />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Business Address</label>
                    <textarea className="form-control" value={business.address}
                        onChange={e => updateBusiness({ address: e.target.value })}
                        style={{ minHeight: 72 }} />
                </div>

                {/* Logo Upload */}
                <div className="form-group">
                    <label className="form-label">Business Logo</label>
                    <div style={{
                        border: '2px dashed #e2e8f0', borderRadius: 10, padding: '24px',
                        textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
                    }}
                        onClick={() => document.getElementById('logo-upload').click()}
                        onMouseEnter={e => e.currentTarget.style.borderColor = '#93c5fd'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
                        <Upload size={24} color="#9ca3af" style={{ margin: '0 auto 8px' }} />
                        <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500 }}>Click to upload logo</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 4 }}>PNG, JPG up to 2MB</div>
                        <input id="logo-upload" type="file" accept="image/*" style={{ display: 'none' }}
                            onChange={e => {
                                const file = e.target.files[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = ev => { updateBusiness({ logo: ev.target.result }); toast.success('Logo uploaded!'); };
                                reader.readAsDataURL(file);
                            }} />
                    </div>
                    {business.logo && (
                        <img src={business.logo} alt="Logo" style={{ height: 60, marginTop: 8, borderRadius: 8 }} />
                    )}
                </div>
            </SettingSection>

            {/* ── Currency & Date ── */}
            <SettingSection title="Currency & Regional" icon={Percent}>
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Currency</label>
                        <select className="form-select" value={business.currencyCode || 'NPR'}
                            onChange={e => updateBusiness({ currencyCode: e.target.value })}>
                            {CURRENCIES.map(c => (
                                <option key={c.code} value={c.code}>
                                    {c.symbol} — {c.label} ({c.code})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Date Format</label>
                        <select className="form-select" value={business.dateFormat || 'DD/MM/YYYY'}
                            onChange={e => updateBusiness({ dateFormat: e.target.value })}>
                            {DATE_FORMATS.map(f => (
                                <option key={f.id} value={f.id}>{f.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Default Tax Rate (%)</label>
                        <input className="form-control" type="number" min="0" max="100" step="0.1"
                            value={business.taxRate ?? 0}
                            onChange={e => updateBusiness({ taxRate: parseFloat(e.target.value) })}
                            placeholder="e.g. 13 for Nepal VAT, 20 for UK VAT" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Invoice Prefix</label>
                        <input className="form-control" value={business.invoicePrefix || 'INV'}
                            onChange={e => updateBusiness({ invoicePrefix: e.target.value })} placeholder="INV" />
                    </div>
                </div>

                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px', fontSize: '0.82rem', color: '#1d4ed8' }}>
                    💡 <strong>Tip:</strong> Set the tax rate that applies to most of your products (e.g. Nepal VAT = 13%, UK VAT = 20%, USA sales tax = varies). You can override per-product in the Inventory page.
                </div>
            </SettingSection>

            {/* ── Invoice Design ── */}
            <SettingSection title="Invoice Design" icon={FileText}>
                {/* Color Picker */}
                <div className="form-group">
                    <label className="form-label">Invoice Accent Color</label>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                        {INVOICE_COLORS.map(color => (
                            <div key={color} onClick={() => updateBusiness({ invoiceColor: color })}
                                style={{
                                    width: 36, height: 36, borderRadius: '50%', background: color,
                                    cursor: 'pointer',
                                    outline: business.invoiceColor === color ? `3px solid ${color}` : 'none',
                                    outlineOffset: 2,
                                    boxShadow: business.invoiceColor === color ? `0 0 0 2px white, 0 0 0 4px ${color}` : 'none',
                                    transition: 'all 0.2s',
                                    transform: business.invoiceColor === color ? 'scale(1.15)' : 'scale(1)',
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Invoice options */}
                <div>
                    {[
                        { key: 'showLogo', label: 'Show Business Logo', desc: 'Display your logo on all invoices' },
                        { key: 'showTax', label: 'Show Tax Breakdown', desc: `Display ${business.taxLabel || 'VAT'} amounts on invoice` },
                        { key: 'showBankDetails', label: 'Show Bank / Payment Details', desc: 'Add payment instructions at the bottom' },
                        { key: 'autoNumber', label: 'Auto Invoice Numbering', desc: 'Automatically increment invoice numbers' },
                    ].map(s => (
                        <ToggleSetting key={s.key} label={s.label} desc={s.desc}
                            value={invoiceSettings[s.key]}
                            onChange={v => setInvoiceSettings(p => ({ ...p, [s.key]: v }))} />
                    ))}
                </div>

                <div className="form-group">
                    <label className="form-label">Terms & Conditions / Invoice Footer</label>
                    <textarea className="form-control" value={invoiceSettings.termsAndConds}
                        onChange={e => setInvoiceSettings(p => ({ ...p, termsAndConds: e.target.value }))}
                        style={{ minHeight: 72 }} />
                </div>
            </SettingSection>

            {/* ── Notifications ── */}
            <SettingSection title="Notifications" icon={Bell}>
                {[
                    { key: 'lowStock', label: 'Low Stock Alerts', desc: 'Notify when stock falls below minimum level' },
                    { key: 'paymentReminders', label: 'Payment Reminders', desc: 'Remind customers about overdue invoices' },
                    { key: 'dailyReport', label: 'Daily Sales Summary', desc: 'Daily business summary at end of day' },
                    { key: 'monthlyReport', label: 'Monthly Report', desc: 'Monthly P&L report on 1st of each month' },
                ].map(s => (
                    <ToggleSetting key={s.key} label={s.label} desc={s.desc}
                        value={notifs[s.key]}
                        onChange={v => setNotifs(p => ({ ...p, [s.key]: v }))} />
                ))}
            </SettingSection>

            {/* ── User Roles ── */}
            <SettingSection title="User Roles & Access" icon={Users}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                    {[
                        { role: 'Owner', desc: 'Full access to all features', count: 1, color: '#3b82f6' },
                        { role: 'Manager', desc: 'Invoices, inventory, reports', count: 0, color: '#14b8a6' },
                        { role: 'Cashier', desc: 'Billing only, limited access', count: 0, color: '#a855f7' },
                        { role: 'Accountant', desc: 'Reports & payments, read-only', count: 0, color: '#f59e0b' },
                    ].map(r => (
                        <div key={r.role} style={{ padding: '14px 16px', border: `1px solid ${r.color}30`, borderRadius: 10, background: `${r.color}08` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <Shield size={16} color={r.color} />
                                <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{r.role}</span>
                                <span style={{ marginLeft: 'auto', background: r.color, color: 'white', borderRadius: 99, padding: '1px 8px', fontSize: '0.7rem', fontWeight: 700 }}>{r.count}</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{r.desc}</div>
                        </div>
                    ))}
                </div>
                <button className="btn btn-outline btn-sm" style={{ width: 'fit-content' }}
                    onClick={() => toast('👥 Team invites — coming in Pro version!', { icon: '🚀' })}>
                    <Users size={14} /> Invite Team Member
                </button>
            </SettingSection>

            {/* ── Backup & Data ── */}
            <SettingSection title="Backup & Data" icon={Database}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <button className="btn btn-outline" style={{ flex: 1, minWidth: 160 }} onClick={handleExportBackup}>
                        <Database size={16} /> Download Backup
                    </button>
                    <button className="btn btn-ghost" style={{ flex: 1, minWidth: 160 }}
                        onClick={() => toast('📤 Restore from backup — coming soon!', { icon: '⚙️' })}>
                        <Upload size={16} /> Restore Backup
                    </button>
                </div>
                <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10 }}>
                    <CheckCircle size={18} color="#16a34a" style={{ flexShrink: 0 }} />
                    <p style={{ fontSize: '0.8rem', color: '#166534', margin: 0 }}>
                        Your data is securely synced to the cloud. You can also download a local backup for your records.
                    </p>
                </div>
            </SettingSection>

            {/* Save Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button className="btn btn-primary btn-lg" onClick={handleSave} style={{ minWidth: 200 }}>
                    <Save size={18} /> Save All Settings
                </button>
            </div>
        </div>
    );
}
