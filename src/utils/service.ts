import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig
} from "axios"
import { useUserStoreHook } from "@/store/modules/user"
import { ElMessage } from "element-plus"
import { isPlainObject, merge } from "lodash-es"
import { getToken } from "./cache/cookies"
import { sanitizeHTML, truncateString } from "@/utils/index"

class ErrorApiResponse extends Error {
  public readonly code: number | string
  public readonly innerError: AxiosError | Error | object | null
  public readonly response?: AxiosResponse
  public readonly url: string | null
  public readonly config?: AxiosRequestConfig

  constructor(
    message: string,
    code: number | string,
    innerError: AxiosError | Error | object | null,
    response?: AxiosResponse,
    config?: AxiosRequestConfig | InternalAxiosRequestConfig
  ) {
    super(message)
    this.code = code
    this.innerError = innerError
    this.response = response
    this.config = config
    this.url = response?.request?.responseURL

    // 设置原型链
    Object.setPrototypeOf(this, ErrorApiResponse.prototype)
  }

  public isAxiosError(): boolean {
    return axios.isAxiosError(this.innerError)
  }

  public isCancel(): boolean {
    return axios.isCancel(this.innerError)
  }

  public toPromise(): Promise<ErrorApiResponse> {
    return Promise.reject(this)
  }

  public toReportMessage(): string {
    let url = this.url ? new URL(this.url) : ""
    if (url instanceof URL) {
      url = url.pathname + url.search + url.hash
    }
    const responseStatus = `${this.response?.status} ${httpCodeToText(this.response?.status ?? 0) ?? this.response?.statusText}`
    return [sanitizeHTML(this.message), `at status (${responseStatus})`, `at settle (${sanitizeHTML(url)})`].join("\n")
  }

  public static create(
    message: string,
    code: number | string,
    innerError: AxiosError | Error | object | null,
    response?: AxiosResponse,
    config?: AxiosRequestConfig
  ): ErrorApiResponse {
    if (response === undefined && innerError instanceof AxiosError) {
      response = innerError.response
    }
    if (config === undefined && innerError instanceof AxiosError) {
      config = innerError.config
    }

    const error = new ErrorApiResponse(message, code, innerError, response)

    if (innerError instanceof AxiosError) {
      const silentErrorNotify = innerError?.config?.silentErrorNotify ?? true

      silentErrorNotify && responseErrorNotify(error)
    }

    return error
  }
}

function responseErrorNotify(error: ErrorApiResponse) {
  const p = error
    .toReportMessage()
    .split("\n")
    .map((v) => `<p>${v}</p>`)
  ElMessage.error({
    dangerouslyUseHTMLString: true,
    message: p.join("")
  })
}

function httpCodeToText(code: number): string | null {
  switch (code) {
    case 400:
      return "请求错误"
    case 401:
      return "登录状态已过期"
    case 403:
      return "拒绝访问"
    case 404:
      return "请求地址出错"
    case 408:
      return "请求超时"
    case 500:
      return "服务器内部错误"
    case 501:
      return "服务未实现"
    case 502:
      return "网关错误"
    case 503:
      return "服务不可用"
    case 504:
      return "网关超时"
    case 505:
      return "HTTP 版本不受支持"
    default:
      return null
  }
}

/** 退出登录并强制刷新页面（会重定向到登录页） */
function logout() {
  useUserStoreHook().logout()
  location.reload()
}

/** 创建请求实例 */
function createService() {
  // 创建一个 axios 实例命名为 service
  const service = axios.create({
    headers: {
      "X-Requested-With": "XMLHttpRequest"
    }
  })
  // 请求拦截
  service.interceptors.request.use(
    (config) => config,
    // 发送失败
    (error) => Promise.reject(error)
  )
  // 响应拦截（可根据具体业务作出相应的调整）
  service.interceptors.response.use(
    (response) => {
      const respData = response.data
      const requestConfig = response.request as AxiosRequestConfig
      // 二进制数据则直接返回原始结构
      if (
        requestConfig.responseType === "blob" ||
        requestConfig.responseType === "arraybuffer" ||
        !(requestConfig?.extractData || true)
      ) {
        return response
      }
      if (response.status === 204) {
        return Promise.resolve(response)
      }
      // 这个 code 是和后端约定的业务 code
      const code = respData.code
      // 如果没有 code, 代表这不是项目后端开发的 api
      if (code === undefined) {
        return ErrorApiResponse.create("非系统的接口", -1, null, response, requestConfig).toPromise()
      }
      return respData
    },
    async (error) => {
      console.debug(error)
      if (axios.isCancel(error)) {
        error.message = `request canceled: ${error.message}`
        return ErrorApiResponse.create(`request canceled: ${error.message}`, -1, error, undefined).toPromise()
      }
      if (!axios.isAxiosError(error)) {
        return ErrorApiResponse.create(`fault: ${error.message}`, -1, error, undefined).toPromise()
      }
      error = error as AxiosError
      const response = error.response
      const respData = response?.data

      const httpCode = response!.status
      console.log(respData)
      try {
        if (isPlainObject(respData)) {
          const errno = respData?.errno || -1
          const message = respData?.message || "unknown"
          return ErrorApiResponse.create(message, errno, error, response).toPromise()
        } else if (respData instanceof Blob) {
          const result = await respData.text()
          let message = "unknown"
          let errno = -1
          try {
            const data = JSON.parse(result)
            if (isPlainObject(data)) {
              errno = data.errno
              message = data.message
            }
          } catch (e) {
            message = truncateString(result, 128, "[omit...]")
          }
          return ErrorApiResponse.create(message, errno, error, response).toPromise()
        } else {
          return ErrorApiResponse.create("unknown", -1, error, response).toPromise()
        }
      } finally {
        if (httpCode === 401) {
          // 会话过期
          logout()
        }
      }
    }
  )
  return service
}

/** 创建请求方法 */
function createRequest(service: AxiosInstance) {
  return function <T>(config: AxiosRequestConfig): Promise<T> {
    const token = getToken()
    const defaultConfig = {
      headers: {
        // 携带 Token
        Authorization: `Bearer TK="${token}"`,
        "Content-Type": "application/json"
      },
      timeout: 5000,
      baseURL: import.meta.env.VITE_BASE_API,
      data: {}
    }
    // 将默认配置 defaultConfig 和传入的自定义配置 config 进行合并成为 mergeConfig
    const mergeConfig = merge(defaultConfig, config)
    return service(mergeConfig)
  }
}

/** 用于网络请求的实例 */
const service = createService()
/** 用于网络请求的方法 */
export const request = createRequest(service)
