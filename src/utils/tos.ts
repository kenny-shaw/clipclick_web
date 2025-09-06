import TOS from '@volcengine/tos-sdk';
import { AuthService } from '@/api';

// TOS 配置接口
interface TOSConfig {
    region: string;
    endpoint: string;
    accessKeyId: string;
    accessKeySecret: string;
    stsToken?: string;
    bucket: string;
}

// 上传进度回调接口
interface UploadProgress {
    loaded: number;
    total: number;
    percent: number;
    checkpoint?: unknown; // 断点信息
}

// 上传选项接口
interface UploadOptions {
    partSize?: number; // 分片大小，默认5MB
    taskNum?: number;  // 并发数，默认3
    onProgress?: (progress: UploadProgress) => void;
    cancelToken?: unknown; // 取消令牌
    checkpoint?: unknown; // 断点信息
}

// TOS客户端类
class TOSClient {
    private client: TOS | null = null;
    private config: TOSConfig;

    constructor(config: TOSConfig) {
        this.config = config;
        this.initClient();
    }

    // 初始化TOS客户端
    private initClient() {
        try {
            this.client = new TOS({
                region: this.config.region,
                endpoint: this.config.endpoint,
                accessKeyId: this.config.accessKeyId,
                accessKeySecret: this.config.accessKeySecret,
                stsToken: this.config.stsToken,
                bucket: this.config.bucket,
            });
        } catch (error) {
            console.error('TOS客户端初始化失败:', error);
            throw new Error('TOS客户端初始化失败');
        }
    }

    // 上传文件
    async uploadFile(
        file: File,
        key: string,
        options: UploadOptions = {}
    ): Promise<string> {
        if (!this.client) {
            throw new Error('TOS客户端未初始化');
        }

        const {
            partSize = 5 * 1024 * 1024, // 默认5MB
            taskNum = 3, // 默认并发数3
            onProgress,
            cancelToken,
            checkpoint
        } = options;

        try {
            const result = await this.client.uploadFile({
                key,
                file,
                partSize,
                taskNum,
                cancelToken, // 支持取消
                checkpoint, // 支持断点续传
                progress: (p: number, checkpoint: { uploadedSize?: number }) => {
                    if (onProgress) {
                        onProgress({
                            loaded: checkpoint?.uploadedSize || 0,
                            total: file.size,
                            percent: Math.round(p * 100)
                        });
                    }
                }
            });

            // 返回文件的完整URL
            const fileUrl = (result as { location?: string }).location || `https://${this.config.bucket}.${this.config.endpoint}/${key}`;
            return fileUrl;

        } catch (error: unknown) {
            // 检查是否是取消错误
            if ((error as { code?: string; message?: string }).code === 'CANCELED' ||
                (error as { message?: string }).message?.includes('cancel')) {
                throw new Error('UPLOAD_CANCELLED');
            }

            console.error('文件上传失败:', error);
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            throw new Error(`文件上传失败: ${errorMessage}`);
        }
    }

    // 删除文件
    async deleteFile(key: string): Promise<void> {
        if (!this.client) {
            throw new Error('TOS客户端未初始化');
        }

        try {
            await this.client.deleteObject({
                key
            });
        } catch (error) {
            console.error('文件删除失败:', error);
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            throw new Error(`文件删除失败: ${errorMessage}`);
        }
    }

    // 检查文件是否存在
    async fileExists(key: string): Promise<boolean> {
        if (!this.client) {
            throw new Error('TOS客户端未初始化');
        }

        try {
            await this.client.headObject({
                key
            });
            return true;
        } catch (error: unknown) {
            if ((error as { statusCode?: number }).statusCode === 404) {
                return false;
            }
            throw error;
        }
    }

    // 获取文件信息
    async getFileInfo(key: string) {
        if (!this.client) {
            throw new Error('TOS客户端未初始化');
        }

        try {
            const result = await this.client.headObject({
                key
            });
            return {
                size: (result as { contentLength?: number }).contentLength,
                lastModified: (result as { lastModified?: string }).lastModified,
                contentType: (result as { contentType?: string }).contentType,
                etag: (result as { etag?: string }).etag
            };
        } catch (error) {
            console.error('获取文件信息失败:', error);
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            throw new Error(`获取文件信息失败: ${errorMessage}`);
        }
    }
}

// 创建默认的TOS客户端实例（使用环境变量）
const createTOSClient = (): TOSClient => {
    // 从环境变量获取配置，如果没有则使用默认值
    const config: TOSConfig = {
        region: process.env.NEXT_PUBLIC_TOS_REGION || 'cn-beijing',
        endpoint: process.env.NEXT_PUBLIC_TOS_ENDPOINT || 'tos-s3-cn-beijing.volces.com',
        accessKeyId: process.env.NEXT_PUBLIC_TOS_ACCESS_KEY || 'your-access-key',
        accessKeySecret: process.env.NEXT_PUBLIC_TOS_SECRET_KEY || 'your-secret-key',
        stsToken: process.env.NEXT_PUBLIC_TOS_STS_TOKEN,
        bucket: process.env.NEXT_PUBLIC_TOS_BUCKET || 'your-bucket-name',
    };

    return new TOSClient(config);
};

// TOS 客户端缓存管理
class TOSClientManager {
    private static instance: TOSClientManager;
    private cachedClient: TOSClient | null = null;
    private tokenExpiry: number = 0;
    private readonly TOKEN_CACHE_DURATION = 50 * 60 * 1000; // 50分钟缓存（临时token通常1小时过期）

    private constructor() { }

    static getInstance(): TOSClientManager {
        if (!TOSClientManager.instance) {
            TOSClientManager.instance = new TOSClientManager();
        }
        return TOSClientManager.instance;
    }

    // 获取TOS客户端（带缓存）
    async getTOSClient(): Promise<TOSClient> {
        const now = Date.now();

        // 如果缓存有效，直接返回
        if (this.cachedClient && now < this.tokenExpiry) {
            console.log('使用缓存的TOS客户端');
            return this.cachedClient;
        }

        // 缓存过期或不存在，重新创建
        console.log('创建新的TOS客户端');
        try {
            this.cachedClient = await this.createNewTOSClient();
            this.tokenExpiry = now + this.TOKEN_CACHE_DURATION;
            return this.cachedClient;
        } catch (error) {
            console.error('创建TOS客户端失败:', error);
            // 如果创建失败，清除缓存并回退到默认配置
            this.clearCache();
            return createTOSClient();
        }
    }

    // 创建新的TOS客户端
    private async createNewTOSClient(): Promise<TOSClient> {
        // 获取临时 token
        const response = await AuthService.getTosTempToken();

        if (response.code !== 200) {
            throw new Error(response.msg || '获取临时 token 失败');
        }

        const { accessKey, secretKey } = response.data;

        // 从用户信息获取租户配置
        const userInfoResponse = await AuthService.getUserInfo();
        if (userInfoResponse.code !== 200 || !userInfoResponse.user.tenant?.tosConfig) {
            throw new Error('无法获取租户 TOS 配置');
        }

        const tosConfig = userInfoResponse.user.tenant.tosConfig;

        console.log('tosConfig', tosConfig);

        const config: TOSConfig = {
            region: tosConfig.region,
            endpoint: tosConfig.endpoint || "tos-cn-beijing.volces.com",
            accessKeyId: tosConfig.accessKey || accessKey,
            accessKeySecret: tosConfig.accessSecret || secretKey,
            bucket: tosConfig.bucket,
        };

        return new TOSClient(config);
    }

    // 清除缓存
    clearCache(): void {
        this.cachedClient = null;
        this.tokenExpiry = 0;
        console.log('TOS客户端缓存已清除');
    }

    // 检查缓存是否有效
    isCacheValid(): boolean {
        return this.cachedClient !== null && Date.now() < this.tokenExpiry;
    }

    // 获取缓存剩余时间（毫秒）
    getCacheRemainingTime(): number {
        if (!this.isCacheValid()) {
            return 0;
        }
        return Math.max(0, this.tokenExpiry - Date.now());
    }
}

// 创建使用临时 token 的 TOS 客户端实例（带缓存）
const createTOSClientWithTempToken = async (): Promise<TOSClient> => {
    const manager = TOSClientManager.getInstance();
    return await manager.getTOSClient();
};

// 带错误重试的TOS客户端获取函数
const createTOSClientWithRetry = async (): Promise<TOSClient> => {
    const manager = TOSClientManager.getInstance();

    try {
        return await manager.getTOSClient();
    } catch (error) {
        console.error('获取TOS客户端失败，清除缓存并重试:', error);
        // 清除缓存并重试一次
        manager.clearCache();
        return await manager.getTOSClient();
    }
};

// 手动清除TOS客户端缓存
const clearTOSClientCache = (): void => {
    const manager = TOSClientManager.getInstance();
    manager.clearCache();
};

// 获取TOS客户端缓存状态
const getTOSClientCacheStatus = (): { isValid: boolean; remainingTime: number } => {
    const manager = TOSClientManager.getInstance();
    return {
        isValid: manager.isCacheValid(),
        remainingTime: manager.getCacheRemainingTime()
    };
};

// 导出工具函数
export {
    TOSClient,
    createTOSClient,
    createTOSClientWithTempToken,
    createTOSClientWithRetry,
    TOSClientManager,
    clearTOSClientCache,
    getTOSClientCacheStatus
};
export type { TOSConfig, UploadProgress, UploadOptions };
