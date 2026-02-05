import type { ProductBundleDto } from '@/types/product.types';
import './BundleComponents.css';

interface BundleComponentsProps {
    bundle: ProductBundleDto;
    loading?: boolean;
    onComponentClick?: (productId: number) => void;
}

const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(price);
};

const BundleComponents: React.FC<BundleComponentsProps> = ({
    bundle,
    loading = false,
    onComponentClick,
}) => {
    if (loading) {
        return (
            <div className="bundle-loading">
                <div className="loading-spinner" />
                <span>Loading bundle components...</span>
            </div>
        );
    }

    const { kitName, totalComponents, components } = bundle;

    return (
        <div className="bundle-components">
            <div className="bundle-header">
                <h3 className="bundle-title">What's in the Kit</h3>
                <span className="bundle-count">{totalComponents} components</span>
            </div>

            <div className="components-grid">
                {components.map((component) => (
                    <div
                        key={component.productId}
                        className="component-card"
                        onClick={() => onComponentClick?.(component.productId)}
                        role={onComponentClick ? 'button' : undefined}
                        tabIndex={onComponentClick ? 0 : undefined}
                    >
                        <div className="component-image">
                            {component.primaryImage ? (
                                <img
                                    src={component.primaryImage}
                                    alt={component.name}
                                />
                            ) : (
                                <div className="no-image">No image</div>
                            )}
                        </div>
                        <div className="component-info">
                            <span className="component-type" data-type={component.productType.toLowerCase()}>
                                {component.productType}
                            </span>
                            <h4 className="component-name">{component.name}</h4>
                            <div className="component-details">
                                <span className="component-qty">Qty: {component.quantity}</span>
                                <span className="component-price">{formatPrice(component.price)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Total Value */}
            <div className="bundle-total">
                <span className="total-label">Total value if bought separately:</span>
                <span className="total-value">
                    {formatPrice(components.reduce((sum, c) => sum + c.price * c.quantity, 0))}
                </span>
            </div>
        </div>
    );
};

export default BundleComponents;
