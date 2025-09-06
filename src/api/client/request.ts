import { API_BASE_URL, API_CONFIG } from './config';
import { requestInterceptor, responseInterceptor } from './interceptors';
import { ApiResponse } from '../types/common';

// 构建请求URL
const buildUrl = (endpoint: string): string => {
    return `${API_BASE_URL}${endpoint}`;
};

// 构建请求头
const buildHeaders = (customHeaders?: Record<string, string>): HeadersInit => {
    const baseHeaders = {
        ...API_CONFIG.headers,
        ...customHeaders,
    };

    return requestInterceptor(baseHeaders);
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

    return responseInterceptor<ApiResponse<T>>(response);
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

    return responseInterceptor<ApiResponse<T>>(response);
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

    return responseInterceptor<ApiResponse<T>>(response);
};

// DELETE请求
export const del = async <T = unknown>(
    endpoint: string
): Promise<ApiResponse<T>> => {
    const response = await fetch(buildUrl(endpoint), {
        method: 'DELETE',
        headers: buildHeaders(),
    });

    return responseInterceptor<ApiResponse<T>>(response);
}; 