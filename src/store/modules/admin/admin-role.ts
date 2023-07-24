import { defineStore } from "pinia"
import { onMounted, reactive, toRef } from "vue"
import store from "@/store"
import { debounce } from "lodash-es"
import { RoleApi, type RoleSelectOption } from "@/api/admin/role"

export const useAdminRoleStore = defineStore("AdminRole", () => {
  const options = reactive<{
    data: RoleSelectOption[]
    loading: boolean
  }>({
    data: [],
    loading: false
  })

  async function loadOptions() {
    await _loadOptions()
  }

  const _loadOptions = debounce(async function () {
    options.loading = true
    await RoleApi.select()
      .then(({ data }) => {
        options.data = data
      })
      .finally(() => {
        options.loading = false
      })
  }, 300)

  return {
    options,
    loadOptions
  }
})

export function useAdminRoleStoreHook() {
  return useAdminRoleStore(store)
}

export function useAdminRoleSelectHook() {
  const store = useAdminRoleStoreHook()

  onMounted(async () => {
    await store.loadOptions()
  })

  return {
    options: toRef(store.options, "data"),
    loading: toRef(store.options, "loading"),
    loadOptions: store.loadOptions
  }
}
