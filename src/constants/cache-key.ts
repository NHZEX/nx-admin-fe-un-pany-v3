const SYSTEM_NAME = import.meta.env.VITE_APP_SYSTEM_NAME || "v3-admin-vite"

/** 缓存数据时用到的 Key */
class CacheKey {
  static readonly UUID = `${SYSTEM_NAME}-uuid`
  static readonly TOKEN = `${SYSTEM_NAME}-token`
  static readonly SIDEBAR_STATUS = `${SYSTEM_NAME}-sidebar-status-key`
  static readonly ACTIVE_THEME_NAME = `${SYSTEM_NAME}-active-theme-name-key`
}

export default CacheKey
