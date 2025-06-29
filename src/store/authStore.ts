import { create } from 'zustand';
import { login as apiLogin, getUserInfo as apiGetUserInfo, logout as apiLogout, setToken, removeToken } from '@/api';

export interface User {
    userId: number;
    userName: string;
    nickName: string;
    email: string;
    phonenumber: string;
    sex: string;
    avatar: string;
    status: string;
    permissions: string[];
    roles: string[];
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    fetchUser: () => Promise<void>;
}

const getInitialState = (): Omit<AuthState, 'login' | 'logout' | 'fetchUser'> => {
    console.log('getInitialState 被调用');
    // 在客户端环境下从localStorage恢复状态
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        console.log('从localStorage读取:', { token: !!token, userStr: !!userStr });

        if (token && userStr) {
            try {
                const user = JSON.parse(userStr) as User;
                console.log('成功解析用户信息:', user);
                return {
                    user,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                };
            } catch (error) {
                console.error('解析用户信息失败:', error);
                // 如果解析失败，清除localStorage
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        } else {
            console.log('localStorage中没有token或用户信息');
        }
    } else {
        console.log('不在客户端环境');
    }

    console.log('返回初始状态');
    return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
    };
};

export const useAuthStore = create<AuthState>((set) => ({
    ...getInitialState(),
    login: async (username, password) => {
        set({ isLoading: true });
        try {
            console.log('开始登录流程...');
            const response = await apiLogin({ username, password });
            console.log('登录API响应:', response);

            if (response.token) {
                console.log('获取到token，开始获取用户信息...');
                setToken(response.token);

                // 登录成功后获取用户信息
                const userInfoResponse = await apiGetUserInfo();
                console.log('用户信息API响应:', userInfoResponse);
                // @ts-expect-error 类型错误
                const userData = userInfoResponse.user;
                if (userData) {
                    console.log('用户数据:', userData);
                    const user: User = {
                        userId: userData.userId,
                        userName: userData.userName,
                        nickName: userData.nickName,
                        email: userData.email,
                        phonenumber: userData.phonenumber,
                        sex: userData.sex,
                        avatar: userData.avatar,
                        status: userData.status,
                        // @ts-expect-error 类型错误
                        permissions: userInfoResponse.permissions,
                        // @ts-expect-error 类型错误
                        roles: userInfoResponse.roles,
                    };

                    console.log('构建的用户对象:', user);
                    console.log('设置状态前...');

                    set({
                        user,
                        token: response.token,
                        isAuthenticated: true,
                        isLoading: false
                    });

                    console.log('状态设置完成，保存到localStorage...');
                    localStorage.setItem('user', JSON.stringify(user));
                    console.log('localStorage保存完成');
                } else {
                    console.error('用户数据为空');
                }
            } else {
                console.error('登录响应中没有token');
            }
        } catch (error) {
            console.error('登录过程中发生错误:', error);
            set({ isLoading: false });
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error('登录失败');
            }
        }
    },
    logout: async () => {
        try {
            await apiLogout();
        } catch (error) {
            // 即使登出API失败，也要清除本地状态
            console.warn('登出API调用失败，但已清除本地状态:', error);
        } finally {
            removeToken();
            set({ user: null, token: null, isAuthenticated: false });
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    },
    fetchUser: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            set({ isAuthenticated: false });
            return;
        }

        try {
            set({ isLoading: true });
            const response = await apiGetUserInfo();
            // @ts-expect-error 类型错误
            const userData = response.user;

            if (userData) {
                const user: User = {
                    userId: userData.userId,
                    userName: userData.userName,
                    nickName: userData.nickName,
                    email: userData.email,
                    phonenumber: userData.phonenumber,
                    sex: userData.sex,
                    avatar: userData.avatar,
                    status: userData.status,
                    // @ts-expect-error 类型错误
                    permissions: response.permissions,
                    // @ts-expect-error 类型错误
                    roles: response.roles,
                };

                set({ user, token, isAuthenticated: true, isLoading: false });
                localStorage.setItem('user', JSON.stringify(user));
            }
        } catch (error) {
            console.error('获取用户信息失败:', error);
            removeToken();
            set({ user: null, token: null, isAuthenticated: false, isLoading: false });
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    },
})); 