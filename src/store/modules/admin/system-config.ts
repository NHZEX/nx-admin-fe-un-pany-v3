import { ref } from "vue"
import { defineStore } from "pinia"
import store from "@/store"
import { SystemApi, type SystemSettings } from "@/api/admin/system"

export const useSystemSettingsStore = defineStore("system-settings", () => {
  /** 状态对象 */
  const state = ref<SystemSettings>({
    loginCaptcha: false
  })
  const loading = ref<boolean>(false)

  async function loadData() {
    loading.value = true

    try {
      const { data } = await SystemApi.config()
      state.value = data
    } finally {
      loading.value = false
    }
  }

  return {
    settings: state,
    loading,
    loadData
  }
})

/** 在 setup 外使用 */
export function useSystemSettingsStoreHook() {
  return useSystemSettingsStore(store)
}
