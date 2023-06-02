import { ref, computed } from "vue"
import store from "@/store"
import { defineStore } from "pinia"
import { type RouteRecordRaw } from "vue-router"
import { constantRoutes, asyncRoutes, frameEndMust } from "@/router"
import asyncRouteSettings from "@/config/async-route"
import { type LoginPermission, type AuthItem } from "types/nx-system"

type RouteInfo = {
  routes: RouteRecordRaw[]
  dynamicRoutes: RouteRecordRaw[]
}

const hasRoutePermission = (permissions: string[], route: RouteRecordRaw) => {
  const testAuth = route.meta?.auth
  if (!testAuth) {
    return true
  }
  return hasPermissionV2(permissions, testAuth)
}

const hasPermissionV2 = (permissions: string[], testAuth: AuthItem) => {
  if (false === testAuth || null === testAuth || undefined === testAuth) {
    return true
  }
  if (testAuth === true && permissions.length > 0) {
    return true
  }
  if (typeof testAuth === "string" && permissions.includes(testAuth)) {
    return true
  }
  return Array.isArray(testAuth) ? permissions.some((role) => testAuth.includes(role)) : false
}

const filterAsyncRoutesV2 = (routes: RouteRecordRaw[], permissions: string[]) => {
  const res: RouteRecordRaw[] = []
  routes.forEach((route) => {
    const tempRoute = { ...route }
    const isAuth = hasRoutePermission(permissions, tempRoute)
    if (isAuth) {
      if (tempRoute.children) {
        tempRoute.children = filterAsyncRoutesV2(tempRoute.children, permissions)
      }
      res.push(tempRoute)
    }
  })
  return res
}

export const usePermissionStore = defineStore("permission", () => {
  const permissions = ref<string[]>([])
  const isLoaded = ref<boolean>(false)

  function setPermissions(value: LoginPermission) {
    permissions.value = Object.keys(value)
    isLoaded.value = true
  }

  function reset(): void {
    permissions.value = []
    isLoaded.value = false
  }

  /**
   * 根据角色生成可访问的 Routes（可访问路由 = 常驻路由 + 有访问权限的动态路由）
   */
  function generateRoutes(): RouteInfo {
    let accessedRoutes = asyncRouteSettings.open ? filterAsyncRoutesV2(asyncRoutes, permissions.value) : asyncRoutes
    accessedRoutes = accessedRoutes.concat(frameEndMust)

    // routes.value = constantRoutes.concat(accessedRoutes)
    return {
      routes: constantRoutes.concat(accessedRoutes),
      dynamicRoutes: accessedRoutes
    }
  }

  const routesInfo = computed((): RouteInfo => {
    return generateRoutes()
  })

  function allowAccess(testAuth: AuthItem): boolean {
    return hasPermissionV2(permissions.value, testAuth)
  }

  return { routesInfo, isLoaded, permissions, setPermissions, reset, allowAccess }
})

/** 在 setup 外使用 */
export function usePermissionStoreHook() {
  return usePermissionStore(store)
}
