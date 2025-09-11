// 部门信息接口
export interface DeptInfo {
    createBy: string | null;
    createTime: string | null;
    updateBy: string | null;
    updateTime: string | null;
    remark: string | null;
    deleted: string | null;
    deptId: number;
    parentId: number;
    ancestors: string;
    deptName: string;
    orderNum: number;
    leader: string;
    phone: string | null;
    email: string | null;
    status: string;
    delFlag: string | null;
    parentName: string | null;
    children: DeptInfo[];
}

// 角色信息接口
export interface RoleInfo {
    createBy: string | null;
    createTime: string | null;
    updateBy: string | null;
    updateTime: string | null;
    remark: string | null;
    deleted: string | null;
    roleId: number;
    roleName: string;
    roleKey: string;
    roleSort: number;
    dataScope: string;
    menuCheckStrictly: boolean;
    deptCheckStrictly: boolean;
    status: string;
    delFlag: string | null;
    flag: boolean;
    menuIds: number[] | null;
    deptIds: number[] | null;
    permissions: string[];
    admin: boolean;
}

// 租户配置信息接口
export interface TosConfig {
    bucket: string;
    endpoint: string;
    host: string;
    accessKey: string;
    region: string;
    accessSecret: string;
}

// 租户信息接口
export interface TenantInfo {
    createBy: string;
    createTime: string;
    updateBy: string | null;
    updateTime: string | null;
    remark: string | null;
    deleted: string | null;
    tenantId: number;
    tenantName: string;
    tosConfig: TosConfig;
    delFlag: string | null;
}

// 社交认证信息接口
export interface SocialAuthInfo {
    createBy: string;
    createTime: string;
    updateBy: string;
    updateTime: string;
    remark: string | null;
    deleted: string | null;
    id: number;
    phoneNum: string;
    platformName: string;
    cookieUrl: string;
    userId: number;
}

// 用户信息接口
export interface UserInfo {
    createBy: string;
    createTime: string;
    updateBy: string | null;
    updateTime: string | null;
    remark: string | null;
    deleted: string | null;
    userId: number;
    deptId: number;
    userName: string;
    nickName: string;
    email: string;
    phonenumber: string;
    sex: string;
    avatar: string;
    password: string;
    status: string;
    delFlag: string;
    loginIp: string;
    loginDate: string;
    dept: DeptInfo;
    roles: RoleInfo[];
    roleIds: number[] | null;
    postIds: number[] | null;
    roleId: number | null;
    tenantId: number;
    tenant: TenantInfo;
    admin: boolean;
}

// 登录请求参数
export interface LoginParams {
    username: string;
    password: string;
}

// 注册请求参数
export interface RegisterParams {
    username: string;
    password: string;
    tenantId: number;
}

// 登录响应类型
export interface LoginResponse {
    token: string;
    permissions: string[];
    roles: string[];
    user: UserInfo;
}

// 用户信息响应类型
export interface UserInfoResponse {
    user: UserInfo;
    permissions: string[];
    roles: string[];
    social_auth: SocialAuthInfo[];
}

// 租户查询请求参数
export interface TenantQueryParams {
    tenantName: string;
    [key: string]: string | number | undefined;
}

// 租户查询响应类型
export interface TenantQueryResponse {
    tenantId: number;
    name: string;
}

// TOS 临时 token 数据接口
export interface TosTempTokenData {
    accessKey: string;
    secretKey: string;
    currentTime: string;
    expireTime: string;
    token: string;
}

// TOS 临时 token 响应类型
export interface TosTempTokenResponse {
    data: TosTempTokenData;
} 