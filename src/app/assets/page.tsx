"use client";
import React from "react";
import { Card, Typography, Row, Col, Statistic, Button, Space } from "antd";
import {
  FileImageOutlined,
  ShoppingOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import styles from "./index.module.scss";

const { Title, Paragraph } = Typography;

const AssetsHome = () => {
  const router = useRouter();

  const quickActions = [
    {
      title: "素材管理",
      description: "管理您的创作素材",
      icon: <FileImageOutlined />,
      path: "/assets/materials",
      color: "#faad14",
    },
    {
      title: "商品管理",
      description: "管理商品信息",
      icon: <ShoppingOutlined />,
      path: "/assets/products",
      color: "#52c41a",
    },
    {
      title: "成片管理",
      description: "管理生成的视频",
      icon: <PlayCircleOutlined />,
      path: "/assets/videos",
      color: "#1890ff",
    },
  ];

  return (
    <div className={styles.assetsHome}>
      <div className={styles.header}>
        <Title level={2}>资产管理</Title>
        <Paragraph>统一管理您的素材、商品和成片资源</Paragraph>
      </div>

      {/* 数据统计 */}
      <Row gutter={16} className={styles.statsRow}>
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
            <Statistic
              title="商品数量"
              value={0}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="成片数量"
              value={0}
              prefix={<PlayCircleOutlined />}
            />
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

      {/* 最近活动 */}
      <div className={styles.recentActivity}>
        <div className={styles.sectionHeader}>
          <Title level={3}>最近活动</Title>
          <Button type="link">查看全部</Button>
        </div>
        <Card>
          <div className={styles.emptyState}>
            <FileImageOutlined className={styles.emptyIcon} />
            <Title level={4}>暂无活动</Title>
            <Paragraph>开始管理您的资源</Paragraph>
            <Space>
              <Button
                type="primary"
                onClick={() => router.push("/assets/materials")}
              >
                素材管理
              </Button>
              <Button onClick={() => router.push("/assets/products")}>
                商品管理
              </Button>
            </Space>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AssetsHome;
