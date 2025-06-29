import { post, get } from './request';
import { LoginParams, UserInfo, ApiResponse } from './config';

// 登录接口
export const login = async (params: LoginParams): Promise<ApiResponse<{ token: string }>> => {
    const response = await post<{ token: string }>('/login', params);
    return response;
};

// 获取用户信息接口
export const getUserInfo = async (): Promise<ApiResponse<{
    user: UserInfo;
    permissions: string[];
    roles: string[];
}>> => {
    const response = await get<{
        user: UserInfo;
        permissions: string[];
        roles: string[];
    }>('/getInfo');
    return response;
};

// 登出接口（如果需要的话）
export const logout = async (): Promise<ApiResponse> => {
    const response = await post('/logout');
    return response;
}; 