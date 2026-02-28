// =====================================================
// AppContext.jsx — Global State Management
// Sprint 1: localStorage persistence + global-first
//            (no GST/GSTIN/India-only references)
// =====================================================
import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { CURRENCIES, DATE_FORMATS, AVATAR_COLORS, DEFAULT_BUSINESS } from '../constants';

const AppContext = createContext(null);

// ── Currency Library (Global) ────────────────────────


// Format a number as currency string using the business currency
export function formatCurrency(amount, currencyCode = 'NPR') {
    const cur = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];
    const n = Number(amount) || 0;
    try {
        return new Intl.NumberFormat(cur.locale, {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(n);
    } catch {
        return `${cur.symbol}${n.toLocaleString()}`;
    }
}

// ── Date Format Utility ──────────────────────────────


export function formatDate(dateStr, fmt = 'DD/MM/YYYY') {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    if (fmt === 'MM/DD/YYYY') return `${mm}/${dd}/${yyyy}`;
    if (fmt === 'YYYY-MM-DD') return `${yyyy}-${mm}-${dd}`;
    return `${dd}/${mm}/${yyyy}`; // default DD/MM/YYYY
}

// ── localStorage helpers ─────────────────────────────
const LS = {
    get: (key, fallback) => {
        try {
            const v = localStorage.getItem(key);
            return v !== null ? JSON.parse(v) : fallback;
        } catch { return fallback; }
    },
    set: (key, value) => {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.error("LS Error", e); }
    },
};

// ── Avatar Colors ────────────────────────────────────


// ── Default Sample Data (Global-friendly) ────────────
const DEFAULT_PRODUCTS = [];
const DEFAULT_CUSTOMERS = [];
const DEFAULT_INVOICES = [];

// ── Provider ─────────────────────────────────────────
export function AppProvider({ children }) {
    // Auth — persisted initially
    const [isAuthenticated, setIsAuthenticated] = useState(() => LS.get('mbb_auth', false));
    const [user, setUser] = useState(null);
    const [authScreen, setAuthScreen] = useState('login');

    // Business profile — persisted locally
    const [business, setBusiness] = useState(() => LS.get('mbb_business', DEFAULT_BUSINESS));

    // Core data — persisted
    const [products, setProducts] = useState(() => LS.get('mbb_products', DEFAULT_PRODUCTS));
    const [customers, setCustomers] = useState(() => LS.get('mbb_customers', DEFAULT_CUSTOMERS));
    const [invoices, setInvoices] = useState(() => LS.get('mbb_invoices', DEFAULT_INVOICES));
    const [nextInvoiceNo, setNextInvoiceNo] = useState(() => LS.get('mbb_nextInv', 1));

    // UI state
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // ── Firebase Auth Listener ───────────────────────
    useEffect(() => {
        if (!auth) return;
        return onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        });
    }, []);

    // ── Firebase Firestore Sync ──────────────────────
    useEffect(() => {
        if (!user || !db) return;
        const uid = user.uid;

        const unsubBusiness = onSnapshot(doc(db, 'businesses', uid), (docSnap) => {
            if (docSnap.exists()) {
                setBusiness({ ...DEFAULT_BUSINESS, ...docSnap.data() });
            } else {
                setDoc(doc(db, 'businesses', uid), {
                    ...DEFAULT_BUSINESS,
                    email: user.email,
                    name: user.displayName || 'My Default Business'
                });
            }
        });

        const unsubProducts = onSnapshot(query(collection(db, 'products'), where('businessId', '==', uid)), (snap) => {
            setProducts(snap.empty ? [] : snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        const unsubCustomers = onSnapshot(query(collection(db, 'customers'), where('businessId', '==', uid)), (snap) => {
            setCustomers(snap.empty ? [] : snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        const unsubInvoices = onSnapshot(query(collection(db, 'invoices'), where('businessId', '==', uid)), (snap) => {
            if (snap.empty) {
                setInvoices([]);
                setNextInvoiceNo(1);
            } else {
                const fetchedInvoices = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setInvoices(fetchedInvoices);
                const maxInv = fetchedInvoices.reduce((max, inv) => {
                    const parts = inv.invoiceNo?.split('-');
                    if (!parts) return max;
                    const num = parseInt(parts[parts.length - 1], 10);
                    return !isNaN(num) && num > max ? num : max;
                }, 0);
                setNextInvoiceNo(maxInv + 1);
            }
        });

        return () => {
            unsubBusiness(); unsubProducts(); unsubCustomers(); unsubInvoices();
        };
    }, [user]);

    // ── LocalStorage Fallback Sync ───────────────────
    useEffect(() => { if (!user) LS.set('mbb_auth', isAuthenticated); }, [isAuthenticated, user]);
    useEffect(() => { if (!user) LS.set('mbb_business', business); }, [business, user]);
    useEffect(() => { if (!user) LS.set('mbb_products', products); }, [products, user]);
    useEffect(() => { if (!user) LS.set('mbb_customers', customers); }, [customers, user]);
    useEffect(() => { if (!user) LS.set('mbb_invoices', invoices); }, [invoices, user]);
    useEffect(() => { if (!user) LS.set('mbb_nextInv', nextInvoiceNo); }, [nextInvoiceNo, user]);

    // ── Auth ─────────────────────────────────────────
    const login = () => setIsAuthenticated(true);
    const logout = async () => {
        if (auth) await signOut(auth);
        setUser(null);
        setIsAuthenticated(false);
        // Clear local state immediately for a fresh feel
        setProducts([]);
        setCustomers([]);
        setInvoices([]);
        setNextInvoiceNo(1);
        setBusiness(DEFAULT_BUSINESS);
    };

    // ── Product CRUD ─────────────────────────────────
    const addProduct = async (p) => {
        const id = Date.now().toString();
        const pObj = { ...p, id, active: true, businessId: user?.uid || 'local' };
        if (user && db) {
            await setDoc(doc(db, 'products', id), pObj);
        } else {
            setProducts(prev => [...prev, pObj]);
        }
    };
    const updateProduct = async (id, u) => {
        if (user && db) await updateDoc(doc(db, 'products', id.toString()), u);
        else setProducts(prev => prev.map(p => p.id === id ? { ...p, ...u } : p));
    };
    const deleteProduct = async (id) => {
        if (user && db) await deleteDoc(doc(db, 'products', id.toString()));
        else setProducts(prev => prev.filter(p => p.id !== id));
    };
    const adjustStock = async (id, d) => {
        const prod = products.find(p => p.id === id);
        if (!prod) return;
        const newStock = Math.max(0, prod.stock + d);
        if (user && db) await updateDoc(doc(db, 'products', id.toString()), { stock: newStock });
        else setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
    };

    // ── Customer CRUD ────────────────────────────────
    const addCustomer = async (c) => {
        const colorIdx = customers.length % AVATAR_COLORS.length;
        const id = Date.now().toString();
        const cObj = { ...c, id, colorIdx, businessId: user?.uid || 'local' };
        if (user && db) await setDoc(doc(db, 'customers', id), cObj);
        else setCustomers(prev => [...prev, cObj]);
    };
    const updateCustomer = async (id, u) => {
        if (user && db) await updateDoc(doc(db, 'customers', id.toString()), u);
        else setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...u } : c));
    };
    const deleteCustomer = async (id) => {
        if (user && db) await deleteDoc(doc(db, 'customers', id.toString()));
        else setCustomers(prev => prev.filter(c => c.id !== id));
    };

    // ── Invoice CRUD ─────────────────────────────────
    const addInvoice = async (invoice) => {
        const id = Date.now().toString();
        const year = new Date().getFullYear();
        const invoiceNo = `${business.invoicePrefix}-${year}-${String(nextInvoiceNo).padStart(3, '0')}`;
        const invObj = { ...invoice, id, invoiceNo, businessId: user?.uid || 'local' };

        if (user && db) {
            await setDoc(doc(db, 'invoices', id), invObj);
        } else {
            setNextInvoiceNo(n => n + 1);
            setInvoices(prev => [...prev, invObj]);
        }
        return invoiceNo;
    };
    const updateInvoice = async (id, u) => {
        if (user && db) await updateDoc(doc(db, 'invoices', id.toString()), u);
        else setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...u } : i));
    };
    const deleteInvoice = async (id) => {
        if (user && db) await deleteDoc(doc(db, 'invoices', id.toString()));
        else setInvoices(prev => prev.filter(i => i.id !== id));
    };

    // ── Business Profile ─────────────────────────────
    const updateBusiness = async (updates) => {
        if (user && db) await updateDoc(doc(db, 'businesses', user.uid), updates);
        else setBusiness(prev => ({ ...prev, ...updates }));
    };

    // Helper to reset all app data (for testing / demo)
    const resetToSampleData = () => {
        setProducts([]);
        setCustomers([]);
        setInvoices([]);
        setNextInvoiceNo(1);
        setBusiness(DEFAULT_BUSINESS);
    };

    // ── Computed Values ──────────────────────────────
    const lowStockProducts = products.filter(p => p.stock <= p.minStock);
    const todayStr = new Date().toISOString().slice(0, 10);
    const totalSalesToday = invoices.filter(i => i.date === todayStr).reduce((s, i) => s + i.total, 0);
    const pendingPayments = invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + (i.total - i.paid), 0);

    // Currency helper bound to current business currency
    const currency = (amount) => formatCurrency(amount, business.currencyCode);
    const currencySymbol = CURRENCIES.find(c => c.code === business.currencyCode)?.symbol || 'Rs.';

    return (
        <AppContext.Provider value={{
            // Auth
            isAuthenticated, user, login, logout,
            authScreen, setAuthScreen,
            // Business
            business, updateBusiness,
            // Data
            products, addProduct, updateProduct, deleteProduct, adjustStock,
            customers, addCustomer, updateCustomer, deleteCustomer,
            invoices, addInvoice, updateInvoice, deleteInvoice,
            // Computed
            lowStockProducts, totalSalesToday, pendingPayments,
            // Currency & Date formatting
            currency, currencySymbol, CURRENCIES, formatDate,
            // Helpers
            AVATAR_COLORS,
            sidebarOpen, setSidebarOpen,
            resetToSampleData,
        }}>
            {children}
        </AppContext.Provider>
    );
}

export const useApp = () => {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used within AppProvider');
    return ctx;
};
