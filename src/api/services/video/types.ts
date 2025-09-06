import { PaginationParams, PaginatedResponse } from '../../types/common';

// 视频项目接口
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

// 视频创建参数
export interface CreateVideoParams {
    tile: string;
    templateId: string;
    resourceUrl: string;
}

// 视频更新参数
export interface UpdateVideoParams {
    tile?: string;
    templateId?: string;
    resourceUrl?: string;
    remark?: string;
}

// 视频查询参数
export interface VideoListParams extends PaginationParams {
    status?: string;
    industryType?: string;
}

// 视频列表响应类型
export type VideoListResponse = PaginatedResponse<VideoItem>;

// 创建视频响应类型
export interface CreateVideoResponse {
    id: number;
}

// 导出视频响应类型
export interface ExportVideoResponse {
    downloadUrl: string;
} 