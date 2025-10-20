namespace go clipclick_web

struct EmptyRequest {}

struct PingReq {
	1: string Message,
}

struct PingResp {
	1: string Echo,
}
struct QueueMaterialReq {
    1: string MaterialID
    2: string MaterialURL
}

struct QueueMaterialResp {
    1: string MessageID
    2: string Status
}

// 账号相关结构体
struct TosStsTokenResp {
	1: required string region,
	2: required string endpoint,
	3: required string accessKeyId,
	4: required string accessKeySecret,
	5: required string stsToken,
	6: required string bucket,
}

// 文件夹相关结构体
struct Folder {
	1: required i64 id,
	2: required string name,
	3: required string tosKey,
	4: optional i64 parentId,
	5: optional string vectorIndex,
	6: required string ownerId,
	7: required i32 isPublic,
	8: required string createdAt,
	9: required string updatedAt,
}

struct FolderListReq {
	1: required i32 pageNo,
	2: required i32 pageSize,
}

struct FolderListResp {
	1: required list<Folder> folders,
	2: required i32 total,
}

struct FolderDetailReq {
	1: required i64 folderId (api.path="folderId"),
}

struct FolderDetailResp {
	1: required Folder folder,
}

struct FolderCreateReq {
	1: required string name,
	2: optional i64 parentId,
	3: optional string tosKey,
	4: optional string vectorIndex,
}

struct FolderCreateResp {
	1: required i64 folderId,
}

struct FolderUpdateReq {
	1: required i64 folderId (api.path="folderId"),
	2: optional string name,
	3: optional i64 parentId,
	4: optional string tosKey,
	5: optional string vectorIndex,
}

struct FolderUpdateResp {
	1: required bool success,
}

struct FolderDeleteReq {
	1: required i64 folderId,
}

struct FolderDeleteResp {
	1: required bool success,
}

// 素材相关结构体
struct Material {
	1: required i64 id,
	2: required i64 folderId,
	3: required string name,
	4: optional string attributes,
	5: optional i64 category,
	6: optional string modalData,
	7: optional string platformSource,
	8: optional i64 industry,
	9: required string url,
	10: optional string relatedInfo,
	11: optional string metaInfo,
	12: required i32 isApproved,
	13: optional string md5,
	14: required string ownerId,
	15: required i32 isPublic,
	16: required i32 understandingStatus,
	17: required string createdAt,
	18: required string updatedAt,
}

struct MaterialListReq {
	1: required i32 pageNo,
	2: required i32 pageSize,
	3: required i64 folderId,
}

struct MaterialListResp {
	1: required list<Material> materials,
	2: required i32 total,
}

struct MaterialDetailReq {
	1: required i64 materialId (api.path="materialId"),
}

struct MaterialDetailResp {
	1: required Material material,
}

struct MaterialCreateReq {
	1: required i64 folderId,
	2: required string name,
	3: optional string attributes,
	4: optional i64 category,
	5: optional string modalData,
	6: optional string platformSource,
	7: optional i64 industry,
	8: required string url,
	9: optional string relatedInfo,
	10: optional string metaInfo,
	11: optional i32 isApproved,
	12: optional string md5,
	13: optional i32 isPublic,
	14: optional i32 understandingStatus,
}

struct MaterialCreateResp {
	1: required i64 materialId,
}

struct MaterialUpdateReq {
	1: required i64 materialId (api.path="materialId"),
	2: optional i64 folderId,
	3: optional string name,
	4: optional string attributes,
	5: optional i64 category,
	6: optional string modalData,
	7: optional string platformSource,
	8: optional i64 industry,
	9: optional string url,
	10: optional string relatedInfo,
	11: optional string metaInfo,
	12: optional i32 isApproved,
	13: optional string md5,
	14: optional i32 isPublic,
	15: optional i32 understandingStatus,
}

struct MaterialUpdateResp {
	1: required bool success,
}

struct MaterialDeleteReq {
	1: required i64 materialId,
}

struct MaterialDeleteResp {
	1: required bool success,
}

// 商品相关结构体
struct Product {
	1: required i64 id,
	2: required string name,
	3: required i64 mainFolderId,
	4: required i64 captionFolderId,
	5: required i64 prefixFolderId,
	6: required i64 picFolderId,
	7: required string createdAt,
	8: required string updatedAt,
}

struct ProductListReq {
	1: required i32 pageNo,
	2: required i32 pageSize,
}

struct ProductListResp {
	1: required list<Product> products,
	2: required i32 total,
}

struct ProductDetailReq {
	1: required i64 productId (api.path="productId"),
}

struct ProductDetailResp {
	1: required Product product,
}

struct ProductCreateReq {
	1: required string name,
	2: required i64 mainFolderId,
	3: required i64 captionFolderId,
	4: required i64 prefixFolderId,
	5: required i64 picFolderId,
}

struct ProductCreateResp {
	1: required i64 productId,
}

struct ProductUpdateReq {
	1: required i64 productId (api.path="productId"),
	2: optional string name,
	3: optional i64 mainFolderId,
	4: optional i64 captionFolderId,
	5: optional i64 prefixFolderId,
	6: optional i64 picFolderId,
}

struct ProductUpdateResp {
	1: required bool success,
}

struct ProductDeleteReq {
	1: required i64 productId,
}

struct ProductDeleteResp {
	1: required bool success,
}

// 用户相关结构体
struct User {
	1: required i64 id,
	2: required string username,
	3: optional string email,
	4: optional string phone,
	5: required string createdAt,
	6: required string updatedAt,
	7: required i32 status,
}

struct UserRegisterReq {
	1: required string username,
	2: required string password,
	3: optional string email,
	4: optional string phone,
}

struct UserRegisterResp {
	1: required i64 userId,
	2: required string token,
	3: required string message,
}

struct UserLoginReq {
	1: required string username,
	2: required string password,
}

struct UserLoginResp {
	1: required i64 userId,
	2: required string token,
	3: required string message,
}

struct UserInfoResp {
	1: required User user,
	2: required string message,
}

struct UserUpdateReq {
	1: optional string username,
	2: optional string email,
	3: optional string password
	4: optional string phone
}

struct UserUpdateResp {
	1: required bool success,
	2: required string message,
}

struct UserDeleteReq {
	// 移除token字段，依赖认证中间件
}

service HttpWebService {
  /* -----------测试相关--------- */

  PingResp Ping(1: PingReq req)(api.post="/api/ping")

  QueueMaterialResp QueueMaterial (1:QueueMaterialReq req)(api.post="/api/material/queue")

  /* -----------账号相关--------- */
  // 获取TOS STS Token
  TosStsTokenResp GetTosStsToken(EmptyRequest req)(api.get="/api/account/tos-sts-token")

  /* -----------文件夹相关--------- */

  // 文件夹列表查询
  FolderListResp GetFolderList(1: FolderListReq req)(api.get="/api/folders")

  // 文件夹详情查询
  FolderDetailResp GetFolderDetail(1: FolderDetailReq req)(api.get="/api/folders/{folderId}")

  // 文件夹创建
  FolderCreateResp CreateFolder(1: FolderCreateReq req)(api.post="/api/folders")

  // 文件夹修改
  FolderUpdateResp UpdateFolder(1: FolderUpdateReq req)(api.put="/api/folders/{folderId}")

  // 文件夹删除
  FolderDeleteResp DeleteFolder(1: FolderDeleteReq req)(api.delete="/api/folders/{folderId}")


  /* -----------素材相关--------- */
  // 素材列表查询
  MaterialListResp GetMaterialList(1: MaterialListReq req)(api.get="/api/materials")

  // 素材详情查询
  MaterialDetailResp GetMaterialDetail(1: MaterialDetailReq req)(api.get="/api/materials/{materialId}")

  // 素材创建
  MaterialCreateResp CreateMaterial(1: MaterialCreateReq req)(api.post="/api/materials")

  // 素材修改
  MaterialUpdateResp UpdateMaterial(1: MaterialUpdateReq req)(api.put="/api/materials/{materialId}")

  // 素材删除
  MaterialDeleteResp DeleteMaterial(1: MaterialDeleteReq req)(api.delete="/api/materials/{materialId}")


  /* -----------商品相关--------- */
  // 商品列表查询
  ProductListResp GetProductList(1: ProductListReq req)(api.get="/api/products")

  // 商品详情查询
  ProductDetailResp GetProductDetail(1: ProductDetailReq req)(api.get="/api/products/{productId}")

  // 商品创建
  ProductCreateResp CreateProduct(1: ProductCreateReq req)(api.post="/api/products")

  // 商品修改
  ProductUpdateResp UpdateProduct(1: ProductUpdateReq req)(api.put="/api/products/{productId}")

  // 商品删除
  ProductDeleteResp DeleteProduct(1: ProductDeleteReq req)(api.delete="/api/products/{productId}")

  /* -----------用户相关--------- */
  // 用户注册
  UserRegisterResp RegisterUser(1: UserRegisterReq req)(api.post="/api/user/register")

  // 用户登录
  UserLoginResp LoginUser(1: UserLoginReq req)(api.post="/api/user/login")

  // 获取用户信息
  UserInfoResp GetUserInfo(1: EmptyRequest req)(api.get="/api/user/info")

  // 更新用户信息
  UserUpdateResp UpdateUser(1: UserUpdateReq req)(api.put="/api/user/update")

}