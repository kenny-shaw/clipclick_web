import type { LayoutVariant, SidebarType } from "@/components/layouts/BaseLayout";

export interface LayoutConfig {
    variant: LayoutVariant;
    sidebarType?: SidebarType;
    pageTitle?: string;
    protected?: boolean;
}

// 路由布局配置
export const LAYOUT_CONFIG: Record<string, LayoutConfig> = {
    // 公开页面
    '/': { variant: 'default' },
    '/login': { variant: 'default' },
    '/register': { variant: 'default' },

    // 受保护页面 - 默认布局
    '/profile': { variant: 'default', protected: true },
    '/settings': { variant: 'default', protected: true },

    // Studio 页面组 - 侧边栏布局
    '/studio': { variant: 'sidebar', sidebarType: 'studio', protected: true },
    '/assets': { variant: 'sidebar', sidebarType: 'studio', protected: true },
    '/assets/materials': { variant: 'sidebar', sidebarType: 'studio', protected: true },
    '/assets/products': { variant: 'sidebar', sidebarType: 'studio', protected: true },
    '/assets/videos': { variant: 'sidebar', sidebarType: 'studio', protected: true },

    // 全屏页面
    '/template-video': { variant: 'fullscreen', pageTitle: '模板成片', protected: true },
    '/fine-cut': { variant: 'fullscreen', pageTitle: '精剪成片', protected: true },
} as const;

// 获取布局配置的辅助函数
export const getLayoutConfig = (pathname: string): LayoutConfig => {
    return LAYOUT_CONFIG[pathname] || { variant: 'default' };
};
