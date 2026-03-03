// =====================================================
// AppContext.jsx — Global State Management (v2)
// Backend API Integration + JWT Authentication
// =====================================================
import { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../api/client';
import { CURRENCIES, AVATAR_COLORS, DEFAULT_BUSINESS } from '../constants';
import toast from 'react-hot-toast';

const AppContext = createContext(null);

// ── Currency Library (Global) ────────────────────────


// Format a number as currency string using the business currency
export function formatCurrency(amount, currencyCode = 'USD') {
    const cur = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];
    const n = Number(amount) || 0;
    try {
        const formatted = new Intl.NumberFormat(cur.locale, {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(n);
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
const TokenStorage = {
    getAccessToken: () => localStorage.getItem('accessToken'),
    getRefreshToken: () => localStorage.getItem('refreshToken'),
    setAccessToken: (token) => localStorage.setItem('accessToken', token),
    setRefreshToken: (token) => localStorage.setItem('refreshToken', token),
    clear: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    },
};

// ── Provider ─────────────────────────────────────────
export function AppProvider({ children }) {
    // Auth state
    const [isAuthenticated, setIsAuthenticated] = useState(!!TokenStorage.getAccessToken());
    const [user, setUser] = useState(null);
    const [authScreen, setAuthScreen] = useState('login');
    const [authLoading, setAuthLoading] = useState(false);

    // Business profile
    const [business, setBusiness] = useState(DEFAULT_BUSINESS);
    const [businessLoading, setBusinessLoading] = useState(false);

    // Core data
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);

    const [customers, setCustomers] = useState([]);
    const [customersLoading, setCustomersLoading] = useState(false);

    const [invoices, setInvoices] = useState([]);
    const [invoicesLoading, setInvoicesLoading] = useState(false);

    const [payments, setPayments] = useState([]);
    const [paymentsLoading, setPaymentsLoading] = useState(false);

    const [expenses, setExpenses] = useState([]);
    const [expensesLoading, setExpensesLoading] = useState(false);

    const [notifications, setNotifications] = useState([]);

    // UI state
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // ── Load initial data on mount ────────────────────
    useEffect(() => {
        const token = TokenStorage.getAccessToken();
        if (token) {
            setIsAuthenticated(true);
            loadAllData();
        }
    }, []);

    // ── Load all data from API ────────────────────────
    const loadAllData = async (silent = false) => {
        try {
            const [business, products, customers, invoices, expenses] = await Promise.all([
                api.businessApi.getProfile().catch(err => {
                    if (!silent) console.error('Failed to load business:', err);
                    return DEFAULT_BUSINESS;
                }),
                api.productsApi.getAll().catch(() => []),
                api.customersApi.getAll().catch(() => []),
                api.invoicesApi.getAll().catch(() => []),
                api.expensesApi.getAll().catch(() => []),
            ]);

            setBusiness(business || DEFAULT_BUSINESS);
            setProducts(products || []);
            setCustomers(customers || []);
            setInvoices(invoices || []);
            setExpenses(expenses || []);

            // Load payments for each invoice
            if (invoices?.length > 0) {
                const allPayments = [];
                for (const invoice of invoices) {
                    try {
                        const payments = await api.paymentsApi.getForInvoice(invoice.id);
                        allPayments.push(...payments);
                    } catch (err) {
                        if (!silent) console.error(`Failed to load payments for invoice ${invoice.id}:`, err);
                    }
                }
                setPayments(allPayments);
            }
        } catch (error) {
            if (!silent) {
                console.error('Failed to load app data:', error);
                toast.error('Failed to load data');
            }
        }
    };

    // ── Auth Functions ───────────────────────────────
    const register = async (email, password, businessName, ownerName, businessPhone) => {
        setAuthLoading(true);
        try {
            const response = await api.authApi.register({
                email,
                password,
                businessName,
                ownerName,
                businessPhone,
            });

            TokenStorage.setAccessToken(response.accessToken);
            TokenStorage.setRefreshToken(response.refreshToken);
            setUser(response.user);
            setIsAuthenticated(true);
            
            // Set business before loading data
            if (response.business) {
                setBusiness({
                    ...DEFAULT_BUSINESS,
                    ...response.business,
                });
            }
            
            // Load all business data (silent mode to avoid duplicate error toasts)
            await loadAllData(true);

            toast.success('🎉 Account created successfully!');
            return true;
        } catch (error) {
            console.error('Registration error:', error);
            toast.error(error.message || 'Registration failed');
            return false;
        } finally {
            setAuthLoading(false);
        }
    };

    const login = async (email, password) => {
        setAuthLoading(true);
        try {
            const response = await api.authApi.login(email, password);

            TokenStorage.setAccessToken(response.accessToken);
            TokenStorage.setRefreshToken(response.refreshToken);
            setUser(response.user);
            setIsAuthenticated(true);
            setBusiness(response.business || DEFAULT_BUSINESS);

            // Load all data after login
            await loadAllData();

            toast.success('Login successful!');
            return true;
        } catch (error) {
            toast.error(error.message || 'Login failed');
            return false;
        } finally {
            setAuthLoading(false);
        }
    };

    const logout = () => {
        TokenStorage.clear();
        setUser(null);
        setIsAuthenticated(false);
        setProducts([]);
        setCustomers([]);
        setInvoices([]);
        setPayments([]);
        setExpenses([]);
        setBusiness(DEFAULT_BUSINESS);
        setNotifications([]);
        toast.success('Logged out successfully');
    };

    // ── Product CRUD ─────────────────────────────────
    const addProduct = async (productData) => {
        setProductsLoading(true);
        try {
            const product = await api.productsApi.create(productData);
            setProducts(prev => [...prev, product]);
            toast.success('Product added successfully');
            return product;
        } catch (error) {
            toast.error(error.message || 'Failed to add product');
            throw error;
        } finally {
            setProductsLoading(false);
        }
    };

    const updateProduct = async (id, updates) => {
        setProductsLoading(true);
        try {
            const product = await api.productsApi.update(id, updates);
            setProducts(prev => prev.map(p => p.id === id ? product : p));
            toast.success('Product updated successfully');
            return product;
        } catch (error) {
            toast.error(error.message || 'Failed to update product');
            throw error;
        } finally {
            setProductsLoading(false);
        }
    };

    const deleteProduct = async (id) => {
        setProductsLoading(true);
        try {
            await api.productsApi.delete(id);
            setProducts(prev => prev.filter(p => p.id !== id));
            toast.success('Product deleted successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to delete product');
            throw error;
        } finally {
            setProductsLoading(false);
        }
    };

    const adjustStock = async (id, quantity) => {
        const product = products.find(p => p.id === id);
        if (!product) return;

        const newStock = Math.max(0, product.stock + quantity);
        try {
            await updateProduct(id, { stock: newStock });

            // Low stock notification
            if (newStock <= product.minStock && product.stock > product.minStock) {
                addNotification({
                    type: 'warning',
                    title: 'Low Stock Alert',
                    body: `${product.name} is now low in stock (${newStock} remaining)`,
                });
            }
        } catch (error) {
            console.error('Failed to adjust stock:', error);
        }
    };

    // ── Customer CRUD ────────────────────────────────
    const addCustomer = async (customerData) => {
        setCustomersLoading(true);
        try {
            const customer = await api.customersApi.create(customerData);
            setCustomers(prev => [...prev, customer]);
            toast.success('Customer added successfully');
            return customer;
        } catch (error) {
            toast.error(error.message || 'Failed to add customer');
            throw error;
        } finally {
            setCustomersLoading(false);
        }
    };

    const updateCustomer = async (id, updates) => {
        setCustomersLoading(true);
        try {
            const customer = await api.customersApi.update(id, updates);
            setCustomers(prev => prev.map(c => c.id === id ? customer : c));
            toast.success('Customer updated successfully');
            return customer;
        } catch (error) {
            toast.error(error.message || 'Failed to update customer');
            throw error;
        } finally {
            setCustomersLoading(false);
        }
    };

    const deleteCustomer = async (id) => {
        setCustomersLoading(true);
        try {
            await api.customersApi.delete(id);
            setCustomers(prev => prev.filter(c => c.id !== id));
            toast.success('Customer deleted successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to delete customer');
            throw error;
        } finally {
            setCustomersLoading(false);
        }
    };

    // ── Invoice CRUD ─────────────────────────────────
    const addInvoice = async (invoiceData) => {
        setInvoicesLoading(true);
        try {
            const invoice = await api.invoicesApi.create(invoiceData);
            setInvoices(prev => [...prev, invoice]);
            toast.success('Invoice created successfully');
            return invoice;
        } catch (error) {
            toast.error(error.message || 'Failed to create invoice');
            throw error;
        } finally {
            setInvoicesLoading(false);
        }
    };

    const updateInvoice = async (id, updates) => {
        setInvoicesLoading(true);
        try {
            const invoice = await api.invoicesApi.update(id, updates);
            setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...invoice } : i));
            toast.success('Invoice updated successfully');
            return invoice;
        } catch (error) {
            toast.error(error.message || 'Failed to update invoice');
            throw error;
        } finally {
            setInvoicesLoading(false);
        }
    };

    const deleteInvoice = async (id) => {
        setInvoicesLoading(true);
        try {
            await api.invoicesApi.delete(id);
            setInvoices(prev => prev.filter(i => i.id !== id));
            setPayments(prev => prev.filter(p => p.invoiceId !== id));
            toast.success('Invoice deleted successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to delete invoice');
            throw error;
        } finally {
            setInvoicesLoading(false);
        }
    };

    // ── Payment CRUD ─────────────────────────────────
    const addPayment = async (paymentData) => {
        setPaymentsLoading(true);
        try {
            const result = await api.paymentsApi.create(paymentData);
            setPayments(prev => [...prev, result.payment]);
            
            // Update invoice in local state
            setInvoices(prev => prev.map(i => 
                i.id === paymentData.invoiceId 
                    ? { ...i, ...result.invoice }
                    : i
            ));
            
            toast.success('Payment recorded successfully');
            return result.payment;
        } catch (error) {
            toast.error(error.message || 'Failed to record payment');
            throw error;
        } finally {
            setPaymentsLoading(false);
        }
    };

    const updatePayment = async (id, updates) => {
        setPaymentsLoading(true);
        try {
            // Note: Backend doesn't support payment update, only delete & recreate
            toast.error('Please delete and recreate the payment to modify it');
            throw new Error('Payment update not supported');
        } catch (error) {
            toast.error(error.message);
            throw error;
        } finally {
            setPaymentsLoading(false);
        }
    };

    const deletePayment = async (id) => {
        setPaymentsLoading(true);
        try {
            const payment = payments.find(p => p.id === id);
            if (!payment) throw new Error('Payment not found');

            await api.paymentsApi.delete(id);
            setPayments(prev => prev.filter(p => p.id !== id));
            
            // Reload invoices to get updated paid status
            const updated = await api.invoicesApi.getAll();
            setInvoices(updated);
            
            toast.success('Payment deleted successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to delete payment');
            throw error;
        } finally {
            setPaymentsLoading(false);
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

    // ── Helper: Calculate customer balance ────────────
    const getCustomerBalance = (customerId) => {
        const customerInvoices = invoices.filter(i => i.customerId === customerId);
        if (customerInvoices.length === 0) return 0;

        const totalBilled = customerInvoices.reduce((sum, i) => sum + (i.total || 0), 0);
        const totalPaid = customerInvoices.reduce((sum, i) => sum + (i.paid || 0), 0);

        return totalBilled - totalPaid;
    };

    // ── Expense CRUD ─────────────────────────────────
    const addExpense = async (expenseData) => {
        setExpensesLoading(true);
        try {
            const expense = await api.expensesApi.create(expenseData);
            setExpenses(prev => [...prev, expense]);
            toast.success('Expense added successfully');
            return expense;
        } catch (error) {
            toast.error(error.message || 'Failed to add expense');
            throw error;
        } finally {
            setExpensesLoading(false);
        }
    };

    const updateExpense = async (id, updates) => {
        setExpensesLoading(true);
        try {
            const expense = await api.expensesApi.update(id, updates);
            setExpenses(prev => prev.map(e => e.id === id ? expense : e));
            toast.success('Expense updated successfully');
            return expense;
        } catch (error) {
            toast.error(error.message || 'Failed to update expense');
            throw error;
        } finally {
            setExpensesLoading(false);
        }
    };

    const deleteExpense = async (id) => {
        setExpensesLoading(true);
        try {
            await api.expensesApi.delete(id);
            setExpenses(prev => prev.filter(e => e.id !== id));
            toast.success('Expense deleted successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to delete expense');
            throw error;
        } finally {
            setExpensesLoading(false);
        }
    };

    // ── Business Profile ─────────────────────────────
    const updateBusiness = async (updates) => {
        setBusinessLoading(true);
        try {
            const updated = await api.businessApi.updateProfile(updates);
            setBusiness(updated);
            toast.success('Business profile updated');
            return updated;
        } catch (error) {
            toast.error(error.message || 'Failed to update business profile');
            throw error;
        } finally {
            setBusinessLoading(false);
        }
    };

    // ── Computed Values ──────────────────────────────
    const lowStockProducts = products.filter(p => (p.stock || 0) <= (p.minStock || 0));
    
    const todayStr = new Date().toISOString().slice(0, 10);
    const totalSalesToday = invoices
        .filter(i => i.date?.slice(0, 10) === todayStr)
        .reduce((s, i) => s + (i.total || 0), 0);

    const pendingPayments = invoices
        .filter(i => i.status !== 'paid')
        .reduce((s, i) => s + (i.total - (i.paid || 0)), 0);

    // Currency helpers
    const currency = (amount) => formatCurrency(amount, business.currency || 'USD');
    const currencySymbol = CURRENCIES.find(c => c.code === (business.currency || 'USD'))?.symbol || '$';

    return (
        <AppContext.Provider value={{
            // Auth
            isAuthenticated,
            user,
            authScreen,
            setAuthScreen,
            authLoading,
            register,
            login,
            logout,

            // Business
            business,
            updateBusiness,
            businessLoading,

            // Products
            products,
            productsLoading,
            addProduct,
            updateProduct,
            deleteProduct,
            adjustStock,

            // Customers
            customers,
            customersLoading,
            addCustomer,
            updateCustomer,
            deleteCustomer,

            // Invoices
            invoices,
            invoicesLoading,
            addInvoice,
            updateInvoice,
            deleteInvoice,

            // Payments
            payments,
            paymentsLoading,
            addPayment,
            updatePayment,
            deletePayment,

            // Expenses
            expenses,
            expensesLoading,
            addExpense,
            updateExpense,
            deleteExpense,

            // Notifications
            notifications,
            addNotification,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            clearAllNotifications,

            // Computed
            lowStockProducts,
            totalSalesToday,
            pendingPayments,

            // Utilities
            currency,
            currencySymbol,
            CURRENCIES,
            formatDate,
            AVATAR_COLORS,
            getCustomerBalance,

            // UI
            sidebarOpen,
            setSidebarOpen,

            // Data loading
            loadAllData,
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
