import { post, get } from '../../client';
import { ApiResponse } from '../../types/common';
import { LoginParams, RegisterParams, LoginResponse, UserInfoResponse, TenantQueryParams, TenantQueryResponse, TosTempTokenResponse } from './types';

// 登录接口
export const login = async (params: LoginParams): Promise<ApiResponse<LoginResponse>> => {
    const response = await post<LoginResponse>('/login', params);
    return response;
};

// 注册接口
export const register = async (params: RegisterParams): Promise<ApiResponse> => {
    const response = await post('/register', params);
    return response;
};

// 获取用户信息接口
export const getUserInfo = async (): Promise<ApiResponse<UserInfoResponse>> => {
    const response = await get<UserInfoResponse>('/getInfo');
    return response;
};

// 登出接口
export const logout = async (): Promise<ApiResponse> => {
    const response = await post('/logout');
    return response;
};

// 租户查询接口
export const queryTenant = async (params: TenantQueryParams): Promise<ApiResponse<TenantQueryResponse>> => {
    const response = await get<TenantQueryResponse>('/system/tenant/query', params);
    return response;
};

// 获取 TOS 临时 token 接口
export const getTosTempToken = async (): Promise<ApiResponse<TosTempTokenResponse>> => {
    const response = await get<TosTempTokenResponse>('/system/tenant/getTempToken');
    return response;
};

