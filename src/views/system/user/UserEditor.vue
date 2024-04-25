<script setup lang="ts">
import { computed, reactive, ref } from "vue"
import { UserType, UserTypeDict } from "@/enum/user"
import { useAdminRoleSelectHook } from "@/store/modules/admin/admin-role"
import type { FormInstance, FormRules } from "element-plus"
import { cloneDeep } from "lodash-es"
import { UserApi, type UserItem } from "@/api/admin/user"

interface UserForm extends UserItem {
  password?: string
  repeatPassword?: string | null
}

const defaultFormData: UserForm = {
  id: 0,
  genre: UserType.OPERATOR,
  username: "",
  nickname: "",
  password: "",
  role_id: 0,
  status: 0,
  repeatPassword: ""
}

const emits = defineEmits<{
  /** 提交 */
  submit: []
}>()

const formIns = ref<FormInstance>()
const editorId = ref<number | null>(null)
const loading = ref<boolean>(false)
const visible = ref<boolean>(false)
const formData = ref<UserForm>(defaultFormData)
const rules = reactive<FormRules<UserForm>>({
  genre: [{ required: true }],
  username: [{ required: true, min: 2, max: 64 }],
  nickname: [{ required: true, min: 2, max: 64 }],
  password: [{ min: 6, max: 64 }],
  repeatPassword: [
    {
      validator: (rule, value, callback) => {
        if (value === undefined || value === formData.value.password) {
          callback()
        } else {
          callback("两次输入的密码要一致")
        }
      }
    }
  ]
})

const { options: roleList } = useAdminRoleSelectHook()

const isEditor = computed(() => editorId.value && editorId.value > 0)

function onOpen() {
  loadData()
}
function onClose() {
  formData.value = defaultFormData
  formIns.value?.clearValidate()
}
function loadData() {
  if (!editorId.value) {
    return
  }
  loading.value = true
  UserApi.read(editorId.value)
    .then(({ data }) => {
      formData.value = data
    })
    .finally(() => {
      loading.value = false
    })
}
async function onSubmit() {
  await formIns.value?.validate()

  loading.value = true

  const data = cloneDeep(formData.value)
  if (data.password) {
    delete data.repeatPassword
  }
  if (data.role_id === null) {
    data.role_id = 0
  }
  UserApi.save(editorId.value, data)
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
    title="用户编辑"
    width="450px"
    footer-hide
    :styles="{ top: '20px' }"
  >
    <el-form ref="formIns" :model="formData" :rules="rules" label-width="80px" v-loading="loading">
      <el-form-item label="类型" prop="genre">
        <el-radio-group v-model="formData.genre" :disabled="isEditor">
          <el-radio v-for="item in UserTypeDict.toList()" :key="item.value" :label="item.value">{{
            item.label
          }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="账号" prop="username">
        <el-input name="username" v-model.trim="formData.username" :readonly="isEditor" />
      </el-form-item>
      <el-form-item label="昵称" prop="nickname">
        <el-input name="nickname" v-model.trim="formData.nickname" />
      </el-form-item>
      <template v-if="!isEditor">
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model.trim="formData.password" placeholder="输入创建用户密码" />
        </el-form-item>
        <el-form-item label="二次确认" prop="repeatPassword" v-show="!!formData.password">
          <el-input type="password" v-model.trim="formData.repeatPassword" placeholder="输入创建用户密码" />
        </el-form-item>
      </template>
      <el-form-item label="角色" prop="role_id">
        <el-select v-model="formData.role_id" placeholder="请选择用户角色" style="width: 100%">
          <el-option v-for="item in roleList" :key="item.value" :value="item.value" :label="item.label" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-checkbox v-model="formData.status" :true-value="0" :false-value="1">启用</el-checkbox>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">提交</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<style scoped lang="scss"></style>
