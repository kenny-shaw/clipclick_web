# 状态更新不一致问题解决方案

## 问题描述

在素材上传过程中，文件可能在前台上传和后台任务之间转移，导致状态更新到错误的位置，造成状态丢失。

## 根本原因

原始代码中的问题：
```typescript
// 问题代码
const isTransferredToBackground = fileInfo.transferredToBackground; // 只检查一次

const updateStatus = (updates: Partial<UploadFileInfo>) => {
    if (isTransferredToBackground) { // 使用固定的值，不会动态更新
        get().updateBackgroundTask(fileInfo.id, updates);
    } else {
        // 更新前台状态
    }
};
```

**问题**：`isTransferredToBackground` 在函数开始时就被固定了，但在上传过程中，文件可能被转移到后台任务，导致后续的状态更新都更新到错误的位置。

## 解决方案

### 1. 动态状态检查

```typescript
// 修复后的代码
const updateStatus = (updates: Partial<UploadFileInfo>) => {
    get().syncFileStatus(fileInfo.id, updates);
};
```

### 2. 统一状态同步方法

```typescript
// 新增的 syncFileStatus 方法
syncFileStatus: (fileId: string, updates: Partial<UploadFileInfo>) => {
    const state = get();
    
    // 检查文件是否在前台上传列表中
    const isInUploadFiles = state.uploadFiles.some(f => f.id === fileId);
    // 检查文件是否在后台任务列表中
    const isInBackgroundTasks = state.backgroundTasks.some(t => t.id === fileId);
    
    if (isInBackgroundTasks) {
        // 更新后台任务状态
        get().updateBackgroundTask(fileId, updates);
    } else if (isInUploadFiles) {
        // 更新前台任务状态
        get().updateUploadFile(fileId, updates);
    } else {
        // 文件不在任何列表中，记录警告
        console.warn(`文件 ${fileId} 不在任何状态列表中，无法同步状态:`, updates);
    }
}
```

### 3. 状态验证机制

```typescript
// 新增的状态验证方法
validateFileStatus: (fileId: string) => {
    const state = get();
    const inUploadFiles = state.uploadFiles.some(f => f.id === fileId);
    const inBackgroundTasks = state.backgroundTasks.some(t => t.id === fileId);
    
    if (inUploadFiles && inBackgroundTasks) {
        console.error(`文件 ${fileId} 同时存在于前台上传和后台任务中，状态不一致！`);
        return false;
    }
    
    if (!inUploadFiles && !inBackgroundTasks) {
        console.warn(`文件 ${fileId} 不存在于任何状态列表中`);
        return false;
    }
    
    return true;
}
```

## 使用方式

### 在组件中使用

```typescript
// 在 UploadFilesDrawer 组件中
const { syncFileStatus, validateFileStatus } = useMaterialStore();

// 更新文件状态
const handleUpdateFileStatus = (fileId: string, updates: Partial<UploadFileInfo>) => {
    // 验证状态一致性
    if (!validateFileStatus(fileId)) {
        console.error('文件状态不一致，无法更新');
        return;
    }
    
    // 同步状态到正确的位置
    syncFileStatus(fileId, updates);
};
```

### 在 Store 中使用

```typescript
// 在 uploadFileToTOS 方法中
const updateStatus = (updates: Partial<UploadFileInfo>) => {
    get().syncFileStatus(fileInfo.id, updates);
};
```

## 优势

1. **动态检查**：每次状态更新时都会重新检查文件所在位置
2. **统一管理**：所有状态更新都通过 `syncFileStatus` 方法
3. **错误处理**：当文件不在任何列表中时，会记录警告而不是崩溃
4. **状态验证**：提供 `validateFileStatus` 方法检查状态一致性
5. **调试友好**：添加了详细的日志输出

## 注意事项

1. 确保所有状态更新都使用 `syncFileStatus` 方法
2. 在关键操作前使用 `validateFileStatus` 验证状态
3. 监控控制台日志，及时发现状态不一致问题
4. 考虑添加状态恢复机制（如果需要）

## 测试建议

1. 测试文件在前台上传过程中被转移到后台的情况
2. 测试文件在后台任务中被删除的情况
3. 测试并发上传多个文件时的状态同步
4. 测试网络中断时的状态恢复
