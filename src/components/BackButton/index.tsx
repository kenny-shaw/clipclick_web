"use client";
import React from "react";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import styles from "./index.module.scss";

interface BackButtonProps {
  onClick?: () => void;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick, className }) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // 默认返回到创作中心首页
      router.push("/studio");
    }
  };

  return (
    <Button
      type="text"
      icon={<ArrowLeftOutlined />}
      onClick={handleClick}
      className={`${styles.backButton} ${className || ""}`}
    >
      返回
    </Button>
  );
};

export default BackButton;
