<script setup lang="ts">
import { computed, reactive, ref } from "vue"
import type { FormInstance, FormRules } from "element-plus"
import { cloneDeep, isPlainObject } from "lodash-es"
import { RoleApi, type RoleItem } from "@/api/admin/role"
import PermissionTree from "@/views/system/permission/PermissionTree.vue"

interface RoleForm extends RoleItem {}

const defaultFormData: RoleForm = {
  id: 0,
  pid: 0,
  genre: 0,
  status: 0,
  name: "",
  description: "",
  ext: {
    permission: []
  }
}

const emits = defineEmits<{
  /** 提交 */
  submit: []
}>()

const formIns = ref<FormInstance>()
const permissionTreeIns = ref<InstanceType<typeof PermissionTree>>()
const editorId = ref<number | null>(null)
const loading = ref<boolean>(false)
const visible = ref<boolean>(false)
const formData = ref<RoleForm>(defaultFormData)
const rules = reactive<FormRules<RoleForm>>({
  genre: [{ required: true }],
  name: [{ required: true, min: 1, max: 64 }],
  description: [{ max: 256 }]
})

const selectedPermission = computed({
  get: () => {
    return formData.value.ext?.permission
  },
  set: (val) => {
    if (!isPlainObject(formData.value.ext)) {
      formData.value.ext = {}
    }
    formData.value.ext!.permission = val
  }
})

const isEditor = computed(() => !!(editorId.value && editorId.value > 0))

function onOpen() {
  formIns.value?.clearValidate()
  loadData()
}
function onClose() {
  formData.value = defaultFormData
}
function loadData() {
  if (!editorId.value) {
    permissionTreeIns.value?.reload()
    return
  }
  loading.value = true
  RoleApi.read(editorId.value)
    .then(async ({ data }) => {
      formData.value = data
      await permissionTreeIns.value?.reload()
    })
    .finally(() => {
      loading.value = false
    })
}
async function onSubmit() {
  await formIns.value?.validate()

  loading.value = true

  const data = cloneDeep(formData.value)

  data.genre = 1

  RoleApi.save(editorId.value, data)
    .then(() => {
      visible.value = false
    })
    .finally(() => {
      loading.value = false
      emits("submit")
    })
}

defineExpose({
  open(id: number | null = null) {
    editorId.value = id
    visible.value = true
  }
})
</script>

<template>
  <el-dialog
    v-model="visible"
    @close="onClose"
    @open="onOpen"
    title="角色编辑"
    width="800px"
    footer-hide
    :styles="{ top: '20px' }"
  >
    <el-form ref="formIns" :model="formData" :rules="rules" label-width="80px" v-loading="loading">
      <div class="flex">
        <div class="min-w-40%">
          <el-form-item label="名称" prop="name">
            <el-input name="username" v-model.trim="formData.name" :readonly="isEditor" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-checkbox v-model="formData.status" :true-value="0" :false-value="1">启用</el-checkbox>
          </el-form-item>
          <el-form-item label="备注" prop="description">
            <el-input
              name="description"
              v-model.trim="formData.description"
              type="textarea"
              :autosize="{ minRows: 5 }"
              maxlength="256"
            />
          </el-form-item>
        </div>
        <div class="min-w-60% min-h-xl">
          <el-form-item label="权限">
            <PermissionTree
              v-model="selectedPermission"
              :create-mode="!isEditor"
              ref="permissionTreeIns"
              style="width: 100%"
            ></PermissionTree>
          </el-form-item>
        </div>
      </div>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">提交</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<style scoped lang="scss"></style>
