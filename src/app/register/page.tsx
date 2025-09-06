"use client";
import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Form, Input, Card, Typography, message } from "antd";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";
import styles from "./index.module.scss";

interface RegisterForm {
  username: string;
  password: string;
  tenantName: string;
}

const RegisterPageInner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, register } = useAuthStore();
  const [form] = Form.useForm<RegisterForm>();

  // 获取重定向URL
  const redirectUrl = searchParams.get("redirect");

  React.useEffect(() => {
    if (isAuthenticated) {
      // 注册成功并自动登录后，跳转到目标页面
      if (redirectUrl) {
        const decodedUrl = decodeURIComponent(redirectUrl);
        router.replace(decodedUrl);
      } else {
        router.replace("/");
      }
    }
  }, [isAuthenticated, router, redirectUrl]);

  const onFinish = async (values: RegisterForm) => {
    try {
      await register(values.username, values.password, values.tenantName);
      message.success("注册成功！已自动登录");
      // 注册成功后会通过 useEffect 自动跳转
    } catch (e: unknown) {
      if (e instanceof Error) {
        message.error(e.message);
      } else {
        message.error("注册失败，请重试");
      }
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <Image
            src="/next.svg"
            alt="logo"
            width={40}
            height={40}
            className={styles.logo}
          />
          <Typography.Title level={3} className={styles.title}>
            ClipClick AI 注册
          </Typography.Title>
        </div>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: "请输入用户名" },
              { min: 3, message: "用户名至少3个字符" },
              { max: 20, message: "用户名最多20个字符" },
            ]}
          >
            <Input size="large" placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: "请输入密码" },
              { min: 6, message: "密码至少6个字符" },
              { max: 20, message: "密码最多20个字符" },
            ]}
          >
            <Input.Password size="large" placeholder="请输入密码" />
          </Form.Item>
          <Form.Item
            name="tenantName"
            label="租户名称"
            rules={[
              { required: true, message: "请输入租户名称" },
              { min: 2, message: "租户名称至少2个字符" },
              { max: 50, message: "租户名称最多50个字符" },
            ]}
          >
            <Input size="large" placeholder="请输入租户名称" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isLoading}
              size="large"
              className={styles.registerButton}
            >
              注册
            </Button>
          </Form.Item>
        </Form>
        <div className={styles.loginLink}>
          已有账号？{" "}
          <a
            onClick={() => {
              // 传递重定向参数到登录页面
              const loginUrl = redirectUrl
                ? `/login?redirect=${redirectUrl}`
                : "/login";
              router.push(loginUrl);
            }}
          >
            登录
          </a>
        </div>
      </Card>
    </div>
  );
};

const RegisterPage = () => (
  <Suspense fallback={null}>
    <RegisterPageInner />
  </Suspense>
);

export default RegisterPage;
