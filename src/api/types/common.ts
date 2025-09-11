// 基础响应接口
export interface BaseResponse {
    msg: string;
    code: number;
}

// 响应接口类型 - 使用交叉类型让T平级展开
export type ApiResponse<T = unknown> = BaseResponse & T;

// 分页参数类型
export interface PaginationParams {
    pageNum?: number;
    pageSize?: number;
    [key: string]: string | number | undefined;
}

// 通用操作响应类型
export interface OperationResponse {
    success: boolean;
    message?: string;
}

// 分页响应类型
export interface PaginatedResponse<T> {
    total: number;
    rows: T[];
} 