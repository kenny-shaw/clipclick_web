/* tslint:disable */
/* eslint-disable */
/*
 * 自动生成的客户端代码
 * 请勿手动修改此文件
 */

import { IPingReqArgs, IPingRespArgs, IFolderListReqArgs, IFolderListRespArgs, IFolderDetailReqArgs, IFolderDetailRespArgs, IFolderCreateReqArgs, IFolderCreateRespArgs, IFolderUpdateReqArgs, IFolderUpdateRespArgs, IFolderDeleteReqArgs, IFolderDeleteRespArgs, IMaterialListReqArgs, IMaterialListRespArgs, IMaterialDetailReqArgs, IMaterialDetailRespArgs, IMaterialCreateReqArgs, IMaterialCreateRespArgs, IMaterialUpdateReqArgs, IMaterialUpdateRespArgs, IMaterialDeleteReqArgs, IMaterialDeleteRespArgs, IProductListReqArgs, IProductListRespArgs, IProductDetailReqArgs, IProductDetailRespArgs, IProductCreateReqArgs, IProductCreateRespArgs, IProductUpdateReqArgs, IProductUpdateRespArgs, IProductDeleteReqArgs, IProductDeleteRespArgs, IUserRegisterReqArgs, IUserRegisterRespArgs, IUserLoginReqArgs, IUserLoginRespArgs, IEmptyRequestArgs, IUserInfoRespArgs, IUserUpdateReqArgs, IUserUpdateRespArgs } from '../generated';
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
  async Ping(req: IPingReqArgs): Promise<IPingRespArgs> {

    const response = await this.requestInstance.post<IPingRespArgs>('/api/ping', req);
    return response;
  }

  /**
   * GetFolderList
   */
  async GetFolderList(req: IFolderListReqArgs): Promise<IFolderListRespArgs> {

    const response = await this.requestInstance.get<IFolderListRespArgs>('/api/folders', req);
    return response;
  }

  /**
   * GetFolderDetail
   */
  async GetFolderDetail(req: IFolderDetailReqArgs): Promise<IFolderDetailRespArgs> {
    const path = '/api/folders/{folderId}'.replace('{folderId}', String(req.folderId || ''));
    const response = await this.requestInstance.get<IFolderDetailRespArgs>(path, req);
    return response;
  }

  /**
   * CreateFolder
   */
  async CreateFolder(req: IFolderCreateReqArgs): Promise<IFolderCreateRespArgs> {

    const response = await this.requestInstance.post<IFolderCreateRespArgs>('/api/folders', req);
    return response;
  }

  /**
   * UpdateFolder
   */
  async UpdateFolder(req: IFolderUpdateReqArgs): Promise<IFolderUpdateRespArgs> {
    const path = '/api/folders/{folderId}'.replace('{folderId}', String(req.folderId || ''));
    const response = await this.requestInstance.put<IFolderUpdateRespArgs>(path, req);
    return response;
  }

  /**
   * DeleteFolder
   */
  async DeleteFolder(req: IFolderDeleteReqArgs): Promise<IFolderDeleteRespArgs> {
    const path = '/api/folders/{folderId}'.replace('{folderId}', String(req.folderId || ''));
    const response = await this.requestInstance.delete<IFolderDeleteRespArgs>(path);
    return response;
  }

  /**
   * GetMaterialList
   */
  async GetMaterialList(req: IMaterialListReqArgs): Promise<IMaterialListRespArgs> {

    const response = await this.requestInstance.get<IMaterialListRespArgs>('/api/materials', req);
    return response;
  }

  /**
   * GetMaterialDetail
   */
  async GetMaterialDetail(req: IMaterialDetailReqArgs): Promise<IMaterialDetailRespArgs> {
    const path = '/api/materials/{materialId}'.replace('{materialId}', String(req.materialId || ''));
    const response = await this.requestInstance.get<IMaterialDetailRespArgs>(path, req);
    return response;
  }

  /**
   * CreateMaterial
   */
  async CreateMaterial(req: IMaterialCreateReqArgs): Promise<IMaterialCreateRespArgs> {

    const response = await this.requestInstance.post<IMaterialCreateRespArgs>('/api/materials', req);
    return response;
  }

  /**
   * UpdateMaterial
   */
  async UpdateMaterial(req: IMaterialUpdateReqArgs): Promise<IMaterialUpdateRespArgs> {
    const path = '/api/materials/{materialId}'.replace('{materialId}', String(req.materialId || ''));
    const response = await this.requestInstance.put<IMaterialUpdateRespArgs>(path, req);
    return response;
  }

  /**
   * DeleteMaterial
   */
  async DeleteMaterial(req: IMaterialDeleteReqArgs): Promise<IMaterialDeleteRespArgs> {
    const path = '/api/materials/{materialId}'.replace('{materialId}', String(req.materialId || ''));
    const response = await this.requestInstance.delete<IMaterialDeleteRespArgs>(path);
    return response;
  }

  /**
   * GetProductList
   */
  async GetProductList(req: IProductListReqArgs): Promise<IProductListRespArgs> {

    const response = await this.requestInstance.get<IProductListRespArgs>('/api/products', req);
    return response;
  }

  /**
   * GetProductDetail
   */
  async GetProductDetail(req: IProductDetailReqArgs): Promise<IProductDetailRespArgs> {
    const path = '/api/products/{productId}'.replace('{productId}', String(req.productId || ''));
    const response = await this.requestInstance.get<IProductDetailRespArgs>(path, req);
    return response;
  }

  /**
   * CreateProduct
   */
  async CreateProduct(req: IProductCreateReqArgs): Promise<IProductCreateRespArgs> {

    const response = await this.requestInstance.post<IProductCreateRespArgs>('/api/products', req);
    return response;
  }

  /**
   * UpdateProduct
   */
  async UpdateProduct(req: IProductUpdateReqArgs): Promise<IProductUpdateRespArgs> {
    const path = '/api/products/{productId}'.replace('{productId}', String(req.productId || ''));
    const response = await this.requestInstance.put<IProductUpdateRespArgs>(path, req);
    return response;
  }

  /**
   * DeleteProduct
   */
  async DeleteProduct(req: IProductDeleteReqArgs): Promise<IProductDeleteRespArgs> {
    const path = '/api/products/{productId}'.replace('{productId}', String(req.productId || ''));
    const response = await this.requestInstance.delete<IProductDeleteRespArgs>(path);
    return response;
  }

  /**
   * RegisterUser
   */
  async RegisterUser(req: IUserRegisterReqArgs): Promise<IUserRegisterRespArgs> {

    const response = await this.requestInstance.post<IUserRegisterRespArgs>('/api/user/register', req);
    return response;
  }

  /**
   * LoginUser
   */
  async LoginUser(req: IUserLoginReqArgs): Promise<IUserLoginRespArgs> {

    const response = await this.requestInstance.post<IUserLoginRespArgs>('/api/user/login', req);
    return response;
  }

  /**
   * GetUserInfo
   */
  async GetUserInfo(req: IEmptyRequestArgs): Promise<IUserInfoRespArgs> {

    const response = await this.requestInstance.get<IUserInfoRespArgs>('/api/user/info', req);
    return response;
  }

  /**
   * UpdateUser
   */
  async UpdateUser(req: IUserUpdateReqArgs): Promise<IUserUpdateRespArgs> {

    const response = await this.requestInstance.put<IUserUpdateRespArgs>('/api/user/update', req);
    return response;
  }
}

// 创建默认实例
export const httpWebServiceClient = new HttpWebServiceClient();

export default httpWebServiceClient;
