// API配置文件
export const API_BASE_URL = 'http://47.93.53.0:8080';

// 请求配置
export const API_CONFIG = {
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
};

// 响应状态码
export const API_STATUS = {
    SUCCESS: 200,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500,
};

// 响应接口类型
export interface ApiResponse<T = unknown> {
    msg: string;
    code: number;
    data?: T;
    token?: string;
}

// 用户信息接口
export interface UserInfo {
    userId: number;
    userName: string;
    nickName: string;
    email: string;
    phonenumber: string;
    sex: string;
    avatar: string;
    status: string;
    loginIp: string;
    loginDate: string;
    dept: {
        deptId: number;
        deptName: string;
        leader: string;
    };
    roles: Array<{
        roleId: number;
        roleName: string;
        roleKey: string;
        permissions: string[];
    }>;
    permissions: string[];
}

// 登录请求参数
export interface LoginParams {
    username: string;
    password: string;
}

// 视频创建参数
export interface CreateVideoParams {
    tile: string;
    templateId: string;
    resourceUrl: string;
}

// 视频查询参数
export interface VideoListParams {
    current?: number;
    pageSize?: number;
    [key: string]: string | number | undefined;
} 