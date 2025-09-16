import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Product } from '@/api/services/product/types';
import { MaterialInfo } from '@/api';
import { getProductList } from '@/api/services/product';
import { getMaterialList } from '@/api/services/material';
import { message } from 'antd';

// 精剪成片参数接口
export interface CreateFineCutVideoParams {
    productId: number;
    mainVideoIds: number[];
    prefixVideoIds?: number[];
    maskImageIds: number[];
    title?: string;
}

// 精剪成片结果接口
export interface FineCutVideoItem {
    id: number;
    title: string;
    videoUrl: string;
    coverUrl: string;
    createTime: string;
    status: 'completed' | 'loading' | 'error';
    productName: string;
    mainVideoNames: string[];
    prefixVideoNames: string[];
    maskImageNames: string[];
}

// 本地loading任务接口
export interface FineCutLoadingTask {
    id: string;
    title: string;
    productName: string;
    mainVideoNames: string[];
    prefixVideoNames: string[];
    maskImageNames: string[];
    status: 'loading';
    createTime: string;
}

interface FineCutState {
    // 商品相关
    products: Product[];
    productsLoading: boolean;
    productsTotal: number;
    productsCurrent: number;
    productsPageSize: number;
    searchKeyword: string;
    selectedProduct: Product | null;

    // 素材相关
    mainVideos: MaterialInfo[];
    prefixVideos: MaterialInfo[];
    maskImages: MaterialInfo[];
    materialsLoading: boolean;

    // 选择状态
    selectedMainVideos: MaterialInfo[];
    selectedPrefixVideos: MaterialInfo[];
    selectedMaskImages: MaterialInfo[];

    // 生成状态
    isGenerating: boolean;
    generatedVideos: FineCutVideoItem[];
    loadingTasks: FineCutLoadingTask[];

    // 商品操作
    fetchProducts: (params?: { pageNum?: number; pageSize?: number; name?: string }) => Promise<void>;
    setSearchKeyword: (keyword: string) => void;
    setSelectedProduct: (product: Product | null) => void;

    // 素材操作
    fetchMainVideos: (folderId: number) => Promise<void>;
    fetchPrefixVideos: (folderId: number) => Promise<void>;
    fetchMaskImages: (folderId: number) => Promise<void>;
    setSelectedMainVideos: (videos: MaterialInfo[]) => void;
    setSelectedPrefixVideos: (videos: MaterialInfo[]) => void;
    setSelectedMaskImages: (images: MaterialInfo[]) => void;

    // 生成操作
    generateVideo: (params: CreateFineCutVideoParams) => Promise<void>;
    addLoadingTask: (task: Omit<FineCutLoadingTask, 'id' | 'status' | 'createTime'>) => void;
    removeLoadingTask: (id: string) => void;

    // 清空状态
    clearState: () => void;
    resetSelections: () => void;
}

const initialState = {
    products: [],
    productsLoading: false,
    productsTotal: 0,
    productsCurrent: 1,
    productsPageSize: 10,
    searchKeyword: '',
    selectedProduct: null,

    mainVideos: [],
    prefixVideos: [],
    maskImages: [],
    materialsLoading: false,

    selectedMainVideos: [],
    selectedPrefixVideos: [],
    selectedMaskImages: [],

    isGenerating: false,
    generatedVideos: [],
    loadingTasks: [],
};

export const useFineCutStore = create<FineCutState>()(
    devtools(
        (set, get) => ({
            ...initialState,

            // 获取商品列表
            fetchProducts: async (params = {}) => {
                set({ productsLoading: true });
                try {
                    const { productsCurrent, productsPageSize, searchKeyword } = get();
                    const requestParams = {
                        pageNum: productsCurrent,
                        pageSize: productsPageSize,
                        name: searchKeyword || undefined,
                        ...params,
                    };

                    const response = await getProductList(requestParams);

                    if (response.code === 200) {
                        set({
                            products: response.rows || [],
                            productsTotal: response.total || 0,
                            productsLoading: false,
                        });
                    } else {
                        throw new Error(response.msg || '获取商品列表失败');
                    }
                } catch (error) {
                    console.error('获取商品列表失败:', error);
                    set({ productsLoading: false });
                    throw error;
                }
            },

            // 设置搜索关键词
            setSearchKeyword: (keyword: string) => {
                set({ searchKeyword: keyword });
            },

            // 设置选中的商品
            setSelectedProduct: (product: Product | null) => {
                set({ selectedProduct: product });

                // 清空之前的选择
                get().resetSelections();

                // 如果选择了商品，加载对应的素材
                if (product) {
                    if (product.mainFolderId) {
                        get().fetchMainVideos(product.mainFolderId);
                    }
                    if (product.prefixFolderId) {
                        get().fetchPrefixVideos(product.prefixFolderId);
                    }
                    if (product.picFolderId) {
                        get().fetchMaskImages(product.picFolderId);
                    }
                }
            },

            // 获取主视频列表
            fetchMainVideos: async (folderId: number) => {
                set({ materialsLoading: true });
                try {
                    const response = await getMaterialList({
                        folderId: folderId,
                        pageNum: 1,
                        pageSize: 100, // 获取所有视频
                    });

                    if (response.code === 200 && response.rows) {
                        // 过滤出视频类型的素材
                        const videos = response.rows.filter(material => material.category === 2);
                        set({
                            mainVideos: videos,
                            materialsLoading: false,
                        });
                    } else {
                        throw new Error(response.msg || '获取主视频列表失败');
                    }
                } catch (error) {
                    console.error('获取主视频列表失败:', error);
                    set({ materialsLoading: false });
                    message.error('获取主视频列表失败');
                    throw error;
                }
            },

            // 获取前贴视频列表
            fetchPrefixVideos: async (folderId: number) => {
                set({ materialsLoading: true });
                try {
                    const response = await getMaterialList({
                        folderId: folderId,
                        pageNum: 1,
                        pageSize: 100, // 获取所有视频
                    });

                    if (response.code === 200 && response.rows) {
                        // 过滤出视频类型的素材
                        const videos = response.rows.filter(material => material.category === 2);
                        set({
                            prefixVideos: videos,
                            materialsLoading: false,
                        });
                    } else {
                        throw new Error(response.msg || '获取前贴视频列表失败');
                    }
                } catch (error) {
                    console.error('获取前贴视频列表失败:', error);
                    set({ materialsLoading: false });
                    message.error('获取前贴视频列表失败');
                    throw error;
                }
            },

            // 获取蒙层图片列表
            fetchMaskImages: async (folderId: number) => {
                set({ materialsLoading: true });
                try {
                    const response = await getMaterialList({
                        folderId: folderId,
                        pageNum: 1,
                        pageSize: 100, // 获取所有图片
                    });

                    if (response.code === 200 && response.rows) {
                        // 过滤出图片类型的素材
                        const images = response.rows.filter(material => material.category === 1);
                        set({
                            maskImages: images,
                            materialsLoading: false,
                        });
                    } else {
                        throw new Error(response.msg || '获取蒙层图片列表失败');
                    }
                } catch (error) {
                    console.error('获取蒙层图片列表失败:', error);
                    set({ materialsLoading: false });
                    message.error('获取蒙层图片列表失败');
                    throw error;
                }
            },

            // 设置选中的主视频
            setSelectedMainVideos: (videos: MaterialInfo[]) => {
                set({ selectedMainVideos: videos });
            },

            // 设置选中的前贴视频
            setSelectedPrefixVideos: (videos: MaterialInfo[]) => {
                set({ selectedPrefixVideos: videos });
            },

            // 设置选中的蒙层图片
            setSelectedMaskImages: (images: MaterialInfo[]) => {
                set({ selectedMaskImages: images });
            },

            // 生成视频
            generateVideo: async (params: CreateFineCutVideoParams) => {
                set({ isGenerating: true });
                let loadingTaskId: string | null = null;

                try {
                    // 先添加loading任务
                    const loadingTask: FineCutLoadingTask = {
                        id: `loading_${Date.now()}`,
                        title: params.title || '精剪成片',
                        productName: get().selectedProduct?.name || '',
                        mainVideoNames: get().selectedMainVideos.map(v => v.name),
                        prefixVideoNames: get().selectedPrefixVideos.map(v => v.name),
                        maskImageNames: get().selectedMaskImages.map(i => i.name),
                        status: 'loading',
                        createTime: new Date().toISOString(),
                    };

                    loadingTaskId = loadingTask.id;
                    get().addLoadingTask(loadingTask);

                    // TODO: 调用精剪成片API
                    // 这里先用mock数据模拟异步生成
                    await new Promise(resolve => setTimeout(resolve, 3000));

                    const mockVideo: FineCutVideoItem = {
                        id: Date.now(),
                        title: params.title || '精剪成片',
                        videoUrl: 'https://example.com/generated-video.mp4',
                        coverUrl: 'https://example.com/generated-cover.jpg',
                        createTime: new Date().toISOString(),
                        status: 'completed',
                        productName: get().selectedProduct?.name || '',
                        mainVideoNames: get().selectedMainVideos.map(v => v.name),
                        prefixVideoNames: get().selectedPrefixVideos.map(v => v.name),
                        maskImageNames: get().selectedMaskImages.map(i => i.name),
                    };

                    // 移除loading任务
                    if (loadingTaskId) {
                        get().removeLoadingTask(loadingTaskId);
                    }

                    set(state => ({
                        generatedVideos: [...state.generatedVideos, mockVideo],
                        isGenerating: false,
                    }));

                    message.success('成片生成成功！');
                } catch (error) {
                    console.error('生成成片失败:', error);
                    set({ isGenerating: false });

                    // 移除loading任务
                    if (loadingTaskId) {
                        get().removeLoadingTask(loadingTaskId);
                    }

                    throw error;
                }
            },

            // 添加loading任务
            addLoadingTask: (task) => {
                const loadingTask: FineCutLoadingTask = {
                    ...task,
                    id: `loading_${Date.now()}`,
                    status: 'loading',
                    createTime: new Date().toISOString(),
                };

                set(state => ({
                    loadingTasks: [...state.loadingTasks, loadingTask]
                }));
            },

            // 移除loading任务
            removeLoadingTask: (id) => {
                set(state => ({
                    loadingTasks: state.loadingTasks.filter(task => task.id !== id)
                }));
            },

            // 清空状态
            clearState: () => {
                set(initialState);
            },

            // 重置选择
            resetSelections: () => {
                set({
                    selectedMainVideos: [],
                    selectedPrefixVideos: [],
                    selectedMaskImages: [],
                    mainVideos: [],
                    prefixVideos: [],
                    maskImages: [],
                });
            },
        }),
        {
            name: 'fine-cut-store',
        }
    )
);
