import axios from 'axios'
import { ElMessage } from 'element-plus'
import { IM_URL, CHAT_URL, CHAT_ADMIN_URL } from '@/config'
import router from '@/router'

// 生成 operationID
function genOperationID() {
  return Date.now().toString() + Math.floor(Math.random() * 10000)
}

// 创建 axios 实例工厂
function createRequest(baseURL, tokenKey) {
  const instance = axios.create({ baseURL, timeout: 30000 })

  // 请求拦截器：注入 token 和 operationID
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem(tokenKey)
    if (token) {
      config.headers.token = token
    }
    // 将 operationID 放在 headers 中
    config.headers.operationID = config.headers.operationID || genOperationID()
    return config
  })

  // 响应拦截器：统一错误处理
  instance.interceptors.response.use(
    (response) => {
      const { data } = response
      if (data.errCode === 0) {
        return data
      }
      // 其他业务错误，提示错误信息，不跳转登录
      const errMsg = data.errMsg || data.errDlt || '操作失败'
      ElMessage.error(errMsg)
      return Promise.reject(data)
    },
    (error) => {
      // 网络错误 / 超时等
      if (error.response) {
        const status = error.response.status
        ElMessage.error(`请求错误 (${status})`)
      } else if (error.code === 'ECONNABORTED') {
        ElMessage.error('请求超时，请稍后重试')
      } else {
        ElMessage.error('网络异常，请检查网络连接')
      }
      return Promise.reject(error)
    }
  )

  return instance
}

// 三个 API 实例
// imRequest -> /api (IM 服务)，使用 IMAdminToken
export const imRequest = createRequest(IM_URL, 'IMAdminToken')

// chatRequest -> /chat (Chat 服务)，使用 IMAccountToken
export const chatRequest = createRequest(CHAT_URL, 'IMAccountToken')

// chatAdminRequest -> /complete_admin (Chat Admin 服务)，使用 IMAccountToken
export const chatAdminRequest = createRequest(CHAT_ADMIN_URL, 'IMAccountToken')
