import { useUserStoreHook } from "@/store/modules/user"

/** 全局权限判断函数，和指令 v-permission 功能类似 */
export const checkPermission = (value: string[]): boolean => {
  if (value && value instanceof Array && value.length > 0) {
    return useUserStoreHook().allowAccess(value)
  } else {
    console.error("need roles! Like checkPermission(['admin','editor'])")
    return false
  }
}
