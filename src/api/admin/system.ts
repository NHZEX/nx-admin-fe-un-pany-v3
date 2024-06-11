import { request } from "@/utils/service"

export interface SystemSettings {
  // 启用登录验证码
  loginCaptcha: boolean
}

export interface DatabaseItem {
  name: string
  table: TableInfo[]
  version: string
  message: string | null
}

export interface TableInfo {
  table_schema: string
  table_name: string
  auto_increment: number
  table_rows: number
  avg_row_length: number
  data_length: number
  index_length: number
  data_free: number
  create_time: string
  update_time: string
  table_comment: string
  partition: PartitionInfo[] | null
  human: {
    avg_row_size: string
    total_size: string
    data_size: string
    index_size: string
    data_free_size: string
  }
}

export interface PartitionInfo {
  table_name: string
  partition_name: string
  subpartition_name: string | null
  partition_method: string
  subpartition_method: string | null
  partition_expression: string
  subpartition_expression: string | null
  partition_description: string
  table_rows: number
  avg_row_length: number
  data_length: number
  max_data_length: number
  index_length: number
  data_free: number
  create_time: string
  update_time: string | null
  check_time: string | null
  human: {
    avg_row_size: string
    data_size: string
    index_size: string
    total_size: string
    data_free_size: string
  }
}

export const SystemApi = new (class {
  config() {
    return request<ApiResponseData<SystemSettings>>({
      method: "get",
      url: "v2/system/config",
      authorization: false
    })
  }

  resetCache() {
    return request<ApiResponseData<any>>({
      method: "POST",
      url: "v2/system/resetCache"
    })
  }

  systemInfo() {
    return request<ApiResponseData<any>>({
      method: "GET",
      url: "v2/system/sysinfo"
    })
  }

  database() {
    return request<ApiResponseData<DatabaseItem[]>>({
      method: "GET",
      url: "v2/system/database"
    })
  }
})()
