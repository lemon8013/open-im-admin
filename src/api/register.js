import { chatAdminRequest } from './request'

// ==================== 默认好友 API (chatAdminRequest → /complete_admin) ====================

// 搜索默认好友
export function getDefaultFriends(data) {
  return chatAdminRequest.post('/default/user/search', data)
}
export { getDefaultFriends as searchDefaultFriend }

// 添加默认好友
export function addDefaultFriend(userIDs) {
  return chatAdminRequest.post('/default/user/add', { userIDs })
}

// 删除默认好友
export function deleteDefaultFriend(userIDs) {
  return chatAdminRequest.post('/default/user/del', { userIDs })
}
export { deleteDefaultFriend as delDefaultFriend }

// ==================== 默认群组 API ====================

// 搜索默认群组
export function getDefaultGroups(data) {
  return chatAdminRequest.post('/default/group/search', data)
}
export { getDefaultGroups as searchDefaultGroup }

// 添加默认群组
export function addDefaultGroup(groupIDs) {
  return chatAdminRequest.post('/default/group/add', { groupIDs })
}

// 删除默认群组
export function deleteDefaultGroup(groupIDs) {
  return chatAdminRequest.post('/default/group/del', { groupIDs })
}
export { deleteDefaultGroup as delDefaultGroup }
