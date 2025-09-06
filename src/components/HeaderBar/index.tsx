"use client";
import React from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import AuthMenu from "../AuthMenu";
import BackButton from "../BackButton";
import styles from "./index.module.css";

// 移除素材管理，只保留创作中心
const navs = [{ key: "studio", label: "创作中心", path: "/studio" }];

// 全屏模式页面配置
const fullScreenPages = {
  "/template-video": "模板成片",
  "/edit-video": "精剪成片",
};

const HeaderBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  // 判断是否为全屏模式
  const isFullScreenMode = pathname in fullScreenPages;

  // 判断是否为创作中心相关页面
  const isStudioPage = pathname.startsWith("/studio");

  // 获取当前页面标题
  const getCurrentPageTitle = () => {
    if (isFullScreenMode) {
      return fullScreenPages[pathname as keyof typeof fullScreenPages];
    }
    return null;
  };

  // 判断创作中心是否应该高亮
  const shouldHighlightStudio = () => {
    return isStudioPage || isFullScreenMode;
  };

  return (
    <header className={styles.headerBar}>
      <div className={styles.left}>
        {/* 全屏模式时在logo左边显示返回按钮 */}
        {isFullScreenMode && <BackButton />}

        <div className={styles.logoArea} onClick={() => router.push("/")}>
          <Image
            src="/next.svg"
            alt="logo"
            width={32}
            height={32}
            className={styles.logoImg}
            priority
          />
          <span className={styles.siteName}>ClipClick AI</span>
        </div>

        {/* 全屏模式：显示页面标题 */}
        {isFullScreenMode ? (
          <div className={styles.fullScreenNav}>
            <span className={styles.pageTitle}>{getCurrentPageTitle()}</span>
          </div>
        ) : (
          /* 正常模式：显示导航菜单 */
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
      <div className={styles.rightArea}>
        <AuthMenu />
      </div>
    </header>
  );
};

export default HeaderBar;
