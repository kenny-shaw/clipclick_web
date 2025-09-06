"use client";
import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Form, Input, Card, Typography, message } from "antd";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";
import styles from "./index.module.scss";

interface LoginForm {
  username: string;
  password: string;
}

const LoginPageInner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [form] = Form.useForm<LoginForm>();

  // 获取重定向URL
  const redirectUrl = searchParams.get("redirect");

  React.useEffect(() => {
    if (isAuthenticated) {
      // 如果有重定向URL，跳转到原始页面，否则跳转到首页
      if (redirectUrl) {
        const decodedUrl = decodeURIComponent(redirectUrl);
        router.replace(decodedUrl);
      } else {
        router.replace("/");
      }
    }
  }, [isAuthenticated, router, redirectUrl]);

  const onFinish = async (values: LoginForm) => {
    try {
      await login(values.username, values.password);
      message.success("登录成功");
      // 登录成功后，useEffect会处理重定向
    } catch (e: unknown) {
      if (e instanceof Error) {
        message.error(e.message);
      } else {
        message.error("登录失败");
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
            ClipClick AI 登录
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
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input size="large" placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password size="large" placeholder="请输入密码" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isLoading}
              size="large"
              className={styles.loginButton}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
        <div className={styles.registerLink}>
          没有账号？ <a onClick={() => router.push("/register")}>注册</a>
        </div>
      </Card>
    </div>
  );
};

const LoginPage = () => (
  <Suspense fallback={null}>
    <LoginPageInner />
  </Suspense>
);

export default LoginPage;
