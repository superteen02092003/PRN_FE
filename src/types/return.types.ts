export type ReturnType = 'RETURN' | 'EXCHANGE';
export type ReturnStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export interface ReturnRequestDto {
  returnRequestId: number;
  orderId: number;
  orderNumber: string;
  userId: number;
  userName: string;
  type: ReturnType;
  reason: string;
  status: ReturnStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt?: string;
  processedAt?: string;
  processedByName?: string;
}

export interface CreateReturnRequestDto {
  orderId: number;
  type: ReturnType;
  reason: string;
}

export interface ProcessReturnRequestDto {
  status: 'APPROVED' | 'REJECTED' | 'COMPLETED';
  adminNote?: string;
}
