import { useState, useCallback, useRef } from "react";
import { message } from "antd";

export interface DragDropUploadOptions {
    accept?: string;
    multiple?: boolean;
    onFilesSelect: (files: File[]) => void;
    onFolderSelect?: (files: File[], folderName: string) => void;
    maxFiles?: number;
}

export interface DragDropUploadReturn {
    isDragOver: boolean;
    dragDropProps: {
        onDragEnter: (e: React.DragEvent) => void;
        onDragLeave: (e: React.DragEvent) => void;
        onDragOver: (e: React.DragEvent) => void;
        onDrop: (e: React.DragEvent) => void;
    };
    fileInputRef: React.RefObject<HTMLInputElement>;
    folderInputRef: React.RefObject<HTMLInputElement>;
    handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleFolderSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
    triggerFileSelect: () => void;
    triggerFolderSelect: () => void;
}

export const useDragDropUpload = (options: DragDropUploadOptions): DragDropUploadReturn => {
    const {
        onFilesSelect,
        onFolderSelect,
        maxFiles = 100,
    } = options;

    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);

    // 处理文件选择
    const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const fileArray = Array.from(files);
        if (fileArray.length > maxFiles) {
            message.warning(`最多只能选择 ${maxFiles} 个文件`);
            return;
        }

        onFilesSelect(fileArray);
        event.target.value = "";
    }, [onFilesSelect, maxFiles]);

    // 处理文件夹选择
    const handleFolderSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const fileArray = Array.from(files);
        if (fileArray.length > maxFiles) {
            message.warning(`最多只能选择 ${maxFiles} 个文件`);
            return;
        }

        // 从第一个文件的 webkitRelativePath 提取文件夹名
        const firstFile = fileArray[0];
        const relativePath = firstFile.webkitRelativePath;
        const extractedFolderName = relativePath.split("/")[0];

        if (onFolderSelect) {
            onFolderSelect(fileArray, extractedFolderName);
        }
        event.target.value = "";
    }, [onFolderSelect, maxFiles]);

    // 触发文件选择
    const triggerFileSelect = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    // 触发文件夹选择
    const triggerFolderSelect = useCallback(() => {
        folderInputRef.current?.click();
    }, []);

    // 拖拽事件处理
    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // 只有当离开整个拖拽区域时才设置为false
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDragOver(false);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;

        if (files.length > maxFiles) {
            message.warning(`最多只能选择 ${maxFiles} 个文件`);
            return;
        }

        // 检查是否包含文件夹（通过webkitRelativePath判断）
        const hasFolder = files.some(file => file.webkitRelativePath && file.webkitRelativePath.includes('/'));

        if (hasFolder && onFolderSelect) {
            // 文件夹拖拽
            const firstFile = files[0];
            const relativePath = firstFile.webkitRelativePath;
            const extractedFolderName = relativePath.split("/")[0];
            onFolderSelect(files, extractedFolderName);
        } else {
            // 文件拖拽
            onFilesSelect(files);
        }
    }, [onFilesSelect, onFolderSelect, maxFiles]);

    return {
        isDragOver,
        dragDropProps: {
            onDragEnter: handleDragEnter,
            onDragLeave: handleDragLeave,
            onDragOver: handleDragOver,
            onDrop: handleDrop,
        },
        fileInputRef,
        folderInputRef,
        handleFileSelect,
        handleFolderSelect,
        triggerFileSelect,
        triggerFolderSelect,
    };
};
