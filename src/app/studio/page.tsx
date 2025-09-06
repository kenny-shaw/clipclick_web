"use client";
import React from "react";
import { Card, Row, Col, Statistic, Button, Typography, Space } from "antd";
import {
  VideoCameraOutlined,
  FileImageOutlined,
  PlayCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import styles from "./index.module.scss";

const { Title, Paragraph } = Typography;

const StudioHome = () => {
  const router = useRouter();

  const quickActions = [
    {
      title: "模板成片",
      description: "使用预设模板快速生成视频",
      icon: <PlayCircleOutlined />,
      path: "/template-video",
      color: "#1890ff",
    },
    {
      title: "精剪成片",
      description: "自由编辑，打造个性化视频",
      icon: <VideoCameraOutlined />,
      path: "/edit-video",
      color: "#52c41a",
    },
    {
      title: "素材库",
      description: "管理您的创作素材",
      icon: <FileImageOutlined />,
      path: "/studio/materials",
      color: "#faad14",
    },
  ];

  return (
    <div className={styles.studioHome}>
      <div className={styles.header}>
        <Title level={2}>创作中心</Title>
        <Paragraph>
          欢迎来到 ClipClick AI 创作中心，开始您的视频创作之旅
        </Paragraph>
      </div>

      {/* 数据统计 */}
      <Row gutter={16} className={styles.statsRow}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总视频数"
              value={0}
              prefix={<VideoCameraOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="素材数量"
              value={0}
              prefix={<FileImageOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="本月创作" value={0} prefix={<PlusOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="存储使用" value="0%" suffix="/ 100GB" />
          </Card>
        </Col>
      </Row>

      {/* 快捷操作 */}
      <div className={styles.quickActions}>
        <Title level={3}>快捷操作</Title>
        <Row gutter={[16, 16]}>
          {quickActions.map((action, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Card
                className={styles.actionCard}
                hoverable
                onClick={() => router.push(action.path)}
              >
                <div
                  className={styles.actionIcon}
                  style={{ color: action.color }}
                >
                  {action.icon}
                </div>
                <Title level={4}>{action.title}</Title>
                <Paragraph>{action.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* 最近项目 */}
      <div className={styles.recentProjects}>
        <div className={styles.sectionHeader}>
          <Title level={3}>最近项目</Title>
          <Button type="link">查看全部</Button>
        </div>
        <Card>
          <div className={styles.emptyState}>
            <VideoCameraOutlined className={styles.emptyIcon} />
            <Title level={4}>暂无项目</Title>
            <Paragraph>开始您的第一个视频创作项目</Paragraph>
            <Space>
              <Button
                type="primary"
                onClick={() => router.push("/template-video")}
              >
                模板成片
              </Button>
              <Button onClick={() => router.push("/edit-video")}>
                精剪成片
              </Button>
            </Space>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudioHome;
