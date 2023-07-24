<script setup lang="tsx">
import { ref, reactive, onMounted } from "vue"
import { type VxeGridInstance, type VxeGridProps } from "vxe-table"
import { UserApi, type UserItem } from "@/api/admin/user"
import { formatUnix } from "@/utils"
import { ElMessage, ElMessageBox } from "element-plus"
import UserEditor from "@/views/system/user/UserEditor.vue"

const loading = ref<boolean>(false)
const editorIns = ref<InstanceType<typeof UserEditor> | null>()
const xGridIns = ref<VxeGridInstance>()
const xGridOpt = reactive<VxeGridProps<UserItem>>({
  border: true,
  align: null,
  autoResize: true,
  columnConfig: {
    resizable: true
  },
  rowConfig: {
    height: 120
  },
  columns: [
    { field: "id", title: "#", width: 50 },
    {
      title: "操作",
      width: 170,
      slots: {
        default: "row_buttons"
      }
    },
    {
      title: "用户",
      showOverflow: "title",
      slots: {
        default: ({ row }: { row: UserItem }) => {
          return (
            <>
              <ul class="nx-list">
                <li>
                  <label>账号：</label>
                  <span>{row.username}</span>
                </li>
                <li>
                  <label>昵称：</label>
                  <span>{row.nickname}</span>
                </li>
                <li>
                  <label>类型：</label>
                  <span>{row.genre_desc}</span>
                </li>
                <li>
                  <label>状态：</label>
                  <span>{row.status_desc}</span>
                </li>
              </ul>
            </>
          )
        }
      }
    },
    { field: "role_name", title: "角色" },
    {
      title: "状态",
      slots: {
        // default: 'row_user_info',
        default: ({ row }: { row: UserItem }) => {
          return (
            <>
              <ul class="nx-list">
                <li>
                  <label>创建时间：</label>
                  <span>{formatUnix(row.create_time)}</span>
                </li>
                <li>
                  <label>更新时间：</label>
                  <span>{formatUnix(row.update_time)}</span>
                </li>
                <li>
                  <label>最近登录：</label>
                  <span>{formatUnix(row.last_login_time)}</span>
                </li>
                <li>
                  <label>登录IP：</label>
                  <span>{row.last_login_ip || "N/A"}</span>
                </li>
              </ul>
            </>
          )
        }
      }
    }
  ],
  toolbarConfig: {
    slots: {
      buttons: "toolbar_buttons"
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
        return UserApi.list(page.currentPage, page.pageSize)
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

onMounted(() => {})

function handleRefresh() {
  xGridIns.value?.commitProxy("query")
}

function handleEdit(row: UserItem | null) {
  editorIns.value?.open(row?.id)
}

function handleResetPassword(row: UserItem) {
  ElMessageBox.prompt(`确定要重置用户 #${row.id} ${row.username} 的密码吗？`, "重置密码", {
    type: "warning",
    inputType: "text"
  })
    .then(({ value }) => {
      value = value.trim()
      if (!value) {
        throw new Error("密码不能为空")
      }
      loading.value = true
      return UserApi.resetPassword(row.id, value)
    })
    .then(() => {
      ElMessage.success({
        type: "success",
        message: "重置密码完成"
      })
    })
    .finally(() => {
      loading.value = false
      handleRefresh()
    })
}

async function handleDelete(row: UserItem) {
  await ElMessageBox.confirm(`确定要删除用户 #${row.id} ${row.username} 吗？`, "删除数据", { type: "warning" })
  loading.value = true
  UserApi.delete(row.id)
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
    <vxe-grid ref="xGridIns" :loading="loading" v-bind="xGridOpt">
      <template #toolbar_buttons>
        <el-button icon="Refresh" :loading="loading" @click="handleRefresh()">刷新</el-button>
        <el-button type="primary" icon="Plus" @click="handleEdit(null)">新增</el-button>
      </template>
      <template #row_buttons="{ row }: { row: UserItem }">
        <div>
          <ul class="nx-list nx-list-pb-y-2">
            <li>
              <el-button type="primary" @click="handleEdit(row)">编辑</el-button>
              <el-button type="danger" @click="handleDelete(row)">删除</el-button>
            </li>
            <li>
              <el-button type="warning" @click="handleResetPassword(row)">重置密码</el-button>
            </li>
          </ul>
        </div>
      </template>
      <template #row_user_info="{ row }: { row: UserItem }">
        <ul class="nx-list">
          <li>
            <label>创建时间：</label>
            <span>{{ formatUnix(row?.create_time) }}</span>
          </li>
          <li>
            <label>更新时间：</label>
            <span>{{ formatUnix(row?.update_time) }}</span>
          </li>
          <li>
            <label>最近登录：</label>
            <span>{{ formatUnix(row?.last_login_time) }}</span>
          </li>
          <li>
            <label>登录IP：</label>
            <span>{{ row.last_login_ip || "N/A" }}</span>
          </li>
        </ul>
      </template>
    </vxe-grid>
    <UserEditor ref="editorIns" @submit="handleRefresh()" />
  </div>
</template>

<style scoped></style>
