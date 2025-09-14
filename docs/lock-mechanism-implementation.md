# 锁机制实现说明

## 问题描述

在 `confirmForegroundTasks` 执行过程中，原本未完成的上传任务可能在上传完成后立即被转移到后台，导致这些任务既没有被创建素材，也没有被正确转移到后台。

## 解决方案

通过添加 `isConfirmingForegroundTasks` 锁状态，确保在确认前台任务期间，上传完成的任务能够被正确处理。

## 实现细节

### 1. 状态添加

在 `MaterialState` 接口中添加锁状态：

```typescript
interface MaterialState {
    // ... 其他属性
    isConfirmingForegroundTasks: boolean; // 是否正在确认前台任务
}
```

### 2. confirmForegroundTasks 方法

```typescript
confirmForegroundTasks: async () => {
    // 设置确认锁，防止上传过程中的竞态条件
    set({ isConfirmingForegroundTasks: true });
    
    try {
        // 原有的确认逻辑...
        return { completedCount, transferredCount };
    } finally {
        // 释放确认锁
        set({ isConfirmingForegroundTasks: false });
    }
}
```

### 3. uploadSingleTask 方法

```typescript
// 在 uploadSingleTask 的上传完成逻辑中
const currentTask = get().uploadTasks.find(t => t.id === task.id);
const isConfirmingForeground = get().isConfirmingForegroundTasks;

if (currentTask?.location === 'background') {
    // 后台任务立即创建素材
    await get().createMaterialForTask(task.id);
} else if (currentTask?.location === 'foreground' && isConfirmingForeground) {
    // 前台任务且在确认过程中，立即创建素材并转移到后台
    await get().createMaterialForTask(task.id, true);
    get().transferTaskToBackground(task.id);
}
// 其他情况（前台任务且不在确认过程中）等待用户确认
```

## 工作流程

### 场景1：正常上传完成
1. 任务上传完成
2. 检查任务位置：`foreground`
3. 检查锁状态：`false`（不在确认过程中）
4. 等待用户确认

### 场景2：确认过程中的上传完成
1. `confirmForegroundTasks` 开始执行，设置锁为 `true`
2. 任务上传完成
3. 检查任务位置：`foreground`
4. 检查锁状态：`true`（正在确认过程中）
5. 立即创建素材并转移到后台
6. `confirmForegroundTasks` 完成，释放锁

### 场景3：后台任务上传完成
1. 任务上传完成
2. 检查任务位置：`background`
3. 立即创建素材（无论锁状态如何）

## 优势

1. **解决竞态条件**：确保在确认过程中完成上传的任务不会被遗漏
2. **保持原有逻辑**：不影响正常的上传和确认流程
3. **简单有效**：通过一个布尔标志就能解决问题
4. **性能友好**：不会阻塞其他操作，只是改变行为逻辑

## 测试建议

1. 测试正常的上传和确认流程
2. 测试在确认过程中有任务完成上传的情况
3. 测试并发上传和确认的场景
4. 测试锁状态的正确释放
