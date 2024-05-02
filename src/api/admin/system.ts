import { request } from "@/utils/service"

export interface DatabaseItem {
  name: string
  tables: TableInfo[]
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
  human: {
    avg_row_size: string
    total_size: string
    data_size: string
    index_size: string
    data_free_size: string
  }
}

export const SystemApi = new (class {
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
