import { request } from "@/utils/service"
import type * as Login from "./types/login"

/** 获取登录验证码 */
export function getLoginCodeApi() {
  return request<Login.LoginCodeResponseData>({
    url: "system/captcha",
    method: "get",
    responseType: "blob"
  })
}

/** 登录并返回 Token */
export function loginApi(data: Login.LoginRequestData) {
  const dataCopy: any = data
  // 解决兼容问题
  dataCopy.account = data.username
  // users/login
  return request<Login.LoginResponseData>({
    url: "admin/login",
    method: "post",
    data: dataCopy
  })
}

/** 获取用户详情 */
export function getUserInfoApi() {
  // users/info
  return request<Login.UserInfoResponseData>({
    url: "admin/user-info",
    method: "get"
  })
}

/** 注销登录 */
export function logoutApi() {
  return request({
    url: "admin/logout",
    method: "get"
  })
}
