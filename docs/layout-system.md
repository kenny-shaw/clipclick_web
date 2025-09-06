# ClipClick Web 布局系统实现文档

## 📋 概述

本文档详细描述了 ClipClick Web 应用的布局系统实现，包括动态 HeaderBar、StudioSidebar 控制、全屏模式管理等核心功能。

## 🏗️ 整体架构

### 布局模式
应用支持两种主要布局模式：

1. **标准模式（Standard Mode）**
   - 包含 HeaderBar + 页面内容
   - 适用于首页、登录、注册等页面

2. **工作室模式（Studio Mode）**
   - 包含 HeaderBar + StudioSidebar + 内容区域
   - 适用于创作中心相关页面

3. **全屏模式（Full-Screen Mode）**
   - 仅包含 HeaderBar（带返回按钮）+ 全屏内容
   - 适用于视频编辑等专业工具页面

## 📁 核心文件结构

```
src/
├── constants/
│   └── layout.ts                    # 布局常量定义
├── components/
│   ├── HeaderBar/
│   │   ├── index.tsx               # 动态头部导航
│   │   └── index.module.css        # 头部样式
│   ├── StudioSidebar/
│   │   ├── index.tsx               # 工作室侧边栏
│   │   └── index.module.scss       # 侧边栏样式
│   └── BackButton/
│       ├── index.tsx               # 返回按钮组件
│       └── index.module.scss       # 返回按钮样式
├── store/
│   ├── authStore.ts                # 认证状态管理
│   └── studioStore.ts              # 工作室状态管理
├── app/
│   ├── layout.tsx                  # 根布局
│   ├── globals.css                 # 全局样式
│   └── studio/
│       ├── layout.tsx              # 工作室布局
│       └── layout.module.scss      # 工作室布局样式
```

## 🎯 核心实现

### 1. 布局常量管理

**文件**: `src/constants/layout.ts`

```typescript
// 布局相关常量
export const LAYOUT_CONSTANTS = {
  HEADER_HEIGHT: 64,
  SIDEBAR_WIDTH: 240,
  SIDEBAR_COLLAPSED_WIDTH: 80,
} as const;
```

**设计理念**:
- 统一管理所有布局相关的尺寸常量
- 确保组件间的尺寸一致性
- 便于后续维护和调整

### 2. 动态 HeaderBar 实现

**文件**: `src/components/HeaderBar/index.tsx`

#### 核心功能
- **路由检测**: 自动识别当前页面类型
- **动态渲染**: 根据页面模式切换不同的 UI 结构
- **状态管理**: 集成认证状态和导航逻辑

#### 关键代码逻辑

```typescript
const HeaderBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();

  // 全屏模式检测
  const isFullScreenMode = useMemo(() => {
    return ['/template-video', '/edit-video'].some(path => 
      pathname.startsWith(path)
    );
  }, [pathname]);

  // 工作室页面检测
  const isStudioPage = useMemo(() => {
    return pathname.startsWith('/studio');
  }, [pathname]);

  // 页面标题获取
  const getCurrentPageTitle = () => {
    if (pathname.startsWith('/template-video')) return '模板成片';
    if (pathname.startsWith('/edit-video')) return '精剪成片';
    return '';
  };

  // 工作室高亮逻辑
  const shouldHighlightStudio = () => {
    return isStudioPage || isFullScreenMode;
  };

  return (
    <header className={styles.headerBar}>
      <div className={styles.left}>
        {/* 全屏模式显示返回按钮 */}
        {isFullScreenMode && <BackButton />}
        
        {/* Logo 区域 */}
        <div className={styles.logoArea} onClick={() => router.push("/")}>
          <Image src="/next.svg" alt="logo" width={32} height={32} />
          <span className={styles.siteName}>ClipClick AI</span>
        </div>

        {/* 动态导航内容 */}
        {isFullScreenMode ? (
          // 全屏模式：显示页面标题
          <div className={styles.fullScreenNav}>
            <span className={styles.pageTitle}>{getCurrentPageTitle()}</span>
          </div>
        ) : (
          // 标准模式：显示导航菜单
          <nav className={styles.menu}>
            {navs.map((item) => (
              <span
                key={item.key}
                className={`${styles.menuItem} ${
                  shouldHighlightStudio() ? styles.menuItemActive : ""
                }`}
                onClick={() => router.push(item.path)}
              >
                {item.label}
              </span>
            ))}
          </nav>
        )}
      </div>

      <div className={styles.right}>
        <AuthMenu />
      </div>
    </header>
  );
};
```

#### 样式特点
- **固定定位**: `position: fixed` 确保头部始终可见
- **响应式设计**: 适配不同屏幕尺寸
- **动画过渡**: 平滑的状态切换效果

### 3. StudioSidebar 实现

**文件**: `src/components/StudioSidebar/index.tsx`

#### 核心功能
- **层级菜单**: 支持多级菜单结构
- **状态持久化**: 展开/收起状态持久化存储
- **智能展示**: 收起时自动调整菜单结构
- **路由同步**: 菜单选中状态与路由同步

#### 菜单结构定义

```typescript
const menuItems = [
  {
    key: 'home',
    icon: <HomeOutlined />,
    label: '首页',
    path: '/studio',
  },
  {
    key: 'video',
    icon: <PlayCircleOutlined />,
    label: '视频成片',
    children: [
      {
        key: 'template-video',
        icon: <FolderOutlined />,
        label: '模板成片',
        path: '/template-video',
      },
      {
        key: 'edit-video',
        icon: <ScissorOutlined />,
        label: '精剪成片',
        path: '/edit-video',
      },
    ],
  },
  {
    key: 'assets',
    icon: <FileImageOutlined />,
    label: '资产管理',
    children: [
      {
        key: 'materials',
        icon: <FolderOutlined />,
        label: '素材库',
        path: '/studio/materials',
      },
      {
        key: 'videos',
        icon: <PlayCircleOutlined />,
        label: '成片库',
        path: '/studio/videos',
      },
    ],
  },
];
```

#### 关键实现逻辑

```typescript
const StudioSidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed, openKeys, setOpenKeys } = useStudioStore();

  // 动态菜单项生成
  const getMenuItems = () => {
    if (sidebarCollapsed) {
      // 收起状态：返回扁平化菜单
      const flatItems: any[] = [];
      menuItems.forEach(item => {
        if (item.children) {
          item.children.forEach(child => {
            flatItems.push({
              key: child.key,
              icon: child.icon,
              label: child.label,
              onClick: () => router.push(child.path),
            });
          });
        } else {
          flatItems.push({
            key: item.key,
            icon: item.icon,
            label: item.label,
            onClick: () => router.push(item.path),
          });
        }
      });
      return flatItems;
    } else {
      // 展开状态：返回层级菜单
      return menuItems.map(item => ({
        key: item.key,
        icon: item.icon,
        label: item.label,
        children: item.children?.map(child => ({
          key: child.key,
          icon: child.icon,
          label: child.label,
          onClick: () => router.push(child.path),
        })),
        onClick: item.path ? () => router.push(item.path) : undefined,
      }));
    }
  };

  // 选中状态计算
  const getSelectedKeys = () => {
    if (pathname === '/studio') return ['home'];
    if (pathname.startsWith('/template-video')) return ['template-video'];
    if (pathname.startsWith('/edit-video')) return ['edit-video'];
    if (pathname.startsWith('/studio/materials')) return ['materials'];
    if (pathname.startsWith('/studio/videos')) return ['videos'];
    return [];
  };

  return (
    <Sider
      className={styles.sidebar}
      collapsed={sidebarCollapsed}
      onCollapse={setSidebarCollapsed}
      collapsible
      theme="light"
      width={LAYOUT_CONSTANTS.SIDEBAR_WIDTH}
      collapsedWidth={LAYOUT_CONSTANTS.SIDEBAR_COLLAPSED_WIDTH}
    >
      <Menu
        mode="inline"
        selectedKeys={getSelectedKeys()}
        openKeys={sidebarCollapsed ? [] : openKeys} // 收起时清空展开状态
        onOpenChange={handleOpenChange}
        items={getMenuItems()}
        className={styles.menu}
        inlineCollapsed={sidebarCollapsed} // 明确设置收起状态
      />
    </Sider>
  );
};
```

#### 样式优化

```scss
.sidebar {
  background: #fff;
  height: calc(100vh - 64px);
  position: fixed;
  top: 64px;
  left: 0;
  z-index: 999;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;

  // 收起状态优化
  &:global(.ant-layout-sider-collapsed) {
    .menu {
      // 隐藏子菜单浮窗
      :global(.ant-menu-submenu-popup) {
        display: none !important;
      }
    }
  }
}
```

### 4. 状态管理

#### AuthStore (认证状态)

**文件**: `src/store/authStore.ts`

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, password: string, tenantName: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // ... 状态和方法实现
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

#### StudioStore (工作室状态)

**文件**: `src/store/studioStore.ts`

```typescript
interface StudioState {
  sidebarCollapsed: boolean;
  openKeys: string[];
  setSidebarCollapsed: (collapsed: boolean) => void;
  setOpenKeys: (keys: string[]) => void;
}

export const useStudioStore = create<StudioState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      openKeys: ["video", "assets"], // 默认展开项
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setOpenKeys: (keys) => set({ openKeys: keys }),
    }),
    {
      name: 'studio-storage',
    }
  )
);
```

### 5. 布局组件实现

#### 工作室布局

**文件**: `src/app/studio/layout.tsx`

```typescript
const StudioLayout: React.FC<StudioLayoutProps> = ({ children }) => {
  const { sidebarCollapsed } = useStudioStore();

  return (
    <ProtectedRoute>
      <div className={styles.studioLayout} data-studio-layout>
        <StudioSidebar />
        <Layout
          className={styles.contentLayout}
          style={{
            marginLeft: sidebarCollapsed 
              ? LAYOUT_CONSTANTS.SIDEBAR_COLLAPSED_WIDTH 
              : LAYOUT_CONSTANTS.SIDEBAR_WIDTH,
          }}
        >
          <Content className={styles.content}>{children}</Content>
        </Layout>
      </div>
    </ProtectedRoute>
  );
};
```

#### 全局样式处理

**文件**: `src/app/globals.css`

```css
body {
  overflow: hidden; /* 防止全局滚动 */
}

/* 非工作室页面添加顶部边距 */
body:not(:has([data-studio-layout])) {
  padding-top: 64px;
  overflow-y: auto;
}
```

## 🎨 样式设计原则

### 1. 固定定位系统
- **HeaderBar**: `position: fixed; top: 0; z-index: 1000;`
- **StudioSidebar**: `position: fixed; top: 64px; z-index: 999;`
- **内容区域**: 动态 `margin-left` 适应侧边栏状态

### 2. 响应式设计
```scss
@media (max-width: 768px) {
  .sidebar {
    :global(.ant-layout-sider-collapsed) {
      width: 0 !important;
    }
  }
}

@media (max-width: 576px) {
  .sidebar {
    :global(.ant-layout-sider) {
      width: 100vw !important;
    }
  }
}
```

### 3. 动画过渡
- 统一使用 `transition: all 0.2s ease;`
- 菜单项悬停效果：`transform: translateX(2px);`
- 渐变背景和阴影效果

## 🔄 交互流程

### 1. 页面路由切换
```
用户访问页面 → 路由检测 → 确定布局模式 → 渲染对应组件
```

### 2. 侧边栏状态管理
```
用户点击收起/展开 → 更新 studioStore → 触发布局重新计算 → 动画过渡
```

### 3. 菜单选中同步
```
路由变化 → pathname 检测 → 计算选中状态 → 更新菜单显示
```

## 🚀 性能优化

### 1. 状态持久化
- 使用 `zustand/middleware/persist` 持久化关键状态
- 避免页面刷新后状态丢失

### 2. 计算优化
- 使用 `useMemo` 缓存路由检测结果
- 避免不必要的重新计算

### 3. 样式优化
- CSS Modules 避免样式冲突
- 使用 GPU 加速的 `transform` 属性
- 合理的 z-index 层级管理

## 🛠️ 扩展指南

### 添加新的布局模式
1. 在 `HeaderBar` 中添加新的检测逻辑
2. 创建对应的布局组件
3. 更新样式和常量定义

### 添加新的菜单项
1. 在 `StudioSidebar` 的 `menuItems` 中添加配置
2. 更新 `getSelectedKeys` 方法
3. 添加对应的路由处理

### 自定义主题
1. 修改 `layout.ts` 中的常量
2. 调整对应的 SCSS 变量
3. 更新 Ant Design 主题配置

## 📝 总结

这个布局系统的核心优势：

1. **高度模块化**: 每个组件职责单一，易于维护
2. **状态统一管理**: 使用 Zustand 集中管理状态
3. **响应式设计**: 适配各种屏幕尺寸
4. **性能优化**: 合理的重渲染控制和状态持久化
5. **扩展性强**: 易于添加新功能和布局模式

通过这套系统，实现了灵活、高效、美观的多模式布局管理。
