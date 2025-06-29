"use client";
import React from "react";
import { Card, Typography, Avatar, Descriptions, Button, Space } from "antd";
import { UserOutlined, EditOutlined } from "@ant-design/icons";
import { useAuthStore } from "@/store/authStore";
import ProtectedRoute from "@/components/ProtectedRoute";

const { Title, Text } = Typography;

const ProfilePage = () => {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
        <Title level={2}>个人中心</Title>

        <Card style={{ marginBottom: 24 }}>
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 24 }}
          >
            <Avatar
              size={64}
              src={user.avatar || undefined}
              icon={<UserOutlined />}
              style={{ marginRight: 16 }}
            />
            <div>
              <Title level={3} style={{ margin: 0 }}>
                {user.nickName || user.userName}
              </Title>
              <Text type="secondary">@{user.userName}</Text>
            </div>
            <Space style={{ marginLeft: "auto" }}>
              <Button icon={<EditOutlined />}>编辑资料</Button>
            </Space>
          </div>
        </Card>

        <Card title="基本信息">
          <Descriptions column={2}>
            <Descriptions.Item label="用户ID">{user.userId}</Descriptions.Item>
            <Descriptions.Item label="用户名">
              {user.userName}
            </Descriptions.Item>
            <Descriptions.Item label="昵称">
              {user.nickName || "未设置"}
            </Descriptions.Item>
            <Descriptions.Item label="邮箱">
              {user.email || "未设置"}
            </Descriptions.Item>
            <Descriptions.Item label="手机号">
              {user.phonenumber || "未设置"}
            </Descriptions.Item>
            <Descriptions.Item label="性别">
              {user.sex || "未设置"}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Text type={user.status === "0" ? "success" : "danger"}>
                {user.status === "0" ? "正常" : "禁用"}
              </Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="权限信息" style={{ marginTop: 24 }}>
          <Descriptions column={1}>
            <Descriptions.Item label="角色">
              {user.roles && user.roles.length > 0
                ? user.roles.join(", ")
                : "无"}
            </Descriptions.Item>
            <Descriptions.Item label="权限">
              {user.permissions && user.permissions.length > 0
                ? user.permissions.join(", ")
                : "无"}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </ProtectedRoute>
  );
};

export default ProfilePage;
