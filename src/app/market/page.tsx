import React from "react";
import { Card, Typography, Row, Col } from "antd";
import ProtectedRoute from "@/components/ProtectedRoute";

const { Title, Paragraph } = Typography;

const Market = () => (
  <ProtectedRoute>
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <Title level={2}>服务市场</Title>
      <Paragraph>这里是服务市场页面，功能正在开发中...</Paragraph>

      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card title="视频模板">
            <Paragraph>丰富的视频模板库，满足不同行业需求</Paragraph>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="AI工具">
            <Paragraph>智能AI工具，提升视频制作效率</Paragraph>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="素材库">
            <Paragraph>海量素材资源，让创作更轻松</Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  </ProtectedRoute>
);

export default Market;
