/**
 * Mock Data Generator for Testing
 * Generates 10 customers and 30 products across all categories
 */

export const MOCK_CUSTOMERS = [
    { name: 'Rajesh Kumar', phone: '9841234567', email: 'rajesh@gmail.com', gst: '44AABCT1234H1Z0', address: 'Kathmandu, Nepal', type: 'customer' },
    { name: 'Priya Sharma', phone: '9845678901', email: 'priya@gmail.com', gst: '44AABCT1234H1Z1', address: 'Lalitpur, Nepal', type: 'customer' },
    { name: 'Amit Patel', phone: '9849876543', email: 'amit@gmail.com', gst: '44AABCT1234H1Z2', address: 'Bhaktapur, Nepal', type: 'customer' },
    { name: 'Neha Verma', phone: '9842345678', email: 'neha@gmail.com', gst: '44AABCT1234H1Z3', address: 'Pokhara, Nepal', type: 'customer' },
    { name: 'Vikram Singh', phone: '9843456789', email: 'vikram@gmail.com', gst: '44AABCT1234H1Z4', address: 'Biratnagar, Nepal', type: 'customer' },
    { name: 'Anjali Desai', phone: '9844567890', email: 'anjali@gmail.com', gst: '44AABCT1234H1Z5', address: 'Janakpur, Nepal', type: 'customer' },
    { name: 'Tech Store Nepal', phone: '9851234567', email: 'info@techstore.com', gst: '44AABCT1234H1Z6', address: 'Thamel, Kathmandu', type: 'supplier' },
    { name: 'Fresh Mart Groceries', phone: '9852345678', email: 'freshmart@gmail.com', gst: '44AABCT1234H1Z7', address: 'New Road, Kathmandu', type: 'supplier' },
    { name: 'Electronics Hub', phone: '9853456789', email: 'ehub@gmail.com', gst: '44AABCT1234H1Z8', address: 'Durbar Marg, Kathmandu', type: 'supplier' },
    { name: 'Soni Enterprises', phone: '9854567890', email: 'soni@gmail.com', gst: '44AABCT1234H1Z9', address: 'Chabahil, Kathmandu', type: 'supplier' },
];

export const MOCK_PRODUCTS = [
    // Tech Products - Phones (6 items)
    { name: 'iPhone 15 Pro Max', sku: 'IPHONE-15PRO', category: 'phones', unit: 'PCS', salePrice: 180000, purchasePrice: 155000, stock: 15, minStock: 5, taxRate: 5, barcode: 'IPHONE15001' },
    { name: 'Samsung Galaxy S24', sku: 'SAMSUNG-S24', category: 'phones', unit: 'PCS', salePrice: 95000, purchasePrice: 78000, stock: 22, minStock: 5, taxRate: 5, barcode: 'SAMSUNG001' },
    { name: 'OnePlus 12', sku: 'ONEPLUS-12', category: 'phones', unit: 'PCS', salePrice: 72000, purchasePrice: 58000, stock: 18, minStock: 5, taxRate: 5, barcode: 'ONEPLUS001' },
    { name: 'Xiaomi 14 Ultra', sku: 'XIAOMI-14', category: 'phones', unit: 'PCS', salePrice: 65000, purchasePrice: 52000, stock: 25, minStock: 5, taxRate: 5, barcode: 'XIAOMI001' },
    { name: 'Google Pixel 8 Pro', sku: 'PIXEL-8PRO', category: 'phones', unit: 'PCS', salePrice: 89000, purchasePrice: 72000, stock: 12, minStock: 5, taxRate: 5, barcode: 'PIXEL001' },
    { name: 'Realme GT 6', sku: 'REALME-GT6', category: 'phones', unit: 'PCS', salePrice: 45000, purchasePrice: 36000, stock: 30, minStock: 5, taxRate: 5, barcode: 'REALME001' },

    // Laptops (6 items)
    { name: 'MacBook Pro 16" M3', sku: 'MACBOOK-M3', category: 'Electronics', unit: 'PCS', salePrice: 450000, purchasePrice: 380000, stock: 5, minStock: 2, taxRate: 5, barcode: 'MACBOOK001' },
    { name: 'Dell XPS 15', sku: 'DELL-XPS15', category: 'Electronics', unit: 'PCS', salePrice: 220000, purchasePrice: 180000, stock: 8, minStock: 2, taxRate: 5, barcode: 'DELL001' },
    { name: 'HP Pavilion 14', sku: 'HP-PAV14', category: 'Electronics', unit: 'PCS', salePrice: 85000, purchasePrice: 68000, stock: 12, minStock: 2, taxRate: 5, barcode: 'HP001' },
    { name: 'Lenovo ThinkPad X1', sku: 'LENOVO-X1', category: 'Electronics', unit: 'PCS', salePrice: 145000, purchasePrice: 115000, stock: 6, minStock: 2, taxRate: 5, barcode: 'LENOVO001' },
    { name: 'ASUS VivoBook 15', sku: 'ASUS-VIVO15', category: 'Electronics', unit: 'PCS', salePrice: 65000, purchasePrice: 52000, stock: 10, minStock: 2, taxRate: 5, barcode: 'ASUS001' },
    { name: 'MSI GE66 Raider', sku: 'MSI-GE66', category: 'Electronics', unit: 'PCS', salePrice: 185000, purchasePrice: 150000, stock: 4, minStock: 2, taxRate: 5, barcode: 'MSI001' },

    // Accessories (6 items)
    { name: 'USB-C Cable 2M', sku: 'CABLE-USBC', category: 'Electronics', unit: 'PCS', salePrice: 800, purchasePrice: 450, stock: 150, minStock: 30, taxRate: 5, barcode: 'CABLE001' },
    { name: 'Wireless Mouse Logitech', sku: 'MOUSE-LOG', category: 'Electronics', unit: 'PCS', salePrice: 3500, purchasePrice: 2200, stock: 45, minStock: 10, taxRate: 5, barcode: 'MOUSE001' },
    { name: 'Mechanical Keyboard RGB', sku: 'KEYBOARD-RGB', category: 'Electronics', unit: 'PCS', salePrice: 8900, purchasePrice: 5500, stock: 28, minStock: 5, taxRate: 5, barcode: 'KEYBOARD001' },
    { name: 'HDMI Cable 3M', sku: 'HDMI-3M', category: 'Electronics', unit: 'PCS', salePrice: 1200, purchasePrice: 650, stock: 80, minStock: 20, taxRate: 5, barcode: 'HDMI001' },
    { name: 'Power Bank 20000mAh', sku: 'POWER-20K', category: 'Electronics', unit: 'PCS', salePrice: 2800, purchasePrice: 1600, stock: 60, minStock: 15, taxRate: 5, barcode: 'POWER001' },
    { name: 'Phone Screen Protector', sku: 'PROTECTOR-10', category: 'Electronics', unit: 'BOX', salePrice: 500, purchasePrice: 250, stock: 200, minStock: 50, taxRate: 0, barcode: 'PROTECT001' },

    // Groceries (8 items)
    { name: 'Basmati Rice 5KG', sku: 'RICE-BASMATI', category: 'Food & Grocery', unit: 'BAG', salePrice: 850, purchasePrice: 650, stock: 45, minStock: 10, taxRate: 5, barcode: 'RICE001' },
    { name: 'Organic Wheat Flour 2KG', sku: 'FLOUR-WHEAT', category: 'Food & Grocery', unit: 'BAG', salePrice: 280, purchasePrice: 180, stock: 60, minStock: 15, taxRate: 5, barcode: 'FLOUR001' },
    { name: 'Sunflower Oil 1L', sku: 'OIL-SUNFLOWER', category: 'Food & Grocery', unit: 'BOTTLE', salePrice: 420, purchasePrice: 300, stock: 55, minStock: 15, taxRate: 5, barcode: 'OIL001' },
    { name: 'Sugar 1KG', sku: 'SUGAR-1KG', category: 'Food & Grocery', unit: 'BAG', salePrice: 120, purchasePrice: 85, stock: 100, minStock: 30, taxRate: 0, barcode: 'SUGAR001' },
    { name: 'Salt 1KG', sku: 'SALT-1KG', category: 'Food & Grocery', unit: 'PKT', salePrice: 60, purchasePrice: 35, stock: 120, minStock: 40, taxRate: 0, barcode: 'SALT001' },
    { name: 'Green Tea Leaves 250g', sku: 'TEA-GREEN', category: 'Beverages', unit: 'BOX', salePrice: 450, purchasePrice: 280, stock: 40, minStock: 10, taxRate: 5, barcode: 'TEA001' },
    { name: 'Black Pepper 100g', sku: 'PEPPER-BLACK', category: 'Food & Grocery', unit: 'TUBE', salePrice: 380, purchasePrice: 220, stock: 50, minStock: 15, taxRate: 5, barcode: 'PEPPER001' },
    { name: 'Turmeric Powder 100g', sku: 'TURMERIC-100', category: 'Cooking Essentials', unit: 'TUBE', salePrice: 280, purchasePrice: 160, stock: 70, minStock: 20, taxRate: 5, barcode: 'TURMERIC001' },

    // Dairy & Beverages (4 items)
    { name: 'Full Cream Milk 1L', sku: 'MILK-CREAM', category: 'Dairy', unit: 'LTR', salePrice: 180, purchasePrice: 120, stock: 80, minStock: 20, taxRate: 5, barcode: 'MILK001' },
    { name: 'Yogurt 500g', sku: 'YOGURT-500', category: 'Dairy', unit: 'JAR', salePrice: 120, purchasePrice: 75, stock: 60, minStock: 15, taxRate: 5, barcode: 'YOGURT001' },
    { name: 'Coffee Beans 250g', sku: 'COFFEE-250', category: 'Beverages', unit: 'PKT', salePrice: 650, purchasePrice: 400, stock: 35, minStock: 10, taxRate: 5, barcode: 'COFFEE001' },
    { name: 'Fresh Orange Juice 1L', sku: 'JUICE-ORANGE', category: 'Beverages', unit: 'LTR', salePrice: 280, purchasePrice: 180, stock: 45, minStock: 15, taxRate: 5, barcode: 'JUICE001' },
];

export function generateSampleInvoices(customers, products) {
    const invoices = [];
    const dates = ['2026-02-25', '2026-02-26', '2026-02-27', '2026-02-28', '2026-03-01'];
    
    dates.forEach((date, dateIdx) => {
        for (let i = 0; i < 2; i++) {
            const customer = customers[Math.floor(Math.random() * customers.filter(c => c.type === 'customer').length)];
            const itemCount = Math.floor(Math.random() * 3) + 1;
            const items = [];
            let subtotal = 0;
            
            for (let j = 0; j < itemCount; j++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const qty = Math.floor(Math.random() * 5) + 1;
                const amount = product.salePrice * qty;
                items.push({
                    productId: product.id || String(Math.random()),
                    name: product.name,
                    unit: product.unit,
                    qty,
                    price: product.salePrice,
                    taxRate: product.taxRate || 5,
                    amount,
                });
                subtotal += amount;
            }
            
            const taxAmount = items.reduce((s, i) => s + (i.amount * i.taxRate / 100), 0);
            const total = subtotal + taxAmount;
            const paid = Math.random() > 0.5 ? total : Math.floor(total * 0.5);
            const status = paid >= total ? 'paid' : paid > 0 ? 'partial' : 'unpaid';
            
            invoices.push({
                id: String(Date.now() + Math.random()),
                invoiceNo: `INV-2026-${String(dateIdx * 10 + i + 1).padStart(3, '0')}`,
                date,
                customerId: customer.id || String(Math.random()),
                customer: customer.name,
                items,
                subtotal,
                taxAmount,
                discount: 0,
                total,
                paid,
                status,
                notes: 'Thank you for your business!',
                taxEnabled: true,
            });
        }
    });
    
    return invoices;
}
