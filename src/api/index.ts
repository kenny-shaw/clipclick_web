// 导出通用类型
export type { ApiResponse, BaseResponse, PaginationParams, OperationResponse, PaginatedResponse } from './types/common';

// 导出各服务的类型
export type * from './services/auth/types';
export type * from './services/video/types';
export type * from './services/product/types';
export type * from './services/material/types';

// 导出所有服务（命名空间方式）
export * as AuthService from './services/auth';
export * as VideoService from './services/video';
export * as ProductService from './services/product';
export * as MaterialService from './services/material';

// 导出客户端工具（用于高级用法）
export { API_BASE_URL, API_CONFIG, API_STATUS } from './client/config';
export { get, post, put, del } from './client/request'; 