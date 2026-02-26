import type { ShippingFormData, ShippingFormErrors } from '../../hooks/useCheckout';

interface ShippingFormProps {
    formData: ShippingFormData;
    formErrors: ShippingFormErrors;
    onFieldChange: (field: keyof ShippingFormData, value: string) => void;
    isLoading: boolean;
}

const ShippingForm = ({ formData, formErrors, onFieldChange, isLoading }: ShippingFormProps) => {
    const getInputClass = (field: keyof ShippingFormErrors) =>
        `checkout-input ${formErrors[field] ? 'checkout-input--error' : ''}`;

    return (
        <div>
            {/* Section Header */}
            <div className="checkout-section-header">
                <div className="checkout-section-badge">1</div>
                <h2 className="checkout-section-title">Shipping Information</h2>
            </div>

            {/* Name & Email */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label className="checkout-label">
                        Full Name <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.customerName}
                        onChange={(e) => onFieldChange('customerName', e.target.value)}
                        placeholder="John Doe"
                        className={getInputClass('customerName')}
                        disabled={isLoading}
                    />
                    {formErrors.customerName && (
                        <p className="checkout-error-text">
                            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {formErrors.customerName}
                        </p>
                    )}
                </div>
                <div>
                    <label className="checkout-label">
                        Email <span className="required">*</span>
                    </label>
                    <input
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => onFieldChange('customerEmail', e.target.value)}
                        placeholder="john@example.com"
                        className={getInputClass('customerEmail')}
                        disabled={isLoading}
                    />
                    {formErrors.customerEmail && (
                        <p className="checkout-error-text">
                            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {formErrors.customerEmail}
                        </p>
                    )}
                </div>
            </div>

            {/* Phone */}
            <div style={{ marginBottom: '1rem' }}>
                <label className="checkout-label">
                    Phone Number <span className="required">*</span>
                </label>
                <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => onFieldChange('customerPhone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className={getInputClass('customerPhone')}
                    disabled={isLoading}
                />
                {formErrors.customerPhone && (
                    <p className="checkout-error-text">
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {formErrors.customerPhone}
                    </p>
                )}
            </div>

            {/* Province / District / Ward */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                    <label className="checkout-label">
                        Province / State <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.province}
                        onChange={(e) => onFieldChange('province', e.target.value)}
                        placeholder="California"
                        className={getInputClass('province')}
                        disabled={isLoading}
                    />
                    {formErrors.province && (
                        <p className="checkout-error-text">{formErrors.province}</p>
                    )}
                </div>
                <div>
                    <label className="checkout-label">
                        District / City <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.district}
                        onChange={(e) => onFieldChange('district', e.target.value)}
                        placeholder="Los Angeles"
                        className={getInputClass('district')}
                        disabled={isLoading}
                    />
                    {formErrors.district && (
                        <p className="checkout-error-text">{formErrors.district}</p>
                    )}
                </div>
                <div>
                    <label className="checkout-label">
                        Ward / Zip Code <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.ward}
                        onChange={(e) => onFieldChange('ward', e.target.value)}
                        placeholder="90001"
                        className={getInputClass('ward')}
                        disabled={isLoading}
                    />
                    {formErrors.ward && (
                        <p className="checkout-error-text">{formErrors.ward}</p>
                    )}
                </div>
            </div>

            {/* Street Address */}
            <div style={{ marginBottom: '1rem' }}>
                <label className="checkout-label">
                    Street Address <span className="required">*</span>
                </label>
                <input
                    type="text"
                    value={formData.streetAddress}
                    onChange={(e) => onFieldChange('streetAddress', e.target.value)}
                    placeholder="Apartment, suite, unit, building, floor, etc."
                    className={getInputClass('streetAddress')}
                    disabled={isLoading}
                />
                {formErrors.streetAddress && (
                    <p className="checkout-error-text">{formErrors.streetAddress}</p>
                )}
            </div>

            {/* Notes */}
            <div>
                <label className="checkout-label">
                    Notes <span style={{ color: '#94a3b8', fontWeight: 400, textTransform: 'none' }}>(Optional)</span>
                </label>
                <textarea
                    value={formData.notes}
                    onChange={(e) => onFieldChange('notes', e.target.value)}
                    placeholder="Delivery instructions, preferred time, etc."
                    className="checkout-input checkout-textarea"
                    rows={3}
                    disabled={isLoading}
                />
            </div>
        </div>
    );
};

export default ShippingForm;
