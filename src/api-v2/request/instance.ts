// 基础响应接口
interface BaseResponse {
    msg: string;
    code: number;
}

// 响应接口类型
export type ApiResponse<T = unknown> = BaseResponse & T;

// 默认API配置
const defaultApiConfig = {
    baseUrl: 'http://47.93.53.0:8080',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
};

// 从api.config.json读取配置
let apiConfig = defaultApiConfig;

if (typeof window === 'undefined') {
    try {
        const fs = require('fs');
        const path = require('path');
        const configPath = path.join(process.cwd(), 'api.config.json');

        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            apiConfig = config.api || defaultApiConfig;
        }
    } catch (error) {
        console.warn('无法读取api.config.json，使用默认配置:', error);
    }
}

// 构建请求URL
const buildUrl = (endpoint: string): string => {
    return `${apiConfig.baseUrl}${endpoint}`;
};

// Token管理 - 从localStorage获取
const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};

// 请求拦截器：添加认证头
const requestInterceptor = (headers: HeadersInit = {}): HeadersInit => {
    const token = getToken();
    const finalHeaders: HeadersInit = { ...headers };

    if (token) {
        (finalHeaders as Record<string, string>).Authorization = token;
    }

    return finalHeaders;
};

// 响应拦截器：处理通用错误
const responseInterceptor = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
        if (response.status === 401) {
            // 处理token失效
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                // 重定向到登录页
                window.location.href = '/login';
            }
        }
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.code !== 200) {
        throw new Error(data.msg || '请求失败');
    }

    return data;
};

// 构建请求头
const buildHeaders = (customHeaders?: Record<string, string>): HeadersInit => {
    const baseHeaders = {
        ...apiConfig.headers,
        ...customHeaders,
    };

    return requestInterceptor(baseHeaders);
};

// 请求实例类
export class RequestInstance {
    private baseUrl: string;

    constructor(baseUrl?: string) {
        this.baseUrl = baseUrl || apiConfig.baseUrl;
    }

    // GET请求
    async get<T = unknown>(
        endpoint: string,
        params?: Record<string, string | number | undefined>
    ): Promise<ApiResponse<T>> {
        const url = new URL(`${this.baseUrl}${endpoint}`);

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

        return responseInterceptor<ApiResponse<T>>(response);
    }

    // POST请求
    async post<T = unknown>(
        endpoint: string,
        data?: unknown,
        customHeaders?: Record<string, string>
    ): Promise<ApiResponse<T>> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: buildHeaders(customHeaders),
            body: data ? JSON.stringify(data) : undefined,
        });

        return responseInterceptor<ApiResponse<T>>(response);
    }

    // PUT请求
    async put<T = unknown>(
        endpoint: string,
        data?: unknown
    ): Promise<ApiResponse<T>> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PUT',
            headers: buildHeaders(),
            body: data ? JSON.stringify(data) : undefined,
        });

        return responseInterceptor<ApiResponse<T>>(response);
    }

    // DELETE请求
    async delete<T = unknown>(
        endpoint: string
    ): Promise<ApiResponse<T>> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'DELETE',
            headers: buildHeaders(),
        });

        return responseInterceptor<ApiResponse<T>>(response);
    }
}

// 创建默认请求实例
export const requestInstance = new RequestInstance();

// 导出请求方法（保持向后兼容）
export const { get, post, put, delete: del } = requestInstance;
