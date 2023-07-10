import { UserType } from "@/enum/user"

interface UserInfo {
  id: number
  genre: UserType
  status: number
  username: string
  nickname: string
  email: string
  avatar: string
  role_id: number
  create_time: number
  update_time: number
  last_login_time: number
}

interface LoginPermission {
  [key: string]: boolean
}

interface LoginUserInfo {
  user: UserInfo
  permission: LoginPermission
}

type AuthItem = string[] | string | boolean | null
