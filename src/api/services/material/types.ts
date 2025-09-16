// 新增素材请求参数
export interface CreateMaterialParams {
    attributes: string;
    caption: string;
    category: number;
    folderId: number;
    industry: number;
    isApproved: number;
    isPublic: number;
    md5: string;
    metaInfo: string;
    modalData: string;
    name: string;
    platformSource: string;
    relatedInfo: string;
    renderProtocol: string;
    url: string;
}

// 素材列表查询参数
export interface MaterialListParams {
    pageNum?: number;
    pageSize?: number;
    folderId?: number;
    [key: string]: string | number | undefined;
}

// 素材信息接口
export interface MaterialInfo {
    id: number;
    folderId: number;
    name: string;
    caption: string | null;
    attributes: string | null;
    category: number;
    modalData: string | null;
    platformSource: string | null;
    industry: number | null;
    url: string;
    relatedInfo: string | null;
    metaInfo: string | null;
    renderProtocol: string | null;
    isApproved: number;
    md5: string | null;
    ownerId: string;
    isPublic: number;
    createdAt: string;
    updatedAt: string;
    tenantId: number;
}

// 素材列表响应类型
export interface MaterialListResponse {
    total: number;
    rows: MaterialInfo[];
}

// 创建文件夹请求参数
export interface CreateFolderParams {
    isPublic: number;
    name: string;
    parentId: number;
    vectorIndex: string;
}

// 文件夹列表查询参数
export interface FolderListParams {
    pageNum?: number;
    pageSize?: number;
    [key: string]: string | number | undefined;
}

// 文件夹信息接口
export interface FolderInfo {
    id: number;
    name: string;
    parentId: number;
    isPublic: number;
    vectorIndex: string;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
    tenantId: number;
}

// 文件夹列表响应类型
export interface FolderListResponse {
    total: number;
    rows: FolderInfo[];
}

// 文件夹详情响应类型
export type FolderDetailResponse = FolderInfo;
// 可以扩展更多详情字段，目前使用FolderInfo作为基础