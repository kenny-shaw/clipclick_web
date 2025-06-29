import { post, get, put, del } from './request';
import { CreateVideoParams, VideoListParams, ApiResponse } from './config';

// 视频列表项接口
export interface VideoItem {
    id: number;
    tile: string;
    templateId: string;
    resourceUrl: string | null;
    videoUrl: string | null;
    coverUrl: string | null;
    createTime: string;
    updateTime: string | null;
    status: string | null;
    industryType: string | null;
    taskId: string | null;
    remark: string | null;
    extendInfo: string | null;
    createBy: string | null;
    updateBy: string | null;
    deleted: number;
}

// 视频列表响应接口
export interface VideoListResponse {
    total: number;
    rows: VideoItem[];
    code: number;
    msg: string;
}

// 创建视频接口
export const createVideo = async (params: CreateVideoParams): Promise<ApiResponse> => {
    const response = await post('/clipclick/product_video', params);
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
export const updateVideo = async (id: string, params: Partial<CreateVideoParams>): Promise<ApiResponse> => {
    const response = await put(`/clipclick/product_video/${id}`, params);
    return response;
};

// 删除视频接口
export const deleteVideo = async (id: string): Promise<ApiResponse> => {
    const response = await del(`/clipclick/product_video/${id}`);
    return response;
};

// 导出视频接口
export const exportVideo = async (id: string): Promise<ApiResponse> => {
    const response = await get(`/clipclick/product_video/export/${id}`);
    return response;
}; 