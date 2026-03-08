import api from './api';

export interface StoreLocationDto {
    name: string;
    address: string;
    phone: string;
    email: string;
    latitude: number;
    longitude: number;
    openingHours: Record<string, string>; // { monday: '08:00 - 21:00', ... }
}

export interface StoreBranchDto {
    name: string;
    address: string;
    phone: string;
    latitude: number;
    longitude: number;
    isMainBranch: boolean;
}

interface StoreLocationResponse {
    success: boolean;
    data: StoreLocationDto;
}

interface StoreBranchesResponse {
    success: boolean;
    data: StoreBranchDto[];
}

export const getStoreLocation = async (): Promise<StoreLocationDto> => {
    const response = await api.get<StoreLocationResponse>('/store/location');
    return response.data.data;
};

export const getStoreBranches = async (): Promise<StoreBranchDto[]> => {
    const response = await api.get<StoreBranchesResponse>('/store/branches');
    return response.data.data || [];
};

const storeService = {
    getStoreLocation,
    getStoreBranches,
};

export default storeService;
