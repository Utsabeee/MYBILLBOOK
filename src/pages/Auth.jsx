// =====================================================
// Auth.jsx — Login, Signup, Forgot Password screens
// Using JWT authentication via AppContext
// =====================================================
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, Zap, Mail, Lock, User, Phone, Building2, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import logoImage from '../components/image/ChatGPT Image Mar 2, 2026, 04_20_16 PM.png';

function PasswordInput({ value, onChange, placeholder = 'Password', id }) {
    const [show, setShow] = useState(false);
    return (
        <div style={{ position: 'relative' }}>
            <input
                id={id}
                type={show ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="form-control"
                style={{ paddingRight: 44 }}
            />
            <button
                type="button"
                onClick={() => setShow(!show)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
            >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    );
}

function InputWithIcon({ icon: Icon, ...rest }) {
    return (
        <div style={{ position: 'relative' }}>
            {Icon && (
                <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                    <Icon size={16} />
                </div>
            )}
            <input {...rest} className="form-control" style={{ paddingLeft: Icon ? 38 : 14 }} />
        </div>
    );
}

// ── Login Screen ──
function LoginScreen() {
    const { setAuthScreen, login, authLoading } = useApp();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [localLoading, setLocalLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) { setError('Please fill all fields'); return; }
        setLocalLoading(true);
        setError('');
        try {
            await login(email, password);
            // AppContext will set authUser and redirect
        } catch (err) {
            const errMsg = err.response?.data?.error || err.message || 'Login failed';
            setError(errMsg);
        }
        setLocalLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-bg-pattern" />
            {/* Left decorative panel (hidden on mobile) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, maxWidth: 500 }}
                className="auth-left-panel">
                <div style={{ color: '#111827', padding: 40, maxWidth: 420 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                        <img 
                            src={logoImage} 
                            alt="MyBillBook Logo" 
                            style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover' }} 
                        />
                        <div>
                            <div style={{ fontSize: '1.5rem', fontFamily: 'Poppins,sans-serif', fontWeight: 800, color: '#111827' }}>MyBillBook</div>
                            <div style={{ fontSize: '0.8rem', color: '#374151' }}>Smart Billing & Inventory</div>
                        </div>
                    </div>
                    <h1 style={{ color: '#111827', fontSize: '2rem', fontFamily: 'Poppins,sans-serif', marginBottom: 16, lineHeight: 1.2 }}>
                        Manage your business<br />
                        <span style={{ background: 'linear-gradient(90deg,#60a5fa,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            smarter & faster
                        </span>
                    </h1>
                    <p style={{ color: '#374151', lineHeight: 1.6, marginBottom: 28 }}>
                        Professional billing, inventory management, and business analytics — all in one powerful platform.
                    </p>
                    {[
                        'Tax-compliant Invoice Generation',
                        'Real-time Inventory Tracking',
                        'Customer & Supplier Management',
                        'Detailed Reports & Analytics',
                    ].map(f => (
                        <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                            <CheckCircle size={16} color="#34d399" style={{ flexShrink: 0 }} />
                            <span style={{ color: '#1f2937', fontSize: '0.875rem' }}>{f}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Auth Card */}
            <div className="auth-card" style={{ maxWidth: 440 }}>
                <div className="auth-logo">
                    <div className="auth-logo-icon">
                        <Zap size={28} color="white" />
                    </div>
                    <h2 className="auth-title">Welcome back!</h2>
                    <p className="auth-sub">Sign in to your MyBillBook account</p>
                </div>

                {error && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: '0.85rem', marginBottom: 8 }}>
                        {error}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="login-email">Email Address</label>
                        <InputWithIcon id="login-email" icon={Mail} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" />
                    </div>

                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label className="form-label" htmlFor="login-password">Password</label>
                            <button type="button" onClick={() => setAuthScreen('forgot')} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
                                Forgot password?
                            </button>
                        </div>
                        <PasswordInput id="login-password" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 4 }} disabled={localLoading || authLoading}>
                        {localLoading || authLoading ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                </svg>
                                Signing in...
                            </span>
                        ) : 'Sign In'}
                    </button>
                </form>

                <div className="auth-divider" style={{ marginTop: 20 }}>or</div>

                <p style={{ textAlign: 'center', fontSize: '0.875rem', marginTop: 12 }}>
                    Don't have an account?{' '}
                    <button onClick={() => setAuthScreen('signup')} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                        Create free account
                    </button>
                </p>

                <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#000000', marginTop: 20 }}>
                    Enter your credentials to manage your store data securely.
                </p>
            </div>

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media(max-width:900px) { .auth-left-panel { display: none !important; } }
      `}</style>
        </div>
    );
}

// ── Signup Screen ──
function SignupScreen() {
    const { setAuthScreen, register, authLoading } = useApp();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', businessName: 'My Store', gst: '' });
    const [localLoading, setLocalLoading] = useState(false);
    const [error, setError] = useState('');

    const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleNext = async (e) => {
        e.preventDefault();
        setError('');
        
        if (step === 1) {
            if (!form.name || !form.phone || !form.email || !form.password) {
                setError('Please fill all fields');
                return;
            }
            if (form.password.length < 6) {
                setError('Password must be at least 6 characters');
                return;
            }
            setStep(2);
            return;
        }
        
        setLocalLoading(true);
        try {
            // Register with JWT backend
            const success = await register(form.email, form.password, form.businessName, form.name, form.phone);
            if (success) {
                // Success toast already shown in AppContext
                // Auto-login happens in register function
            }
        } catch (err) {
            const errMsg = err.response?.data?.error || err.message || 'Failed to create account';
            setError(errMsg);
        }
        setLocalLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-bg-pattern" />
            <div className="auth-card" style={{ maxWidth: 460 }}>
                <div className="auth-logo">
                    <img 
                        src={logoImage} 
                        alt="MyBillBook Logo" 
                        style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover', marginBottom: 12 }} 
                    />
                    <h2 className="auth-title">Create Account</h2>
                    <p className="auth-sub">Step {step} of 2 — {step === 1 ? 'Personal Info' : 'Business Details'}</p>
                </div>

                {/* Progress indicator */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                    {[1, 2].map(s => (
                        <div key={s} style={{
                            flex: 1, height: 4, borderRadius: 4,
                            background: s <= step ? 'linear-gradient(90deg,#3b82f6,#14b8a6)' : '#e5e7eb',
                            transition: 'background 0.3s'
                        }} />
                    ))}
                </div>

                {error && (
                    <div style={{
                        background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
                        padding: '12px 16px', marginBottom: 16, color: '#dc2626', fontSize: '0.85rem'
                    }}>
                        ❌ {error}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleNext}>
                    {step === 1 ? (
                        <>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <InputWithIcon icon={User} type="text" value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. John Doe Consulting" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Mobile Number</label>
                                <InputWithIcon icon={Phone} type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+1 234 567 890" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <InputWithIcon icon={Mail} type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@example.com" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <PasswordInput value={form.password} onChange={e => update('password', e.target.value)} />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="form-group">
                                <label className="form-label">Business / Shop Name</label>
                                <InputWithIcon icon={Building2} type="text" value={form.businessName} onChange={e => update('businessName', e.target.value)} placeholder="e.g. Global Trade Store" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Tax ID <span style={{ color: '#9ca3af', fontWeight: 400 }}>(Optional)</span></label>
                                <InputWithIcon icon={Building2} type="text" value={form.gst} onChange={e => update('gst', e.target.value)} placeholder="Registration Number" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Business Type</label>
                                <select className="form-select">
                                    <option>Retail Shop</option>
                                    <option>Wholesale</option>
                                    <option>Service Provider</option>
                                    <option>Manufacturing</option>
                                    <option>E-commerce</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </>
                    )}

                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={localLoading || authLoading}>
                        {localLoading || authLoading ? 'Creating...' : step === 1 ? 'Continue →' : 'Create Account'}
                    </button>
                </form>

                {step === 2 && (
                    <button onClick={() => setStep(1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', margin: '12px auto 0', fontSize: '0.85rem' }}>
                        <ArrowLeft size={14} /> Back
                    </button>
                )}

                <p style={{ textAlign: 'center', fontSize: '0.875rem', marginTop: 16 }}>
                    Already have an account?{' '}
                    <button onClick={() => setAuthScreen('login')} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                        Sign in
                    </button>
                </p>
            </div>
        </div>
    );
}

// ── Forgot Password Screen ──
function ForgotScreen() {
    const { setAuthScreen } = useApp();
    return (
        <div className="auth-page">
            <div className="auth-bg-pattern" />
            <div className="auth-card">
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ width: 64, height: 64, background: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <Lock size={32} color="#d97706" />
                    </div>
                    <h2 className="auth-title">Password Reset</h2>
                    <p className="auth-sub" style={{ marginTop: 8 }}>Password reset functionality will be available soon.</p>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: 12, lineHeight: 1.5 }}>
                        Please contact support if you've forgotten your password.
                    </p>
                </div>
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <button onClick={() => setAuthScreen('login')} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4, margin: '0 auto' }}>
                        <ArrowLeft size={14} /> Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Auth() {
    const { authScreen } = useApp();
    if (authScreen === 'signup') return <SignupScreen />;
    if (authScreen === 'forgot') return <ForgotScreen />;
    return <LoginScreen />;
}
