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
} as const; 