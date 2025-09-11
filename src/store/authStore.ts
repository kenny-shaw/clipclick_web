import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthService } from '@/api';
import { TenantInfo, SocialAuthInfo } from '@/api/services/auth/types';

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
    tenant?: TenantInfo;
    social_auth?: SocialAuthInfo[];
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string, tenantName: string) => Promise<void>;
    logout: () => Promise<void>;
    fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            // 初始状态
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            login: async (username, password) => {
                set({ isLoading: true });
                try {
                    console.log('开始登录流程...');
                    const response = await AuthService.login({ username, password });
                    console.log('登录API响应:', response);

                    if (response.token) {
                        console.log('获取到token，先设置token到store...');

                        // 先设置token，这样后续API调用才能带上Authorization头
                        set({ token: response.token });

                        console.log('开始获取用户信息...');
                        // 登录成功后获取用户信息
                        const userInfoResponse = await AuthService.getUserInfo();
                        console.log('用户信息API响应:', userInfoResponse);
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
                                permissions: userInfoResponse.permissions,
                                roles: userInfoResponse.roles,
                                tenant: userData.tenant,
                                social_auth: userInfoResponse.social_auth,
                            };

                            console.log('构建的用户对象:', user);
                            console.log('设置状态...');

                            set({
                                user,
                                token: response.token,
                                isAuthenticated: true,
                                isLoading: false
                            });

                            console.log('状态设置完成，persist中间件会自动保存到localStorage');
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
            register: async (username, password, tenantName) => {
                set({ isLoading: true });
                try {
                    console.log('开始注册流程...');

                    // 1. 先查询租户获取租户ID
                    const tenantResponse = await AuthService.queryTenant({ tenantName });
                    console.log('租户查询响应:', tenantResponse);

                    if (tenantResponse.code !== 200 || !tenantResponse.tenantId) {
                        throw new Error(tenantResponse.msg || '租户查询失败');
                    }

                    // 2. 执行注册
                    const registerResponse = await AuthService.register({
                        username,
                        password,
                        tenantId: tenantResponse.tenantId,
                    });
                    console.log('注册API响应:', registerResponse);

                    if (registerResponse.code !== 200) {
                        throw new Error(registerResponse.msg || '注册失败');
                    }

                    console.log('注册成功，开始自动登录...');

                    // 3. 注册成功后自动登录
                    const loginResponse = await AuthService.login({ username, password });
                    console.log('自动登录API响应:', loginResponse);

                    if (loginResponse.token) {
                        // 先设置token
                        set({ token: loginResponse.token });

                        // 获取用户信息
                        const userInfoResponse = await AuthService.getUserInfo();
                        const userData = userInfoResponse.user;

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
                                permissions: userInfoResponse.permissions,
                                roles: userInfoResponse.roles,
                                tenant: userData.tenant,
                                social_auth: userInfoResponse.social_auth,
                            };

                            set({
                                user,
                                token: loginResponse.token,
                                isAuthenticated: true,
                                isLoading: false
                            });

                            console.log('注册并自动登录成功');
                        }
                    } else {
                        console.error('自动登录失败：没有获取到token');
                        set({ isLoading: false });
                        throw new Error('注册成功但自动登录失败，请手动登录');
                    }
                } catch (error) {
                    console.error('注册过程中发生错误:', error);
                    set({ isLoading: false });
                    if (error instanceof Error) {
                        throw new Error(error.message);
                    } else {
                        throw new Error('注册失败');
                    }
                }
            },
            logout: async () => {
                try {
                    await AuthService.logout();
                } catch (error) {
                    // 即使登出API失败，也要清除本地状态
                    console.warn('登出API调用失败，但已清除本地状态:', error);
                } finally {
                    set({ user: null, token: null, isAuthenticated: false });
                    // persist中间件会自动清除localStorage
                }
            },
            fetchUser: async () => {
                const { token } = get();
                if (!token) {
                    set({ isAuthenticated: false });
                    return;
                }

                try {
                    set({ isLoading: true });
                    const response = await AuthService.getUserInfo();
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
                            permissions: response.permissions,
                            roles: response.roles,
                            tenant: userData.tenant,
                            social_auth: response.social_auth,
                        };

                        set({ user, token, isAuthenticated: true, isLoading: false });
                        // persist中间件会自动保存
                    }
                } catch (error) {
                    console.error('获取用户信息失败:', error);
                    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
                    // persist中间件会自动清除localStorage
                }
            },
        }),
        {
            name: 'auth-storage', // localStorage key
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
); 