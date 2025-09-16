"use client";
import React from "react";
import { Card, Typography, Button, Space, Empty } from "antd";
import { PlayCircleOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import styles from "./index.module.scss";

const { Title } = Typography;

const VideosPage = () => {
  const router = useRouter();

  return (
    <div className={styles.videosPage}>
      <div className={styles.header}>
        <div>
          <Title level={2}>成片库</Title>
          <p>管理您创作的所有视频作品</p>
        </div>
        <Space>
          <Button type="primary" onClick={() => router.push("/template-video")}>
            模板成片
          </Button>
          <Button onClick={() => router.push("/edit-video")}>精剪成片</Button>
        </Space>
      </div>

      <Card>
        <Empty
          image={
            <PlayCircleOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
          }
          description="暂无视频作品"
        >
          <Space>
            <Button
              type="primary"
              onClick={() => router.push("/template-video")}
            >
              开始创作
            </Button>
            <Button onClick={() => router.push("/edit-video")}>精剪成片</Button>
          </Space>
        </Empty>
      </Card>
    </div>
  );
};

export default VideosPage;
