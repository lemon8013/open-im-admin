import { imRequest } from './request'

// 搜索群组
export function searchGroups(data) {
  return imRequest.post('/group/get_groups', data)
}
export { searchGroups as getGroups }

// 创建群组
export function createGroup(data) {
  return imRequest.post('/group/create_group', data)
}

// 修改群组信息
export function setGroupInfo(data) {
  return imRequest.post('/group/set_group_info', data)
}

// 全体禁言
export function muteGroup(groupID) {
  return imRequest.post('/group/mute_group', { groupID })
}

// 取消全体禁言
export function cancelMuteGroup(groupID) {
  return imRequest.post('/group/cancel_mute_group', { groupID })
}

// 解散群组
export function dismissGroup(groupID) {
  return imRequest.post('/group/dismiss_group', { groupID: groupID })
}

// 获取群成员列表
export function getGroupMembers(data) {
  return imRequest.post('/group/get_group_member_list', data)
}

// 踢出群成员
export function kickGroupMember(data) {
  return imRequest.post('/group/kick_group_member', data)
}

// 转让群主
export function transferGroupOwner(data) {
  return imRequest.post('/group/transfer_group_owner', data)
}
