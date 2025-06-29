"use client";
import React from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import AuthMenu from "../AuthMenu";
import styles from "./index.module.css";

const navs = [
  { key: "studio", label: "创作中心", path: "/studio" },
  { key: "market", label: "服务市场", path: "/market" },
];

const HeaderBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <header className={styles.headerBar}>
      <div className={styles.left}>
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
        <nav className={styles.menu}>
          {navs.map((item) => (
            <span
              key={item.key}
              className={`${styles.menuItem} ${
                pathname === item.path ? styles.menuItemActive : ""
              }`}
              onClick={() => router.push(item.path)}
            >
              {item.label}
            </span>
          ))}
        </nav>
      </div>
      <div className={styles.rightArea}>
        <AuthMenu />
      </div>
    </header>
  );
};

export default HeaderBar;
