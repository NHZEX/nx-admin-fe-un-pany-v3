import { type AxiosResponse } from "axios"
import { LoginUserInfo } from "types/nx-system"

export interface LoginRequestData {
  /** admin 或 editor */
  username: string
  /** 密码 */
  password: string
  /** 验证码 */
  code: string
  /** 额外验证码凭据 */
  token: null | string
  /** 记住登录状态 */
  lasting: false
}

export interface LoginConfig {
  enableCaptcha: boolean
}

export type LoginConfigResponseData = AxiosResponse<LoginConfig>

export type LoginCodeResponseData = AxiosResponse<Blob>

export type LoginResponseData = ApiResponseData<{ uuid: string; token: string }>

export type UserInfoResponseData = ApiResponseData<LoginUserInfo>
