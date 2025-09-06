"use client";
import React from "react";
import { Card, Typography, Button, Space } from "antd";
import { ScissorOutlined, PlayCircleOutlined } from "@ant-design/icons";
import FullScreenLayout from "@/components/FullScreenLayout";
import styles from "./index.module.scss";

const { Title, Paragraph } = Typography;

const EditVideoPage = () => {
  return (
    <FullScreenLayout>
      <div className={styles.editVideoContainer}>
        <Card className={styles.comingSoonCard}>
          <div className={styles.content}>
            <ScissorOutlined className={styles.icon} />
            <Title level={2}>精剪成片</Title>
            <Paragraph>专业的视频编辑工具正在开发中，敬请期待！</Paragraph>
            <Paragraph>
              功能包括：时间轴编辑、多轨道支持、特效添加、音频处理等
            </Paragraph>
            <Space>
              <Button type="primary" icon={<PlayCircleOutlined />}>
                体验模板成片
              </Button>
              <Button>了解更多</Button>
            </Space>
          </div>
        </Card>
      </div>
    </FullScreenLayout>
  );
};

export default EditVideoPage;
