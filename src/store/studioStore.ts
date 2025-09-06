import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
            openKeys: ["video", "assets"], // 默认展开视频成片和资产管理
            setSidebarCollapsed: (collapsed: boolean) => set({ sidebarCollapsed: collapsed }),
            setOpenKeys: (keys: string[]) => set({ openKeys: keys }),
        }),
        {
            name: 'studio-storage',
            partialize: (state) => ({
                sidebarCollapsed: state.sidebarCollapsed,
                openKeys: state.openKeys,
            }),
        }
    )
);
