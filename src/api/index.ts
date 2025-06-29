// 统一导出所有API模块
export * from './config';
export * from './request';
export * from './auth';
export * from './video';

// 导出常用的API函数别名
export { login, getUserInfo, logout } from './auth';
export {
    createVideo,
    getVideoList,
    getVideoDetail,
    updateVideo,
    deleteVideo,
    exportVideo
} from './video';
export { get, post, put, del, getToken, setToken, removeToken } from './request'; 