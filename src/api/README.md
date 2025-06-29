# API 模块使用说明

## 概述

这个API模块封装了与后端服务器的所有通信，提供了类型安全的接口调用。

## 文件结构

```
src/api/
├── config.ts      # 配置文件，包含类型定义和常量
├── request.ts     # 请求工具函数
├── auth.ts        # 认证相关API
├── video.ts       # 视频相关API
├── index.ts       # 统一导出文件
├── example.ts     # 使用示例
└── README.md      # 说明文档
```

## 快速开始

### 1. 导入API模块

```typescript
import { login, getUserInfo, createVideo, getVideoList } from '@/api';
```

### 2. 登录认证

```typescript
import { login, setToken } from '@/api';

// 登录
const response = await login({
  username: 'chenhao',
  password: '123456'
});

// 保存token
if (response.token) {
  setToken(response.token);
}
```

### 3. 获取用户信息

```typescript
import { getUserInfo } from '@/api';

const response = await getUserInfo();
console.log('用户信息:', response.data?.user);
console.log('权限列表:', response.data?.permissions);
```

### 4. 视频操作

```typescript
import { createVideo, getVideoList, updateVideo, deleteVideo } from '@/api';

// 创建视频
await createVideo({
  tile: '视频标题',
  templateId: '模版ID',
  resourceUrl: '视频资源URL'
});

// 获取视频列表
const videoList = await getVideoList({
  current: 1,
  pageSize: 10
});

// 更新视频
await updateVideo('videoId', {
  tile: '新标题'
});

// 删除视频
await deleteVideo('videoId');
```

## API 接口列表

### 认证接口

- `login(params: LoginParams)` - 用户登录
- `getUserInfo()` - 获取用户信息
- `logout()` - 用户登出

### 视频接口

- `createVideo(params: CreateVideoParams)` - 创建视频
- `getVideoList(params?: VideoListParams)` - 获取视频列表
- `getVideoDetail(id: string)` - 获取视频详情
- `updateVideo(id: string, params: Partial<CreateVideoParams>)` - 更新视频
- `deleteVideo(id: string)` - 删除视频
- `exportVideo(id: string)` - 导出视频

### 工具函数

- `getToken()` - 获取存储的token
- `setToken(token: string)` - 设置token
- `removeToken()` - 移除token

## 错误处理

所有API函数都会抛出错误，建议使用try-catch进行错误处理：

```typescript
try {
  const response = await login({ username: 'test', password: '123' });
  console.log('登录成功');
} catch (error) {
  console.error('登录失败:', error.message);
}
```

## 类型安全

所有API都提供了完整的TypeScript类型定义，包括：

- 请求参数类型
- 响应数据类型
- 错误类型

## 配置

可以在 `config.ts` 中修改以下配置：

- `API_BASE_URL` - API基础URL
- `API_CONFIG` - 请求配置（超时时间、默认请求头等）

## 示例

查看 `example.ts` 文件获取完整的使用示例。 