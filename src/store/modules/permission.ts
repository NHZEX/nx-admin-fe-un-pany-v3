import { ref, computed } from "vue"
import store from "@/store"
import { defineStore } from "pinia"
import { type RouteRecordRaw } from "vue-router"
import { constantRoutes, dynamicRoutes, frameEndMust } from "@/router"
import { flatMultiLevelRoutes } from "@/router/helper"
import routeSettings from "@/config/route"
import { type LoginPermission, type AuthItem } from "types/nx-system"

type RouteInfo = {
  routes: RouteRecordRaw[]
  dynamicRoutes: RouteRecordRaw[]
}

const hasPermission = (permissions: string[], testAuth: AuthItem, matchMode: "some" | "every" = "some"): boolean => {
  if (false === testAuth || null === testAuth || undefined === testAuth) {
    return true
  }
  if (testAuth === true && permissions.length > 0) {
    return true
  }
  if (typeof testAuth === "string" && permissions.includes(testAuth)) {
    return true
  }
  if (Array.isArray(testAuth)) {
    if (matchMode === "some") {
      return testAuth.some((role) => permissions.includes(role))
    } else if (matchMode === "every") {
      return testAuth.every((role) => permissions.includes(role))
    } else {
      return false
    }
  } else {
    return false
  }
}

const testAllowAccessRouteItem = (permissions: string[], route: RouteRecordRaw) => {
  const testAuth = route.meta?.auth
  if (!testAuth) {
    return true
  }
  return hasPermission(permissions, testAuth)
}

const filterDynamicRoutes = (routes: RouteRecordRaw[], permissions: string[]) => {
  const res: RouteRecordRaw[] = []
  routes.forEach((route) => {
    const tempRoute = { ...route }
    const isAuth = testAllowAccessRouteItem(permissions, tempRoute)
    if (isAuth) {
      if (tempRoute.children) {
        tempRoute.children = filterDynamicRoutes(tempRoute.children, permissions)
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

  function allowAccess(testAuth: AuthItem): boolean {
    return hasPermission(permissions.value, testAuth)
  }

  function reset(): void {
    permissions.value = []
    isLoaded.value = false
  }

  /**
   * 根据角色生成可访问的 Routes（可访问路由 = 常驻路由 + 有访问权限的动态路由）
   */
  function generateRoutes(): RouteInfo {
    let accessedRoutes = asyncRouteSettings.open ? filterDynamicRoutes(asyncRoutes, permissions.value) : dynamicRoutes
    accessedRoutes = accessedRoutes.concat(frameEndMust)

    accessedRoutes = routeSettings.thirdLevelRouteCache ? flatMultiLevelRoutes(accessedRoutes) : accessedRoutes

    // todo 要检查是否 routes 是否需要兼容三级路由
    // todo 要检查 routes 与 dynamicRoutes 区别
    return {
      routes: constantRoutes.concat(accessedRoutes),
      dynamicRoutes: accessedRoutes
    }
  }

  const routesInfo = computed((): RouteInfo => {
    return generateRoutes()
  })

  // 兼容旧代码
  const routes = computed((): RouteRecordRaw[] => routesInfo.value.routes)
  const dynamicRoutes = computed((): RouteRecordRaw[] => routesInfo.value.dynamicRoutes)

  return { routes, dynamicRoutes, setPermissions, allowAccess, reset, isLoaded, permissions, routesInfo }
})

/** 在 setup 外使用 */
export function usePermissionStoreHook() {
  return usePermissionStore(store)
}
