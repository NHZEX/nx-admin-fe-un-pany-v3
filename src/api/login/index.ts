import { request } from "@/utils/service"
import type * as Login from "./types/login"

/** 获取登录验证码 */
export function getLoginCodeApi() {
  return request<Login.LoginCodeResponseData>({
    url: "login/captcha",
    method: "get",
    responseType: "blob"
  })
}

/** 登录并返回 Token */
export function loginApi(data: Login.LoginRequestData) {
  const dataCopy: any = data
  // 解决兼容问题
  dataCopy.account = data.username

  return request<Login.LoginResponseData>({
    url: "users/login",
    method: "post",
    data: dataCopy
  })
}

/** 获取用户详情 */
export function getUserInfoApi() {
  return request<Login.UserInfoResponseData>({
    url: "users/info",
    method: "get"
  })
}
