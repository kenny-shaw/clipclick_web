import { create } from 'zustand';
import { VideoService } from '@/api';
import type { VideoItem, VideoListResponse, CreateVideoParams } from '@/api';
import { message } from 'antd';



// 本地loading任务接口
export interface LoadingTask {
    id: string;
    tile: string;
    templateId: string;
    resourceUrl: string;
    status: 'loading';
    createTime: string;
}

interface VideoState {
    videos: VideoItem[];
    loadingTasks: LoadingTask[];
    isLoading: boolean;
    isCreating: boolean;
    total: number;
    current: number;
    pageSize: number;

    // 获取视频列表
    fetchVideoList: (params?: { current?: number; pageSize?: number }) => Promise<void>;

    // 创建视频
    createVideo: (params: CreateVideoParams) => Promise<void>;

    // 添加loading任务
    addLoadingTask: (task: Omit<LoadingTask, 'id' | 'status' | 'createTime'>) => void;

    // 移除loading任务
    removeLoadingTask: (id: string) => void;

    // 清空状态
    clearState: () => void;
}

export const useVideoStore = create<VideoState>((set, get) => ({
    videos: [],
    loadingTasks: [],
    isLoading: false,
    isCreating: false,
    total: 0,
    current: 1,
    pageSize: 1000,

    fetchVideoList: async (params = {}) => {
        set({ isLoading: true });
        try {
            const { current = 1, pageSize = 1000 } = params;
            const response = await VideoService.getVideoList({ current, pageSize });

            console.log("response", response);
            if (response.rows) {
                const videoList = response as VideoListResponse;
                set({
                    videos: videoList.rows,
                    total: videoList.total,
                    current: current,
                    pageSize: pageSize,
                    isLoading: false,
                });
            }
        } catch (error) {
            console.error('获取视频列表失败:', error);
            set({ isLoading: false });
            throw error;
        }
    },

    createVideo: async (params: CreateVideoParams) => {
        set({ isCreating: true });
        let loadingTaskId: string | null = null;

        try {
            // 先添加loading任务
            const loadingTask: LoadingTask = {
                id: `loading_${Date.now()}`,
                tile: params.tile,
                templateId: params.templateId,
                resourceUrl: params.resourceUrl,
                status: 'loading',
                createTime: new Date().toISOString(),
            };

            loadingTaskId = loadingTask.id;
            get().addLoadingTask(loadingTask);

            // 调用创建API
            const response = await VideoService.createVideo(params);

            if (response.code === 200) {
                // 创建成功后，移除loading任务并重新获取视频列表
                if (loadingTaskId) {
                    get().removeLoadingTask(loadingTaskId);
                }
                await get().fetchVideoList();
                message.success('视频创建成功！');
            } else {
                throw new Error(response.msg || '创建视频失败');
            }

            set({ isCreating: false });
        } catch (error) {
            console.error('创建视频失败:', error);
            set({ isCreating: false });

            // 移除loading任务
            if (loadingTaskId) {
                get().removeLoadingTask(loadingTaskId);
            }

            throw error;
        }
    },

    addLoadingTask: (task) => {
        const loadingTask: LoadingTask = {
            ...task,
            id: `loading_${Date.now()}`,
            status: 'loading',
            createTime: new Date().toISOString(),
        };

        set(state => ({
            loadingTasks: [...state.loadingTasks, loadingTask]
        }));
    },

    removeLoadingTask: (id) => {
        set(state => ({
            loadingTasks: state.loadingTasks.filter(task => task.id !== id)
        }));
    },

    clearState: () => {
        set({
            videos: [],
            loadingTasks: [],
            isLoading: false,
            isCreating: false,
            total: 0,
            current: 1,
            pageSize: 1000,
        });
    },
})); 