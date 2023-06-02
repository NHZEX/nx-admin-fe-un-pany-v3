import { ref, computed } from "vue"
import store from "@/store"
import { defineStore } from "pinia"
import { usePermissionStore } from "./permission"
import { useTagsViewStore } from "./tags-view"
import { clearSecret, getToken, getUUID, initSecret } from "@/utils/cache/cookies"
import { resetRouter } from "@/router"
import { loginApi, getUserInfoApi } from "@/api/login"
import { type LoginRequestData } from "@/api/login/types/login"
import { hash_sha256 } from "@ozxin/js-tools/src/crypto/hash"
import { UserType } from "@/enum/user"
import { type AuthItem, type LoginPermission, type UserInfo } from "types/nx-system"

export const useUserStore = defineStore("user", () => {
  const token = ref<string>(getToken())
  const uuid = ref<string>(getUUID())

  const user = ref<UserInfo | null>(null)
  const permission = ref<LoginPermission>({})

  const username = computed<string>(() => user.value?.username || "")
  const nickname = computed<string>(() => user.value?.nickname || "")

  const permissionStore = usePermissionStore()
  const tagsViewStore = useTagsViewStore()

  /** 登录 */
  const login = async (loginData: LoginRequestData) => {
    return new Promise((resolve, reject) => {
      loginApi({
        username: loginData.username,
        password: hash_sha256(loginData.password),
        code: loginData.code,
        token: null,
        lasting: true
      })
        .then((res) => {
          initSecret(res.uuid, res.token)
          token.value = res.token
          uuid.value = res.uuid
          resolve(true)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }
  /** 获取用户详情 */
  const getInfo = () => {
    return new Promise((resolve, reject) => {
      getUserInfoApi()
        .then((data) => {
          user.value = data.user
          permission.value = data.permission
          permissionStore.setPermissions(data.permission)
          resolve(data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  const clearState = () => {
    token.value = ""
    uuid.value = ""
    user.value = null
    permission.value = {}
    permissionStore.reset()
  }

  /** 登出 */
  const logout = () => {
    clearSecret()
    clearState()
    resetRouter()
    _resetTagsView()
  }
  /** 重置 Token */
  const resetToken = () => {
    clearSecret()
    clearState()
  }
  /** 重置 visited views 和 cached views */
  const _resetTagsView = () => {
    tagsViewStore.delAllVisitedViews()
    tagsViewStore.delAllCachedViews()
  }

  const isSupperAdmin = computed(() => user.value?.genre === UserType.SUPER_ADMIN)
  const isUserAdmin = computed(() => user.value?.genre === UserType.USER_ADMIN)
  const isAnyAdmin = computed(() => isSupperAdmin.value || isUserAdmin.value)
  const isOperator = computed(() => user.value?.genre === UserType.OPERATOR)
  const userTypeDesc = computed(() => user.value?.genre)

  return {
    token,
    username,
    nickname,
    user,
    permission,
    login,
    getInfo,
    logout,
    resetToken,
    userTypeDesc,
    isSupperAdmin,
    isUserAdmin,
    isAnyAdmin,
    isOperator,
    allowAccess: (testAuth: AuthItem) => permissionStore.allowAccess(testAuth)
  }
})

/** 在 setup 外使用 */
export function useUserStoreHook() {
  return useUserStore(store)
}
