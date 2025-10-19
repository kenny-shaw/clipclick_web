#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs-extra');
const path = require('path');
const IDLSync = require('../scripts/thrift-sync');
const CodeGenerator = require('../scripts/code-generator');

const program = new Command();

program
    .name('sync-api')
    .description('从Gitee拉取IDL文件并生成TypeScript API代码')
    .version('1.0.0')
    .option('-c, --config <path>', '配置文件路径', 'api.config.json')
    .option('-b, --branch <branch>', '指定分支', 'main')
    .option('--no-cleanup', '不清理临时文件')
    .action(async (options) => {
        try {
            console.log('🚀 开始同步API...');

            // 加载配置文件
            const configPath = path.resolve(options.config);
            if (!await fs.pathExists(configPath)) {
                console.error(`❌ 配置文件不存在: ${configPath}`);
                process.exit(1);
            }

            const config = await fs.readJson(configPath);

            // 如果指定了分支，覆盖配置
            if (options.branch) {
                config.gitee.branch = options.branch;
            }

            console.log(`📋 使用配置:`, {
                owner: config.gitee.owner,
                repo: config.gitee.repo,
                branch: config.gitee.branch,
                scanDir: config.idl.scanDir || '根目录'
            });

            // 创建IDL同步器
            const idlSync = new IDLSync(config);

            // 拉取IDL文件
            await idlSync.pullLatestIDL();

            // 创建代码生成器
            const codeGenerator = new CodeGenerator(config);

            // 生成TypeScript代码
            await codeGenerator.generateCode();

            // 清理临时文件
            if (options.cleanup !== false) {
                // 不清理IDL文件，保留在tempDir中
                console.log(`📁 IDL文件已保留在: ${config.idl.tempDir}`);
            }

            console.log('🎉 API同步完成！');
            console.log(`📁 生成的代码位于: ${config.idl.outputDir}`);

        } catch (error) {
            console.error('❌ 同步失败:', error.message);
            process.exit(1);
        }
    });

// 解析命令行参数
program.parse();
