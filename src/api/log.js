import { imRequest } from './request'

// 获取日志列表
export function searchLogs(data) {
  return imRequest.post('/logs/search', data)
}

// 删除日志
export function deleteLogs(data) {
  return imRequest.post('/logs/delete', data)
}
