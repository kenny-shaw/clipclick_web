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

const StudioSidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed, openKeys, setOpenKeys } =
    useStudioStore();

  // 菜单配置
  const menuConfig = {
    homePath: "/studio",
    materialsPath: "/assets/materials",
    productsPath: "/assets/products",
    videosPath: "/assets/videos",
    templateVideoPath: "/template-video",
    fineCutPath: "/fine-cut",
  };

  // 菜单配置 - 根据收起状态动态调整
  const getMenuItems = () => {
    if (sidebarCollapsed) {
      // 收起状态：扁平化菜单，不显示子菜单
      return [
        {
          key: menuConfig.homePath,
          icon: <HomeOutlined />,
          label: "首页",
        },
        {
          key: menuConfig.templateVideoPath,
          icon: <PlayCircleOutlined />,
          label: "模板成片",
        },
        {
          key: menuConfig.fineCutPath,
          icon: <ScissorOutlined />,
          label: "精剪成片",
        },
        {
          key: menuConfig.videosPath,
          icon: <PlayCircleOutlined />,
          label: "成片库",
        },
        {
          key: menuConfig.materialsPath,
          icon: <FileImageOutlined />,
          label: "素材库",
        },
        {
          key: menuConfig.productsPath,
          icon: <ShoppingOutlined />,
          label: "商品库",
        },
      ];
    } else {
      // 展开状态：分层菜单结构
      return [
        {
          key: menuConfig.homePath,
          icon: <HomeOutlined />,
          label: "首页",
        },
        {
          key: "video",
          icon: <VideoCameraOutlined />,
          label: "视频成片",
          children: [
            {
              key: menuConfig.templateVideoPath,
              icon: <PlayCircleOutlined />,
              label: "模板成片",
            },
            {
              key: menuConfig.fineCutPath,
              icon: <ScissorOutlined />,
              label: "精剪成片",
            },
            {
              key: menuConfig.videosPath,
              icon: <PlayCircleOutlined />,
              label: "成片库",
            },
          ],
        },
        {
          key: "assets",
          icon: <FolderOutlined />,
          label: "资产管理",
          children: [
            {
              key: menuConfig.materialsPath,
              icon: <FileImageOutlined />,
              label: "素材库",
            },
            {
              key: menuConfig.productsPath,
              icon: <ShoppingOutlined />,
              label: "商品库",
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

  // 处理子菜单展开/收起
  const handleOpenChange = (keys: string[]) => {
    if (!sidebarCollapsed) {
      setOpenKeys(keys);
    }
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
