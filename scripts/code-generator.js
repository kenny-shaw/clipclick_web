const fs = require('fs-extra');
const path = require('path');

class CodeGenerator {
  constructor(config) {
    this.config = config;
    this.outputDir = config.idl.outputDir;
    this.tempDir = config.idl.tempDir;
    this.generationConfig = config.generation;
    this.clientsConfig = config.clients;
  }

  /**
   * 生成TypeScript代码
   */
  async generateCode() {
    try {
      console.log('🔄 开始生成TypeScript代码...');

      // 动态导入thrift-typescript
      const { generate } = await import('@creditkarma/thrift-typescript');

      // 确保输出目录存在
      await fs.ensureDir(this.outputDir);

      // 清空输出目录
      await fs.emptyDir(this.outputDir);

      // 获取IDL文件列表
      const idlFiles = await this.getIDLFiles();

      if (idlFiles.length === 0) {
        throw new Error('未找到IDL文件');
      }

      console.log(`📁 找到 ${idlFiles.length} 个IDL文件:`, idlFiles.map(f => f.name));

      // 生成代码
      await generate({
        rootDir: process.cwd(),
        sourceDir: this.tempDir,
        outDir: this.outputDir,
        target: this.generationConfig.target,
        files: idlFiles.map(f => f.name),
        fallbackNamespace: this.generationConfig.fallbackNamespace
      });

      console.log('✅ TypeScript代码生成完成');

      // 生成客户端代码
      if (this.clientsConfig) {
        await this.generateClients();
      }

    } catch (error) {
      console.error('❌ 生成代码失败:', error.message);
      throw error;
    }
  }

  /**
   * 获取IDL文件列表
   */
  async getIDLFiles() {
    const files = await fs.readdir(this.tempDir);
    return files
      .filter(file => file.endsWith('.thrift'))
      .map(file => ({
        name: file,
        path: path.join(this.tempDir, file)
      }));
  }

  /**
   * 生成客户端代码
   */
  async generateClients() {
    try {
      console.log('🔄 开始生成客户端代码...');

      // 确保客户端输出目录存在
      await fs.ensureDir(this.clientsConfig.outputDir);

      // 清空客户端目录
      await fs.emptyDir(this.clientsConfig.outputDir);

      // 解析IDL文件，提取API端点信息
      const servicesMap = await this.parseIDLEndpoints();

      console.log(`📋 发现 ${servicesMap.size} 个服务:`, Array.from(servicesMap.keys()));

      console.log('servicesMap', servicesMap.values())
      // 为每个发现的服务生成客户端
      for (const [serviceName, endpoints] of servicesMap) {
        await this.generateServiceClient(serviceName, endpoints);
      }

      // 生成统一的客户端导出文件
      await this.generateClientsIndex(servicesMap);

      console.log('✅ 客户端代码生成完成');

    } catch (error) {
      console.error('❌ 生成客户端代码失败:', error.message);
      throw error;
    }
  }

  /**
   * 生成单个服务的客户端
   */
  async generateServiceClient(serviceName, endpoints) {
    const clientPath = path.join(this.clientsConfig.outputDir, `${serviceName}Client.ts`);

    // 生成方法实现
    const methods = endpoints.map(endpoint => {
      const methodName = endpoint.methodName;
      const httpMethod = endpoint.httpMethod;
      const endpointPath = endpoint.endpoint;
      const returnType = endpoint.returnType;
      const requestType = endpoint.requestType;

      // 处理路径参数
      const hasPathParams = endpointPath.includes('{');
      let pathProcessing = '';
      let processedEndpointPath = endpointPath;

      if (hasPathParams) {
        // 提取路径参数并替换
        const pathParams = endpointPath.match(/\{(\w+)\}/g) || [];
        pathProcessing = pathParams.map(param => {
          const paramName = param.slice(1, -1); // 去掉大括号
          return `    const path = '${endpointPath}'.replace('{${paramName}}', String(req.${paramName} || ''));`;
        }).join('\n');
        processedEndpointPath = 'path';
      }

      // 根据HTTP方法选择对应的请求方法
      let requestMethod;
      const endpointStr = hasPathParams ? processedEndpointPath : `'${endpointPath}'`;

      if (httpMethod === 'GET') {
        requestMethod = `this.requestInstance.get<I${returnType}Args>(${endpointStr}, req)`;
      } else if (httpMethod === 'POST') {
        requestMethod = `this.requestInstance.post<I${returnType}Args>(${endpointStr}, req)`;
      } else if (httpMethod === 'PUT') {
        requestMethod = `this.requestInstance.put<I${returnType}Args>(${endpointStr}, req)`;
      } else if (httpMethod === 'DELETE') {
        requestMethod = `this.requestInstance.delete<I${returnType}Args>(${endpointStr})`;
      }

      return `  /**
   * ${methodName}
   */
  async ${methodName}(req: I${requestType}Args): Promise<I${returnType}Args> {
${pathProcessing}
    const response = await ${requestMethod};
    return response;
  }`;
    }).join('\n\n');

    const clientContent = `/* tslint:disable */
/* eslint-disable */
/*
 * 自动生成的客户端代码
 * 请勿手动修改此文件
 */

import { ${endpoints.map(e => `I${e.requestType}Args, I${e.returnType}Args`).join(', ')} } from '../generated';
import { RequestInstance } from '../request';

export interface ClientConfig {
  baseUrl?: string;
  requestInstance?: RequestInstance;
}

export class ${serviceName}Client {
  private requestInstance: RequestInstance;

  constructor(config: ClientConfig = {}) {
    this.requestInstance = config.requestInstance || new RequestInstance(config.baseUrl);
  }

${methods}
}

// 创建默认实例
export const ${this.toCamelCase(serviceName)}Client = new ${serviceName}Client();

export default ${this.toCamelCase(serviceName)}Client;
`;

    await fs.writeFile(clientPath, clientContent, 'utf8');
    console.log(`📄 生成客户端: ${serviceName}Client.ts`);
  }

  /**
   * 生成客户端统一导出文件
   */
  async generateClientsIndex(servicesMap) {
    const indexPath = path.join(this.clientsConfig.outputDir, 'index.ts');

    const exports = Array.from(servicesMap.keys()).map(serviceName => {
      const clientName = this.toCamelCase(serviceName);
      return `export { ${serviceName}Client, ${clientName}Client } from './${serviceName}Client'`;
    }).join('\n');

    const indexContent = `/* tslint:disable */
/* eslint-disable */
/*
 * 自动生成的客户端导出文件
 * 请勿手动修改此文件
 */

${exports}
`;

    await fs.writeFile(indexPath, indexContent, 'utf8');
    console.log('📄 生成客户端导出文件: index.ts');
  }


  /**
   * 将字符串转换为驼峰命名
   */
  toCamelCase(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  /**
   * 解析IDL文件，提取API端点信息
   */
  async parseIDLEndpoints() {
    const idlFiles = await this.getIDLFiles();
    const services = new Map(); // 使用Map来存储每个服务的端点

    for (const file of idlFiles) {
      const content = await fs.readFile(file.path, 'utf8');

      // 1. 先找到所有的service定义
      const serviceRegex = /service\s+(\w+)\s*\{/g;
      const servicesInFile = [];
      let serviceMatch;
      while ((serviceMatch = serviceRegex.exec(content)) !== null) {
        servicesInFile.push(serviceMatch[1]);
      }

      // 2. 如果没有找到service定义，使用文件名作为服务名
      if (servicesInFile.length === 0) {
        const fileName = file.name.replace('.thrift', '');
        servicesInFile.push(fileName);
      }

      // 3. 为每个服务解析端点
      for (const serviceName of servicesInFile) {
        if (!services.has(serviceName)) {
          services.set(serviceName, []);
        }

        // 匹配API注解的正则表达式，提取返回类型、方法名、请求类型、HTTP方法和端点
        const apiRegex = /(\w+)\s+(\w+)\(\d+:\s*(\w+)\s+\w+\)\s*\(api\.(get|post|put|delete)="([^"]+)"\)/g;
        let match;

        while ((match = apiRegex.exec(content)) !== null) {
          const [, returnType, methodName, requestType, httpMethod, endpoint] = match;
          services.get(serviceName).push({
            methodName,
            returnType,
            requestType,
            httpMethod: httpMethod.toUpperCase(),
            endpoint,
            serviceName
          });
        }
      }
    }

    return services;
  }

}

module.exports = CodeGenerator;
