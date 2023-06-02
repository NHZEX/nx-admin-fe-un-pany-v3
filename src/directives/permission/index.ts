import { type Directive } from "vue"
import { useUserStoreHook } from "@/store/modules/user"

/** 权限指令 */
export const permission: Directive = {
  mounted(el, binding) {
    const { value } = binding
    const { allowAccess } = useUserStoreHook()

    if (value) {
      if (!allowAccess(value)) {
        // 隐藏
        // el.style.display = "none"
        // 销毁
        el.parentNode?.removeChild(el)
      }
    } else {
      throw new Error(`need roles! Like v-permission="['admin','editor']"`)
    }
  }
}
