"use client";
import React from "react";
import { Avatar, Dropdown, message } from "antd";
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
  console.log("user", user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  if (!mounted || !user || isLoading) return null;

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
    console.log(e);
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
