import api from './api';
import type {
    WarrantyDto,
    WarrantyApiResponse,
    SubmitClaimRequest,
    SubmitClaimResponse,
    SubmitClaimApiResponse,
    ClaimsPaginatedResponse,
    ClaimsApiResponse,
    ResolveClaimRequest,
    ResolveClaimApiResponse,
    SingleWarrantyApiResponse,
    WarrantyClaimDto,
    CustomerWarrantyClaimPagedResponse,
    CustomerClaimsApiResponse,
} from '../types/warranty.types';

// ===== Customer: Warranty APIs =====

/**
 * API 12: Get My Warranties (Customer)
 * Get warranties for the currently logged-in customer
 */
export const getMyWarranties = async (): Promise<WarrantyDto[]> => {
    const response = await api.get<WarrantyApiResponse>('/warranties');

    if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch warranties');
    }

    return response.data.data;
};

/**
 * API: Get Warranty by ID
 * Get warranty details by ID
 */
export const getWarrantyById = async (id: number): Promise<WarrantyDto> => {
    const response = await api.get<SingleWarrantyApiResponse>(`/Warranty/${id}`);

    if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch warranty details');
    }

    return response.data.data;
};

/**
 * API 13: Submit Warranty Claim
 * Customer submits a warranty claim for a specific warranty
 * Validation:
 * - warrantyId must belong to the logged-in user
 * - WARRANTY.status must be ACTIVE
 * - issueDescription: required, min 10 chars, max 1000 chars
 */
export const submitWarrantyClaim = async (
    warrantyId: number,
    data: SubmitClaimRequest
): Promise<SubmitClaimResponse> => {
    const response = await api.post<SubmitClaimApiResponse>(
        `/warranties/${warrantyId}/claims`,
        data
    );

    if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to submit warranty claim');
    }

    return response.data.data;
};

/**
 * API: Get My Warranty Claims (Customer)
 */
export const getMyClaims = async (
    page: number = 1,
    pageSize: number = 10
): Promise<CustomerWarrantyClaimPagedResponse> => {
    const params: Record<string, string | number> = { page, pageSize };
    const response = await api.get<CustomerClaimsApiResponse>('/warranties/claims', { params });

    if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch your warranty claims');
    }

    return response.data.data;
};

// ===== Admin: Warranty Claim APIs =====

/**
 * API 14: Get All Warranty Claims (Admin)
 * Get all warranty claims with pagination and filter
 */
export const getAllWarrantyClaims = async (
    status?: string,
    page: number = 1,
    pageSize: number = 10
): Promise<ClaimsPaginatedResponse> => {
    const params: Record<string, string | number> = { page, pageSize };
    if (status) params.status = status;

    const response = await api.get<ClaimsApiResponse>('/admin/warranty-claims', { params });

    if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch warranty claims');
    }

    return response.data.data;
};

/**
 * API 15: Resolve Warranty Claim (Admin)
 * Admin resolves claim: APPROVED / REJECTED / RESOLVED
 * 
 * Business Logic:
 * - APPROVED: WARRANTY.status → 'IN_REPAIR'
 * - RESOLVED: WARRANTY.status → 'REPAIRED'
 */
export const resolveWarrantyClaim = async (
    claimId: number,
    data: ResolveClaimRequest
): Promise<void> => {
    const response = await api.put<ResolveClaimApiResponse>(
        `/admin/warranty-claims/${claimId}/resolve`,
        data
    );

    if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to resolve warranty claim');
    }
};

/**
 * Admin: Get Warranty Claim Detail by ID
 */
export const getWarrantyClaimById = async (claimId: number): Promise<WarrantyClaimDto> => {
    const response = await api.get<{ success: boolean; data: WarrantyClaimDto }>(
        `/admin/warranty-claims/${claimId}`
    );

    if (!response.data.success) {
        throw new Error('Failed to fetch warranty claim details');
    }

    return response.data.data;
};

const warrantyService = {
    getMyWarranties,
    getWarrantyById,
    submitWarrantyClaim,
    getMyClaims,
    getAllWarrantyClaims,
    resolveWarrantyClaim,
    getWarrantyClaimById,
};

export default warrantyService;
