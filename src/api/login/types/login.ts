import { type AxiosResponse } from "axios"
import { LoginUserInfo } from "types/nx-system"

export interface LoginRequestData {
  /** 用户名 */
  username: string
  /** 密码 */
  password: string
  /** 验证码 */
  code: string
  /** 验证码令牌 */
  token: string | null
  /** 持久化登录 */
  lasting: boolean
}

export type LoginCodeResponseData = AxiosResponse<Blob>

export type LoginResponseData = { token: string; uuid: string }

// ApiResponseData<{}>
export type UserInfoResponseData = LoginUserInfo
