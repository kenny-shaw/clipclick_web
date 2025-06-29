"use client";
import React from "react";
import { Avatar, Dropdown, message, Button } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import styles from "./index.module.scss";
import type { MenuInfo } from "rc-menu/lib/interface";

const AuthMenu: React.FC = () => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  // 如果还没挂载或正在加载，显示加载状态
  if (!mounted || isLoading) {
    return (
      <div className={styles.authMenu}>
        <div
          style={{
            width: 80,
            height: 32,
            background: "#f0f0f0",
            borderRadius: 16,
          }}
        ></div>
      </div>
    );
  }

  // 如果未登录，显示登录/注册按钮
  if (!user) {
    return (
      <div className={styles.loginButtons}>
        <Button
          type="text"
          onClick={() => router.push("/login")}
          className={styles.loginButton}
          style={{ color: "#673ab7" }}
        >
          登录
        </Button>
        <Button
          type="primary"
          onClick={() => router.push("/register")}
          className={styles.registerButton}
          style={{
            background: "linear-gradient(90deg, #673ab7 0%, #9c27b0 100%)",
            border: "none",
          }}
        >
          注册
        </Button>
      </div>
    );
  }

  const items = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "个人中心",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "设置",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "退出登录",
    },
  ];

  const handleMenuClick = async (e: MenuInfo) => {
    if (e.key === "profile") {
      router.push("/profile");
    } else if (e.key === "settings") {
      router.push("/settings");
    } else if (e.key === "logout") {
      await logout();
      message.success("已退出登录");
      router.replace("/login");
    }
  };

  return (
    <Dropdown
      menu={{ items, onClick: handleMenuClick, className: styles.dropdownMenu }}
      placement="bottomRight"
      arrow
    >
      <div className={styles.authMenu}>
        <Avatar
          size={32}
          src={user.avatar === "" ? null : user.avatar}
          icon={<UserOutlined />}
          className={styles.avatar}
        />
        <span className={styles.username}>{user.userName}</span>
      </div>
    </Dropdown>
  );
};

export default AuthMenu;
