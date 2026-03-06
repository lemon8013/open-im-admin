import { imRequest } from './request'

// 获取聊天记录
export function getChatLogs(data) {
  return imRequest.post('/msg/search_msg', data)
}

// 发送通知消息
export function sendNotification(data) {
  return imRequest.post('/msg/send_msg', data)
}
