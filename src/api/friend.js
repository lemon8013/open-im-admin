import { chatAdminRequest, imRequest } from './request'

// ==================== 黑名单 API (chatAdminRequest → /complete_admin) ====================

// 搜索黑名单 baseURL: js = /complete_admin
export function searchBlockList(data) {
  return chatAdminRequest.post('/block/search', data)
}
export { searchBlockList as searchBlockUser }

// 添加黑名单
export function addBlockUser(data) {
  return chatAdminRequest.post('/block/add', data)
}

// 移除黑名单
export function removeBlockUser(data) {
  return chatAdminRequest.post('/block/del', data)
}
export { removeBlockUser as unblockUser }

// ==================== 好友 API (imRequest → /api) ====================

// 获取好友列表
export function getFriendList(data) {
  return imRequest.post('/friend/get_friend_list', data)
}

// 删除好友
export function deleteFriend(data) {
  return imRequest.post('/friend/delete_friend', data)
}
