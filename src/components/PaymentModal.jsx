// =====================================================
// PaymentModal.jsx — Record & Manage Invoice Payments
// =====================================================
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Plus, Trash2, DollarSign, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaymentModal({ invoice, onClose, onSave }) {
    const { currency } = useApp();
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentNote, setPaymentNote] = useState('');

    // Calculate totals
    const payments = invoice.payments || [];
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const invoiceTotal = invoice.total || 0;
    const balanceDue = invoiceTotal - totalPaid;
    const isFullyPaid = balanceDue <= 0;

    const handleAddPayment = () => {
        const amount = parseFloat(paymentAmount);
        
        if (!amount || amount <= 0) {
            toast.error('Please enter a valid payment amount');
            return;
        }

        if (amount > balanceDue) {
            toast.warning(`Payment exceeds balance due. Balance: ${currency(balanceDue)}`);
        }

        const newPayment = {
            id: Date.now().toString(),
            date: paymentDate,
            amount,
            method: paymentMethod,
            note: paymentNote,
        };

        const updatedPayments = [...payments, newPayment];
        const newTotalPaid = totalPaid + amount;
        const newStatus = newTotalPaid >= invoiceTotal ? 'paid' : newTotalPaid > 0 ? 'partial' : 'unpaid';

        onSave({
            ...invoice,
            payments: updatedPayments,
            paid: newTotalPaid,
            status: newStatus,
        });

        setPaymentAmount('');
        setPaymentDate(new Date().toISOString().slice(0, 10));
        setPaymentMethod('cash');
        setPaymentNote('');
        toast.success('Payment recorded successfully!');
    };

    const handleDeletePayment = (paymentId) => {
        const updatedPayments = payments.filter(p => p.id !== paymentId);
        const newTotalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
        const newStatus = newTotalPaid >= invoiceTotal ? 'paid' : newTotalPaid > 0 ? 'partial' : 'unpaid';

        onSave({
            ...invoice,
            payments: updatedPayments,
            paid: newTotalPaid,
            status: newStatus,
        });

        toast.success('Payment deleted');
    };

    return (
        <div className="modal-overlay">
            <div className="modal modal-lg">
                <div className="modal-header">
                    <h3 className="modal-title">Payment Management — {invoice.invoiceNo}</h3>
                    <button className="modal-close" onClick={onClose}><X size={16} /></button>
                </div>

                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Invoice Summary */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Invoice Total</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1f2937', marginTop: 4 }}>{currency(invoiceTotal)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Already Paid</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#16a34a', marginTop: 4 }}>{currency(totalPaid)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Balance Due</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: isFullyPaid ? '#16a34a' : '#dc2626', marginTop: 4 }}>
                                    {isFullyPaid ? '✓ Paid' : currency(balanceDue)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Form */}
                    {!isFullyPaid && (
                        <div style={{ padding: 16, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10 }}>
                            <div style={{ fontWeight: 700, marginBottom: 12, color: '#15803d' }}>Record New Payment</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div className="form-group">
                                    <label className="form-label">Payment Amount *</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={paymentAmount}
                                        onChange={e => setPaymentAmount(e.target.value)}
                                        placeholder={`Up to ${currency(balanceDue)}`}
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Payment Date *</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={paymentDate}
                                        onChange={e => setPaymentDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                                <div className="form-group">
                                    <label className="form-label">Payment Method</label>
                                    <select
                                        className="form-select"
                                        value={paymentMethod}
                                        onChange={e => setPaymentMethod(e.target.value)}
                                    >
                                        <option value="cash">💵 Cash</option>
                                        <option value="bank">🏦 Bank Transfer</option>
                                        <option value="cheque">📄 Cheque</option>
                                        <option value="online">💳 Online Payment</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Note (Optional)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={paymentNote}
                                        onChange={e => setPaymentNote(e.target.value)}
                                        placeholder="Cheque no., reference ID, etc."
                                    />
                                </div>
                            </div>
                            <button
                                className="btn btn-success"
                                onClick={handleAddPayment}
                                style={{ marginTop: 12, width: '100%' }}
                            >
                                <Plus size={16} /> Record Payment
                            </button>
                        </div>
                    )}

                    {/* Payment History */}
                    <div>
                        <div style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.95rem' }}>
                            Payment History ({payments.length})
                        </div>
                        {payments.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', background: '#f8fafc', borderRadius: 10 }}>
                                No payments recorded yet
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {payments.map((payment, idx) => (
                                    <div
                                        key={payment.id}
                                        style={{
                                            padding: '12px 16px',
                                            background: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: 8,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                                            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <DollarSign size={20} color="#2563eb" />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#1f2937' }}>
                                                    {payment.method === 'cash' && '💵'}
                                                    {payment.method === 'bank' && '🏦'}
                                                    {payment.method === 'cheque' && '📄'}
                                                    {payment.method === 'online' && '💳'}
                                                    {' '}
                                                    {payment.method.charAt(0).toUpperCase() + payment.method.slice(1)}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                                    <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />
                                                    {payment.date}
                                                    {payment.note && ` • ${payment.note}`}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#16a34a', minWidth: 80, textAlign: 'right' }}>
                                                {currency(payment.amount)}
                                            </div>
                                            <button
                                                className="btn btn-icon"
                                                style={{ width: 28, height: 28, background: '#fef2f2', color: '#dc2626', border: 'none' }}
                                                onClick={() => handleDeletePayment(payment.id)}
                                                title="Delete payment"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}
