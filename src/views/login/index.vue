<script lang="ts" setup>
import { onMounted, reactive, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { useUserStore } from "@/store/modules/user"
import { type FormInstance, type FormRules, type ElInput } from "element-plus"
import { User, Lock, Key, Picture, Loading } from "@element-plus/icons-vue"
import { getLoginCodeApi, getLoginConfigApi } from "@/api/login"
import { type LoginRequestData, LoginConfig } from "@/api/login/types/login"
import ThemeSwitch from "@/components/ThemeSwitch/index.vue"
import Owl from "./components/Owl.vue"
import { blob2DataUrl } from "@/utils"
import { useFocus } from "./hooks/useFocus"
import { useSettingsStore } from "@/store/modules/settings"

const router = useRouter()
const { isFocus, handleBlur, handleFocus } = useFocus()
const settingsStore = useSettingsStore()

/** 登录表单元素的引用 */
const loginFormRef = ref<FormInstance | null>(null)
const formCodeRef = ref<InstanceType<typeof ElInput> | null>(null)

const loginConfig = ref<LoginConfig>({
  enableCaptcha: false
})
const loginSuccess = ref<boolean>(false)

/** 登录按钮 Loading */
const loading = ref(false)
/** 验证码图片 URL */
const codeUrl = ref("")
/** 登录表单数据 */
const loginFormData: LoginRequestData = reactive({
  username: "admin123",
  password: "admin123",
  code: "",
  token: null,
  lasting: false
})
/** 登录表单校验规则 */
const loginFormRules: FormRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 64, message: "长度在 8 到 16 个字符", trigger: "blur" }
  ],
  code: [{ required: true, message: "请输入验证码", trigger: "blur" }]
}
/** 登录逻辑 */
const handleLogin = () => {
  if (loading.value) {
    console.warn("wait for data to load")
    return
  }
  loginFormRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      loading.value = true
      useUserStore()
        .login(loginFormData)
        .then(() => {
          loginSuccess.value = true
          router.push({ path: "/" })
        })
        .catch(({ response }) => {
          if (response?.data?.code === 1103) {
            loginFormData.password = ""
          } else if (response?.data?.code === 1001) {
            createCode({ focus: true })
          } else {
            loginFormData.password = ""
          }
        })
        .finally(() => {
          loading.value = false
        })
    } else {
      console.error("表单校验不通过", fields)
    }
  })
}
/** 创建验证码 */
const createCode = (options: { focus: boolean } = { focus: false }): void => {
  if (!loginConfig.value.enableCaptcha) {
    return
  }
  // 先清空验证码的输入
  loginFormData.code = ""
  // 获取验证码
  codeUrl.value = ""

  loading.value = true
  getLoginCodeApi()
    .then(async (res) => {
      codeUrl.value = await blob2DataUrl(res.data)
      loginFormData.token = res.headers["x-captcha-token"]
      if (
        import.meta.env.MODE === "development" &&
        Object.prototype.hasOwnProperty.call(res.headers, "x-test-captcha-code")
      ) {
        loginFormData.code = res.headers["x-test-captcha-code"]
      }
    })
    .finally(() => {
      loading.value = false
      if (options.focus) {
        formCodeRef.value?.focus()
      }
    })
}

const loadConfig = async () => {
  loading.value = true
  try {
    const { data } = await getLoginConfigApi()
    loginConfig.value = data
  } finally {
    loading.value = false
  }
}

watch(
  () => loginConfig.value.enableCaptcha,
  (value) => {
    if (value) {
      /** 初始化验证码 */
      createCode()
    }
  }
)

onMounted(loadConfig)
</script>

<template>
  <div class="login-container">
    <ThemeSwitch class="theme-switch" />
    <Owl :close-eyes="isFocus" v-if="settingsStore.showLoginOwl" />
    <div class="login-card">
      <div class="title">
        <img src="@/assets/layouts/logo-text-2.png" alt="logo-title" />
      </div>
      <div class="content">
        <el-form ref="loginFormRef" :model="loginFormData" :rules="loginFormRules" @keyup.enter="handleLogin">
          <el-form-item prop="username">
            <el-input
              v-model.trim="loginFormData.username"
              placeholder="用户名"
              type="text"
              tabindex="1"
              :prefix-icon="User"
              size="large"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model.trim="loginFormData.password"
              placeholder="密码"
              type="password"
              tabindex="2"
              :prefix-icon="Lock"
              size="large"
              show-password
              @blur="handleBlur"
              @focus="handleFocus"
            />
          </el-form-item>
          <el-form-item prop="code" v-if="loginConfig.enableCaptcha">
            <el-input
              ref="formCodeRef"
              v-model.trim="loginFormData.code"
              placeholder="验证码"
              type="text"
              tabindex="3"
              :prefix-icon="Key"
              maxlength="7"
              size="large"
            >
              <template #append>
                <el-image :src="codeUrl" @click="createCode" draggable="false">
                  <template #placeholder>
                    <el-icon>
                      <Picture />
                    </el-icon>
                  </template>
                  <template #error>
                    <el-icon>
                      <Loading />
                    </el-icon>
                  </template>
                </el-image>
              </template>
            </el-input>
          </el-form-item>
          <el-button
            :loading="loading"
            type="primary"
            size="large"
            @click.prevent="handleLogin"
            :disabled="loginSuccess"
            >登 录</el-button
          >
        </el-form>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 100%;
  .theme-switch {
    position: fixed;
    top: 5%;
    right: 5%;
    cursor: pointer;
  }
  .login-card {
    width: 480px;
    max-width: 90%;
    border-radius: 20px;
    box-shadow: 0 0 10px #dcdfe6;
    background-color: var(--el-bg-color);
    overflow: hidden;
    .title {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 150px;
      img {
        height: 100%;
      }
    }
    .content {
      padding: 20px 50px 50px 50px;
      :deep(.el-input-group__append) {
        padding: 0;
        overflow: hidden;
        .el-image {
          width: 100px;
          height: 40px;
          border-left: 0px;
          user-select: none;
          cursor: pointer;
          text-align: center;
        }
      }
      .el-button {
        width: 100%;
        margin-top: 10px;
      }
    }
  }
}
</style>
