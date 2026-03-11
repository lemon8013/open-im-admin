import { imRequest } from './request'

// ==================== IM 用户 API (imRequest → /api) ====================

// 获取用户信息列表
export function getUsers(data) {
  return imRequest.post('/user/get_users', data)
}

// 获取用户在线 token 详情
export function getUsersOnlineTokenDetail(data) {
  return imRequest.post('/user/get_users_online_token_detail', data)
}

// 强制下线
export function forceLogout(data) {
  return imRequest.post('/auth/force_logout', data)
}

// 获取用户 token
export function getUserToken(data) {
  return imRequest.post('/auth/get_user_token', data)
}

// 搜索通知账号
export function searchNotificationAccounts(data) {
  return imRequest.post('/user/search_notification_account', data)
}

// 添加通知账号
export function addNotificationAccount(data) {
  return imRequest.post('/user/add_notification_account', data)
}
export { addNotificationAccount as createNotificationAccount }

// 更新通知账号
export function updateNotificationAccount(data) {
  return imRequest.post('/user/update_notification_account', data)
}
