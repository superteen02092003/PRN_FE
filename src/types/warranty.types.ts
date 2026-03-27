// ===== Warranty Types =====

export interface WarrantyDto {
    warrantyId: number;
    product: {
        productId: number;
        name: string;
        image: string | null;
    };
    serialNumber: string | null;
    purchaseDate: string;
    expiryDate: string;
    monthsRemaining: number;
    status: WarrantyStatus;
    policyName: string;
}

export type WarrantyStatus = 'ACTIVE' | 'IN_REPAIR' | 'REPAIRED' | 'EXPIRED' | 'VOID';

export interface WarrantyApiResponse {
    success: boolean;
    message: string;
    data: WarrantyDto[];
}

export interface SingleWarrantyApiResponse {
    success: boolean;
    message: string;
    data: WarrantyDto;
}

// ===== Warranty Claim Types =====

export interface SubmitClaimRequest {
    issueDescription: string;
    contactPhone?: string;
}

export interface SubmitClaimResponse {
    claimId: number;
    status: string;
    submittedAt: string;
}

export interface SubmitClaimApiResponse {
    success: boolean;
    message: string;
    data: SubmitClaimResponse;
}

export interface WarrantyClaimDto {
    claimId: number;
    status: ClaimStatus;
    customer: {
        userId: number;
        fullName: string;
        phone: string | null;
    };
    product: {
        productId: number;
        name: string;
    };
    warranty: {
        warrantyId: number;
        serialNumber: string | null;
        policyName: string;
    };
    issueDescription: string;
    contactPhone: string | null;
    resolutionNote: string | null;
    submittedAt: string;
    resolvedDate: string | null;
}

export type ClaimStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'RESOLVED' | 'UNRESOLVED';

export interface ClaimsPaginatedResponse {
    items: WarrantyClaimDto[];
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
}

export interface ClaimsApiResponse {
    success: boolean;
    message: string;
    data: ClaimsPaginatedResponse;
}

export interface ResolveClaimRequest {
    resolution: 'APPROVED' | 'REJECTED' | 'RESOLVED' | 'UNRESOLVED';
    resolutionNote?: string;
}

export interface ResolveClaimApiResponse {
    success: boolean;
    message: string;
    data: unknown;
}
