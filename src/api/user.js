import { chatRequest, chatAdminRequest, imRequest } from './request'

// ==================== Chat 用户 API (chatRequest → /chat) ====================

// 封禁用户 baseURL: js = /complete_admin
export function blockUser(data) {
  return chatAdminRequest.post('/block/add', data)
}

// 搜索用户（完整信息） baseURL: bt = /chat
export function searchUserFull(data) {
  return chatRequest.post('/user/search/full', data)
}

// 更新用户信息（Chat 服务） baseURL: bt = /chat
export function updateUserInfo(data) {
  return chatRequest.post('/user/update', data)
}

// ==================== Chat Admin 用户 API (chatAdminRequest → /complete_admin) ====================

// 重置密码 baseURL: js = /complete_admin
export function resetUserPassword(data) {
  return chatAdminRequest.post('/user/password/reset', data)
}

// 导入用户 baseURL: js = /complete_admin
export function importUsers(data) {
  return chatAdminRequest.post('/user/import/json', data)
}

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
