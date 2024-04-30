import { PermissionApi, type PermissionTree, type PermissionSet } from "@/api/admin/permission"
import { computed, onMounted, ref } from "vue"

interface Options {
  enableMountedLoader: boolean
}

export function usePermissionTree(
  options: Options = {
    enableMountedLoader: false
  }
) {
  const loading = ref(false)
  const permissionData = ref<PermissionTree[]>([])
  const permissionNodes = computed(() => {
    const resultNodes = new Map<string, PermissionTree>()
    const r = (nodes: PermissionTree[]) => {
      for (const node of nodes) {
        resultNodes.set(node.name, node)
        if (Array.isArray(node.children)) {
          r(node.children)
        }
      }
    }
    r(permissionData.value)
    return resultNodes
  })

  const loadData = async () => {
    loading.value = true
    try {
      const resp = await PermissionApi.all()
      permissionData.value = resp.data
    } finally {
      loading.value = false
    }
  }

  if (options.enableMountedLoader) {
    onMounted(async () => {
      await loadData()
    })
  }

  const filterLeafNodes = (data: PermissionSet) => {
    return data.filter((node) => {
      const permission = permissionNodes.value.get(node)
      if (!permission) {
        return false
      }
      return permission.children && permission.children.length === 0
    })
  }

  return {
    // data
    loading,
    treeData: permissionData,
    nodes: permissionNodes,
    // func
    reload: loadData,
    filterLeafNodes
  }
}
