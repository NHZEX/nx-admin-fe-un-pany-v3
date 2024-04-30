import { request } from "@/utils/service"

export type PermissionTreeResponseData = ApiResponseData<PermissionTree[]>

export type PermissionSet = string[]

export interface PermissionTree {
  name: string
  children?: PermissionTree[]
  [allow: number]: string
  title: string
  desc: string
  pid: string
  sort: number
  spread: boolean
  valid: boolean
}

export const PermissionApi = new (class {
  all() {
    return request<PermissionTreeResponseData>({
      method: "get",
      url: "v2/admin/permission/tree"
    })
  }

  read(id: string) {
    return request<ApiResponseData<any>>({
      method: "get",
      url: `v2/admin/permission/${id}`
    })
  }

  scan() {
    return request<ApiResponseData<any>>({
      method: "post",
      url: `v2/admin/permission/scan`
    })
  }
})()
