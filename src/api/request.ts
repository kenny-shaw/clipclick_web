import { API_BASE_URL, API_CONFIG, ApiResponse } from './config';

// 获取token
const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};

// 设置token
const setToken = (token: string): void => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
    }
};

// 移除token
const removeToken = (): void => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
    }
};

// 构建请求URL
const buildUrl = (endpoint: string): string => {
    return `${API_BASE_URL}${endpoint}`;
};

// 构建请求头
const buildHeaders = (customHeaders?: Record<string, string>): HeadersInit => {
    const token = getToken();
    const headers: HeadersInit = {
        ...API_CONFIG.headers,
        ...customHeaders,
    };

    if (token) {
        headers.Authorization = token;
    }

    return headers;
};

// 处理响应
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
    if (!response.ok) {
        if (response.status === 401) {
            removeToken();
            // 可以在这里添加重定向到登录页的逻辑
        }
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<T> = await response.json();

    if (data.code !== 200) {
        throw new Error(data.msg || '请求失败');
    }

    return data;
};

// GET请求
export const get = async <T = unknown>(
    endpoint: string,
    params?: Record<string, string | number | undefined>
): Promise<ApiResponse<T>> => {
    const url = new URL(buildUrl(endpoint));

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                url.searchParams.append(key, String(value));
            }
        });
    }

    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: buildHeaders(),
    });

    return handleResponse<T>(response);
};

// POST请求
export const post = async <T = unknown>(
    endpoint: string,
    data?: unknown,
    customHeaders?: Record<string, string>
): Promise<ApiResponse<T>> => {
    const response = await fetch(buildUrl(endpoint), {
        method: 'POST',
        headers: buildHeaders(customHeaders),
        body: data ? JSON.stringify(data) : undefined,
    });

    return handleResponse<T>(response);
};

// PUT请求
export const put = async <T = unknown>(
    endpoint: string,
    data?: unknown
): Promise<ApiResponse<T>> => {
    const response = await fetch(buildUrl(endpoint), {
        method: 'PUT',
        headers: buildHeaders(),
        body: data ? JSON.stringify(data) : undefined,
    });

    return handleResponse<T>(response);
};

// DELETE请求
export const del = async <T = unknown>(
    endpoint: string
): Promise<ApiResponse<T>> => {
    const response = await fetch(buildUrl(endpoint), {
        method: 'DELETE',
        headers: buildHeaders(),
    });

    return handleResponse<T>(response);
};

// 导出token相关函数
export { getToken, setToken, removeToken }; 