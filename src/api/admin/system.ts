import { request } from "@/utils/service"

export const SystemApi = new (class {
  resetCache() {
    return request<ApiResponseData<any>>({
      method: "POST",
      url: "v2/system/resetCache"
    })
  }
})()
