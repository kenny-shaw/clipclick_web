import { PaginationParams, PaginatedResponse } from '../../types/common';

// 商品接口
export interface Product {
    id: number;
    name: string;
    mainFolderId: number;
    captionFolderId: number;
    prefixFolderId: number;
    picFolderId: number;
    completedFolderId: number | null;
    createdAt: string;
    updatedAt: string;
}

// 商品列表查询参数
export interface ProductListParams extends PaginationParams {
    name?: string;
    status?: string;
}

// 商品列表响应类型
export type ProductListResponse = PaginatedResponse<Product>;

// 创建商品参数
export interface CreateProductParams {
    name: string;
    mainFolder: string;
    mainFolderVectorIndex: string;
    captionFolder: string;
    captionFolderVectorIndex: string;
    prefixFolder: string;
    prefixFolderVectorIndex: string;
    picFolder: string;
    picFolderVectorIndex: string;
}

// 更新商品参数
export interface UpdateProductParams {
    name?: string;
    mainFolder?: string;
    mainFolderVectorIndex?: string;
    captionFolder?: string;
    captionFolderVectorIndex?: string;
    prefixFolder?: string;
    prefixFolderVectorIndex?: string;
    picFolder?: string;
    picFolderVectorIndex?: string;
} 