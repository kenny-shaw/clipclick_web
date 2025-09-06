# 第四阶段功能说明

## 🎉 第四阶段已完成！

### ✅ 主要功能

#### 1. **提前关闭抽屉的智能处理**
- 检测正在上传和等待上传的文件
- 智能确认弹窗，提供用户选择
- 已完成上传的文件立即创建素材
- 未完成的文件自动转为后台上传

#### 2. **后台任务管理系统**
- 完整的后台任务状态管理
- 实时任务进度追踪
- 任务成功/失败状态监控
- 自动静默刷新素材列表

#### 3. **后台任务侧边栏**
- 美观的任务列表界面
- 实时进度显示
- 任务状态标签（等待、上传中、创建中、完成、失败）
- 任务管理功能（移除、清除完成）

#### 4. **智能后台上传模式**
- 上传完一个文件立即创建一个素材
- 支持文件夹结构的后台上传
- 网络异常自动重试
- 完成后自动通知用户

#### 5. **用户体验优化**
- 后台任务按钮带数量徽章
- 上传中的脉冲动画效果
- 详细的任务统计信息
- 响应式设计

### 🔧 技术实现

#### **提前关闭确认机制**
```typescript
const handleClose = () => {
  const uploadingFiles = fileList.filter(f => f.tosStatus === 'uploading');
  const pendingFiles = fileList.filter(f => f.tosStatus === 'pending');
  const completedFiles = fileList.filter(f => f.tosStatus === 'completed' && f.materialStatus === 'pending');

  if (uploadingFiles.length > 0 || pendingFiles.length > 0) {
    Modal.confirm({
      title: '确认关闭？',
      content: `还有 ${uploadingFiles.length + pendingFiles.length} 个文件未完成上传，关闭后这些文件将转为后台上传。`,
      okText: '转为后台上传',
      onOk: () => {
        // 立即创建已完成文件的素材
        if (completedFiles.length > 0) {
          batchCreateMaterials(completedFiles);
        }
        // 转为后台任务
        startBackgroundUpload([...uploadingFiles, ...pendingFiles]);
      }
    });
  }
};
```

#### **后台任务管理**
```typescript
interface BackgroundTaskState {
  backgroundTasks: UploadFileInfo[];
  isBackgroundUploading: boolean;
  backgroundTasksVisible: boolean;
}

// 后台任务处理流程
const startBackgroundUpload = (tasks: UploadFileInfo[], folderIdMap?: Map<string, number>) => {
  // 1. 添加到后台队列
  addBackgroundTasks(tasks);
  
  // 2. 逐个处理任务
  tasks.forEach(async (task) => {
    // 2.1 上传到TOS
    if (task.tosStatus !== 'completed') {
      const url = await uploadFileToTOS(task);
      updateBackgroundTask(task.id, { tosUrl: url, tosStatus: 'completed' });
    }
    
    // 2.2 创建素材
    const material = await createMaterial(task);
    updateBackgroundTask(task.id, { materialStatus: 'completed', materialId: material.id });
    
    // 2.3 静默刷新列表
    fetchMaterialList();
  });
};
```

#### **智能文件夹处理**
```typescript
// 文件夹上传的提前关闭处理
onOk: async () => {
  // 1. 先创建文件夹结构
  let folderIdMap: Map<string, number> | undefined;
  if (folderStructure && folderStructure.folderPaths.length > 0) {
    folderIdMap = await createFolderStructure(folderStructure.folderPaths, currentFolderId);
  }

  // 2. 处理已完成文件
  if (completedFiles.length > 0) {
    await batchCreateMaterialsWithFolders(completedFiles, folderIdMap);
  }

  // 3. 转为后台任务
  startBackgroundUpload(backgroundTasks, folderIdMap);
}
```

### 📱 用户界面

#### **后台任务按钮**
- 🔔 默认状态：灰色铃铛图标
- 🔵 有任务时：蓝色主色调 + 红色数量徽章
- ✨ 上传中：脉冲动画效果
- 📊 徽章显示：任务数量（99+上限）

#### **后台任务侧边栏**
- 📊 **任务统计**: 总计、完成、失败数量
- 📈 **整体进度**: 可视化进度条
- 📋 **任务列表**: 详细的任务状态和进度
- 🎛️ **任务管理**: 移除单个任务、清除已完成任务

#### **任务状态标签**
- ⏳ **等待**: 灰色 + 时钟图标
- ⬆️ **上传中**: 蓝色 + 加载图标 + 进度条
- 🔨 **创建中**: 蓝色 + 加载图标
- ✅ **完成**: 绿色 + 勾选图标
- ❌ **失败**: 红色 + 错误图标 + 错误信息

### 🎯 使用场景

#### **场景1: 批量上传中途离开**
```
用户操作：上传50个文件 → 10个已完成，40个还在上传 → 点击关闭
系统处理：
1. 弹出确认框
2. 立即为10个已完成文件创建素材
3. 将40个未完成文件转为后台任务
4. 用户可以继续其他操作
5. 后台继续上传并创建素材
6. 完成后通知用户
```

#### **场景2: 文件夹上传中途离开**
```
用户操作：上传包含100个文件的项目文件夹 → 30个已完成 → 点击关闭
系统处理：
1. 弹出确认框
2. 先创建完整的文件夹结构
3. 为30个已完成文件创建素材并关联到正确文件夹
4. 将70个未完成文件转为后台任务
5. 后台继续上传并自动关联到正确文件夹
6. 保持完整的项目结构
```

### ✨ 功能亮点

1. **无缝用户体验**: 用户不需要等待上传完成就能继续其他操作
2. **智能任务管理**: 自动处理复杂的文件夹结构关联
3. **实时状态反馈**: 用户随时了解后台任务进度
4. **错误处理完善**: 失败任务清晰标识，支持手动移除
5. **性能优化**: 后台任务不影响前台操作的流畅性

### 🚀 下一阶段预告

第五阶段将实现：
- 拖拽上传功能
- 文件预览功能
- 上传队列优化
- 断点续传功能

---

**第四阶段完成时间：** 2024年12月
**开发状态：** ✅ 已完成并通过测试
