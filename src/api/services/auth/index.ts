import { post, get } from '../../client';
import { ApiResponse } from '../../types/common';
import { LoginParams, RegisterParams, LoginResponse, UserInfoResponse, TenantQueryParams, TenantQueryResponse, TosTempTokenResponse } from './types';

// Mock模式开关 - 当后端不通时设置为true
const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true' || process.env.NODE_ENV === 'development';

// 导入mock数据
let mockData: any = null;
if (MOCK_MODE) {
    try {
        mockData = require('../../mock/authMock');
    } catch (error) {
        console.warn('Mock数据加载失败，将使用真实API:', error);
    }
}

// 登录接口
export const login = async (params: LoginParams): Promise<ApiResponse<LoginResponse>> => {
    // Mock模式
    if (MOCK_MODE && mockData) {
        console.log('使用Mock登录接口', params);
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockData.mockLoginResponse();
    }

    // 真实API
    const response = await post<LoginResponse>('/login', params);
    return response;
};

// 注册接口
export const register = async (params: RegisterParams): Promise<ApiResponse> => {
    // Mock模式
    if (MOCK_MODE && mockData) {
        console.log('使用Mock注册接口', params);
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockData.mockRegisterResponse();
    }

    // 真实API
    const response = await post('/register', params);
    return response;
};

// 获取用户信息接口
export const getUserInfo = async (): Promise<ApiResponse<UserInfoResponse>> => {
    // Mock模式
    if (MOCK_MODE && mockData) {
        console.log('使用Mock获取用户信息接口');
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockData.mockUserInfoResponse();
    }

    // 真实API
    const response = await get<UserInfoResponse>('/getInfo');
    return response;
};

// 登出接口
export const logout = async (): Promise<ApiResponse> => {
    // Mock模式
    if (MOCK_MODE && mockData) {
        console.log('使用Mock登出接口');
        await new Promise(resolve => setTimeout(resolve, 200));
        return mockData.mockLogoutResponse();
    }

    // 真实API
    const response = await post('/logout');
    return response;
};

// 租户查询接口
export const queryTenant = async (params: TenantQueryParams): Promise<ApiResponse<TenantQueryResponse>> => {
    // Mock模式
    if (MOCK_MODE && mockData) {
        console.log('使用Mock租户查询接口', params);
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockData.mockTenantQueryResponse();
    }

    // 真实API
    const response = await get<TenantQueryResponse>('/system/tenant/query', params);
    return response;
};

// 获取 TOS 临时 token 接口
export const getTosTempToken = async (): Promise<ApiResponse<TosTempTokenResponse>> => {
    // Mock模式
    if (MOCK_MODE && mockData) {
        console.log('使用Mock TOS临时token接口');
        await new Promise(resolve => setTimeout(resolve, 400));
        return mockData.mockTosTempTokenResponse();
    }

    // 真实API
    const response = await get<TosTempTokenResponse>('/system/tenant/getTempToken');
    return response;
};

