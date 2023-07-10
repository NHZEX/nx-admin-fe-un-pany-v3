import { useUserStoreHook } from "@/store/modules/user"
import { AuthItem } from "../../types/nx-system"

/** 全局权限判断函数，和权限指令 v-permission 功能类似 */
export const checkPermission = (permissionRoles: AuthItem): boolean => {
  return useUserStoreHook().allowAccess(permissionRoles)
}
