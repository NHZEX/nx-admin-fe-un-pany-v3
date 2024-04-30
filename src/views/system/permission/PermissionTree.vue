<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { ElTree } from "element-plus"
import { type TreeKey } from "element-plus/es/components/tree/src/tree.type"
import { type PermissionTree, type PermissionSet } from "@/api/admin/permission"
import { usePermissionTree } from "@/hooks/admin/usePermissionTree"
import { difference } from "lodash-es"

interface Props {
  createMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  createMode: false
})

const permissionSet = defineModel<PermissionSet>({
  required: false
})
const initialPermissionSet = ref<PermissionSet | null>([])

const permissionTreeService = usePermissionTree({
  enableMountedLoader: false
})
const treeData = permissionTreeService.treeData

const treeIns = ref<InstanceType<typeof ElTree>>()
const loading = ref<boolean>(false)

watch(permissionSet, (value) => {
  if (initialPermissionSet.value === null) {
    initialPermissionSet.value = value || null
  }
})
const checkedValue = computed((): TreeKey[] => {
  if (!Array.isArray(permissionSet.value)) {
    return []
  }

  return permissionTreeService.filterLeafNodes(permissionSet.value)
})
const defaultExpandedKeys = computed(() => {
  return treeData.value.map((d) => d.name)
})
const isChanged = computed(() => {
  if (initialPermissionSet.value === null) {
    return false
  }
  return difference(permissionSet.value, initialPermissionSet.value).length !== 0
})

watch(checkedValue, (v) => {
  if (v.length === 0) {
    treeIns.value!.setCheckedKeys([])
  }
})

function updateChecked(
  node: PermissionTree,
  { checkedKeys, halfCheckedKeys }: { checkedKeys: string[]; halfCheckedKeys: string[] }
) {
  permissionSet.value = [...halfCheckedKeys, ...checkedKeys]
}

function reset() {
  expandTouchFlag.value = 1
  if (props.createMode) {
    initialPermissionSet.value = []
  } else {
    if (Array.isArray(permissionSet.value) && permissionSet.value.length > 0) {
      initialPermissionSet.value = permissionSet.value
    } else {
      initialPermissionSet.value = null
    }
  }
}

async function reload() {
  reset()
  loading.value = true
  try {
    await permissionTreeService.reload()
  } finally {
    loading.value = false
  }
}

const expandTouchFlag = ref<number>(0)
function expandTreeNode() {
  if (0 === expandTouchFlag.value++) {
    Object.values(treeIns!.value?.store.nodesMap || {})
      .filter((v) => !v.isLeaf && !v.expanded)
      .forEach((v) => {
        if (defaultExpandedKeys.value.includes(v.data.name)) {
          v.expand()
        }
      })
  } else {
    Object.values(treeIns!.value?.store.nodesMap || {})
      .filter((v) => !v.isLeaf && !v.expanded)
      .forEach((v) => {
        v.expand()
      })
    expandTouchFlag.value = 0
  }
}

function collapseTreeNode() {
  Object.values(treeIns!.value?.store.nodesMap || {})
    .filter((v) => !v.isLeaf && v.expanded)
    .forEach((v) => {
      v.collapse()
    })
}

defineExpose({
  reload
})
</script>

<template>
  <div>
    <el-button-group size="small">
      <el-button icon="DCaret" @click="expandTreeNode">展开</el-button>
      <el-button icon="Fold" @click="collapseTreeNode">收起</el-button>
    </el-button-group>
    <div style="max-height: 500px; overflow-x: auto; overflow-y: auto">
      <el-tree
        v-loading="loading"
        ref="treeIns"
        show-checkbox
        highlight-current
        node-key="name"
        :default-checked-keys="checkedValue"
        :default-expanded-keys="defaultExpandedKeys"
        :data="treeData"
        :props="{ children: 'children', label: 'name' }"
        @check="updateChecked"
      >
        <template #default="{ node, data }">
          <span class="custom-tree-node">
            <span
              :class="{
                'node-checked': node.checked,
                'node-half-checked': node.indeterminate,
                'append-checked': node.checked && !initialPermissionSet?.includes(node.data.name),
                'cancel-checked':
                  !(node.checked || node.indeterminate) && initialPermissionSet?.includes(node.data.name)
              }"
              :title="`${node.label} (${data.desc ? data.desc : 'null'})`"
              >{{ node.label }} ({{ data.desc ? data.desc : "null" }})</span
            >
          </span>
        </template>
      </el-tree>
    </div>
    <el-alert title="权限选项已经发生修改" type="success" v-if="isChanged" :closable="false" />
  </div>
</template>

<style scoped lang="scss">
.node-checked {
  color: #409eff;
}
.node-half-checked {
  color: #79bbff;
}
.append-checked {
  color: #67c23a;
}
.cancel-checked {
  color: #f56c6c;
}
</style>
