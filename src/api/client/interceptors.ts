import { useAuthStore } from '@/store/authStore';

// Token管理 - 直接从store获取，保证数据一致性
export const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return useAuthStore.getState().token;
    }
    return null;
};


// 请求拦截器：添加认证头
export const requestInterceptor = (headers: HeadersInit = {}): HeadersInit => {
    const token = getToken();
    const finalHeaders: HeadersInit = { ...headers };
    console.log('token', token);

    if (token) {
        (finalHeaders as Record<string, string>).Authorization = token;
    }

    return finalHeaders;
};

// 响应拦截器：处理通用错误
export const responseInterceptor = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
        if (response.status === 401) {
            // 通过store处理token失效
            if (typeof window !== 'undefined') {
                useAuthStore.getState().logout();
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