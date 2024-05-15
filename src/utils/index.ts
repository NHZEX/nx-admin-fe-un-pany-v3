import dayjs from "dayjs"
import { removeConfigLayout } from "@/utils/cache/local-storage"
import { isNumber, toNumber } from "lodash-es"

/** 用 JS 获取全局 css 变量 */
export const getCssVariableValue = (cssVariableName: string) => {
  let cssVariableValue = ""
  try {
    // 没有拿到值时，会返回空串
    cssVariableValue = getComputedStyle(document.documentElement).getPropertyValue(cssVariableName)
  } catch (error) {
    console.error(error)
  }
  return cssVariableValue
}

/** 用 JS 设置全局 CSS 变量 */
export const setCssVariableValue = (cssVariableName: string, cssVariableValue: string) => {
  try {
    document.documentElement.style.setProperty(cssVariableName, cssVariableValue)
  } catch (error) {
    console.error(error)
  }
}

/** 重置项目配置 */
export const resetConfigLayout = () => {
  removeConfigLayout()
  location.reload()
}

export function blob2DataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as string)
    }
    reader.onerror = () => {
      reject(reader.error)
    }
    reader.readAsDataURL(blob)
  })
}

export function formatUnix(
  timestamp: number | null | undefined,
  format: string | null = null,
  placeholder: string | null = "N/A"
): string {
  timestamp = toNumber(timestamp)
  if ((!isNumber(timestamp) || timestamp <= 0) && placeholder) {
    return placeholder
  }
  return dayjs.unix(timestamp).format(format || "YYYY-MM-DD HH:mm")
}

export function truncateString(str: string, maxLength: number, truncateIndicator: string = "..."): string {
  if (str.length <= maxLength) {
    return str
  } else {
    return str.substring(0, maxLength - truncateIndicator.length) + truncateIndicator
  }
}

export function sanitizeHTML(str: string): string {
  const tempDiv = document.createElement("div")
  tempDiv.textContent = str
  return tempDiv.innerHTML
}
