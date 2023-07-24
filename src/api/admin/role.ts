import { request } from "@/utils/service"

export interface UserItem {
  id: number
  create_time: number
  update_time: number
  lock_version: number
}

export type RolePageInfoResponseData = PageListResponseData<UserItem>

export type RoleInfoResponseData = ApiResponseData<UserItem>

export type RoleSelectOption = {
  label: string
  value: number
  type: number
}

export type RoleSelectResponseData = ApiResponseData<RoleSelectOption[]>

export const RoleApi = new (class {
  list(page: number, limit: number) {
    return request<RolePageInfoResponseData>({
      method: "get",
      url: "v2/admin/roles",
      params: {
        page,
        limit
      }
    })
  }

  select() {
    return request<RoleSelectResponseData>({
      method: "get",
      url: "v2/admin/roles/select"
    })
  }

  read(id: string | number) {
    return request<RoleInfoResponseData>({
      method: "get",
      url: `v2/admin/roles/${id}`
    })
  }

  delete(id: string | number) {
    return request<object>({
      method: "delete",
      url: `v2/admin/roles/${id}`
    })
  }
})()
