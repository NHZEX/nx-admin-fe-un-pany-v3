<script setup lang="tsx">
import { ref, reactive } from "vue"
import { type VxeGridInstance, type VxeGridProps } from "vxe-table"
import { RoleApi, type RoleItem } from "@/api/admin/role"
import { formatUnix } from "@/utils"
import { ElMessage, ElMessageBox } from "element-plus"
import RoleEditor from "@/views/system/role/RoleEditor.vue"

const loading = ref<boolean>(false)
const editorIns = ref<InstanceType<typeof RoleEditor> | null>()
const xGridIns = ref<VxeGridInstance>()
const xGridOpt = reactive<VxeGridProps<RoleItem>>({
  border: true,
  align: null,
  autoResize: true,
  columnConfig: {
    resizable: true
  },
  rowConfig: {
    height: 100
  },
  columns: [
    { field: "id", title: "#", width: 50 },
    {
      title: "操作",
      width: 170,
      slots: {
        default: "RowButtons"
      }
    },
    {
      title: "角色",
      showOverflow: "title",
      slots: {
        default: "RowRoleInfo"
      }
    },
    {
      title: "状态",
      slots: {
        default: "RowStatusInfo"
      }
    }
  ],
  toolbarConfig: {
    slots: {
      buttons: "ToolbarButtons"
    }
  },
  /** 分页配置项 */
  pagerConfig: {
    align: "left"
  },
  proxyConfig: {
    props: {
      result: "data",
      total: "total"
    },
    ajax: {
      query: ({ page }) => {
        loading.value = true
        return RoleApi.list(page.currentPage, page.pageSize)
          .then(({ data, total, page: { current } }) => {
            page.currentPage = current
            return {
              data,
              total
            }
          })
          .finally(() => {
            loading.value = false
          })
      }
    }
  }
})

function handleRefresh() {
  xGridIns.value?.commitProxy("query")
}

function handleEdit(row: RoleItem | null) {
  editorIns.value?.open(row?.id)
}

async function handleDelete(row: RoleItem) {
  await ElMessageBox.confirm(`确定要删除用户 #${row.id} ${row.name} 吗？`, "删除数据", { type: "warning" })
  loading.value = true
  RoleApi.delete(row.id)
    .then(() => {
      ElMessage.success({
        type: "success",
        message: "删除操作成功"
      })
    })
    .finally(() => {
      loading.value = false
      xGridIns.value?.commitProxy("query")
    })
}
</script>

<template>
  <div class="app-container">
    <vxe-grid ref="xGridIns" :loading="loading" v-bind="xGridOpt" height="auto" :auto-resize="true">
      <template #ToolbarButtons>
        <el-button icon="Refresh" :loading="loading" @click="handleRefresh()">刷新</el-button>
        <el-button type="primary" icon="Plus" @click="handleEdit(null)">新增</el-button>
      </template>
      <template #RowButtons="{ row }: { row: RoleItem }">
        <div>
          <ul class="nx-list nx-list-pb-y-2">
            <li>
              <el-button type="primary" @click="handleEdit(row)">编辑</el-button>
              <el-button type="danger" @click="handleDelete(row)">删除</el-button>
            </li>
          </ul>
        </div>
      </template>
      <template #RowRoleInfo="{ row }: { row: RoleItem }">
        <div>
          <ul class="nx-list">
            <li>
              <label>名称：</label>
              <span>{{ row.name }}</span>
            </li>
          </ul>
        </div>
      </template>
      <template #RowStatusInfo="{ row }: { row: RoleItem }">
        <div>
          <ul class="nx-list">
            <li>
              <label>当前状态：</label>
              <span>{{ row.status_desc }}</span>
            </li>
            <li>
              <label>创建时间：</label>
              <span>{{ formatUnix(row.create_time) }}</span>
            </li>
            <li>
              <label>更新时间：</label>
              <span>{{ formatUnix(row.update_time) }}</span>
            </li>
          </ul>
        </div>
      </template>
    </vxe-grid>
    <RoleEditor ref="editorIns" @submit="handleRefresh()"></RoleEditor>
  </div>
</template>

<style scoped lang="scss"></style>
