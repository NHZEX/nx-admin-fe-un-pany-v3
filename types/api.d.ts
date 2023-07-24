/** 所有 api 接口的响应数据都应该准守该格式 */
interface ApiResponseData<T> {
  code: number
  data: T
  message: string
}

interface PageListResponseData<T> extends ApiResponseData {
  data: T[]
  total: number
  page: {
    current: number
    size: number
    hasMore: boolean
  }
}

type ObjectId = number | string
