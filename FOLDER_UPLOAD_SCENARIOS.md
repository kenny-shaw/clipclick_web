# 文件夹上传场景说明

## 📁 支持的上传场景

### 1. **根目录上传文件夹**
**场景**: 用户在素材库根目录页面
**操作**: 点击"上传文件夹"按钮
**结果**: 文件夹将创建在根目录下 (parentId = 0)

```
素材库 (根目录)
├── 📁 新上传的文件夹1
├── 📁 新上传的文件夹2
└── 📁 已存在的文件夹
```

### 2. **子文件夹内上传文件夹**
**场景**: 用户进入某个文件夹内部
**操作**: 点击"上传文件夹"按钮  
**结果**: 文件夹将创建在当前文件夹下 (parentId = 当前文件夹ID)

```
素材库
└── 📁 项目A (当前位置)
    ├── 📁 新上传的子文件夹1
    ├── 📁 新上传的子文件夹2
    └── 📄 已存在的素材文件
```

## 🎯 具体使用示例

### 示例1: 在根目录上传项目文件夹
```
用户位置: /素材库
上传文件夹: MyProject/
结果结构:
素材库/
└── MyProject/           (parentId: 0)
    ├── src/             (parentId: MyProject的ID)
    │   └── components/  (parentId: src的ID)
    └── assets/          (parentId: MyProject的ID)
        └── images/      (parentId: assets的ID)
```

### 示例2: 在现有文件夹内上传子项目
```
用户位置: /素材库/客户项目/
上传文件夹: 新功能模块/
结果结构:
素材库/
└── 客户项目/                (已存在)
    ├── 已有内容...
    └── 新功能模块/          (parentId: 客户项目的ID)
        ├── components/     (parentId: 新功能模块的ID)
        └── assets/         (parentId: 新功能模块的ID)
```

## 🔧 技术实现细节

### parentId 的确定逻辑
```typescript
// 在 createFolderStructure 方法中
let currentParentId = parentFolderId; // 传入的当前文件夹ID

// 创建文件夹时
await MaterialService.createFolder({
    name: folderName,
    parentId: currentParentId || 0, // null时默认为0(根目录)
    isPublic: 0,
    vectorIndex: tosPath
});
```

### 界面提示逻辑
```typescript
// 在上传文件夹抽屉中
<Text type="secondary" className={styles.hint}>
  将保持原有文件夹结构，并创建到
  {currentFolderId ? "当前文件夹" : "根目录"}下
</Text>
```

## 📱 用户界面

### 根目录界面
```
[创建文件夹] [上传文件夹]
```

### 文件夹内界面  
```
[上传素材] [上传文件夹]
```

## ✅ 功能验证

### 测试场景
1. ✅ 在根目录上传文件夹 → 创建到根目录
2. ✅ 在子文件夹内上传文件夹 → 创建到当前文件夹下
3. ✅ 多层级文件夹结构 → 保持完整层级关系
4. ✅ parentId 正确关联 → 数据库关系正确
5. ✅ 界面提示准确 → 用户明确知道创建位置

这样，用户可以在任何层级的文件夹中继续上传新的文件夹结构，实现灵活的文件组织管理！
