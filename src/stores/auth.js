import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('IMAccountToken') || '')
  const imToken = ref(localStorage.getItem('IMAdminToken') || '')
  const account = ref(localStorage.getItem('IMAdminAccount') || '')
  const userID = ref(localStorage.getItem('IMAdminUserID') || '')
  const level = ref(localStorage.getItem('level') || '')

  function setLoginData(data, accountName) {
    token.value = data.adminToken
    imToken.value = data.imToken
    userID.value = data.imUserID
    level.value = String(data.level)
    account.value = accountName

    localStorage.setItem('IMAccountToken', data.adminToken)
    localStorage.setItem('IMAdminToken', data.imToken)
    localStorage.setItem('IMAdminAccount', accountName)
    localStorage.setItem('IMAdminUserID', data.imUserID)
    localStorage.setItem('level', String(data.level))
  }

  function logout() {
    token.value = ''
    imToken.value = ''
    account.value = ''
    userID.value = ''
    level.value = ''
    localStorage.clear()
  }

  return { token, imToken, account, userID, level, setLoginData, logout }
})
