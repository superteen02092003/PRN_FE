import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getShippingInfo, getPaymentMethods, validateCheckout } from '../services/checkoutService';
import { createOrder } from '../services/orderService';
import { redirectToSepayCheckout } from '../services/paymentService';
import type {
    ShippingInfoResponse,
    PaymentMethodDto,
    ValidateCheckoutResponse,
    CreateOrderRequest,
    PaymentMethodType,
} from '../types/order.types';

export interface ShippingFormData {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    province: string;
    district: string;
    ward: string;
    streetAddress: string;
    notes: string;
}

export interface ShippingFormErrors {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    province?: string;
    district?: string;
    ward?: string;
    streetAddress?: string;
}

interface UseCheckoutReturn {
    // Data
    shippingInfo: ShippingInfoResponse | null;
    paymentMethods: PaymentMethodDto[];
    checkoutValidation: ValidateCheckoutResponse | null;
    // Form state
    formData: ShippingFormData;
    formErrors: ShippingFormErrors;
    selectedPaymentMethod: PaymentMethodType;
    couponCode: string;
    // Status
    isLoading: boolean;
    isSubmitting: boolean;
    isValidating: boolean;
    error: string | null;
    // Actions
    setFormField: (field: keyof ShippingFormData, value: string) => void;
    setSelectedPaymentMethod: (method: PaymentMethodType) => void;
    setCouponCode: (code: string) => void;
    validateForm: () => boolean;
    handleSubmit: () => Promise<void>;
    revalidateCheckout: () => Promise<void>;
}

const initialFormData: ShippingFormData = {
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    province: '',
    district: '',
    ward: '',
    streetAddress: '',
    notes: '',
};

export const useCheckout = (initialCoupon?: string): UseCheckoutReturn => {
    const navigate = useNavigate();

    // Data states
    const [shippingInfo, setShippingInfo] = useState<ShippingInfoResponse | null>(null);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDto[]>([]);
    const [checkoutValidation, setCheckoutValidation] = useState<ValidateCheckoutResponse | null>(null);

    // Form states
    const [formData, setFormData] = useState<ShippingFormData>(initialFormData);
    const [formErrors, setFormErrors] = useState<ShippingFormErrors>({});
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType>('COD');
    const [couponCode, setCouponCode] = useState(initialCoupon || '');

    // Status states
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load initial data
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const [shippingResult, methodsResult, validationResult] = await Promise.all([
                    getShippingInfo(),
                    getPaymentMethods(),
                    validateCheckout(initialCoupon),
                ]);

                setShippingInfo(shippingResult);
                setPaymentMethods(methodsResult);
                setCheckoutValidation(validationResult);

                // Nếu coupon không hợp lệ, xóa khỏi state để không gửi lên createOrder
                if (validationResult.couponError) {
                    setCouponCode('');
                    toast.warn(`Coupon not applied: ${validationResult.couponError}`);
                }

                // Pre-fill form with user's shipping info
                setFormData(prev => ({
                    ...prev,
                    customerName: shippingResult.username || '',
                    customerEmail: shippingResult.email || '',
                    customerPhone: shippingResult.phone || '',
                    streetAddress: shippingResult.address || '',
                }));
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to load checkout data';
                setError(message);
                toast.error(message);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, [initialCoupon]);

    // Set form field
    const setFormField = useCallback((field: keyof ShippingFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user types
        if (formErrors[field as keyof ShippingFormErrors]) {
            setFormErrors(prev => ({ ...prev, [field]: undefined }));
        }
    }, [formErrors]);

    // Validate form
    const validateForm = useCallback((): boolean => {
        const errors: ShippingFormErrors = {};

        if (!formData.customerName.trim()) {
            errors.customerName = 'Full name is required';
        }
        if (!formData.customerEmail.trim()) {
            errors.customerEmail = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
            errors.customerEmail = 'Invalid email format';
        }
        if (!formData.customerPhone.trim()) {
            errors.customerPhone = 'Phone number is required';
        } else if (!/^\+?[0-9]{10,15}$/.test(formData.customerPhone)) {
            errors.customerPhone = 'Phone must be 10-15 digits';
        }
        if (!formData.province.trim()) {
            errors.province = 'Province is required';
        }
        if (!formData.district.trim()) {
            errors.district = 'District is required';
        }
        if (!formData.ward.trim()) {
            errors.ward = 'Ward is required';
        }
        if (!formData.streetAddress.trim()) {
            errors.streetAddress = 'Street address is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }, [formData]);

    // Re-validate checkout (when coupon changes)
    const revalidateCheckout = useCallback(async () => {
        setIsValidating(true);
        try {
            const result = await validateCheckout(couponCode || undefined);
            setCheckoutValidation(result);
            if (result.couponError) {
                setCouponCode('');
                toast.warn(`Coupon not applied: ${result.couponError}`);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Validation failed';
            toast.error(message);
        } finally {
            setIsValidating(false);
        }
    }, [couponCode]);

    // Submit order
    const handleSubmit = useCallback(async () => {
        if (!validateForm()) {
            toast.error('Please check your information');
            return;
        }

        if (!checkoutValidation?.isValid) {
            toast.error('Cart is invalid. Please check again.');
            return;
        }

        setIsSubmitting(true);
        try {
            const orderData: CreateOrderRequest = {
                paymentMethod: selectedPaymentMethod,
                couponCode: couponCode || undefined,
                customerName: formData.customerName.trim(),
                customerEmail: formData.customerEmail.trim(),
                customerPhone: formData.customerPhone.trim(),
                province: formData.province.trim(),
                district: formData.district.trim(),
                ward: formData.ward.trim(),
                streetAddress: formData.streetAddress.trim(),
                notes: formData.notes.trim() || undefined,
            };

            const result = await createOrder(orderData);

            // Handle based on payment method
            if (selectedPaymentMethod === 'SEPAY') {
                toast.info('Redirecting to payment page...');
                redirectToSepayCheckout(result.orderId);
            } else {
                // COD - redirect to success page
                toast.success('Order placed successfully!');
                navigate(`/payment/success?status=success&orderId=${result.orderId}&orderNumber=${result.orderNumber}&method=COD`);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to place order';
            toast.error(message);
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    }, [validateForm, checkoutValidation, selectedPaymentMethod, couponCode, formData, navigate]);

    return {
        shippingInfo,
        paymentMethods,
        checkoutValidation,
        formData,
        formErrors,
        selectedPaymentMethod,
        couponCode,
        isLoading,
        isSubmitting,
        isValidating,
        error,
        setFormField,
        setSelectedPaymentMethod,
        setCouponCode,
        validateForm,
        handleSubmit,
        revalidateCheckout,
    };
};
