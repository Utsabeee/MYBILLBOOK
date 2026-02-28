// =====================================================
// Auth.jsx — Login, Signup, Forgot Password screens
// =====================================================
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, Zap, Mail, Lock, User, Phone, Building2, ArrowLeft, CheckCircle } from 'lucide-react';
import { auth, googleProvider, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

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
    const { setAuthScreen } = useApp();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) { setError('Please fill all fields'); return; }
        setLoading(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // AppContext's onAuthStateChanged will pick this up
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        }
        setLoading(false);
    };

    const handleGoogleSignIn = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-bg-pattern" />
            {/* Left decorative panel (hidden on mobile) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, maxWidth: 500 }}
                className="auth-left-panel">
                <div style={{ color: 'white', padding: 40, maxWidth: 420 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                        <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg,#3b82f6,#14b8a6)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Zap size={26} color="white" />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontFamily: 'Poppins,sans-serif', fontWeight: 800 }}>MyBillBook</div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Smart Billing & Inventory</div>
                        </div>
                    </div>
                    <h1 style={{ color: 'white', fontSize: '2rem', fontFamily: 'Poppins,sans-serif', marginBottom: 16, lineHeight: 1.2 }}>
                        Manage your business<br />
                        <span style={{ background: 'linear-gradient(90deg,#60a5fa,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            smarter & faster
                        </span>
                    </h1>
                    <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: 28 }}>
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
                            <span style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>{f}</span>
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

                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 4 }} disabled={loading}>
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                </svg>
                                Signing in...
                            </span>
                        ) : 'Sign In'}
                    </button>

                    <button type="button" onClick={handleGoogleSignIn} className="btn btn-outline btn-lg" style={{ width: '100%', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" /><path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z" /><path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z" /><path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0 7.565 0 3.515 2.7 1.545 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" /></svg>
                        Sign in with Google
                    </button>
                </form>

                <div className="auth-divider" style={{ marginTop: 20 }}>or</div>

                <p style={{ textAlign: 'center', fontSize: '0.875rem', marginTop: 12 }}>
                    Don't have an account?{' '}
                    <button onClick={() => setAuthScreen('signup')} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                        Create free account
                    </button>
                </p>

                <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#9ca3af', marginTop: 20 }}>
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
    const { setAuthScreen } = useApp();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', businessName: '', gst: '' });
    const [loading, setLoading] = useState(false);

    const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleNext = async (e) => {
        e.preventDefault();
        if (step === 1) { setStep(2); return; }
        setLoading(true);
        try {
            // 1. Create User
            const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
            const user = userCredential.user;

            // 2. We can automatically create a business profile for them in Firestore
            await setDoc(doc(db, "businesses", user.uid), {
                name: form.businessName,
                taxId: form.gst || '',
                ownerName: form.name,
                phone: form.phone,
                email: form.email,
                createdAt: new Date()
            });
            await setDoc(doc(db, "users", user.uid), {
                email: form.email,
                name: form.name,
                businessId: user.uid, // simpler 1:1 mapping for now
                role: 'owner'
            });
            toast.success("Account created successfully!");
        } catch (err) {
            toast.error(err.message.replace('Firebase: ', ''));
        }
        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-bg-pattern" />
            <div className="auth-card" style={{ maxWidth: 460 }}>
                <div className="auth-logo">
                    <div className="auth-logo-icon"><Zap size={28} color="white" /></div>
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

                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Creating...' : step === 1 ? 'Continue →' : 'Create Account'}
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
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await sendPasswordResetEmail(auth, email);
            setSent(true);
        } catch (err) {
            toast.error(err.message.replace('Firebase: ', ''));
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-bg-pattern" />
            <div className="auth-card">
                {!sent ? (
                    <>
                        <div className="auth-logo">
                            <div className="auth-logo-icon"><Zap size={28} color="white" /></div>
                            <h2 className="auth-title">Reset Password</h2>
                            <p className="auth-sub">Enter your email to receive reset instructions</p>
                        </div>
                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <InputWithIcon icon={Mail} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                                Send Reset Link
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ width: 64, height: 64, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <CheckCircle size={32} color="#16a34a" />
                        </div>
                        <h2 className="auth-title">Email Sent!</h2>
                        <p className="auth-sub" style={{ marginTop: 8 }}>Check your inbox for the password reset link.</p>
                    </div>
                )}
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
