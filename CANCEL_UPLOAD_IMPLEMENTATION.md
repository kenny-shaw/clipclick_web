# 取消上传功能实现总结

## 实现概述

已成功实现完整的取消上传功能，用户可以在上传过程中选择取消上传或转为后台上传。

## 实现步骤

### 步骤1：修改 UploadFileInfo 接口 ✅
- 添加 `cancelled` 状态到 `tosStatus` 和 `materialStatus`
- 添加上传控制字段：`cancelTokenSource` 和 `checkpoint`
- 支持断点续传功能

### 步骤2：修改 TOS 工具类 ✅
- 在 `UploadOptions` 中添加 `cancelToken` 和 `checkpoint` 支持
- 修改 `uploadFile` 方法支持取消上传和断点续传
- 添加取消错误检测和处理

### 步骤3：修改 materialStore ✅
- 添加上传控制状态：`uploadCancelTokens`
- 修改 `uploadFileToTOS` 方法支持取消令牌
- 添加 `cancelUpload` 和 `cancelAllUploads` 方法
- 支持断点续传和状态同步

### 步骤4：修改 UploadFilesDrawer 组件 ✅
- 修改关闭确认对话框，提供两个选项：
  - **取消上传**：停止所有上传，已上传的文件不会保存
  - **转为后台上传**：继续在后台完成上传和素材创建
- 添加 `handleCancelAllUploads` 和 `handleCancelFile` 方法

### 步骤5：更新 UI ✅
- 在 FileList 组件中添加取消按钮（仅在上传中时显示）
- 添加取消状态标签和进度条显示
- 支持单个文件取消和批量取消

## 核心功能

### 1. 真正的取消上传
```typescript
// 使用 TOS SDK 的 CancelToken 真正取消上传
const cancelTokenSource = TOS.CancelToken.source();
await tosClient.uploadFile(file, key, {
    cancelToken: cancelTokenSource.token
});
```

### 2. 断点续传支持
```typescript
// 支持取消后重新开始上传
await tosClient.uploadFile(file, key, {
    checkpoint: fileInfo.checkpoint
});
```

### 3. 状态管理
```typescript
// 支持多种状态
tosStatus: 'pending' | 'uploading' | 'completed' | 'error' | 'cancelled'
materialStatus: 'pending' | 'creating' | 'completed' | 'error' | 'cancelled'
```

### 4. 用户选择
- **取消上传**：立即停止所有上传，不保存已上传的文件
- **转为后台上传**：继续在后台完成上传和素材创建

## 使用流程

### 正常上传流程
1. 用户选择文件 → 开始上传
2. 显示上传进度和取消按钮
3. 上传完成 → 创建素材

### 取消上传流程
1. 用户选择文件 → 开始上传
2. 用户点击取消按钮或关闭窗口选择"取消上传"
3. 立即停止上传 → 显示已取消状态

### 转为后台流程
1. 用户选择文件 → 开始上传
2. 用户关闭窗口选择"转为后台上传"
3. 前台任务继续执行，但状态更新到后台
4. 后台任务等待前台完成 → 创建素材

## 技术特点

1. **真正的取消**：使用 TOS SDK 的 CancelToken 真正取消网络请求
2. **断点续传**：支持取消后重新开始上传
3. **状态同步**：前台后台无缝切换
4. **用户友好**：提供清晰的选择和状态反馈
5. **资源节约**：避免不必要的网络请求和存储

## 文件修改清单

- `src/store/materialStore.ts` - 核心状态管理和上传控制
- `src/utils/tos.ts` - TOS 工具类，支持取消和断点续传
- `src/app/studio/materials/components/upload/UploadFilesDrawer/index.tsx` - 上传抽屉组件
- `src/app/studio/materials/components/upload/common/FileList/index.tsx` - 文件列表组件

## 测试建议

1. **正常上传**：选择文件，等待完成
2. **单个取消**：上传过程中点击单个文件的取消按钮
3. **批量取消**：关闭窗口时选择"取消上传"
4. **转为后台**：关闭窗口时选择"转为后台上传"
5. **断点续传**：取消后重新选择相同文件上传

## 注意事项

1. 取消的上传不会保存到 TOS
2. 已完成的文件会正常创建素材
3. 后台任务会等待前台任务完成
4. 支持混合场景（部分完成，部分取消）
