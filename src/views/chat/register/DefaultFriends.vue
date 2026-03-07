<template>
  <div class="page-container">
    <div class="page-header">
      <h3>默认好友</h3>
      <el-button type="primary" @click="showAddDialog">添加</el-button>
    </div>

    <el-form :inline="true" :model="searchForm" class="search-form">
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
      <el-table-column prop="userID" label="用户ID" min-width="200" />
      <el-table-column label="昵称">
        <template #default="{ row }">{{ row.user?.nickname || '-' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center">
        <template #default="{ row }">
          <el-popconfirm title="确定要移除吗？" @confirm="removeUser(row.userID)">
            <template #reference>
              <el-button link type="danger">移除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        layout="total, prev, pager, next"
        @change="loadData"
      />
    </div>

    <!-- 添加用户对话框 -->
    <el-dialog v-model="addDialogVisible" title="添加默认好友" width="600px" @open="onDialogOpen">
      <el-form :inline="true" class="search-form" @submit.prevent="searchUsers">
        <el-form-item>
          <el-input v-model="dialogSearch" placeholder="搜索用户昵称/手机号/ID" clearable @keyup.enter="searchUsers" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchUsers">搜索</el-button>
        </el-form-item>
      </el-form>

      <el-table
        ref="selectTableRef"
        :data="userList"
        v-loading="userListLoading"
        border
        stripe
        max-height="360"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column label="头像" width="60" align="center">
          <template #default="{ row }">
            <el-avatar :src="row.faceURL" :size="32">{{ (row.nickname || '')[0] }}</el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="userID" label="用户ID" min-width="180" />
        <el-table-column prop="phoneNumber" label="手机号" />
      </el-table>

      <div class="dialog-pagination">
        <el-pagination
          v-model:current-page="dialogPagination.page"
          v-model:page-size="dialogPagination.size"
          :total="dialogPagination.total"
          layout="total, prev, pager, next"
          :page-sizes="[10, 20]"
          small
          @change="searchUsers"
        />
      </div>

      <div v-if="selectedUsers.length" class="selected-info">
        已选择 <strong>{{ selectedUsers.length }}</strong> 个用户
      </div>

      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!selectedUsers.length" @click="addUsers">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { searchDefaultFriend, addDefaultFriend, delDefaultFriend } from '@/api/register'
import { searchUserFull } from '@/api/user'

const loading = ref(false)
const tableData = ref([])
const searchForm = reactive({ userID: '' })
const pagination = reactive({ page: 1, size: 10, total: 0 })
const addDialogVisible = ref(false)

// 对话框中的用户搜索
const dialogSearch = ref('')
const userList = ref([])
const userListLoading = ref(false)
const selectedUsers = ref([])
const selectTableRef = ref(null)
const dialogPagination = reactive({ page: 1, size: 10, total: 0 })

onMounted(() => loadData())

async function loadData() {
  loading.value = true
  try {
    const res = await searchDefaultFriend({
      keyword: searchForm.userID,
      pagination: { pageNumber: pagination.page, showNumber: pagination.size }
    })
    const data = res.data || res
    tableData.value = data.users || []
    pagination.total = data.total || 0
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

function resetSearch() {
  searchForm.userID = ''
  pagination.page = 1
  loadData()
}

function showAddDialog() {
  dialogSearch.value = ''
  userList.value = []
  selectedUsers.value = []
  dialogPagination.page = 1
  dialogPagination.total = 0
  addDialogVisible.value = true
}

function onDialogOpen() {
  searchUsers()
}

async function searchUsers() {
  userListLoading.value = true
  try {
    const res = await searchUserFull({
      keyword: dialogSearch.value,
      normal: 1,
      pagination: { pageNumber: dialogPagination.page, showNumber: dialogPagination.size }
    })
    const data = res.data || res
    userList.value = data.users || []
    dialogPagination.total = data.total || 0
  } catch (err) {
    console.error(err)
  } finally {
    userListLoading.value = false
  }
}

function handleSelectionChange(rows) {
  selectedUsers.value = rows
}

async function addUsers() {
  const ids = selectedUsers.value.map(u => u.userID)
  if (!ids.length) return
  try {
    await addDefaultFriend(ids)
    ElMessage.success('添加成功')
    addDialogVisible.value = false
    loadData()
  } catch (err) {
    console.error(err)
  }
}

async function removeUser(userID) {
  try {
    await delDefaultFriend([userID])
    ElMessage.success('移除成功')
    loadData()
  } catch (err) {
    console.error(err)
  }
}
</script>

<style scoped>
.page-container { padding: 16px; background: #fff; border-radius: 4px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.search-form { margin-bottom: 16px; }
.pagination-wrap { margin-top: 16px; display: flex; justify-content: flex-end; }
.dialog-pagination { margin-top: 12px; display: flex; justify-content: flex-end; }
.selected-info { margin-top: 10px; font-size: 13px; color: #606266; }
</style>
