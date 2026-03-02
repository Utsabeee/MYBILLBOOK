// =====================================================
// PaymentModal.jsx — Record & Manage Invoice Payments
// =====================================================
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Plus, Trash2, DollarSign, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaymentModal({ invoice, onClose }) {
    const { currency, addPayment, deletePayment, payments } = useApp();
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentNote, setPaymentNote] = useState('');

    // Get payments for this invoice
    const invoicePayments = payments.filter(p => p.invoiceId === invoice.id) || [];
    const totalPaid = invoicePayments.reduce((sum, p) => sum + p.amount, 0);
    const invoiceTotal = invoice.total || 0;
    const balanceDue = invoiceTotal - totalPaid;
    const isFullyPaid = balanceDue <= 0;

    const handleAddPayment = async () => {
        const amount = parseFloat(paymentAmount);
        
        if (!amount || amount <= 0) {
            toast.error('Please enter a valid payment amount');
            return;
        }

        if (amount > balanceDue) {
            toast.warning(`Payment exceeds balance due. Balance: ${currency(balanceDue)}`);
            return;
        }

        try {
            await addPayment({
                invoiceId: invoice.id,
                customerId: invoice.customerId,
                date: paymentDate,
                amount,
                method: paymentMethod,
                note: paymentNote,
            });

            setPaymentAmount('');
            setPaymentDate(new Date().toISOString().slice(0, 10));
            setPaymentMethod('cash');
            setPaymentNote('');
            toast.success('Payment recorded successfully!');
        } catch (error) {
            toast.error('Failed to record payment');
            console.error(error);
        }
    };

    const handleDeletePayment = async (paymentId) => {
        try {
            await deletePayment(paymentId);
            toast.success('Payment deleted');
        } catch (error) {
            toast.error('Failed to delete payment');
            console.error(error);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal modal-lg">
                <div className="modal-header">
                    <h3 className="modal-title">Payment Management — {invoice.invoiceNo}</h3>
                    <button className="modal-close" onClick={onClose}><X size={16} /></button>
                </div>

                <div className="modal-body payment-modal-body">
                    {/* Invoice Summary */}
                    <div className="payment-summary-card">
                        <div className="payment-summary-grid">
                            <div>
                                <div className="payment-summary-label">Invoice Total</div>
                                <div className="payment-summary-value">{currency(invoiceTotal)}</div>
                            </div>
                            <div>
                                <div className="payment-summary-label">Already Paid</div>
                                <div className="payment-summary-value success">{currency(totalPaid)}</div>
                            </div>
                            <div>
                                <div className="payment-summary-label">Balance Due</div>
                                <div className={`payment-summary-value ${isFullyPaid ? 'success' : 'danger'}`}>
                                    {isFullyPaid ? '✓ Paid' : currency(balanceDue)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Form */}
                    {!isFullyPaid && (
                        <div className="payment-form-card">
                            <div className="payment-form-title">Record New Payment</div>
                            <div className="payment-form-grid">
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
                            <div className="payment-form-grid payment-form-grid-spaced">
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
                                className="btn btn-success payment-submit-btn"
                                onClick={handleAddPayment}
                            >
                                <Plus size={16} /> Record Payment
                            </button>
                        </div>
                    )}

                    {/* Payment History */}
                    <div>
                        <div className="payment-history-title">
                            Payment History ({invoicePayments.length})
                        </div>
                        {invoicePayments.length === 0 ? (
                            <div className="payment-empty">
                                No payments recorded yet
                            </div>
                        ) : (
                            <div className="payment-history-list">
                                {invoicePayments.map((payment) => (
                                    <div
                                        key={payment.id}
                                        className="payment-history-row"
                                    >
                                        <div className="payment-history-left">
                                            <div className="payment-history-icon">
                                                <DollarSign size={20} color="#2563eb" />
                                            </div>
                                            <div>
                                                <div className="payment-method-name">
                                                    {payment.method === 'cash' && '💵'}
                                                    {payment.method === 'bank' && '🏦'}
                                                    {payment.method === 'cheque' && '📄'}
                                                    {payment.method === 'online' && '💳'}
                                                    {' '}
                                                    {payment.method.charAt(0).toUpperCase() + payment.method.slice(1)}
                                                </div>
                                                <div className="payment-method-meta">
                                                    <Calendar size={12} className="payment-calendar-icon" />
                                                    {payment.date}
                                                    {payment.note && ` • ${payment.note}`}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="payment-history-right">
                                            <div className="payment-amount">
                                                {currency(payment.amount)}
                                            </div>
                                            <button
                                                className="btn btn-icon payment-delete-btn"
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
