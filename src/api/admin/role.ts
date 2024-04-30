import { request } from "@/utils/service"
import { ItemDataV1Base } from "types/nx-system"
import { type PermissionSet } from "@/api/admin/permission"

export interface RoleItem extends ItemDataV1Base {
  readonly id: number
  readonly pid: number
  genre: number
  status: number
  name: string
  description: string
  readonly status_desc?: string
  readonly genre_desc?: string
  ext?: {
    permission?: PermissionSet
  }
}

export type RolePageInfoResponseData = PageListResponseData<RoleItem>

export type RoleInfoResponseData = ApiResponseData<RoleItem>

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

  save(id: ObjectId | null, data: object) {
    if (id === null) {
      return request<ApiResponseData<any>>({
        method: "post",
        url: `v2/admin/roles`,
        data
      })
    } else {
      return request<ApiResponseData<any>>({
        method: "put",
        url: `v2/admin/roles/${id}`,
        data
      })
    }
  }

  delete(id: string | number) {
    return request<object>({
      method: "delete",
      url: `v2/admin/roles/${id}`
    })
  }
})()
