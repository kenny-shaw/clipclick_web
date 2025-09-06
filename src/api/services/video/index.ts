import { post, get, put, del } from '../../client';
import { ApiResponse } from '../../types/common';
import {
    VideoItem,
    VideoListResponse,
    CreateVideoParams,
    UpdateVideoParams,
    VideoListParams,
    CreateVideoResponse,
    ExportVideoResponse
} from './types';

// 创建视频接口
export const createVideo = async (params: CreateVideoParams): Promise<ApiResponse<CreateVideoResponse>> => {
    const response = await post<CreateVideoResponse>('/clipclick/product_video', params);
    return response;
};

// 获取视频列表接口
export const getVideoList = async (params?: VideoListParams): Promise<ApiResponse<VideoListResponse>> => {
    const response = await get<VideoListResponse>('/clipclick/product_video/list', params);
    return response;
};

// 获取视频详情接口
export const getVideoDetail = async (id: string): Promise<ApiResponse<VideoItem>> => {
    const response = await get<VideoItem>(`/clipclick/product_video/${id}`);
    return response;
};

// 更新视频接口
export const updateVideo = async (id: string, params: UpdateVideoParams): Promise<ApiResponse> => {
    const response = await put(`/clipclick/product_video/${id}`, params);
    return response;
};

// 删除视频接口
export const deleteVideo = async (id: string): Promise<ApiResponse> => {
    const response = await del(`/clipclick/product_video/${id}`);
    return response;
};

// 导出视频接口
export const exportVideo = async (id: string): Promise<ApiResponse<ExportVideoResponse>> => {
    const response = await post<ExportVideoResponse>(`/clipclick/product_video/${id}/export`);
    return response;
};
