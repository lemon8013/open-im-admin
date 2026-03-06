import { chatAdminRequest } from './request'

// 登录 (baseURL: complete_admin)
export function login(data) {
  return chatAdminRequest.post('/account/login', data)
}

// 获取管理员信息
export function getAdminInfo() {
  return chatAdminRequest.post('/account/info', {})
}

// 修改密码
export function changePassword(data) {
  return chatAdminRequest.post('/account/change_password', data)
}

// 修改个人信息
export function updateAdminInfo(data) {
  return chatAdminRequest.post('/account/update', data)
}
