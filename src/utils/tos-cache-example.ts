// TOS客户端缓存使用示例
import {
    createTOSClientWithRetry,
    clearTOSClientCache,
    getTOSClientCacheStatus,
    TOSClientManager
} from './tos';

// 示例1: 基本使用（自动缓存）
export const uploadFileExample = async (file: File, key: string) => {
    try {
        // 第一次调用会请求临时token并缓存
        const client1 = await createTOSClientWithRetry();
        console.log('第一次获取客户端');

        // 第二次调用会使用缓存的客户端（如果缓存有效）
        const client2 = await createTOSClientWithRetry();
        console.log('第二次获取客户端（可能使用缓存）');

        // 上传文件
        const url = await client1.uploadFile(file, key);
        return url;
    } catch (error) {
        console.error('上传失败:', error);
        throw error;
    }
};

// 示例2: 手动管理缓存
export const manualCacheManagement = () => {
    // 检查缓存状态
    const status = getTOSClientCacheStatus();
    console.log('缓存状态:', status);

    if (status.isValid) {
        console.log(`缓存剩余时间: ${Math.round(status.remainingTime / 1000)}秒`);
    } else {
        console.log('缓存已过期或不存在');
    }

    // 手动清除缓存
    clearTOSClientCache();
    console.log('缓存已清除');
};

// 示例3: 获取管理器实例进行高级操作
export const advancedCacheManagement = () => {
    const manager = TOSClientManager.getInstance();

    // 检查缓存是否有效
    if (manager.isCacheValid()) {
        console.log('缓存有效');
        console.log(`剩余时间: ${manager.getCacheRemainingTime()}ms`);
    } else {
        console.log('缓存无效，下次调用会重新创建');
    }

    // 强制清除缓存
    manager.clearCache();
};

// 示例4: 在组件中使用
export const useTOSClientInComponent = () => {
    const handleUpload = async (files: File[]) => {
        try {
            // 获取客户端（自动处理缓存）
            const client = await createTOSClientWithRetry();

            // 批量上传
            const uploadPromises = files.map(async (file, index) => {
                const key = `uploads/${Date.now()}_${index}_${file.name}`;
                return await client.uploadFile(file, key);
            });

            const urls = await Promise.all(uploadPromises);
            console.log('所有文件上传完成:', urls);
            return urls;
        } catch (error) {
            console.error('批量上传失败:', error);
            // 上传失败时，缓存会在下次调用时自动清除
            throw error;
        }
    };

    return { handleUpload };
};
