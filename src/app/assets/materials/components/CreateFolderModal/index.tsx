import React from "react";
import { Modal, Form, Input, Radio } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { CreateFolderParams } from "@/api";

interface CreateFolderModalProps {
  visible: boolean;
  loading: boolean;
  onSubmit: (values: CreateFolderParams) => Promise<void>;
  onCancel: () => void;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  visible,
  loading,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit({
        name: values.name,
        isPublic: values.isPublic,
        parentId: 0, // 目前只支持一级文件夹，所以parentId固定为0
        vectorIndex: "", // 暂时为空
      });
      form.resetFields();
    } catch (error) {
      // 表单验证失败或提交失败
      console.error("创建文件夹失败:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="创建文件夹"
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="创建"
      cancelText="取消"
      destroyOnHidden
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item
          name="name"
          label="文件夹名称"
          rules={[
            { required: true, message: "请输入文件夹名称" },
            { max: 50, message: "文件夹名称不能超过50个字符" },
            {
              pattern: /^[^/\\:*?"<>|]+$/,
              message: '文件夹名称不能包含特殊字符 / \\ : * ? " < > |',
            },
          ]}
        >
          <Input placeholder="请输入文件夹名称" maxLength={50} showCount />
        </Form.Item>

        <Form.Item
          name="isPublic"
          label="可见性"
          initialValue={0}
          rules={[{ required: true, message: "请选择文件夹可见性" }]}
        >
          <Radio.Group>
            <Radio value={0}>
              <EyeInvisibleOutlined style={{ marginRight: 4 }} />
              私有
              <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 2 }}>
                仅自己可见
              </div>
            </Radio>
            <Radio value={1}>
              <EyeOutlined style={{ marginRight: 4 }} />
              公开
              <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 2 }}>
                所有人可见
              </div>
            </Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateFolderModal;
