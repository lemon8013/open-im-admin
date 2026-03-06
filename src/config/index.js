// URL 配置 - 根据协议动态生成或使用环境变量覆盖
// 原始逻辑 (module 92762):
//   HTTPS -> nginx 子路径: /api, /chat, /complete_admin, /msg_gateway
//   HTTP  -> 端口: :10002, :10008, :10009, :10003
const { hostname, protocol } = window.location
const isHttps = protocol === 'https:'
const wsProtocol = isHttps ? 'wss:' : 'ws:'

export const IM_URL = import.meta.env.VITE_IM_URL ||
  `${protocol}//${hostname}${isHttps ? '/api' : ':10002'}`

export const CHAT_URL = import.meta.env.VITE_CHAT_URL ||
  `${protocol}//${hostname}${isHttps ? '/chat' : ':10008'}`

export const CHAT_ADMIN_URL = import.meta.env.VITE_CHAT_ADMIN_URL ||
  `${protocol}//${hostname}${isHttps ? '/complete_admin' : ':10009'}`

export const WS_URL = import.meta.env.VITE_WS_URL ||
  `${wsProtocol}//${hostname}${isHttps ? '/msg_gateway' : ':10003'}`

export const PROMETHEUS_URL = import.meta.env.VITE_PROMETHEUS_URL ||
  `${IM_URL}/third/prometheus`

// 便捷函数：返回所有配置
export function getConfig() {
  return {
    IM_URL,
    CHAT_URL,
    CHAT_ADMIN_URL,
    WS_URL,
    PROMETHEUS_URL
  }
}
