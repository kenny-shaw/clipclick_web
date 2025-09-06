// 统一的上传任务接口
export interface UploadTask {
    id: string;
    file: File;
    relativePath?: string; // 文件夹上传时的相对路径
    targetFolderId?: number; // 目标文件夹ID
    tosPath: string; // 完整的TOS路径

    // 统一的状态管理
    status: 'pending' | 'uploading' | 'completed' | 'error' | 'cancelled';
    progress: number; // 0-100
    location: 'foreground' | 'background'; // 明确标识任务位置

    // TOS相关
    tosUrl?: string;
    checkpoint?: unknown; // TOS 断点信息

    // 素材创建相关
    materialId?: number;
    materialStatus: 'pending' | 'creating' | 'completed' | 'error' | 'cancelled';

    // 错误信息
    error?: string;

    // 上传控制
    cancelTokenSource?: unknown; // TOS CancelTokenSource

    // 时间戳
    createdAt: number;
    updatedAt: number;
}

// 任务状态枚举
export const TaskStatus = {
    PENDING: 'pending',
    UPLOADING: 'uploading',
    COMPLETED: 'completed',
    ERROR: 'error',
    CANCELLED: 'cancelled'
} as const;

export const MaterialStatus = {
    PENDING: 'pending',
    CREATING: 'creating',
    COMPLETED: 'completed',
    ERROR: 'error',
    CANCELLED: 'cancelled'
} as const;

export const TaskLocation = {
    FOREGROUND: 'foreground',
    BACKGROUND: 'background'
} as const;

// 任务统计接口
export interface TaskStats {
    total: number;
    pending: number;
    uploading: number;
    completed: number;
    error: number;
    cancelled: number;
    foreground: number;
    background: number;
}

// 任务过滤选项
export interface TaskFilter {
    location?: 'foreground' | 'background';
    status?: string;
    materialStatus?: string;
}

// 兼容性接口 - 保持与旧代码的兼容
export interface UploadFileInfo extends UploadTask {
    // 保持旧的字段名以兼容现有代码
    tosStatus: UploadTask['status'];
    tosProgress: UploadTask['progress'];
    transferredToBackground?: boolean; // 用于标识是否已转移
}
