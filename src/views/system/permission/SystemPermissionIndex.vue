<script setup lang="tsx">
import { ref, reactive } from "vue"
import { type VxeGridInstance, type VxeGridProps } from "vxe-table"
import { PermissionApi, type PermissionTree, type PermissionChangeItems } from "@/api/admin/permission"
import { SystemApi } from "@/api/admin/system"
import { ElMessage } from "element-plus"
import { EditPen } from "@element-plus/icons-vue"

interface PermissionTreeRow extends PermissionTree {
  _control: {
    loading: boolean
    data: any
  }
}

const loading = ref<{
  query: boolean
  edit: boolean
  scan: boolean
  reset: boolean
}>({
  query: false,
  edit: false,
  scan: false,
  reset: false
})
const isChange = ref<boolean>(false)
const xGridIns = ref<VxeGridInstance>()
const xGridOpt = reactive<VxeGridProps<PermissionTreeRow>>({
  border: true,
  align: null,
  autoResize: true,
  keepSource: true,
  columnConfig: {
    resizable: true
  },
  rowConfig: {
    useKey: true,
    keyField: "name"
  },
  treeConfig: {
    childrenField: "children",
    expandAll: true
  },
  editConfig: {
    trigger: "dblclick",
    mode: "row",
    autoClear: true,
    showStatus: true
  },
  columns: [
    { type: "expand", visible: false, slots: { content: "expand" } },
    { title: "权限", field: "title", treeNode: true, width: 350 },
    {
      title: "排序",
      field: "sort",
      width: 130,
      slots: { default: "RowSort" },
      editRender: {
        name: "input",
        attrs: { type: "text" }
      }
    },
    {
      title: "注释",
      field: "desc",
      minWidth: 150,
      slots: { default: "RowDesc" },
      editRender: {
        name: "input",
        attrs: { type: "text" }
      }
    },
    { title: "查看", minWidth: 80, slots: { default: "RowAction" } }
  ],
  toolbarConfig: {
    slots: {
      buttons: "ToolbarButtons"
    }
  },
  proxyConfig: {
    props: {
      result: "data"
    },
    ajax: {
      query: async () => {
        isChange.value = false
        loading.value.query = true
        try {
          const { data } = await PermissionApi.all()
          return recursionTree(data)
        } finally {
          loading.value.query = false
        }
      }
    }
  },
  expandConfig: {
    accordion: false,
    lazy: true,
    loadMethod: async ({ row }) => {
      row._control.loading = true
      row._control.data = []
      try {
        const result = await PermissionApi.read(row.name)
        if (result) {
          row._control.data = result.data.allow
        }
      } finally {
        row._control.loading = false
      }
    }
  }
})
const recursionTree = (item: PermissionTreeRow[] | PermissionTree[]) => {
  return item.map((el) => {
    el = {
      ...el,
      _control: {
        loading: false,
        data: []
      }
    }
    if (el.children && el.children.length) {
      el.children = recursionTree(el.children)
    }
    return el
  })
}

function handleRefresh() {
  xGridIns.value?.commitProxy("query")
}

function editClosed() {
  const rows = xGridIns.value!.getUpdateRecords()
  isChange.value = rows.length > 0
}

function controlView(row: PermissionTreeRow) {
  xGridIns.value!.toggleRowExpand(row)
}

async function handleScan() {
  loading.value.scan = true
  try {
    await PermissionApi.scan()
  } finally {
    loading.value.scan = false
    handleRefresh()
  }
}

async function saveChange() {
  loading.value.edit = true
  const rows: PermissionChangeItems = {}
  for (const row of xGridIns.value!.getUpdateRecords()) {
    rows[row.name] = {
      sort: row.sort,
      desc: row.desc
    }
  }
  try {
    await PermissionApi.saveItems(rows)
    handleRefresh()
  } finally {
    loading.value.edit = false
  }
}

async function resetCache() {
  loading.value.reset = true
  try {
    await SystemApi.resetCache()
  } finally {
    loading.value.reset = false
    ElMessage.success({
      type: "success",
      message: "重置缓存完成"
    })
  }
}

async function clearRowExpand() {
  await xGridIns.value!.clearRowExpand()
}
</script>

<template>
  <div class="app-container">
    <vxe-grid
      ref="xGridIns"
      :loading="loading.query"
      v-bind="xGridOpt"
      height="auto"
      :auto-resize="true"
      @edit-closed="editClosed"
    >
      <template #ToolbarButtons>
        <el-button icon="Refresh" :loading="loading.query || loading.edit" @click="handleRefresh()">刷新</el-button>
        <!--v-access="'admin.permission.scan'" -->
        <el-button
          type="warning"
          :loading="loading.scan || loading.query || loading.edit"
          @click="handleScan()"
          icon="MagicStick"
          >扫描权限
        </el-button>
        <!--v-access="'admin.permission.edit'" -->
        <el-button type="success" :loading="loading.edit" :disabled="!isChange" @click="saveChange()" icon="Upload"
          >保存更改
        </el-button>
        <!--v-access="'admin.resetCache'" -->
        <el-button type="warning" :loading="loading.reset" @click="resetCache()" icon="RefreshRight"
          >重置缓存
        </el-button>
        <el-button type="info" @click="clearRowExpand()" icon="Fold">折叠展开</el-button>
      </template>
      <template #RowSort="{ row, column }">
        <el-icon>
          <EditPen />
        </el-icon>
        <span style="color: #515a6e; margin-left: 2px">{{ row[column.field] }}</span>
      </template>
      <template #RowDesc="{ row, column }">
        <el-icon>
          <EditPen />
        </el-icon>
        <span style="color: #515a6e; margin-left: 2px">{{
          row[column.property] ? row[column.field] : "[无注释]"
        }}</span>
      </template>
      <template #RowAction="{ row }: { row: PermissionTreeRow }">
        <el-button type="info" :loading="row._control.loading" icon="document" @click="controlView(row)"
          >查看节点
        </el-button>
      </template>
      <template #expand="{ row }: { row: PermissionTreeRow }">
        <vxe-table :data="row._control.data" max-height="350px">
          <vxe-column title="节点" field="name" width="280" show-overflow="title"></vxe-column>
          <vxe-column title="注释" field="desc" show-overflow="title">
            <template #default="{ row, column }">{{ row[column.field] || "无" }}</template>
          </vxe-column>
        </vxe-table>
      </template>
    </vxe-grid>
  </div>
</template>

<style scoped lang="scss"></style>
