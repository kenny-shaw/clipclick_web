import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Product, ProductListParams, CreateProductParams, UpdateProductParams } from '@/api/services/product/types';
import { getProductList, createProduct, updateProduct, getProductDetail, deleteProduct } from '@/api/services/product';

interface ProductState {
    // 商品列表相关
    products: Product[];
    productsLoading: boolean;
    productsTotal: number;
    productsCurrent: number;
    productsPageSize: number;

    // 搜索相关
    searchKeyword: string;

    // 当前编辑的商品
    currentProduct: Product | null;
    currentProductLoading: boolean;

    // 操作状态
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;

    // 抽屉状态
    formDrawerVisible: boolean;
    formDrawerMode: 'create' | 'edit';
}

interface ProductActions {
    // 商品列表操作
    fetchProductList: (params?: ProductListParams) => Promise<void>;
    setSearchKeyword: (keyword: string) => void;

    // 商品详情操作
    fetchProductDetail: (id: number) => Promise<void>;
    setCurrentProduct: (product: Product | null) => void;

    // 商品CRUD操作
    createProduct: (params: CreateProductParams) => Promise<void>;
    updateProduct: (id: number, params: UpdateProductParams) => Promise<void>;
    deleteProduct: (id: number) => Promise<void>;

    // 分页操作
    setPagination: (current: number, pageSize: number) => void;

    // 抽屉操作
    openCreateDrawer: () => void;
    openEditDrawer: (product: Product) => void;
    closeFormDrawer: () => void;

    // 重置状态
    reset: () => void;
}

const initialState: ProductState = {
    products: [],
    productsLoading: false,
    productsTotal: 0,
    productsCurrent: 1,
    productsPageSize: 10,
    searchKeyword: '',
    currentProduct: null,
    currentProductLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    formDrawerVisible: false,
    formDrawerMode: 'create',
};

export const useProductStore = create<ProductState & ProductActions>()(
    devtools(
        (set, get) => ({
            ...initialState,

            // 获取商品列表
            fetchProductList: async (params?: ProductListParams) => {
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

            // 获取商品详情
            fetchProductDetail: async (id: number) => {
                set({ currentProductLoading: true });
                try {
                    const response = await getProductDetail(id);

                    if (response.code === 200) {
                        set({
                            currentProduct: response as Product,
                            currentProductLoading: false,
                        });
                    } else {
                        throw new Error(response.msg || '获取商品详情失败');
                    }
                } catch (error) {
                    console.error('获取商品详情失败:', error);
                    set({ currentProductLoading: false });
                    throw error;
                }
            },

            // 设置当前商品
            setCurrentProduct: (product: Product | null) => {
                set({ currentProduct: product });
            },

            // 创建商品
            createProduct: async (params: CreateProductParams) => {
                set({ isCreating: true });
                try {
                    const response = await createProduct(params);

                    if (response.code === 200) {
                        // 创建成功后刷新列表
                        await get().fetchProductList();
                        set({ isCreating: false });
                    } else {
                        throw new Error(response.msg || '创建商品失败');
                    }
                } catch (error) {
                    console.error('创建商品失败:', error);
                    set({ isCreating: false });
                    throw error;
                }
            },

            // 更新商品
            updateProduct: async (id: number, params: UpdateProductParams) => {
                set({ isUpdating: true });
                try {
                    const response = await updateProduct(id, params);

                    if (response.code === 200) {
                        // 更新成功后刷新列表
                        await get().fetchProductList();
                        set({ isUpdating: false });
                    } else {
                        throw new Error(response.msg || '更新商品失败');
                    }
                } catch (error) {
                    console.error('更新商品失败:', error);
                    set({ isUpdating: false });
                    throw error;
                }
            },

            // 删除商品
            deleteProduct: async (id: number) => {
                set({ isDeleting: true });
                try {
                    const response = await deleteProduct(id);

                    if (response.code === 200) {
                        // 删除成功后刷新列表
                        await get().fetchProductList();
                        set({ isDeleting: false });
                    } else {
                        throw new Error(response.msg || '删除商品失败');
                    }
                } catch (error) {
                    console.error('删除商品失败:', error);
                    set({ isDeleting: false });
                    throw error;
                }
            },

            // 设置分页
            setPagination: (current: number, pageSize: number) => {
                set({
                    productsCurrent: current,
                    productsPageSize: pageSize,
                });
            },

            // 打开创建抽屉
            openCreateDrawer: () => {
                set({
                    formDrawerVisible: true,
                    formDrawerMode: 'create',
                    currentProduct: null,
                });
            },

            // 打开编辑抽屉
            openEditDrawer: (product: Product) => {
                set({
                    formDrawerVisible: true,
                    formDrawerMode: 'edit',
                    currentProduct: product,
                });
            },

            // 关闭表单抽屉
            closeFormDrawer: () => {
                set({
                    formDrawerVisible: false,
                    currentProduct: null,
                });
            },

            // 重置状态
            reset: () => {
                set(initialState);
            },
        }),
        {
            name: 'product-store',
        }
    )
);
