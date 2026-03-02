// =====================================================
// AppContext.jsx — Global State Management
// Sprint 1: localStorage persistence + global-first
//            (no GST/GSTIN/India-only references)
// =====================================================
import { createContext, useContext, useState, useEffect, useRef } from 'react';
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
        const formatted = new Intl.NumberFormat(cur.locale, {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(n);
        // Replace unwanted $ with correct symbol if it appears
        if (currencyCode === 'NPR' && formatted.includes('$')) {
            return formatted.replace('$', cur.symbol);
        }
        return formatted;
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
    const [payments, setPayments] = useState(() => LS.get('mbb_payments', []));
    const [notifications, setNotifications] = useState(() => LS.get('mbb_notifications', []));

    // UI state
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Ref to track latest payments for use in invoices listener
    const paymentsRef = useRef([]);

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

    // ── Sync localStorage to Firebase on first login ──
    useEffect(() => {
        if (!user || !db) return;
        
        const syncLocalToFirebase = async () => {
            try {
                const uid = user.uid;
                
                // Sync business profile
                const localBusiness = LS.get('mbb_business', DEFAULT_BUSINESS);
                const businessWithUser = {
                    ...localBusiness,
                    email: user.email,
                    name: user.displayName || localBusiness.name || 'My Default Business'
                };
                await setDoc(doc(db, 'businesses', uid), businessWithUser, { merge: true });
                
                // Sync products
                const localProducts = LS.get('mbb_products', DEFAULT_PRODUCTS) || [];
                for (const prod of localProducts) {
                    if (prod.id) {
                        await setDoc(doc(db, 'products', prod.id.toString()), 
                            { ...prod, businessId: uid }, { merge: true }
                        );
                    }
                }
                
                // Sync customers
                const localCustomers = LS.get('mbb_customers', DEFAULT_CUSTOMERS) || [];
                for (const cust of localCustomers) {
                    if (cust.id) {
                        await setDoc(doc(db, 'customers', cust.id.toString()), 
                            { ...cust, businessId: uid }, { merge: true }
                        );
                    }
                }
                
                // Sync invoices
                const localInvoices = LS.get('mbb_invoices', DEFAULT_INVOICES) || [];
                for (const inv of localInvoices) {
                    if (inv.id) {
                        await setDoc(doc(db, 'invoices', inv.id.toString()), 
                            { ...inv, businessId: uid }, { merge: true }
                        );
                    }
                }
                
                // Sync payments
                const localPayments = LS.get('mbb_payments', []) || [];
                for (const pay of localPayments) {
                    if (pay.id) {
                        await setDoc(doc(db, 'payments', pay.id.toString()), 
                            { ...pay, businessId: uid }, { merge: true }
                        );
                    }
                }
                
                console.log('✅ Synced localStorage data to Firebase');
            } catch (err) {
                console.error('⚠️ Sync error:', err.message);
            }
        };
        
        syncLocalToFirebase();
    }, [user]);

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

        // Helper to update invoices with payment info
        const updateInvoicesWithPayments = (invoicesToUpdate, paymentData) => {
            return invoicesToUpdate.map(invoice => {
                const invoicePayments = paymentData.filter(p => p.invoiceId === invoice.id);
                const totalPaid = invoicePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
                const invoiceTotal = invoice.total || 0;
                const newStatus = totalPaid >= invoiceTotal ? 'paid' : totalPaid > 0 ? 'partial' : 'unpaid';
                return {
                    ...invoice,
                    paid: totalPaid,
                    status: newStatus,
                };
            });
        };

        const unsubPayments = onSnapshot(query(collection(db, 'payments'), where('businessId', '==', uid)), (snap) => {
            const fetchedPayments = snap.empty ? [] : snap.docs.map(d => ({ id: d.id, ...d.data() }));
            paymentsRef.current = fetchedPayments; // Update ref
            setPayments(fetchedPayments);
            
            // Update invoices with correct paid/status based on payments
            setInvoices(prevInvoices => updateInvoicesWithPayments(prevInvoices, fetchedPayments));
        });

        const unsubInvoices = onSnapshot(query(collection(db, 'invoices'), where('businessId', '==', uid)), (snap) => {
            if (snap.empty) {
                setInvoices([]);
                setNextInvoiceNo(1);
            } else {
                const fetchedInvoices = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                // Update with payment info using latest payments from ref
                setInvoices(prevInvoices => {
                    return updateInvoicesWithPayments(fetchedInvoices, paymentsRef.current);
                });
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
            unsubBusiness(); unsubProducts(); unsubCustomers(); unsubInvoices(); unsubPayments();
        };
    }, [user]);

    // ── Ensure currencyCode is set (migration) ───────
    useEffect(() => {
        if (!business.currencyCode) {
            setBusiness(prev => ({ ...prev, currencyCode: 'NPR' }));
        }
    }, [business.currencyCode]);

    // ── LocalStorage Fallback Sync ───────────────────
    useEffect(() => { if (!user) LS.set('mbb_auth', isAuthenticated); }, [isAuthenticated, user]);
    useEffect(() => { if (!user) LS.set('mbb_business', business); }, [business, user]);
    useEffect(() => { if (!user) LS.set('mbb_products', products); }, [products, user]);
    useEffect(() => { if (!user) LS.set('mbb_customers', customers); }, [customers, user]);
    useEffect(() => { if (!user) LS.set('mbb_invoices', invoices); }, [invoices, user]);
    useEffect(() => { if (!user) LS.set('mbb_nextInv', nextInvoiceNo); }, [nextInvoiceNo, user]);
    useEffect(() => { if (!user) LS.set('mbb_payments', payments); }, [payments, user]);
    useEffect(() => { if (!user) LS.set('mbb_notifications', notifications); }, [notifications, user]);

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
        
        // Generate low stock notification
        if (newStock <= prod.minStock && prod.stock > prod.minStock) {
            addNotification({
                type: 'warning',
                title: 'Low Stock Alert',
                body: `${prod.name} is now low in stock (${newStock} ${prod.unit} remaining)`,
            });
        }
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

        // Deduct inventory for each item
        for (const item of (invoice.items || [])) {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                const newStock = Math.max(0, product.stock - item.qty);
                if (user && db) {
                    await updateDoc(doc(db, 'products', item.productId.toString()), { stock: newStock });
                } else {
                    setProducts(prev => prev.map(p => p.id === item.productId ? { ...p, stock: newStock } : p));
                }
            }
        }

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
        // Restore inventory when deleting invoice
        const invoiceToDelete = invoices.find(i => i.id === id);
        if (invoiceToDelete) {
            for (const item of (invoiceToDelete.items || [])) {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    const newStock = product.stock + item.qty;
                    if (user && db) {
                        await updateDoc(doc(db, 'products', item.productId.toString()), { stock: newStock });
                    } else {
                        setProducts(prev => prev.map(p => p.id === item.productId ? { ...p, stock: newStock } : p));
                    }
                }
            }
        }

        if (user && db) await deleteDoc(doc(db, 'invoices', id.toString()));
        else setInvoices(prev => prev.filter(i => i.id !== id));
    };

    // ── Payment CRUD ─────────────────────────────────
    const addPayment = async (paymentData) => {
        const id = Date.now().toString();
        const paymentObj = {
            ...paymentData,
            id,
            businessId: user?.uid || 'local',
            createdAt: new Date().toISOString(),
        };
        
        if (user && db) {
            // Just add the payment - Firebase listener will update invoice status
            await setDoc(doc(db, 'payments', id), paymentObj);
        } else {
            // For local users, add payment and update invoice
            setPayments(prev => [...prev, paymentObj]);
            const invoice = invoices.find(i => i.id === paymentData.invoiceId);
            if (invoice) {
                const totalPaid = paymentObj.amount + (invoice.paid || 0);
                const newStatus = totalPaid >= invoice.total ? 'paid' : totalPaid > 0 ? 'partial' : 'unpaid';
                setInvoices(prev => prev.map(i => i.id === paymentData.invoiceId ? { ...i, paid: totalPaid, status: newStatus } : i));
                
                // Generate payment received notification
                const customer = customers.find(c => c.id === invoice.customerId);
                addNotification({
                    type: newStatus === 'paid' ? 'success' : 'info',
                    title: newStatus === 'paid' ? 'Invoice Paid' : 'Payment Received',
                    body: `${invoice.invoiceNo} received ${formatCurrency(paymentObj.amount, business.currencyCode || 'NPR')}${customer ? ` from ${customer.name}` : ''}`,
                });
            }
        }
        return id;
    };
    
    const updatePayment = async (id, u) => {
        if (user && db) await updateDoc(doc(db, 'payments', id.toString()), u);
        else setPayments(prev => prev.map(p => p.id === id ? { ...p, ...u } : p));
    };
    
    const deletePayment = async (id) => {
        const payment = payments.find(p => p.id === id);
        if (payment) {
            if (user && db) {
                // Just delete the payment - Firebase listener will update invoice status
                await deleteDoc(doc(db, 'payments', id.toString()));
            } else {
                // For local users, delete payment and update invoice
                setPayments(prev => prev.filter(p => p.id !== id));
                const invoice = invoices.find(i => i.id === payment.invoiceId);
                if (invoice) {
                    const totalPaid = Math.max(0, (invoice.paid || 0) - payment.amount);
                    const newStatus = totalPaid >= invoice.total ? 'paid' : totalPaid > 0 ? 'partial' : 'unpaid';
                    setInvoices(prev => prev.map(i => i.id === payment.invoiceId ? { ...i, paid: totalPaid, status: newStatus } : i));
                }
            }
        }
    };

    // ── Notification Management ──────────────────────
    const addNotification = (notificationData) => {
        const id = Date.now().toString();
        const notifObj = {
            ...notificationData,
            id,
            read: false,
            createdAt: new Date().toISOString(),
        };
        setNotifications(prev => [notifObj, ...prev]);
        return id;
    };

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearAllNotifications = () => {
        setNotifications([]);
    };

    // ── Helper: Calculate customer balance from payments ──
    const getCustomerBalance = (customerId) => {
        const customerInvoices = invoices.filter(i => i.customerId === customerId);
        if (customerInvoices.length === 0) return 0;
        
        const totalBilled = customerInvoices.reduce((sum, i) => sum + (i.total || 0), 0);
        const totalPaid = payments
            .filter(p => customerInvoices.some(i => i.id === p.invoiceId))
            .reduce((sum, p) => sum + (p.amount || 0), 0);
        
        return totalBilled - totalPaid;
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
    // Calculate pending payments - only for actual customers (not suppliers)
    const pendingPayments = invoices.reduce((s, i) => {
        // Find the customer associated with this invoice
        const customer = customers.find(c => c.id === i.customerId);
        // Only count if it's an actual customer (not a supplier)
        if (!customer || customer.type !== 'customer') return s;
        
        const invoicePayments = payments.filter(p => p.invoiceId === i.id);
        const totalPaid = invoicePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const remaining = i.total - totalPaid;
        // Only add positive balances (amounts customers owe)
        return s + (remaining > 0 ? remaining : 0);
    }, 0);

    // Log calculation details for verification
    console.log('📊 Dashboard - Pending Payments Calculation:');
    const pendingInvoices = invoices
        .map(i => {
            const customer = customers.find(c => c.id === i.customerId);
            if (!customer || customer.type !== 'customer') return null;
            const invoicePayments = payments.filter(p => p.invoiceId === i.id);
            const totalPaid = invoicePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
            const remaining = i.total - totalPaid;
            return remaining > 0 ? {
                invoiceNo: i.invoiceNo,
                customer: customer.name,
                total: i.total,
                paid: totalPaid,
                remaining: remaining
            } : null;
        })
        .filter(Boolean);
    if (pendingInvoices.length > 0) console.table(pendingInvoices);
    console.log('📊 Dashboard - Total Pending Payments:', pendingPayments);

    // Currency helper bound to current business currency
    const currency = (amount) => formatCurrency(amount, business.currencyCode || 'NPR');
    const currencySymbol = CURRENCIES.find(c => c.code === (business.currencyCode || 'NPR'))?.symbol || 'Rs.';

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
            payments, addPayment, updatePayment, deletePayment,
            notifications, addNotification, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications,
            // Computed
            lowStockProducts, totalSalesToday, pendingPayments,
            // Currency & Date formatting
            currency, currencySymbol, CURRENCIES, formatDate,
            // Helpers
            AVATAR_COLORS, getCustomerBalance,
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
