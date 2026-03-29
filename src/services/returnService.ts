import api from './api';
import type { ApiResponse, PaginatedResponse } from '../types/product.types';
import type {
    ReturnRequestDto,
    CreateReturnRequestDto,
    ProcessReturnRequestDto,
} from '../types/return.types';

export const createReturnRequest = async (
    data: CreateReturnRequestDto
): Promise<ReturnRequestDto> => {
    const response = await api.post<ApiResponse<ReturnRequestDto>>('/return-request', data);
    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to create return request');
    }
    return response.data.data;
};

export const getMyReturnRequests = async (
    page = 1,
    pageSize = 10
): Promise<PaginatedResponse<ReturnRequestDto>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<ReturnRequestDto>>>(
        '/return-request/my',
        { params: { page, pageSize } }
    );
    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to load requests');
    }
    return response.data.data;
};

export const getReturnRequestById = async (id: number): Promise<ReturnRequestDto> => {
    const response = await api.get<ApiResponse<ReturnRequestDto>>(`/return-request/${id}`);
    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Request not found');
    }
    return response.data.data;
};

export const getAllReturnRequests = async (
    page = 1,
    pageSize = 10
): Promise<PaginatedResponse<ReturnRequestDto>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<ReturnRequestDto>>>(
        '/return-request',
        { params: { page, pageSize } }
    );
    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to load requests');
    }
    return response.data.data;
};

export const processReturnRequest = async (
    id: number,
    data: ProcessReturnRequestDto
): Promise<ReturnRequestDto> => {
    const response = await api.put<ApiResponse<ReturnRequestDto>>(
        `/return-request/${id}/process`,
        data
    );
    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to process request');
    }
    return response.data.data;
};
