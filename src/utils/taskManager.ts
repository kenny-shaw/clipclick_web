import type { UploadTask, TaskStats, TaskFilter } from '@/types/upload';

// 任务过滤工具函数
export const filterTasks = (tasks: UploadTask[], filter: TaskFilter): UploadTask[] => {
    return tasks.filter(task => {
        if (filter.location && task.location !== filter.location) {
            return false;
        }
        if (filter.status && task.status !== filter.status) {
            return false;
        }
        if (filter.materialStatus && task.materialStatus !== filter.materialStatus) {
            return false;
        }
        return true;
    });
};

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

// 检查任务是否可以进行操作
export const canCancelTask = (task: UploadTask): boolean => {
    return task.status === 'uploading' || task.status === 'pending';
};

export const canPauseTask = (task: UploadTask): boolean => {
    return task.status === 'uploading';
};

export const canResumeTask = (task: UploadTask): boolean => {
    return task.status === 'pending' || task.status === 'error';
};

export const canRemoveTask = (task: UploadTask): boolean => {
    return task.status !== 'uploading' && task.materialStatus !== 'creating';
};

// 生成任务ID
export const generateTaskId = (): string => {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 生成TOS路径
export const generateTOSPath = (file: File, prefix: string = 'materials'): string => {
    return `${prefix}/${Date.now()}_${file.name}`;
};

// 创建新的上传任务
export const createUploadTask = (
    file: File,
    options: {
        relativePath?: string;
        targetFolderId?: number;
        tosPath?: string;
        location?: 'foreground' | 'background';
    } = {}
): UploadTask => {
    const now = Date.now();

    return {
        id: generateTaskId(),
        file,
        relativePath: options.relativePath,
        targetFolderId: options.targetFolderId,
        tosPath: options.tosPath || generateTOSPath(file),
        status: 'pending',
        progress: 0,
        location: options.location || 'foreground',
        materialStatus: 'pending',
        createdAt: now,
        updatedAt: now
    };
};

// 更新任务时间戳
export const updateTaskTimestamp = (task: UploadTask): UploadTask => {
    return {
        ...task,
        updatedAt: Date.now()
    };
};

// 检查任务是否完成
export const isTaskCompleted = (task: UploadTask): boolean => {
    return task.status === 'completed' && task.materialStatus === 'completed';
};

// 检查任务是否失败
export const isTaskFailed = (task: UploadTask): boolean => {
    return task.status === 'error' || task.materialStatus === 'error';
};

// 检查任务是否正在处理
export const isTaskProcessing = (task: UploadTask): boolean => {
    return task.status === 'uploading' || task.materialStatus === 'creating';
};
