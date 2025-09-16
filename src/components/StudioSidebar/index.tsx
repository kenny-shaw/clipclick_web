"use client";
import React from "react";
import { Layout, Menu } from "antd";
import { useRouter, usePathname } from "next/navigation";
import {
  HomeOutlined,
  VideoCameraOutlined,
  FolderOutlined,
  PlayCircleOutlined,
  ScissorOutlined,
  FileImageOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { useStudioStore } from "@/store/studioStore";
import { LAYOUT_CONSTANTS } from "@/constants/layout";
import styles from "./index.module.scss";

const { Sider } = Layout;

interface StudioSidebarProps {
  menuType?: "studio" | "assets" | "admin";
}

const StudioSidebar: React.FC<StudioSidebarProps> = ({
  menuType = "studio",
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed, openKeys, setOpenKeys } =
    useStudioStore();

  // 根据菜单类型获取菜单配置
  const getMenuConfig = () => {
    switch (menuType) {
      case "assets":
        return {
          homePath: "/assets",
          materialsPath: "/assets/materials",
          productsPath: "/assets/products",
          videosPath: "/assets/videos",
        };
      case "admin":
        return {
          homePath: "/admin",
          materialsPath: "/admin/materials",
          productsPath: "/admin/products",
          videosPath: "/admin/videos",
        };
      default: // studio
        return {
          homePath: "/studio",
          materialsPath: "/assets/materials",
          productsPath: "/assets/products",
          videosPath: "/assets/videos",
        };
    }
  };

  // 菜单配置 - 根据收起状态和菜单类型动态调整
  const getMenuItems = () => {
    const config = getMenuConfig();

    if (sidebarCollapsed) {
      // 收起状态：扁平化菜单，不显示子菜单
      return [
        {
          key: config.homePath,
          icon: <HomeOutlined />,
          label: "首页",
        },
        {
          key: "/template-video",
          icon: <PlayCircleOutlined />,
          label: "模板成片",
        },
        {
          key: "/fine-cut",
          icon: <ScissorOutlined />,
          label: "精剪成片",
        },
        {
          key: config.materialsPath,
          icon: <FileImageOutlined />,
          label: "素材库",
        },
        {
          key: config.productsPath,
          icon: <ShoppingOutlined />,
          label: "商品库",
        },
        {
          key: config.videosPath,
          icon: <PlayCircleOutlined />,
          label: "成片库",
        },
      ];
    } else {
      // 展开状态：分层菜单结构
      return [
        {
          key: config.homePath,
          icon: <HomeOutlined />,
          label: "首页",
        },
        {
          key: "video",
          icon: <VideoCameraOutlined />,
          label: "视频成片",
          children: [
            {
              key: "/template-video",
              icon: <PlayCircleOutlined />,
              label: "模板成片",
            },
            {
              key: "/fine-cut",
              icon: <ScissorOutlined />,
              label: "精剪成片",
            },
          ],
        },
        {
          key: "assets",
          icon: <FolderOutlined />,
          label: "资产管理",
          children: [
            {
              key: config.materialsPath,
              icon: <FileImageOutlined />,
              label: "素材库",
            },
            {
              key: config.productsPath,
              icon: <ShoppingOutlined />,
              label: "商品库",
            },
            {
              key: config.videosPath,
              icon: <PlayCircleOutlined />,
              label: "成片库",
            },
          ],
        },
      ];
    }
  };

  // 处理菜单点击
  const handleMenuClick = (e: { key: string }) => {
    if (e.key.startsWith("/")) {
      router.push(e.key);
    }
  };

  // 获取当前选中的菜单项
  const getSelectedKeys = () => {
    return [pathname];
  };

  // 初始化展开状态
  React.useEffect(() => {
    if (openKeys.length === 0) {
      // 首次加载时设置默认展开状态
      setOpenKeys(["video", "assets"]);
    }
  }, [openKeys.length, setOpenKeys]);

  // 处理子菜单展开/收起
  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
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
      {/* 123 */}
      <Menu
        mode="inline"
        selectedKeys={getSelectedKeys()}
        openKeys={sidebarCollapsed ? [] : openKeys} // 收起时不显示展开状态
        onOpenChange={handleOpenChange}
        items={getMenuItems()} // 使用动态菜单
        onClick={handleMenuClick}
        className={styles.menu}
        inlineCollapsed={sidebarCollapsed} // 明确设置收起状态
      />
    </Sider>
  );
};

export default StudioSidebar;
