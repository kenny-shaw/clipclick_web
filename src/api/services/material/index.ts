import { post, get } from '../../client';
import { ApiResponse } from '../../types/common';
import { CreateMaterialParams, MaterialListParams, MaterialListResponse, CreateFolderParams, FolderListParams, FolderListResponse } from './types';

// 新增素材接口
export const createMaterial = async (params: CreateMaterialParams): Promise<ApiResponse> => {
    const response = await post('/clipclick/material', params);
    return response;
};

// 素材列表查询接口
export const getMaterialList = async (params?: MaterialListParams): Promise<ApiResponse<MaterialListResponse>> => {
    const response = await get<MaterialListResponse>('/clipclick/material/list', params);
    return response;
};

// 创建文件夹接口
export const createFolder = async (params: CreateFolderParams): Promise<ApiResponse> => {
    const response = await post('/clipclick/folder', params);
    return response;
};

// 文件夹列表查询接口
export const getFolderList = async (params?: FolderListParams): Promise<ApiResponse<FolderListResponse>> => {
    const response = await get<FolderListResponse>('/clipclick/folder/list', params);
    return response;
};

