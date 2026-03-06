<template>
  <div class="page-container">
    <div class="page-header">
      <h3>个人信息</h3>
    </div>

    <el-descriptions :column="1" border style="max-width: 600px">
      <el-descriptions-item label="管理员账号">{{ authStore.account }}</el-descriptions-item>
      <el-descriptions-item label="用户ID">{{ authStore.userID }}</el-descriptions-item>
      <el-descriptions-item label="权限等级">{{ authStore.level }}</el-descriptions-item>
      <el-descriptions-item label="昵称">{{ adminInfo.nickname || '-' }}</el-descriptions-item>
      <el-descriptions-item label="头像">
        <el-avatar :src="adminInfo.faceURL" :size="48">{{ (adminInfo.nickname || '')[0] }}</el-avatar>
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getAdminInfo } from '@/api/auth'

const authStore = useAuthStore()
const adminInfo = reactive({ nickname: '', faceURL: '' })

onMounted(async () => {
  try {
    const res = await getAdminInfo()
    const data = res.data || res
    Object.assign(adminInfo, data)
  } catch (err) {
    console.error(err)
  }
})
</script>

<style scoped>
.page-container { padding: 16px; background: #fff; border-radius: 4px; }
.page-header { margin-bottom: 16px; }
</style>
