import { AlertTriangle, ArrowRight, Package, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LowStockQuickViewModal({ onClose, onNavigate }) {
    const { lowStockProducts, currency } = useApp();

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-lg lowstock-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">LS Items</h3>
                    <button className="modal-close" onClick={onClose}><X size={16} /></button>
                </div>

                <div className="modal-body">
                    <div className="lowstock-summary">
                        <div className="lowstock-summary-left">
                            <AlertTriangle size={16} />
                            <span>{lowStockProducts.length} item(s) need restocking</span>
                        </div>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                                onClose();
                                onNavigate('inventory');
                            }}
                        >
                            Open Inventory <ArrowRight size={14} />
                        </button>
                    </div>

                    {lowStockProducts.length === 0 ? (
                        <div className="empty-state lowstock-empty">
                            <div className="empty-state-icon"><Package size={36} /></div>
                            <h3>All products are sufficiently stocked</h3>
                            <p>No immediate action needed.</p>
                        </div>
                    ) : (
                        <div className="table-wrapper table-flat lowstock-table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Category</th>
                                        <th className="align-right">Current Stock</th>
                                        <th className="align-right">Min Required</th>
                                        <th className="align-right">Shortage</th>
                                        <th className="align-right">Est. Reorder Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lowStockProducts
                                        .slice()
                                        .sort((a, b) => (a.stock - a.minStock) - (b.stock - b.minStock))
                                        .map((product) => {
                                            const shortage = Math.max(0, (product.minStock || 0) - (product.stock || 0));
                                            const reorderValue = shortage * (product.purchasePrice || 0);
                                            return (
                                                <tr key={product.id}>
                                                    <td className="lowstock-product-name">{product.name}</td>
                                                    <td><span className="badge badge-gray">{product.category || 'General'}</span></td>
                                                    <td className="amount-cell lowstock-stock-cell">{product.stock} {product.unit}</td>
                                                    <td className="amount-cell">{product.minStock} {product.unit}</td>
                                                    <td className="amount-cell lowstock-shortage-cell">{shortage} {product.unit}</td>
                                                    <td className="amount-cell">{currency(reorderValue)}</td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
