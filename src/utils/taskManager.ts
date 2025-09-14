import type { UploadTask, TaskStats } from '@/types/upload';

/**
 * 任务管理工具函数
 * 提供上传任务的基本操作和统计功能
 */

// 获取任务统计信息
export const getTaskStats = (tasks: UploadTask[]): TaskStats => {
    const stats: TaskStats = {
        total: tasks.length,
        pending: 0,
        uploading: 0,
        completed: 0,
        error: 0,
        cancelled: 0,
        foreground: 0,
        background: 0
    };

    tasks.forEach(task => {
        // 状态统计
        switch (task.status) {
            case 'pending':
                stats.pending++;
                break;
            case 'uploading':
                stats.uploading++;
                break;
            case 'completed':
                stats.completed++;
                break;
            case 'error':
                stats.error++;
                break;
            case 'cancelled':
                stats.cancelled++;
                break;
        }

        // 位置统计
        if (task.location === 'foreground') {
            stats.foreground++;
        } else {
            stats.background++;
        }
    });

    return stats;
};


/**
 * 生成唯一的任务ID
 * @returns 格式: timestamp_randomString
 */
export const generateTaskId = (): string => {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 生成TOS存储路径
 * @param file 文件对象
 * @param options 路径选项
 * @returns TOS路径字符串
 */
export const generateTOSPath = (file: File, options: {
    tenantId?: number;
    folderId?: number;
    prefix?: string;
    folderName?: string; // 文件夹上传时的文件夹名称
} = {}): string => {
    const { tenantId, folderId, prefix = 'materials', folderName } = options;

    if (tenantId && folderId) {
        return `tenant_${tenantId}/${prefix}/folder_${folderId}/${file.name}`;
    } else if (tenantId && folderName) {
        // 文件夹上传的临时路径
        return `tenant_${tenantId}/${prefix}/folder_${folderName}/${file.name}`;
    } else if (tenantId) {
        return `tenant_${tenantId}/${prefix}/${file.name}`;
    } else if (folderName) {
        // 没有租户ID时的文件夹上传临时路径
        return `${prefix}/folder_${folderName}/${file.name}`;
    } else {
        return `${prefix}/${Date.now()}_${file.name}`;
    }
};

/**
 * 创建新的上传任务
 * @param file 文件对象
 * @param options 任务选项
 * @returns 上传任务对象
 */
export const createUploadTask = (
    file: File,
    options: {
        relativePath?: string;
        targetFolderId?: number;
        tosPath?: string;
        location?: 'foreground' | 'background';
        tenantId?: number;
        folderId?: number;
        folderName?: string; // 文件夹上传时的文件夹名称
    } = {}
): UploadTask => {
    const now = Date.now();

    return {
        id: generateTaskId(),
        file,
        relativePath: options.relativePath,
        targetFolderId: options.targetFolderId,
        tosPath: options.tosPath || generateTOSPath(file, {
            tenantId: options.tenantId,
            folderId: options.folderId || options.targetFolderId,
            folderName: options.folderName
        }),
        folderName: options.folderName,
        status: 'pending',
        progress: 0,
        location: options.location || 'foreground',
        materialStatus: 'pending',
        createdAt: now,
        updatedAt: now
    };
};

