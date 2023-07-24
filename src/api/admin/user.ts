import { request } from "@/utils/service"
import { UserType } from "@/enum/user"

export interface UserItem {
  id: number
  genre: UserType
  status: number
  role_id: number
  nickname: string
  username: string
  email?: string
  group_id?: number
  readonly signup_ip?: string
  readonly create_time?: number
  readonly update_time?: number
  readonly last_login_time?: number
  readonly last_login_ip?: string
  readonly lock_version?: number
  readonly status_desc?: string
  readonly genre_desc?: string
  avatar_data?: null
  avatar?: string
  readonly role_name?: string
}

export type UserPageInfoResponseData = PageListResponseData<UserItem>

export type UserInfoResponseData = ApiResponseData<UserItem>

export const UserApi = new (class {
  list(page: number, limit: number) {
    return request<UserPageInfoResponseData>({
      method: "get",
      url: "v2/admin/users",
      params: {
        page,
        limit
      }
    })
  }

  read(id: ObjectId) {
    return request<UserInfoResponseData>({
      method: "get",
      url: `v2/admin/users/${id}`
    })
  }

  save(id: ObjectId | null, data: object) {
    if (id === null) {
      return request<ApiResponseData<any>>({
        method: "post",
        url: `v2/admin/users`,
        data
      })
    } else {
      return request<ApiResponseData<any>>({
        method: "put",
        url: `v2/admin/users/${id}`,
        data
      })
    }
  }

  resetPassword(id: ObjectId, password: string) {
    return request<ApiResponseData<any>>({
      method: "post",
      url: `v2/admin/users/${id}/reset-password`,
      data: {
        password
      }
    })
  }

  delete(id: ObjectId) {
    return request<object>({
      method: "delete",
      url: `v2/admin/users/${id}`
    })
  }
})()
