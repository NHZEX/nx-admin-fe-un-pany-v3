import { request } from "@/utils/service"

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
    return request<ApiResponseData<any>>({
      method: "GET",
      url: "v2/system/database"
    })
  }
})()
