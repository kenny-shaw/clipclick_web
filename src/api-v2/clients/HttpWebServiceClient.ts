/* tslint:disable */
/* eslint-disable */
/*
 * 自动生成的客户端代码
 * 请勿手动修改此文件
 */

import { PingResp, TosStsTokenResp, FolderListResp, FolderDetailResp, FolderCreateResp, FolderUpdateResp, FolderDeleteResp, MaterialListResp, MaterialDetailResp, MaterialCreateResp, MaterialUpdateResp, MaterialDeleteResp, ProductListResp, ProductDetailResp, ProductCreateResp, ProductUpdateResp, ProductDeleteResp, UserRegisterResp, UserLoginResp, UserInfoResp, UserUpdateResp } from '../generated';
import { RequestInstance } from '../request';

export interface ClientConfig {
  baseUrl?: string;
  requestInstance?: RequestInstance;
}

export class HttpWebServiceClient {
  private requestInstance: RequestInstance;

  constructor(config: ClientConfig = {}) {
    this.requestInstance = config.requestInstance || new RequestInstance(config.baseUrl);
  }

  /**
   * Ping
   */
  async Ping(req: any): Promise<PingResp> {

    const response = await this.requestInstance.post<PingResp>('/api/ping', req);
    return response;
  }

  /**
   * GetTosStsToken
   */
  async GetTosStsToken(req: any): Promise<TosStsTokenResp> {

    const response = await this.requestInstance.get<TosStsTokenResp>('/api/account/tos-sts-token', req);
    return response;
  }

  /**
   * GetFolderList
   */
  async GetFolderList(req: any): Promise<FolderListResp> {

    const response = await this.requestInstance.get<FolderListResp>('/api/folders', req);
    return response;
  }

  /**
   * GetFolderDetail
   */
  async GetFolderDetail(req: any): Promise<FolderDetailResp> {
    const path = '/api/folders/{folderId}'.replace('{folderId}', req.folderId || '');
    const response = await this.requestInstance.get<FolderDetailResp>(path, req);
    return response;
  }

  /**
   * CreateFolder
   */
  async CreateFolder(req: any): Promise<FolderCreateResp> {

    const response = await this.requestInstance.post<FolderCreateResp>('/api/folders', req);
    return response;
  }

  /**
   * UpdateFolder
   */
  async UpdateFolder(req: any): Promise<FolderUpdateResp> {
    const path = '/api/folders/{folderId}'.replace('{folderId}', req.folderId || '');
    const response = await this.requestInstance.put<FolderUpdateResp>(path, req);
    return response;
  }

  /**
   * DeleteFolder
   */
  async DeleteFolder(req: any): Promise<FolderDeleteResp> {
    const path = '/api/folders/{folderId}'.replace('{folderId}', req.folderId || '');
    const response = await this.requestInstance.delete<FolderDeleteResp>(path);
    return response;
  }

  /**
   * GetMaterialList
   */
  async GetMaterialList(req: any): Promise<MaterialListResp> {

    const response = await this.requestInstance.get<MaterialListResp>('/api/materials', req);
    return response;
  }

  /**
   * GetMaterialDetail
   */
  async GetMaterialDetail(req: any): Promise<MaterialDetailResp> {
    const path = '/api/materials/{materialId}'.replace('{materialId}', req.materialId || '');
    const response = await this.requestInstance.get<MaterialDetailResp>(path, req);
    return response;
  }

  /**
   * CreateMaterial
   */
  async CreateMaterial(req: any): Promise<MaterialCreateResp> {

    const response = await this.requestInstance.post<MaterialCreateResp>('/api/materials', req);
    return response;
  }

  /**
   * UpdateMaterial
   */
  async UpdateMaterial(req: any): Promise<MaterialUpdateResp> {
    const path = '/api/materials/{materialId}'.replace('{materialId}', req.materialId || '');
    const response = await this.requestInstance.put<MaterialUpdateResp>(path, req);
    return response;
  }

  /**
   * DeleteMaterial
   */
  async DeleteMaterial(req: any): Promise<MaterialDeleteResp> {
    const path = '/api/materials/{materialId}'.replace('{materialId}', req.materialId || '');
    const response = await this.requestInstance.delete<MaterialDeleteResp>(path);
    return response;
  }

  /**
   * GetProductList
   */
  async GetProductList(req: any): Promise<ProductListResp> {

    const response = await this.requestInstance.get<ProductListResp>('/api/products', req);
    return response;
  }

  /**
   * GetProductDetail
   */
  async GetProductDetail(req: any): Promise<ProductDetailResp> {
    const path = '/api/products/{productId}'.replace('{productId}', req.productId || '');
    const response = await this.requestInstance.get<ProductDetailResp>(path, req);
    return response;
  }

  /**
   * CreateProduct
   */
  async CreateProduct(req: any): Promise<ProductCreateResp> {

    const response = await this.requestInstance.post<ProductCreateResp>('/api/products', req);
    return response;
  }

  /**
   * UpdateProduct
   */
  async UpdateProduct(req: any): Promise<ProductUpdateResp> {
    const path = '/api/products/{productId}'.replace('{productId}', req.productId || '');
    const response = await this.requestInstance.put<ProductUpdateResp>(path, req);
    return response;
  }

  /**
   * DeleteProduct
   */
  async DeleteProduct(req: any): Promise<ProductDeleteResp> {
    const path = '/api/products/{productId}'.replace('{productId}', req.productId || '');
    const response = await this.requestInstance.delete<ProductDeleteResp>(path);
    return response;
  }

  /**
   * RegisterUser
   */
  async RegisterUser(req: any): Promise<UserRegisterResp> {

    const response = await this.requestInstance.post<UserRegisterResp>('/api/user/register', req);
    return response;
  }

  /**
   * LoginUser
   */
  async LoginUser(req: any): Promise<UserLoginResp> {

    const response = await this.requestInstance.post<UserLoginResp>('/api/user/login', req);
    return response;
  }

  /**
   * GetUserInfo
   */
  async GetUserInfo(req: any): Promise<UserInfoResp> {

    const response = await this.requestInstance.get<UserInfoResp>('/api/user/info', req);
    return response;
  }

  /**
   * UpdateUser
   */
  async UpdateUser(req: any): Promise<UserUpdateResp> {

    const response = await this.requestInstance.put<UserUpdateResp>('/api/user/update', req);
    return response;
  }
}

// 创建默认实例
export const httpwebserviceClient = new HttpWebServiceClient();

export default httpwebserviceClient;
