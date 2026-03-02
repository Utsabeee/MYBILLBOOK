import { CheckCircle, AlertCircle, Zap, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { auth, db } from '../firebase';

export default function FirebaseDebugStatus() {
    const { user, business } = useApp();

    const checks = [
        {
            label: 'User Authentication',
            status: user ? 'connected' : 'disconnected',
            detail: user ? `✅ Logged in as ${user.email}` : '❌ Not logged in',
            icon: Shield,
        },
        {
            label: 'Firestore Database',
            status: db ? 'connected' : 'disconnected',
            detail: db ? '✅ Connected' : '❌ Not connected',
            icon: Zap,
        },
        {
            label: 'Business Profile',
            status: business?.name ? 'connected' : 'disconnected',
            detail: business?.name ? `✅ ${business.name}` : '❌ No business data',
            icon: CheckCircle,
        },
        {
            label: 'Firebase Project',
            status: 'info',
            detail: `Project ID: billbook-36af4`,
            icon: AlertCircle,
        },
    ];

    return (
        <div style={{
            padding: '20px',
            backgroundColor: '#f3f4f6',
            borderRadius: '12px',
            marginTop: '20px',
            border: '1px solid #e5e7eb',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '16px',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#1f2937',
            }}>
                🔍 Firebase Debug Status
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '12px',
            }}>
                {checks.map((check, idx) => {
                    const Icon = check.icon;
                    const bgColor = check.status === 'connected' ? '#ecfdf5' : 
                                   check.status === 'disconnected' ? '#fef2f2' : '#eff6ff';
                    const borderColor = check.status === 'connected' ? '#86efac' : 
                                       check.status === 'disconnected' ? '#fca5a5' : '#93c5fd';
                    const textColor = check.status === 'connected' ? '#16a34a' : 
                                     check.status === 'disconnected' ? '#dc2626' : '#1e40af';

                    return (
                        <div
                            key={idx}
                            style={{
                                padding: '12px',
                                backgroundColor: bgColor,
                                borderRadius: '8px',
                                border: `2px solid ${borderColor}`,
                                display: 'flex',
                                gap: '10px',
                                alignItems: 'flex-start',
                            }}
                        >
                            <Icon size={20} style={{ color: textColor, marginTop: '2px', flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    color: '#374151',
                                    marginBottom: '4px',
                                }}>
                                    {check.label}
                                </div>
                                <div style={{
                                    fontSize: '0.78rem',
                                    color: textColor,
                                    fontFamily: 'monospace',
                                }}>
                                    {check.detail}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#fef3c7',
                borderRadius: '8px',
                borderLeft: '4px solid #f59e0b',
                fontSize: '0.78rem',
                color: '#92400e',
                lineHeight: '1.5',
            }}>
                <strong>Setup Checklist:</strong><br/>
                ✅ Firebase Project: billbook-36af4<br/>
                ✅ Email/Password Auth enabled<br/>
                ✅ Google OAuth enabled<br/>
                ✅ Firestore database created<br/>
                ✅ Security rules configured<br/>
                ✅ Collections: businesses, products, customers, invoices, payments
            </div>
        </div>
    );
}
