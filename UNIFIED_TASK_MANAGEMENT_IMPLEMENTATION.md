# 统一任务管理实现总结

## 实现概述

已成功实现素材上传的统一任务管理系统，解决了原有设计中状态管理复杂、任务转移困难等问题。

## 主要改动

### 1. 新增文件

#### 类型定义
- `src/types/upload.ts` - 统一的任务接口和类型定义
- `src/utils/taskManager.ts` - 任务管理工具函数
- `src/hooks/useMaterialStoreCompat.ts` - 兼容性 Hook

#### 核心接口
```typescript
interface UploadTask {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'cancelled';
  progress: number;
  location: 'foreground' | 'background';
  // ... 其他字段
}
```

### 2. 修改的文件

#### Store 层
- `src/store/materialStore.ts`
  - 添加新的统一状态：`uploadTasks: MaterialUploadTask[]`
  - 实现新的任务管理方法：`addTasks`, `updateTask`, `removeTask` 等
  - 实现统一的上传逻辑：`startUpload`, `uploadSingleTask`, `createMaterialForTask`
  - 保持向后兼容的旧方法

#### 组件层
- `src/app/studio/materials/components/upload/UploadFilesDrawer/index.tsx`
  - 使用兼容性 Hook：`useMaterialStoreCompat`
  - 更新文件选择逻辑，使用新的任务创建方法
  - 简化上传控制逻辑，使用统一的上传方法
  - 更新状态检查逻辑，使用新的任务统计方法

## 核心优势

### 1. 统一状态管理
- **单一数据源**：所有任务都在 `uploadTasks` 数组中管理
- **简化状态同步**：不再需要复杂的 `syncFileStatus` 方法
- **减少内存占用**：避免重复的任务对象

### 2. 简化的任务转移
```typescript
// 旧方式：创建新对象
const backgroundTasks = [...uploadingFiles, ...pendingFiles].map(file => ({
  ...file,
  transferredToBackground: true
}));

// 新方式：直接更新位置
transferTaskToBackground(taskId);
```

### 3. 统一的上传控制
```typescript
// 新的统一上传方法
await startUpload(); // 自动处理所有前台上传任务
await startUpload([taskId1, taskId2]); // 上传指定任务
```

### 4. 更好的类型安全
- 统一的 `UploadTask` 接口
- 明确的 `location` 字段标识任务位置
- 完整的类型定义和工具函数

## 兼容性设计

### 1. 兼容性 Hook
`useMaterialStoreCompat` 提供了完整的向后兼容性：
- 保持旧的接口名称
- 自动转换新旧格式
- 无缝迁移现有组件

### 2. 渐进式迁移
- 第一阶段：创建新接口和状态
- 第二阶段：实现新的统一方法
- 第三阶段：更新组件使用新接口
- 第四阶段：移除旧的代码和状态
- 第五阶段：测试和优化

## 使用方式

### 1. 创建任务
```typescript
const { addTaskFromFile } = useMaterialStoreCompat();

// 创建单个任务
const task = addTaskFromFile(file, {
  targetFolderId: folderId,
  location: 'foreground'
});
```

### 2. 管理任务
```typescript
const { 
  getTasksByLocation, 
  getTaskStats, 
  updateTask, 
  removeTask 
} = useMaterialStoreCompat();

// 获取前台上传任务
const foregroundTasks = getTasksByLocation('foreground');

// 获取任务统计
const stats = getTaskStats();

// 更新任务状态
updateTask(taskId, { status: 'completed' });
```

### 3. 上传控制
```typescript
const { startUpload, cancelTask, cancelAllTasks } = useMaterialStoreCompat();

// 开始上传
await startUpload();

// 取消单个任务
cancelTask(taskId);

// 取消所有任务
cancelAllTasks();
```

## 迁移指南

### 对于现有组件
1. 将 `useMaterialStore` 替换为 `useMaterialStoreCompat`
2. 使用新的任务创建方法：`addTaskFromFile`
3. 使用新的上传控制方法：`startUpload`
4. 使用新的状态查询方法：`getTasksByLocation`, `getTaskStats`

### 对于新组件
1. 直接使用 `useMaterialStore` 的新方法
2. 使用 `UploadTask` 接口而不是 `UploadFileInfo`
3. 利用新的任务管理工具函数

## 下一步计划

### 第四阶段：清理旧代码
- [ ] 移除 `uploadFiles` 和 `backgroundTasks` 状态
- [ ] 移除旧的兼容性方法
- [ ] 清理未使用的代码

### 第五阶段：测试和优化
- [ ] 全面测试新的任务管理功能
- [ ] 性能优化和内存使用优化
- [ ] 用户体验改进

## 技术特点

1. **类型安全**：完整的 TypeScript 类型定义
2. **向后兼容**：现有组件无需大幅修改
3. **渐进式迁移**：可以逐步替换旧代码
4. **统一管理**：所有任务使用相同的接口和方法
5. **易于扩展**：为未来功能扩展提供了良好的基础

## 注意事项

1. 确保所有状态更新都使用新的 `updateTask` 方法
2. 使用 `getTasksByLocation` 而不是直接访问 `uploadFiles` 或 `backgroundTasks`
3. 新的上传方法会自动处理素材创建，无需手动调用 `batchCreateMaterials`
4. 任务转移使用 `transferTaskToBackground` 而不是创建新对象
