<template>
  <div class="page-container">
    <div class="page-header">
      <h3>通知账号</h3>
      <el-button type="primary" @click="showAddDialog">创建</el-button>
    </div>

    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="关键词">
        <el-input v-model="searchForm.keyword" placeholder="请输入关键词" clearable @keyup.enter="loadData" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="loadData">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column label="头像" width="80" align="center">
        <template #default="{ row }">
          <el-avatar :src="row.faceURL" :size="36">{{ (row.nickname || '')[0] }}</el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="nickname" label="昵称" />
      <el-table-column prop="userID" label="用户ID" min-width="200" />
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

    <el-dialog v-model="addDialogVisible" title="创建通知账号" width="400px">
      <el-form :model="addForm" label-width="80px">
        <el-form-item label="用户ID">
          <el-input v-model="addForm.userID" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="addForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="头像URL">
          <el-input v-model="addForm.faceURL" placeholder="请输入头像URL" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addAccount">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { searchNotificationAccounts, createNotificationAccount } from '@/api/user'

const loading = ref(false)
const tableData = ref([])
const searchForm = reactive({ keyword: '' })
const pagination = reactive({ page: 1, size: 10, total: 0 })
const addDialogVisible = ref(false)
const addForm = reactive({ userID: '', nickname: '', faceURL: '' })

onMounted(() => loadData())

async function loadData() {
  loading.value = true
  try {
    const res = await searchNotificationAccounts({
      keyword: searchForm.keyword,
      pagination: { pageNumber: pagination.page, showNumber: pagination.size }
    })
    const data = res.data || res
    tableData.value = data.notificationAccounts || []
    pagination.total = data.total || 0
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

function resetSearch() {
  searchForm.keyword = ''
  pagination.page = 1
  loadData()
}

function showAddDialog() {
  Object.assign(addForm, { userID: '', nickname: '', faceURL: '' })
  addDialogVisible.value = true
}

async function addAccount() {
  try {
    await createNotificationAccount(addForm)
    ElMessage.success('创建成功')
    addDialogVisible.value = false
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
</style>
