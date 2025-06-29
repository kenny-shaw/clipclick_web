"use client";
import React from "react";
import { Button, Card, Typography, Row, Col, Space } from "antd";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./page.module.css";

const { Title, Paragraph } = Typography;

const Home = () => {
  const router = useRouter();

  const features = [
    {
      icon: "🎬",
      title: "智能视频生成",
      description: "基于AI技术，自动生成高质量的商品视频广告，无需专业拍摄设备",
    },
    {
      icon: "⚡",
      title: "快速制作",
      description: "几分钟内完成从创意到成片的整个制作流程，大幅提升效率",
    },
    {
      icon: "🎯",
      title: "精准定位",
      description: "智能分析目标受众，生成符合用户偏好的个性化视频内容",
    },
    {
      icon: "📊",
      title: "数据驱动",
      description: "基于大数据分析，持续优化视频效果，提升转化率",
    },
  ];

  const handleGetStarted = () => {
    router.push("/studio");
  };

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <Title level={1} className={styles.heroTitle}>
            AI驱动的商品视频广告制作平台
          </Title>
          <Paragraph className={styles.heroSubtitle}>
            让AI为您创造引人入胜的商品视频广告，提升品牌影响力，驱动销售增长
          </Paragraph>
          <Space size="large">
            <Button
              type="primary"
              size="large"
              onClick={handleGetStarted}
              className={styles.ctaButton}
            >
              开始创作
            </Button>
            <Button size="large" className={styles.secondaryButton}>
              了解更多
            </Button>
          </Space>
        </div>
        <div className={styles.heroImage}>
          <Image
            src="/next.svg"
            alt="AI Video Creation"
            width={400}
            height={300}
            priority
          />
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <Title level={2} className={styles.sectionTitle}>
          为什么选择 ClipClick AI？
        </Title>
        <Row gutter={[32, 32]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card className={styles.featureCard}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <Title level={4} className={styles.featureTitle}>
                  {feature.title}
                </Title>
                <Paragraph className={styles.featureDescription}>
                  {feature.description}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <Card className={styles.ctaCard}>
          <Title level={2} className={styles.ctaTitle}>
            准备好开始您的AI视频创作之旅了吗？
          </Title>
          <Paragraph className={styles.ctaDescription}>
            立即体验AI驱动的视频制作，让您的商品在竞争中脱颖而出
          </Paragraph>
          <Button
            type="primary"
            size="large"
            onClick={handleGetStarted}
            className={styles.ctaButton}
          >
            免费开始创作
          </Button>
        </Card>
      </section>
    </div>
  );
};

export default Home;
