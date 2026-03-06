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
    <el-dialog v-model="addDialogVisible" title="添加默认好友" width="400px">
      <el-input v-model="addUserIDs" type="textarea" :rows="4" placeholder="请输入用户ID，多个用逗号分隔" />
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addUsers">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { searchDefaultFriend, addDefaultFriend, delDefaultFriend } from '@/api/register'

const loading = ref(false)
const tableData = ref([])
const searchForm = reactive({ userID: '' })
const pagination = reactive({ page: 1, size: 10, total: 0 })
const addDialogVisible = ref(false)
const addUserIDs = ref('')

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
  addUserIDs.value = ''
  addDialogVisible.value = true
}

async function addUsers() {
  const ids = addUserIDs.value.split(',').map(s => s.trim()).filter(Boolean)
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
</style>
