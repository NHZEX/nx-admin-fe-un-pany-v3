import { type UserItem } from "@/api/admin/user"

interface LoginPermission {
  [key: string]: boolean
}

interface LoginUserInfo {
  user: UserItem
  permission: LoginPermission
}

type AuthItem = string[] | string | boolean | null

export interface ItemDataV1Base {
  readonly create_time?: number
  readonly update_time?: number
  readonly delete_time?: number
  readonly lock_version?: number
}
