<template>
  <div class="page-container">
    <div class="page-header">
      <h3>IM 用户列表</h3>
    </div>

    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="昵称">
        <el-input v-model="searchForm.nickname" placeholder="请输入昵称" clearable @keyup.enter="loadData" />
      </el-form-item>
      <el-form-item label="用户ID">
        <el-input v-model="searchForm.userID" placeholder="请输入用户ID" clearable @keyup.enter="loadData" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="loadData">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column type="index" label="#" width="60" />
      <el-table-column label="头像" width="80" align="center">
        <template #default="{ row }">
          <el-avatar :src="row.faceURL" :size="36">{{ (row.nickname || '')[0] }}</el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="nickname" label="昵称" />
      <el-table-column prop="userID" label="用户ID" min-width="200" />
      <el-table-column label="在线状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.onlineStr ? 'success' : 'info'" size="small">
            {{ row.onlineStr || '离线' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center">
        <template #default="{ row }">
          <el-button link type="primary" @click="forceOffline(row)" :disabled="!row.onlineStr">强制下线</el-button>
          <el-button link type="primary" @click="viewRelation(row)">关系链</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 20, 50]"
        @change="loadData"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getUsers, getUsersOnlineTokenDetail, forceLogout } from '@/api/user'

const router = useRouter()
const loading = ref(false)
const tableData = ref([])
const searchForm = reactive({ nickname: '', userID: '' })
const pagination = reactive({ page: 1, size: 10, total: 0 })

onMounted(() => loadData())

async function loadData() {
  loading.value = true
  try {
    const res = await getUsers({
      pagination: { pageNumber: pagination.page, showNumber: pagination.size }
    })
    const data = res.data || res
    const users = data.users || []
    // 获取在线状态
    await fetchOnlineStatus(users)
    tableData.value = users
    pagination.total = data.total || 0
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function fetchOnlineStatus(users) {
  if (!users.length) return
  try {
    const res = await getUsersOnlineTokenDetail({
      userIDs: users.map(u => u.userID)
    })
    const data = res.data || res
    ;(data || []).forEach(item => {
      const user = users.find(u => u.userID === item.userID)
      if (user && item.singlePlatformToken?.length) {
        user.onlineStr = '在线'
      }
    })
  } catch (err) {
    console.error(err)
  }
}

function resetSearch() {
  searchForm.nickname = ''
  searchForm.userID = ''
  pagination.page = 1
  loadData()
}

async function forceOffline(row) {
  try {
    await forceLogout({ userID: row.userID, platformID: 0 })
    ElMessage.success('操作成功')
    loadData()
  } catch (err) {
    console.error(err)
  }
}

function viewRelation(row) {
  router.push('/im/user/relation_list?userID=' + row.userID)
}
</script>

<style scoped>
.page-container { padding: 16px; background: #fff; border-radius: 4px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.search-form { margin-bottom: 16px; }
.pagination-wrap { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
