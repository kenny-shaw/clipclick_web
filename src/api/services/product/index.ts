import { get, post, put } from '../../client';
import { ApiResponse } from '../../types/common';
import { ProductListParams, ProductListResponse, CreateProductParams, UpdateProductParams, Product } from './types';

// 获取商品列表接口
export const getProductList = async (params?: ProductListParams): Promise<ApiResponse<ProductListResponse>> => {
    const response = await get<ProductListResponse>('/clipclick/product/list', params);
    return response;
};

// 创建商品接口
export const createProduct = async (params: CreateProductParams): Promise<ApiResponse> => {
    const response = await post('/clipclick/product/create', params);
    return response;
};

// 更新商品接口
export const updateProduct = async (id: number, params: UpdateProductParams): Promise<ApiResponse> => {
    const response = await put(`/clipclick/product/${id}`, params);
    return response;
};

// 获取商品详情接口
export const getProductDetail = async (id: number): Promise<ApiResponse<Product>> => {
    const response = await get<Product>(`/clipclick/product/${id}`);
    return response;
};

// 删除商品接口
export const deleteProduct = async (id: number): Promise<ApiResponse> => {
    const response = await post(`/clipclick/product/${id}/delete`);
    return response;
};

