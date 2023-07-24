import { type UserItem } from "@/api/admin/user"

interface LoginPermission {
  [key: string]: boolean
}

interface LoginUserInfo {
  user: UserItem
  permission: LoginPermission
}

type AuthItem = string[] | string | boolean | null
