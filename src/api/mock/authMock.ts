// Mock数据文件 - 用于模拟后端接口响应
// 当后端不通时，可以临时启用这些mock数据
// 要删除mock时，只需要删除这个文件并移除相关的import即可

import { ApiResponse } from '../types/common';
import { LoginResponse, UserInfoResponse, TenantQueryResponse, TosTempTokenResponse } from '../services/auth/types';

// Mock用户数据
const mockUser = {
    createBy: 'admin',
    createTime: '2024-01-01 00:00:00',
    updateBy: null,
    updateTime: null,
    remark: null,
    deleted: '0',
    userId: 1,
    deptId: 100,
    userName: 'testuser',
    nickName: '测试用户',
    email: 'test@example.com',
    phonenumber: '13800138000',
    sex: '1',
    avatar: 'https://via.placeholder.com/100x100',
    password: '******',
    status: '0',
    delFlag: '0',
    loginIp: '127.0.0.1',
    loginDate: '2024-01-01 00:00:00',
    dept: {
        createBy: 'admin',
        createTime: '2024-01-01 00:00:00',
        updateBy: null,
        updateTime: null,
        remark: null,
        deleted: '0',
        deptId: 100,
        parentId: 0,
        ancestors: '0',
        deptName: '测试部门',
        orderNum: 0,
        leader: 'admin',
        phone: null,
        email: null,
        status: '0',
        delFlag: '0',
        parentName: null,
        children: []
    },
    roles: [
        {
            createBy: 'admin',
            createTime: '2024-01-01 00:00:00',
            updateBy: null,
            updateTime: null,
            remark: null,
            deleted: '0',
            roleId: 1,
            roleName: '管理员',
            roleKey: 'admin',
            roleSort: 1,
            dataScope: '1',
            menuCheckStrictly: false,
            deptCheckStrictly: false,
            status: '0',
            delFlag: '0',
            flag: false,
            menuIds: null,
            deptIds: null,
            permissions: ['*:*:*'],
            admin: true
        }
    ],
    roleIds: [1],
    postIds: null,
    roleId: 1,
    tenantId: 1,
    tenant: {
        createBy: 'admin',
        createTime: '2024-01-01 00:00:00',
        updateBy: null,
        updateTime: null,
        remark: null,
        deleted: '0',
        tenantId: 1,
        tenantName: '测试租户',
        tosConfig: {
            bucket: 'test-bucket',
            endpoint: 'https://tos.example.com',
            host: 'tos.example.com',
            accessKey: 'test-access-key',
            region: 'cn-beijing',
            accessSecret: 'test-secret-key'
        },
        delFlag: '0'
    },
    admin: true
};

// Mock登录响应
export const mockLoginResponse = (): ApiResponse<LoginResponse> => {
    return {
        code: 200,
        msg: '操作成功',
        token: 'mock-jwt-token-' + Date.now(),
        permissions: ['*:*:*'],
        roles: ['admin'],
        user: mockUser
    };
};

// Mock获取用户信息响应
export const mockUserInfoResponse = (): ApiResponse<UserInfoResponse> => {
    return {
        code: 200,
        msg: '操作成功',
        user: mockUser,
        permissions: ['*:*:*'],
        roles: ['admin'],
        social_auth: []
    };
};

// Mock租户查询响应
export const mockTenantQueryResponse = (): ApiResponse<TenantQueryResponse> => {
    return {
        code: 200,
        msg: '操作成功',
        tenantId: 1,
        name: '测试租户'
    };
};

// Mock TOS临时token响应
export const mockTosTempTokenResponse = (): ApiResponse<TosTempTokenResponse> => {
    return {
        code: 200,
        msg: '操作成功',
        data: {
            accessKey: 'mock-access-key',
            secretKey: 'mock-secret-key',
            currentTime: new Date().toISOString(),
            expireTime: new Date(Date.now() + 3600000).toISOString(), // 1小时后过期
            token: 'mock-tos-token-' + Date.now()
        }
    };
};

// Mock注册响应
export const mockRegisterResponse = (): ApiResponse => {
    return {
        code: 200,
        msg: '注册成功'
    };
};

// Mock登出响应
export const mockLogoutResponse = (): ApiResponse => {
    return {
        code: 200,
        msg: '登出成功'
    };
};
