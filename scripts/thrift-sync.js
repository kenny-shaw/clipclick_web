const fs = require('fs-extra');
const path = require('path');

class IDLSync {
    constructor(config) {
        this.config = config;
        this.owner = config.gitee.owner;
        this.repo = config.gitee.repo;
        this.branch = config.gitee.branch;
        this.idlFiles = config.idl.files;
        this.scanDir = config.idl.scanDir;
        this.tempDir = config.idl.tempDir;
        this.octokit = null;
    }

    async init() {
        if (!this.octokit) {
            const { Octokit } = await import('@octokit/rest');
            this.octokit = new Octokit({
                auth: this.config.gitee.token,
                baseUrl: 'https://gitee.com/api/v5' // Gitee API地址
            });
        }
    }

    /**
     * 拉取最新的IDL文件
     */
    async pullLatestIDL() {
        try {
            console.log('🔄 开始拉取IDL文件...');

            // 初始化Octokit
            await this.init();

            // 确保临时目录存在
            await fs.ensureDir(this.tempDir);

            // 清空临时目录
            await fs.emptyDir(this.tempDir);

            // 获取仓库内容
            let repoContents;
            if (this.scanDir) {
                // 如果指定了扫描目录，直接获取该目录内容
                const { data } = await this.octokit.repos.getContent({
                    owner: this.owner,
                    repo: this.repo,
                    ref: this.branch,
                    path: this.scanDir
                });
                repoContents = data;
            } else {
                // 否则获取根目录内容
                const { data } = await this.octokit.repos.getContent({
                    owner: this.owner,
                    repo: this.repo,
                    ref: this.branch
                });
                repoContents = data;
            }

            // 查找IDL文件
            const idlFiles = await this.findIDLFiles(repoContents);

            // 下载IDL文件
            for (const file of idlFiles) {
                await this.downloadIDLFile(file);
            }

            console.log('✅ IDL文件拉取完成');
            return this.tempDir;

        } catch (error) {
            console.error('❌ 拉取IDL文件失败:', error.message);
            throw error;
        }
    }

    /**
     * 查找IDL文件
     */
    async findIDLFiles(contents, currentPath = '') {
        const idlFiles = [];

        for (const item of contents) {
            const itemPath = path.join(currentPath, item.name);

            if (item.type === 'file' && item.name.endsWith('.thrift')) {
                // 如果配置了特定文件列表，只处理列表中的文件
                if (this.idlFiles && this.idlFiles.length > 0) {
                    if (this.idlFiles.includes(item.name)) {
                        idlFiles.push({
                            name: item.name,
                            path: this.scanDir ? `${this.scanDir}/${item.name}` : itemPath,
                            download_url: item.download_url
                        });
                    }
                } else {
                    // 如果没有配置特定文件列表，处理所有.thrift文件
                    idlFiles.push({
                        name: item.name,
                        path: this.scanDir ? `${this.scanDir}/${item.name}` : itemPath,
                        download_url: item.download_url
                    });
                }
            } else if (item.type === 'dir' && !this.scanDir) {
                // 只有在没有指定扫描目录时才递归查找子目录
                try {
                    const { data: subContents } = await this.octokit.repos.getContent({
                        owner: this.owner,
                        repo: this.repo,
                        ref: this.branch,
                        path: itemPath
                    });

                    const subFiles = await this.findIDLFiles(subContents, itemPath);
                    idlFiles.push(...subFiles);
                } catch (error) {
                    console.warn(`⚠️ 无法访问子目录 ${itemPath}:`, error.message);
                }
            }
        }

        return idlFiles;
    }

    /**
     * 下载单个IDL文件
     */
    async downloadIDLFile(file) {
        try {
            console.log(`📥 下载文件: ${file.name}`);

            // 使用Octokit的getContent方法下载文件内容
            const { data: fileContent } = await this.octokit.repos.getContent({
                owner: this.owner,
                repo: this.repo,
                ref: this.branch,
                path: file.path
            });

            // 解码base64内容
            const content = Buffer.from(fileContent.content, 'base64').toString('utf8');

            const filePath = path.join(this.tempDir, file.name);
            await fs.writeFile(filePath, content, 'utf8');

            console.log(`✅ 文件下载完成: ${file.name}`);

        } catch (error) {
            console.error(`❌ 下载文件失败 ${file.name}:`, error.message);
            throw error;
        }
    }

    /**
     * 清理临时文件
     */
    async cleanup() {
        try {
            await fs.remove(this.tempDir);
            console.log('🧹 临时文件清理完成');
        } catch (error) {
            console.warn('⚠️ 清理临时文件失败:', error.message);
        }
    }
}

module.exports = IDLSync;
