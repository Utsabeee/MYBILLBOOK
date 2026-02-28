import { useRef } from 'react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { Printer, MessageCircle, Mail, X } from 'lucide-react';

export default function InvoicePreviewModal({ invoice, onClose, business }) {
    const printRef = useRef();
    const { currency } = useApp();

    const handlePrint = () => {
        const content = printRef.current.innerHTML;
        const win = window.open('', '_blank');
        win.document.write(`
      <html><head><title>${invoice.invoiceNo}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #1f2937; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #2563eb; color: white; padding: 10px; text-align: left; }
        td { padding: 8px; border-bottom: 1px solid #f1f5f9; }
        .total-row td { font-weight: bold; background: #f8fafc; }
      </style></head>
      <body>${content}</body></html>
    `);
        win.document.close();
        win.print();
    };

    return (
        <div className="modal-overlay">
            <div className="modal modal-lg">
                <div className="modal-header">
                    <h3 className="modal-title">Invoice Preview — {invoice.invoiceNo}</h3>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-outline btn-sm" onClick={handlePrint}>
                            <Printer size={14} /> Print
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => toast.success(`WhatsApp share — coming soon!`)}
                        >
                            <MessageCircle size={14} color="#22c55e" /> WhatsApp
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => toast.success(`Email share — coming soon!`)}>
                            <Mail size={14} color="#3b82f6" /> Email
                        </button>
                        <button className="modal-close" onClick={onClose}><X size={16} /></button>
                    </div>
                </div>

                <div className="modal-body">
                    <div ref={printRef} style={{
                        background: 'white', borderRadius: 12, border: '1px solid #e5e7eb',
                        padding: 32, maxWidth: 720, margin: '0 auto',
                    }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28, alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: invoice.business?.invoiceColor || '#2563eb', fontFamily: 'Poppins,sans-serif' }}>
                                    INVOICE
                                </div>
                                <div style={{ marginTop: 6, fontWeight: 800, fontSize: '1rem', color: '#1f2937' }}>{business.name}</div>
                                <div style={{ fontSize: '0.8rem', color: '#6b7280', maxWidth: 220 }}>{business.address}</div>
                                {business.taxId && (
                                    <div style={{ marginTop: 6, fontSize: '0.78rem', fontWeight: 700, color: '#1d4ed8', background: '#dbeafe', padding: '2px 8px', borderRadius: 20, display: 'inline-block' }}>
                                        {business.taxLabel || 'VAT'} No: {business.taxId}
                                    </div>
                                )}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ background: 'linear-gradient(135deg,#2563eb,#0d9488)', color: 'white', padding: '6px 16px', borderRadius: 8, fontWeight: 800, marginBottom: 8 }}>
                                    {invoice.invoiceNo}
                                </div>
                                <div style={{ fontSize: '0.82rem', color: '#6b7280' }}><b>Date:</b> {invoice.date}</div>
                                <div style={{ marginTop: 8, padding: '8px 12px', background: '#f8fafc', borderRadius: 8, textAlign: 'left', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Bill To</div>
                                    <div style={{ fontWeight: 700, color: '#1f2937', marginTop: 2 }}>{invoice.customer}</div>
                                </div>
                            </div>
                        </div>

                        {/* Items */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
                            <thead>
                                <tr>
                                    {['#', 'Description', 'Qty', 'Unit', 'Rate', invoice.taxEnabled && 'Tax %', 'Amount'].filter(Boolean).map(h => (
                                        <th key={h} style={{ background: business.invoiceColor || '#2563eb', color: 'white', padding: '10px 12px', textAlign: 'left', fontSize: '0.8rem' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items.map((item, i) => (
                                    <tr key={i}>
                                        <td style={{ padding: '10px 12px', color: '#9ca3af', fontSize: '0.82rem' }}>{i + 1}</td>
                                        <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1f2937' }}>{item.name}</td>
                                        <td style={{ padding: '10px 12px' }}>{item.qty}</td>
                                        <td style={{ padding: '10px 12px', color: '#6b7280', fontSize: '0.82rem' }}>{item.unit}</td>
                                        <td style={{ padding: '10px 12px' }}>{currency(item.price)}</td>
                                        {invoice.taxEnabled && <td style={{ padding: '10px 12px', color: '#2563eb' }}>{item.taxRate ?? 0}%</td>}
                                        <td style={{ padding: '10px 12px', fontWeight: 700 }}>{currency(item.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <div style={{ minWidth: 260 }}>
                                {[
                                    { label: 'Subtotal', value: currency(invoice.subtotal) },
                                    invoice.discount > 0 && { label: 'Discount', value: `-${currency(invoice.discount)}` },
                                    invoice.taxEnabled && { label: business.taxLabel || 'VAT', value: currency(invoice.taxAmount || 0) },
                                ].filter(Boolean).map(r => (
                                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.85rem', borderBottom: '1px solid #f1f5f9' }}>
                                        <span style={{ color: '#6b7280' }}>{r.label}</span>
                                        <span style={{ fontWeight: 600 }}>{r.value}</span>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: '1.1rem', fontWeight: 900, borderTop: '2px solid #e2e8f0', marginTop: 4 }}>
                                    <span>TOTAL</span>
                                    <span style={{ color: business.invoiceColor || '#2563eb' }}>{currency(invoice.total)}</span>
                                </div>
                                <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, background: invoice.status === 'paid' ? '#dcfce7' : '#fef3c7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: invoice.status === 'paid' ? '#15803d' : '#92400e' }}>
                                        {invoice.status === 'paid' ? '✅ PAID IN FULL' : `⏳ Balance Due: ${currency(invoice.total - invoice.paid)}`}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {invoice.notes && (
                            <div style={{ marginTop: 20, padding: '12px', background: '#f8fafc', borderRadius: 8, fontSize: '0.82rem', color: '#6b7280' }}>
                                <b>Notes:</b> {invoice.notes}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
