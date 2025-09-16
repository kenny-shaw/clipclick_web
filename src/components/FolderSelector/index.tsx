import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Select, Spin, message } from "antd";
import { FolderOutlined } from "@ant-design/icons";
import { FolderInfo } from "@/api/services/material/types";
import styles from "./index.module.scss";

const { Option } = Select;

interface FolderSelectorProps {
  value?: number;
  onChange?: (value?: number) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export interface FolderSelectorRef {
  focus: () => void;
  blur: () => void;
}

const FolderSelector = forwardRef<FolderSelectorRef, FolderSelectorProps>(
  (
    {
      value,
      onChange,
      placeholder = "请选择文件夹",
      disabled = false,
      style,
      className,
    },
    ref
  ) => {
    const [loading, setLoading] = useState(false);
    const [folders, setFolders] = useState<FolderInfo[]>([]);
    const selectRef = React.useRef<any>(null);

    // 暴露给父组件的方法
    useImperativeHandle(ref, () => ({
      focus: () => selectRef.current?.focus(),
      blur: () => selectRef.current?.blur(),
    }));

    // 加载文件夹列表
    const loadFolders = async (searchKeyword?: string) => {
      setLoading(true);
      try {
        // 直接调用API，不通过store
        const { getFolderList } = await import("@/api/services/material");
        const response = await getFolderList({
          pageNum: 1,
          pageSize: 100, // 获取更多文件夹
          name: searchKeyword,
        });

        if (response.code === 200) {
          setFolders(response.rows || []);
        } else {
          message.error(response.msg || "获取文件夹列表失败");
        }
      } catch (error) {
        console.error("获取文件夹列表失败:", error);
        message.error("获取文件夹列表失败");
      } finally {
        setLoading(false);
      }
    };

    // 初始化加载
    useEffect(() => {
      loadFolders();
    }, []);

    // 搜索处理
    const handleSearch = (value: string) => {
      loadFolders(value);
    };

    // 选择处理
    const handleChange = (value: number) => {
      onChange?.(value);
    };

    // 清空处理
    const handleClear = () => {
      onChange?.(undefined);
    };

    return (
      <Select
        ref={selectRef}
        value={value}
        onChange={handleChange}
        onClear={handleClear}
        onSearch={handleSearch}
        placeholder={placeholder}
        disabled={disabled}
        style={style}
        className={`${styles.folderSelector} ${className || ""}`}
        showSearch
        allowClear
        filterOption={false}
        loading={loading}
        notFoundContent={loading ? <Spin size="small" /> : "暂无数据"}
        suffixIcon={<FolderOutlined />}
      >
        {folders.map((folder) => (
          <Option key={folder.id} value={folder.id}>
            <div className={styles.folderOption}>
              <FolderOutlined className={styles.folderIcon} />
              <span className={styles.folderName}>{folder.name}</span>
            </div>
          </Option>
        ))}
      </Select>
    );
  }
);

FolderSelector.displayName = "FolderSelector";

export default FolderSelector;
