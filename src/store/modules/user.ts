import { ref, computed } from "vue"
import store from "@/store"
import { defineStore } from "pinia"
import { usePermissionStore } from "./permission"
import { useTagsViewStore } from "./tags-view"
import { useSettingsStore } from "./settings"
import { getToken, getUUID, setSecret, clearSecret } from "@/utils/cache/cookies"
import { resetRouter } from "@/router"
import { loginApi, getUserInfoApi } from "@/api/login"
import { type LoginRequestData } from "@/api/login/types/login"
import { cloneDeep } from "lodash-es"
import { hash_sha256 } from "@ozxin/js-tools/src/crypto/hash"
import { UserType } from "@/enum/user"
import { type AuthItem } from "types/nx-system"
import { type UserItem } from "@/api/admin/user"

export const useUserStore = defineStore("user", () => {
  // todo 分离 SessionStorage
  const uuid = ref<string>(getUUID() || "")
  const token = ref<string>(getToken() || "")
  const user = ref<UserItem | null>(null)

  const permissionStore = usePermissionStore()
  const tagsViewStore = useTagsViewStore()
  const settingsStore = useSettingsStore()

  /** 登录 */
  const login = async (loginData: LoginRequestData) => {
    loginData = cloneDeep(loginData)
    loginData.password = hash_sha256(loginData.password)
    const { data } = await loginApi(loginData)
    setSecret(data.uuid, data.token)
    uuid.value = data.uuid
    token.value = data.token
  }
  /** 获取用户详情 */
  const getInfo = async () => {
    const { data } = await getUserInfoApi()
    user.value = data.user
    permissionStore.setPermissions(data.permission)
  }

  const clearState = () => {
    token.value = ""
    uuid.value = ""
  }

  /** 登出 */
  const logout = () => {
    clearSecret()
    clearState()
    resetRouter()
    permissionStore.reset()
    _resetTagsView()
  }
  /** 重置 Token */
  const resetToken = () => {
    clearSecret()
    clearState()
  }
  /** 重置 Visited Views 和 Cached Views */
  const _resetTagsView = () => {
    if (!settingsStore.cacheTagsView) {
      tagsViewStore.delAllVisitedViews()
      tagsViewStore.delAllCachedViews()
    }
  }

  const username = computed<string>(() => user.value?.username || "")
  const nickname = computed<string>(() => user.value?.nickname || "")
  const isSupperAdmin = computed(() => user.value?.genre === UserType.SUPER_ADMIN)

  return {
    roles: [], // 弃用
    token,
    username,
    login,
    getInfo,
    logout,
    resetToken,
    nickname,
    isSupperAdmin,
    allowAccess: (testAuth: AuthItem) => permissionStore.allowAccess(testAuth)
  }
})

/** 在 setup 外使用 */
export function useUserStoreHook() {
  return useUserStore(store)
}
