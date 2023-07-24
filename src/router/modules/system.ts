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
      }
    ]
  }
]

export default asyncRoutes
