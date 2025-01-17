import "axios"

declare module "axios" {
  export interface AxiosRequestConfig {
    // 是否启用鉴权流程
    authorization?: boolean
    // 是否直接导出响应数据
    extractData?: boolean
    // 是否静默错误通知
    silentErrorNotify?: boolean
  }
}
