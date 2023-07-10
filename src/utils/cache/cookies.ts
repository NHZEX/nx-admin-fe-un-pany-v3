/** 统一处理 Cookie */

import CacheKey from "@/constants/cache-key"
import Cookies from "js-cookie"

export function setSecret(uuid: string, token: string): void {
  setUUID(uuid)
  setToken(token)
}

export function clearSecret(): void {
  removeUUID()
  removeToken()
}

export function hasSecret(): boolean {
  return !!getUUID() && !!getToken()
}

export const getUUID = (): string | undefined => {
  return Cookies.get(CacheKey.UUID)
}
export const setUUID = (uuid: string) => {
  Cookies.set(CacheKey.UUID, uuid)
}
export const removeUUID = () => {
  Cookies.remove(CacheKey.UUID)
}

export const getToken = () => {
  return Cookies.get(CacheKey.TOKEN)
}
export const setToken = (token: string) => {
  Cookies.set(CacheKey.TOKEN, token)
}
export const removeToken = () => {
  Cookies.remove(CacheKey.TOKEN)
}
