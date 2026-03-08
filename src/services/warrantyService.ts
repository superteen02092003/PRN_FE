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
} from '../types/warranty.types';

// ===== Customer: Warranty APIs =====

/**
 * API 12: Get My Warranties (Customer)
 * Lấy danh sách bảo hành của customer đang đăng nhập
 */
export const getMyWarranties = async (): Promise<WarrantyDto[]> => {
    const response = await api.get<WarrantyApiResponse>('/warranties');

    if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch warranties');
    }

    return response.data.data;
};

/**
 * API 13: Submit Warranty Claim
 * Customer gửi yêu cầu bảo hành cho một warranty cụ thể
 * Validation:
 * - warrantyId phải thuộc về chính user đang đăng nhập
 * - WARRANTY.status phải là ACTIVE
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

// ===== Admin: Warranty Claim APIs =====

/**
 * API 14: Get All Warranty Claims (Admin)
 * Lấy danh sách tất cả warranty claims có phân trang và filter
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
 * Admin xử lý claim: APPROVED / REJECTED / RESOLVED
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

const warrantyService = {
    getMyWarranties,
    submitWarrantyClaim,
    getAllWarrantyClaims,
    resolveWarrantyClaim,
};

export default warrantyService;
