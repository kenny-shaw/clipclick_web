# 状态管理优化：isForegroundUploading 重构

## 问题分析

在原始实现中，`isForegroundUploading` 状态管理存在以下问题：

1. **重复计算**：在 `addTasks`、`removeTask`、`updateTask` 等多个方法中都有相同的计算逻辑
2. **状态不一致**：手动维护状态容易出错，可能导致状态与实际任务状态不同步
3. **性能问题**：每次状态更新都要重新计算，即使任务状态没有变化
4. **维护困难**：逻辑分散在多个地方，难以维护

## 优化方案

### 1. 移除冗余状态

```typescript
// 之前：手动维护状态
interface MaterialState {
    uploadTasks: MaterialUploadTask[];
    isForegroundUploading: boolean; // 冗余状态
    // ...
}

// 之后：移除冗余状态
interface MaterialState {
    uploadTasks: MaterialUploadTask[];
    // isForegroundUploading 被移除
    // ...
}
```

### 2. 使用计算属性选择器

```typescript
// 添加选择器函数到接口
interface MaterialState {
    // 计算属性选择器
    isForegroundUploading: () => boolean;
    isBackgroundUploading: () => boolean;
    getForegroundTasks: () => MaterialUploadTask[];
    getBackgroundTasks: () => MaterialUploadTask[];
    getUploadingTasks: () => MaterialUploadTask[];
}

// 实现选择器函数
export const useMaterialStore = create<MaterialState>((set, get) => ({
    // ... 其他状态和方法

    // 计算属性选择器实现
    isForegroundUploading: () => {
        return get().uploadTasks.some(
            task => task.location === 'foreground' && task.status === 'uploading'
        );
    },

    isBackgroundUploading: () => {
        return get().uploadTasks.some(
            task => task.location === 'background' && task.status === 'uploading'
        );
    },

    getForegroundTasks: () => {
        return get().uploadTasks.filter(task => task.location === 'foreground');
    },

    getBackgroundTasks: () => {
        return get().uploadTasks.filter(task => task.location === 'background');
    },

    getUploadingTasks: () => {
        return get().uploadTasks.filter(task => task.status === 'uploading');
    },
}));
```

### 3. 简化状态更新方法

```typescript
// 之前：复杂的状态更新
addTasks: (tasks: MaterialUploadTask[]) => {
    set(state => {
        const newUploadTasks = [...state.uploadTasks, ...tasks];
        
        // 重复的计算逻辑
        const isForegroundUploading = newUploadTasks.some(
            task => task.location === 'foreground' && task.status === 'uploading'
        );

        return {
            uploadTasks: newUploadTasks,
            isForegroundUploading
        };
    });
},

// 之后：简化的状态更新
addTasks: (tasks: MaterialUploadTask[]) => {
    set(state => ({
        uploadTasks: [...state.uploadTasks, ...tasks]
    }));
},
```

## 使用方式

### 在组件中使用

```typescript
// 在组件中调用选择器函数
const {
    isForegroundUploading,
    isBackgroundUploading,
    getForegroundTasks,
    getBackgroundTasks,
    getUploadingTasks,
} = useMaterialStore();

// 使用方式
const foregroundUploading = isForegroundUploading();
const backgroundUploading = isBackgroundUploading();
const foregroundTasks = getForegroundTasks();
const backgroundTasks = getBackgroundTasks();
const uploadingTasks = getUploadingTasks();
```

### 在 JSX 中使用

```tsx
<Button
    disabled={isForegroundUploading()}
    onClick={handleAction}
>
    操作按钮
</Button>

<UploadActions
    isUploading={isForegroundUploading()}
    hasFiles={foregroundTasks.length > 0}
    onStartUpload={handleStartUpload}
/>
```

## 优势

### 1. 性能优化
- **按需计算**：只在需要时才计算状态，避免不必要的计算
- **减少重渲染**：状态更新更精确，减少组件重渲染
- **内存优化**：移除冗余状态，减少内存占用

### 2. 代码质量
- **单一职责**：每个方法只负责一个功能
- **易于维护**：逻辑集中，易于理解和修改
- **类型安全**：TypeScript 类型检查更准确

### 3. 开发体验
- **调试友好**：状态来源清晰，易于调试
- **测试友好**：选择器函数易于单元测试
- **扩展性好**：添加新的计算属性很简单

## 最佳实践

### 1. 选择器函数命名
```typescript
// 好的命名
isForegroundUploading: () => boolean;
getForegroundTasks: () => MaterialUploadTask[];
hasUploadingTasks: () => boolean;

// 避免的命名
getIsForegroundUploading: () => boolean; // 冗余的 get 前缀
foregroundUploading: () => boolean; // 缺少 is 前缀
```

### 2. 性能考虑
```typescript
// 对于复杂计算，考虑使用 useMemo
const expensiveValue = useMemo(() => {
    return someComplexCalculation(tasks);
}, [tasks]);

// 对于简单计算，直接调用选择器函数
const isUploading = isForegroundUploading();
```

### 3. 错误处理
```typescript
isForegroundUploading: () => {
    try {
        return get().uploadTasks.some(
            task => task.location === 'foreground' && task.status === 'uploading'
        );
    } catch (error) {
        console.error('Error calculating foreground uploading status:', error);
        return false;
    }
},
```

## 迁移指南

### 1. 更新组件导入
```typescript
// 之前
const { isForegroundUploading } = useMaterialStore();

// 之后
const { isForegroundUploading } = useMaterialStore();
// 注意：isForegroundUploading 现在是函数
```

### 2. 更新使用方式
```typescript
// 之前
disabled={isForegroundUploading}

// 之后
disabled={isForegroundUploading()}
```

### 3. 更新类型定义
```typescript
// 如果组件有 props 类型定义
interface ComponentProps {
    isUploading: boolean; // 保持 boolean 类型
}

// 在组件内部调用
const isUploading = isForegroundUploading();
```

## 总结

通过这次重构，我们：

1. **移除了冗余状态** `isForegroundUploading`
2. **实现了计算属性选择器**，按需计算状态
3. **简化了状态更新逻辑**，提高代码可维护性
4. **优化了性能**，减少不必要的计算和重渲染
5. **提高了代码质量**，使逻辑更清晰、更易测试

这种模式可以应用到其他类似的状态管理场景中，是一个通用的优化方案。
