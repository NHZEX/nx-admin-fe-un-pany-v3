import { type RouteRecordRaw } from "vue-router"

const Layouts = () => import("@/layouts/index.vue")

const asyncRoutes: RouteRecordRaw[] = [
  {
    path: "/system",
    component: Layouts,
    name: "System",
    meta: {
      title: "系统管理",
      svgIcon: "setting",
      alwaysShow: true, // 将始终显示根菜单
      auth: true
    },
    children: [
      {
        path: "user",
        component: () => import("@/views/system/user/SystemUserList.vue"),
        name: "SystemUserList",
        meta: {
          title: "用户管理",
          auth: ["admin.user"]
        }
      },
      {
        path: "role",
        component: () => import("@/views/system/role/SystemRoleList.vue"),
        name: "SystemRoleList",
        meta: {
          title: "角色管理",
          auth: ["admin.role"]
        }
      },
      {
        path: "permission",
        component: () => import("@/views/system/permission/SystemPermissionIndex.vue"),
        name: "SystemPermissionIndex",
        meta: {
          title: "权限管理",
          auth: ["admin.permission"]
        }
      }
    ]
  }
]

export default asyncRoutes
