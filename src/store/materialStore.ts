import { create } from 'zustand';
import { MaterialService } from '@/api';
import type {
    MaterialInfo,
    MaterialListResponse,
    CreateMaterialParams,
    FolderInfo,
    FolderListResponse,
    CreateFolderParams,
    MaterialListParams,
    FolderListParams
} from '@/api';
import { message } from 'antd';
import { createTOSClientWithRetry } from '@/utils/tos';
import type { UploadProgress } from '@/utils/tos';
import TOS from '@volcengine/tos-sdk';
import type { UploadTask, TaskStats } from '@/types/upload';
import { getTaskStats, createUploadTask } from '@/utils/taskManager';
import { ConcurrencyLimiter } from '@/utils/concurrencyLimiter';
import { useAuthStore } from './authStore';

// 全局并发限制器实例
const globalUploadLimiter = new ConcurrencyLimiter(1);

// 面包屑导航项
export interface BreadcrumbItem {
    id: number;
    name: string;
}

// 统一任务接口 - 直接使用 UploadTask
export type MaterialUploadTask = UploadTask;

interface MaterialState {
    // 文件夹相关状态
    folders: FolderInfo[];
    foldersLoading: boolean;
    foldersTotal: number;
    foldersCurrent: number;
    foldersPageSize: number;

    // 素材相关状态
    materials: MaterialInfo[];
    materialsLoading: boolean;
    materialsTotal: number;
    materialsCurrent: number;
    materialsPageSize: number;

    // 当前文件夹状态
    currentFolderId: number | null;

    // 操作状态
    isCreatingFolder: boolean;
    isCreatingMaterial: boolean;

    // 新的统一任务管理状态
    uploadTasks: MaterialUploadTask[];
    backgroundTasksVisible: boolean; // 后台任务侧边栏是否可见
    isConfirmingForegroundTasks: boolean; // 是否正在确认前台任务



    // 文件夹操作
    fetchFolderList: (params?: FolderListParams) => Promise<void>;
    createFolder: (params: CreateFolderParams) => Promise<void>;
    createFolderForUpload: (folderName: string) => Promise<number>;
    setCurrentFolder: (folderId: number | null) => void;

    // 素材操作
    fetchMaterialList: (params?: MaterialListParams) => Promise<void>;
    createMaterial: (params: CreateMaterialParams) => Promise<void>;

    // 上传操作
    detectFileCategory: (file: File) => number;

    // 新的统一任务管理方法
    addTasks: (tasks: MaterialUploadTask[]) => void;
    updateTask: (taskId: string, updates: Partial<MaterialUploadTask>) => void;
    updateTasksTargetFolder: (folderId: number, folderName?: string) => void;

    // 任务转移
    transferTaskToBackground: (taskId: string) => void;
    transferAllToBackground: () => void;

    // 任务过滤和查询
    getTasksByLocation: (location: 'foreground' | 'background') => MaterialUploadTask[];
    getTasksByStatus: (status: string) => MaterialUploadTask[];
    getTaskStats: () => TaskStats;

    // 计算属性选择器
    isForegroundUploading: () => boolean;
    isBackgroundUploading: () => boolean;
    isUploading: () => boolean;
    uploadProgress: () => number;
    breadcrumbs: () => BreadcrumbItem[];
    getUploadingTasks: () => MaterialUploadTask[];

    // 上传控制
    startUpload: (taskIds?: string[], location?: 'foreground' | 'background') => Promise<void>;
    uploadSingleTask: (task: MaterialUploadTask) => Promise<void>;
    createMaterialForTask: (taskId: string, shouldRemoveTask?: boolean) => Promise<void>;
    confirmForegroundTasks: () => Promise<{ completedCount: number; transferredCount: number }>;

    // Cancel = 停止上传，任务保留（状态变为 cancelled）
    cancelTask: (taskId: string) => void;
    cancelAllTasks: () => void;
    cancelForegroundTasks: () => void;

    // Clear = 停止上传 + 删除任务（完全清理）
    clearTask: (taskId: string) => void;
    clearAllTasks: () => void;
    clearForegroundTasks: () => void;

    // Remove = 仅删除任务
    removeTask: (taskId: string) => void;
    removeAllTasks: () => void;
    removeForegroundTasks: () => void;

    addTaskFromFile: (file: File, options?: {
        relativePath?: string;
        targetFolderId?: number;
        location?: 'foreground' | 'background';
        folderName?: string; // 文件夹上传时的文件夹名称
    }) => MaterialUploadTask;


    // 文件夹结构管理
    createFolderStructure: (folderPaths: string[], parentFolderId: number | null) => Promise<Map<string, number>>;

    // 后台任务管理
    toggleBackgroundTasksVisible: () => void;


    // 导航操作
    navigateToFolder: (folderId: number, folderName: string) => void;
    navigateToRoot: () => void;

    // 清空状态
    clearState: () => void;
}

export const useMaterialStore = create<MaterialState>((set, get) => ({
    // 初始状态
    folders: [],
    foldersLoading: false,
    foldersTotal: 0,
    foldersCurrent: 1,
    foldersPageSize: 20,

    materials: [],
    materialsLoading: false,
    materialsTotal: 0,
    materialsCurrent: 1,
    materialsPageSize: 20,

    currentFolderId: null,

    isCreatingFolder: false,
    isCreatingMaterial: false,

    // 新的统一任务管理初始状态
    uploadTasks: [],
    backgroundTasksVisible: false,
    isConfirmingForegroundTasks: false,


    // 获取文件夹列表
    fetchFolderList: async (params = {}) => {
        set({ foldersLoading: true });
        try {
            const { pageNum = 1, pageSize = 20 } = params;
            const response = await MaterialService.getFolderList({ pageNum, pageSize, ...params });

            console.log('文件夹列表响应:', response);

            if (response.rows) {
                const folderList = response as FolderListResponse;
                set({
                    folders: folderList.rows,
                    foldersTotal: folderList.total,
                    foldersCurrent: pageNum,
                    foldersPageSize: pageSize,
                    foldersLoading: false,
                });
            }
        } catch (error) {
            console.error('获取文件夹列表失败:', error);
            set({ foldersLoading: false });
            message.error('获取文件夹列表失败');
            throw error;
        }
    },

    // 创建文件夹
    createFolder: async (params: CreateFolderParams) => {
        set({ isCreatingFolder: true });
        try {
            const response = await MaterialService.createFolder(params);

            if (response.code === 200) {
                message.success('文件夹创建成功！');
                // 重新获取文件夹列表
                await get().fetchFolderList();
            } else {
                throw new Error(response.msg || '创建文件夹失败');
            }

            set({ isCreatingFolder: false });
        } catch (error) {
            console.error('创建文件夹失败:', error);
            set({ isCreatingFolder: false });
            message.error('创建文件夹失败');
            throw error;
        }
    },

    // 为上传创建文件夹
    createFolderForUpload: async (folderName: string) => {
        try {
            // 生成唯一的TOS路径
            const tosPath = `folders/${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const response = await MaterialService.createFolder({
                name: folderName,
                parentId: 0, // 根目录
                isPublic: 0,
                vectorIndex: tosPath // 将TOS路径存储在vectorIndex字段中
            });

            if (response.code === 200) {
                const folderId = (response as { data?: { id?: number } }).data?.id;
                if (folderId) {
                    return folderId;
                } else {
                    throw new Error('创建文件夹失败：未返回文件夹ID');
                }
            } else {
                throw new Error(response.msg || '创建文件夹失败');
            }
        } catch (error) {
            console.error('创建文件夹失败:', error);
            throw error;
        }
    },

    // 获取素材列表
    fetchMaterialList: async (params = {}) => {
        set({ materialsLoading: true });
        try {
            const { pageNum = 1, pageSize = 20, folderId } = params;
            const response = await MaterialService.getMaterialList({
                pageNum,
                pageSize,
                folderId: folderId ?? get().currentFolderId ?? undefined,
                ...params
            });

            console.log('素材列表响应:', response);

            if (response.rows) {
                const materialList = response as MaterialListResponse;
                set({
                    materials: materialList.rows,
                    materialsTotal: materialList.total,
                    materialsCurrent: pageNum,
                    materialsPageSize: pageSize,
                    materialsLoading: false,
                });
            }
        } catch (error) {
            console.error('获取素材列表失败:', error);
            set({ materialsLoading: false });
            message.error('获取素材列表失败');
            throw error;
        }
    },

    // 创建素材
    createMaterial: async (params: CreateMaterialParams) => {
        set({ isCreatingMaterial: true });
        try {
            const response = await MaterialService.createMaterial(params);

            if (response.code === 200) {
                message.success('素材上传成功！');
                // 重新获取素材列表
                await get().fetchMaterialList();
            } else {
                throw new Error(response.msg || '上传素材失败');
            }

            set({ isCreatingMaterial: false });
        } catch (error) {
            console.error('上传素材失败:', error);
            set({ isCreatingMaterial: false });
            message.error('上传素材失败');
            throw error;
        }
    },

    // 设置当前文件夹
    setCurrentFolder: (folderId: number | null) => {
        set({ currentFolderId: folderId });
    },

    // 导航到文件夹
    navigateToFolder: (folderId: number) => {
        get().setCurrentFolder(folderId);
        // 清空素材列表，准备加载新的
        set({ materials: [] });
    },

    // 导航到根目录
    navigateToRoot: () => {
        get().setCurrentFolder(null);
        // 清空素材列表
        set({ materials: [] });
    },


    // 检测文件类型
    detectFileCategory: (file: File): number => {
        const extension = file.name.split('.').pop()?.toLowerCase();

        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
            return 1; // 图片
        } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension || '')) {
            return 2; // 视频
        } else if (['mp3', 'wav', 'aac', 'ogg', 'flac'].includes(extension || '')) {
            return 3; // 音频
        } else {
            return 4; // 其他
        }
    },


    // 递归创建文件夹结构
    createFolderStructure: async (folderPaths: string[], parentFolderId: number | null): Promise<Map<string, number>> => {
        const folderIdMap = new Map<string, number>();

        // 按层级深度排序，确保父文件夹先创建
        const sortedPaths = [...new Set(folderPaths)].sort((a, b) => {
            const aDepth = a.split('/').length;
            const bDepth = b.split('/').length;
            return aDepth - bDepth;
        });

        for (const folderPath of sortedPaths) {
            const pathParts = folderPath.split('/');
            let currentParentId = parentFolderId;
            let currentPath = '';

            // 逐级创建文件夹
            for (const folderName of pathParts) {
                currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;

                // 如果文件夹还未创建
                if (!folderIdMap.has(currentPath)) {
                    try {
                        // 生成唯一的TOS路径
                        const tosPath = `folders/${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

                        const response = await MaterialService.createFolder({
                            name: folderName,
                            parentId: currentParentId || 0,
                            isPublic: 0,
                            vectorIndex: tosPath // 将TOS路径存储在vectorIndex字段中
                        });

                        if (response.code === 200) {
                            const folderId = (response as { data?: { id?: number } }).data?.id;
                            if (folderId) {
                                folderIdMap.set(currentPath, folderId);
                                currentParentId = folderId;
                            } else {
                                throw new Error('创建文件夹失败：未返回文件夹ID');
                            }
                        } else {
                            throw new Error(response.msg || '创建文件夹失败');
                        }
                    } catch (error) {
                        console.error(`创建文件夹失败 [${currentPath}]:`, error);
                        throw error;
                    }
                } else {
                    // 文件夹已存在，使用现有ID
                    currentParentId = folderIdMap.get(currentPath)!;
                }
            }
        }

        return folderIdMap;
    },

    // 新的统一任务管理方法实现
    addTasks: (tasks: MaterialUploadTask[]) => {
        set(state => ({
            uploadTasks: [...state.uploadTasks, ...tasks]
        }));
    },

    // Remove = 仅删除任务（不停止上传，用于后台上传场景）
    removeTask: (taskId: string) => {
        set(state => ({
            uploadTasks: state.uploadTasks.filter(task => task.id !== taskId)
        }));
    },

    updateTask: (taskId: string, updates: Partial<MaterialUploadTask>) => {
        set(state => ({
            uploadTasks: state.uploadTasks.map(task =>
                task.id === taskId
                    ? { ...task, ...updates, updatedAt: Date.now() }
                    : task
            )
        }));
    },

    // 更新任务的targetFolderId（用于文件夹上传）
    updateTasksTargetFolder: (folderId: number, folderName?: string) => {
        set(state => ({
            uploadTasks: state.uploadTasks.map(task => {
                // 只更新有folderName且targetFolderId为undefined的任务
                if (task.folderName === folderName && task.targetFolderId === undefined) {
                    return {
                        ...task,
                        targetFolderId: folderId,
                        updatedAt: Date.now()
                    };
                }
                return task;
            })
        }));
    },


    transferTaskToBackground: (taskId: string) => {
        get().updateTask(taskId, { location: 'background' });
    },


    transferAllToBackground: () => {
        set(state => ({
            uploadTasks: state.uploadTasks.map(task => ({
                ...task,
                location: 'background' as const,
                updatedAt: Date.now()
            }))
        }));
    },

    getTasksByLocation: (location: 'foreground' | 'background') => {
        return get().uploadTasks.filter(task => task.location === location);
    },

    getTasksByStatus: (status: string) => {
        return get().uploadTasks.filter(task => task.status === status);
    },

    getTaskStats: () => {
        return getTaskStats(get().uploadTasks);
    },

    // 计算属性选择器实现
    isForegroundUploading: () => {
        return get().uploadTasks.some(
            task => task.location === 'foreground' && task.status === 'uploading'
        );
    },

    isBackgroundUploading: () => {
        return get().uploadTasks.some(
            task => task.location === 'background' && task.status === 'uploading'
        );
    },


    getUploadingTasks: () => {
        return get().uploadTasks.filter(task => task.status === 'uploading');
    },

    isUploading: () => {
        return get().uploadTasks.some(task => task.status === 'uploading');
    },

    uploadProgress: () => {
        const uploadingTasks = get().uploadTasks.filter(task => task.status === 'uploading');
        if (uploadingTasks.length === 0) {
            return 0;
        }

        const totalProgress = uploadingTasks.reduce((sum, task) => sum + task.progress, 0);
        return Math.round(totalProgress / uploadingTasks.length);
    },

    breadcrumbs: () => {
        const { currentFolderId, folders } = get();
        const breadcrumbs: BreadcrumbItem[] = [{ id: 0, name: '素材库' }];

        if (currentFolderId) {
            // 这里需要根据文件夹ID查找文件夹名称
            // 由于当前没有完整的文件夹树结构，暂时简化处理
            const folder = folders.find(f => f.id === currentFolderId);
            if (folder) {
                breadcrumbs.push({ id: currentFolderId, name: folder.name });
            }
        }

        return breadcrumbs;
    },

    startUpload: async (taskIds?: string[], location: 'foreground' | 'background' = 'foreground') => {
        const { uploadTasks } = get();
        const tasksToUpload = taskIds
            ? uploadTasks.filter(task => taskIds.includes(task.id))
            : uploadTasks.filter(task =>
                task.status === 'pending' &&
                (location ? task.location === location : task.location === 'foreground')
            );

        if (tasksToUpload.length === 0) {
            const locationText = location === 'background' ? '后台' : '前台';
            message.warning(`没有可上传的${locationText}任务`);
            return;
        }

        try {
            // 使用全局并发限制器控制上传任务
            const uploadPromises = tasksToUpload.map(async task => {
                // 获取并发许可
                await globalUploadLimiter.acquire();

                // 获取许可后立即检查任务是否还存在且未被取消
                const currentTask = get().uploadTasks.find(t => t.id === task.id);
                if (!currentTask || currentTask.status === 'cancelled' || currentTask.location !== 'foreground') {
                    console.log(`任务 ${task.id} 已被取消或删除，跳过上传`);
                    globalUploadLimiter.release();
                    return;
                }

                try {
                    await get().uploadSingleTask(task);
                } finally {
                    // 释放并发许可
                    globalUploadLimiter.release();
                }
            });

            await Promise.allSettled(uploadPromises);

            const successCount = tasksToUpload.filter(task => {
                const currentTask = get().uploadTasks.find(t => t.id === task.id);
                return currentTask?.status === 'completed';
            }).length;

            if (successCount > 0) {
                const locationText = location === 'background' ? '后台' : '';
                message.success(`成功上传 ${successCount} 个文件${locationText}`);
            }
        } catch (error) {
            console.error('批量上传失败:', error);
            const locationText = location === 'background' ? '后台' : '';
            message.error(`${locationText}上传失败，请重试`);
        }
    },

    // 上传单个任务
    uploadSingleTask: async (task: MaterialUploadTask) => {
        const tosClient = await createTOSClientWithRetry();

        // 创建取消令牌
        const cancelTokenSource = TOS.CancelToken.source();

        // 更新任务状态
        get().updateTask(task.id, {
            status: 'uploading',
            progress: 0,
            cancelTokenSource
        });

        try {
            const url = await tosClient.uploadFile(
                task.file,
                task.tosPath,
                {
                    partSize: 5 * 1024 * 1024, // 5MB
                    taskNum: 3,
                    cancelToken: cancelTokenSource.token,
                    checkpoint: task.checkpoint,
                    onProgress: (progress: UploadProgress) => {
                        get().updateTask(task.id, {
                            progress: progress.percent,
                            checkpoint: progress.checkpoint
                        });
                    }
                }
            );

            // 更新任务状态为完成
            get().updateTask(task.id, {
                status: 'completed',
                progress: 100,
                tosUrl: url
            });

            // 重新获取任务的最新状态，因为可能在上传过程中被转移到了后台
            const currentTask = get().uploadTasks.find(t => t.id === task.id);
            const isConfirmingForeground = get().isConfirmingForegroundTasks;
            console.log('currentTask.location', currentTask?.location);
            console.log('isConfirmingForeground', isConfirmingForeground);

            // 根据任务位置和锁状态决定处理方式
            if (currentTask?.location === 'background') {
                // 后台任务立即创建素材
                await get().createMaterialForTask(task.id);
            } else if (currentTask?.location === 'foreground' && isConfirmingForeground) {
                // 前台任务且在确认过程中，立即创建素材并转移到后台
                await get().createMaterialForTask(task.id, true);
                get().transferTaskToBackground(task.id);
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知错误';

            if (errorMessage.includes('UPLOAD_CANCELLED')) {
                get().updateTask(task.id, {
                    status: 'cancelled',
                    error: '上传已取消'
                });
            } else {
                console.error(`文件上传失败 [${task.file.name}]:`, error);
                get().updateTask(task.id, {
                    status: 'error',
                    error: errorMessage
                });
            }
        } finally {
            // 清理取消令牌
            get().updateTask(task.id, { cancelTokenSource: undefined });
        }
    },

    // 为任务创建素材
    createMaterialForTask: async (taskId: string, shouldRemoveTask: boolean = false) => {
        const task = get().uploadTasks.find(t => t.id === taskId);
        if (!task || !task.tosUrl) {
            throw new Error('任务不存在或TOS URL不存在');
        }

        get().updateTask(taskId, { materialStatus: 'creating' });

        try {
            const materialParams: CreateMaterialParams = {
                name: task.file.name,
                url: task.tosUrl,
                folderId: task.targetFolderId || 0,
                category: get().detectFileCategory(task.file),
                isPublic: 0,
                isApproved: 0,
                caption: '',
                attributes: '',
                industry: 0,
                md5: '',
                metaInfo: JSON.stringify({
                    size: task.file.size,
                    type: task.file.type,
                    lastModified: task.file.lastModified,
                    relativePath: task.relativePath || ''
                }),
                modalData: '',
                platformSource: 'web',
                relatedInfo: '{}',
                renderProtocol: ''
            };

            const response = await MaterialService.createMaterial(materialParams);

            if (response.code === 200) {
                get().updateTask(taskId, {
                    materialStatus: 'completed',
                    materialId: (response as { data?: { id?: number } }).data?.id
                });

                // 静默刷新素材列表
                get().fetchMaterialList();

                // 如果需要删除任务，创建成功后删除
                if (shouldRemoveTask) {
                    get().removeTask(taskId);
                }
            } else {
                throw new Error(response.msg || '创建素材失败');
            }
        } catch (error) {
            console.error(`创建素材失败 [${task.file.name}]:`, error);
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            get().updateTask(taskId, {
                materialStatus: 'error',
                error: errorMessage
            });
        }
    },
    confirmForegroundTasks: async () => {
        // 设置确认锁，防止上传过程中的竞态条件
        set({ isConfirmingForegroundTasks: true });

        try {
            const foregroundTasks = get().uploadTasks.filter(task => task.location === 'foreground');

            if (foregroundTasks.length === 0) {
                return { completedCount: 0, transferredCount: 0 };
            }

            // 1. 先确定哪些是未完成的任务（在创建素材之前确定，避免竞态条件）
            const incompleteTasks = foregroundTasks.filter(task => task.status !== 'completed');

            // 2. 为已完成上传的文件创建素材
            const completedTasks = foregroundTasks.filter(
                task => task.status === 'completed' && task.materialStatus === 'pending'
            );

            let completedCount = 0;
            let transferredCount = 0;

            // 并行创建所有已上传完成的素材
            if (completedTasks.length > 0) {
                const createPromises = completedTasks.map(async (task) => {
                    try {
                        await get().createMaterialForTask(task.id, true); // 创建成功后删除任务
                        return true;
                    } catch (error) {
                        console.error(`创建素材失败 [${task.file.name}]:`, error);
                        throw error;
                    }
                });

                const results = await Promise.allSettled(createPromises);
                completedCount = results.filter(result => result.status === 'fulfilled').length;
            }

            // 3. 将未完成的任务转移到后台
            if (incompleteTasks.length > 0) {
                incompleteTasks.forEach(task => {
                    get().transferTaskToBackground(task.id);
                });
                transferredCount = incompleteTasks.length;
            }

            return { completedCount, transferredCount };
        } finally {
            // 释放确认锁
            set({ isConfirmingForegroundTasks: false });
        }
    },

    // Cancel = 停止上传，任务保留（状态变为 cancelled）
    cancelTask: (taskId: string) => {
        const task = get().uploadTasks.find(t => t.id === taskId);
        if (task?.cancelTokenSource) {
            (task.cancelTokenSource as { cancel: (reason: string) => void }).cancel('用户取消上传');
        }
        get().updateTask(taskId, {
            status: 'cancelled',
            error: '上传已取消'
        });
    },

    // Clear = 停止上传 + 删除任务（完全清理）
    clearTask: (taskId: string) => {
        // 先取消上传
        get().cancelTask(taskId);
        // 然后删除任务
        get().removeTask(taskId);
    },

    clearAllTasks: () => {
        // 先取消所有任务的上传
        get().cancelAllTasks();
        // 然后删除所有任务
        get().removeAllTasks();
    },

    clearForegroundTasks: () => {
        const { uploadTasks } = get();
        const foregroundTasks = uploadTasks.filter(task => task.location === 'foreground');

        // 先取消所有前台任务的上传
        foregroundTasks.forEach(task => {
            if (task.cancelTokenSource) {
                (task.cancelTokenSource as { cancel: (reason: string) => void }).cancel('用户关闭抽屉');
            }
        });

        // 然后删除所有前台任务
        set(state => ({
            uploadTasks: state.uploadTasks.filter(task => task.location !== 'foreground')
        }));
    },

    // Remove = 仅删除任务（不停止上传，用于后台上传场景）
    removeAllTasks: () => {
        set({
            uploadTasks: []
        });
    },

    removeForegroundTasks: () => {
        set(state => ({
            uploadTasks: state.uploadTasks.filter(task => task.location !== 'foreground')
        }));
    },

    // Cancel = 停止上传，任务保留（状态变为 cancelled）
    cancelAllTasks: () => {
        const { uploadTasks } = get();
        uploadTasks.forEach(task => {
            if (task.cancelTokenSource) {
                (task.cancelTokenSource as { cancel: (reason: string) => void }).cancel('用户取消上传');
            }
        });
        set(state => ({
            uploadTasks: state.uploadTasks.map(task => ({
                ...task,
                status: 'cancelled',
                error: '上传已取消',
                updatedAt: Date.now()
            }))
        }));
    },

    cancelForegroundTasks: () => {
        const { uploadTasks } = get();
        const foregroundTasks = uploadTasks.filter(task => task.location === 'foreground');

        foregroundTasks.forEach(task => {
            if (task.cancelTokenSource) {
                (task.cancelTokenSource as { cancel: (reason: string) => void }).cancel('用户取消上传');
            }
        });

        set(state => ({
            uploadTasks: state.uploadTasks.map(task =>
                task.location === 'foreground'
                    ? {
                        ...task,
                        status: 'cancelled',
                        error: '上传已取消',
                        updatedAt: Date.now()
                    }
                    : task
            )
        }));
    },

    toggleBackgroundTasksVisible: () => {
        set(state => ({
            backgroundTasksVisible: !state.backgroundTasksVisible
        }));
    },






    // 从文件创建任务
    addTaskFromFile: (file: File, options?: {
        relativePath?: string;
        targetFolderId?: number;
        location?: 'foreground' | 'background';
        folderName?: string; // 文件夹上传时的文件夹名称
    }) => {
        // 获取当前用户的tenant ID
        const authState = useAuthStore.getState();
        const tenantId = authState.user?.tenant?.tenantId;

        const task = createUploadTask(file, {
            relativePath: options?.relativePath,
            targetFolderId: options?.targetFolderId,
            tenantId: tenantId,
            folderId: options?.targetFolderId,
            location: options?.location || 'foreground',
            folderName: options?.folderName
        });
        return task;
    },

    // 清空状态
    clearState: () => {
        set({
            folders: [],
            foldersLoading: false,
            foldersTotal: 0,
            foldersCurrent: 1,
            foldersPageSize: 20,

            materials: [],
            materialsLoading: false,
            materialsTotal: 0,
            materialsCurrent: 1,
            materialsPageSize: 20,

            currentFolderId: null,

            isCreatingFolder: false,
            isCreatingMaterial: false,

            // 清空新的统一任务状态
            uploadTasks: [],
            backgroundTasksVisible: false,
            isConfirmingForegroundTasks: false,

        });

        // 重置全局并发限制器
        globalUploadLimiter.reset();
    },
}));
