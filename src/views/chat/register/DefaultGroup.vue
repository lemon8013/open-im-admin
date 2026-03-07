<template>
  <div class="page-container">
    <div class="page-header">
      <h3>默认群组</h3>
      <el-button type="primary" @click="showAddDialog">添加</el-button>
    </div>

    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="群组ID">
        <el-input v-model="searchForm.groupID" placeholder="请输入群组ID" clearable @keyup.enter="loadData" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="loadData">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column type="index" label="#" width="60" />
      <el-table-column label="群头像" width="80" align="center">
        <template #default="{ row }">
          <el-avatar :src="row.faceURL" :size="36">{{ (row.groupName || '')[0] }}</el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="groupID" label="群组ID" min-width="200" />
      <el-table-column prop="groupName" label="群名称" />
      <el-table-column label="操作" width="120" align="center">
        <template #default="{ row }">
          <el-popconfirm title="确定要移除吗？" @confirm="removeGroup(row.groupID)">
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

    <el-dialog v-model="addDialogVisible" title="添加默认群组" width="600px" @open="onDialogOpen">
      <el-form :inline="true" class="search-form" @submit.prevent="searchGroupList">
        <el-form-item>
          <el-input v-model="dialogSearch" placeholder="搜索群名称/群ID" clearable @keyup.enter="searchGroupList" @clear="searchGroupList" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchGroupList">搜索</el-button>
        </el-form-item>
      </el-form>

      <el-table
        :data="groupList"
        v-loading="groupListLoading"
        border
        stripe
        max-height="360"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column label="群头像" width="60" align="center">
          <template #default="{ row }">
            <el-avatar :src="row.groupInfo?.faceURL" :size="32">{{ (row.groupInfo?.groupName || '')[0] }}</el-avatar>
          </template>
        </el-table-column>
        <el-table-column label="群名称">
          <template #default="{ row }">{{ row.groupInfo?.groupName || '-' }}</template>
        </el-table-column>
        <el-table-column label="群ID" min-width="180">
          <template #default="{ row }">{{ row.groupInfo?.groupID }}</template>
        </el-table-column>
        <el-table-column label="成员数" width="80" align="center">
          <template #default="{ row }">{{ row.groupInfo?.memberCount }}</template>
        </el-table-column>
      </el-table>

      <div class="dialog-pagination">
        <el-pagination
          v-model:current-page="dialogPagination.page"
          v-model:page-size="dialogPagination.size"
          :total="dialogPagination.total"
          layout="total, prev, pager, next"
          small
          @change="searchGroupList"
        />
      </div>

      <div v-if="selectedGroups.length" class="selected-info">
        已选择 <strong>{{ selectedGroups.length }}</strong> 个群组
      </div>

      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!selectedGroups.length" @click="addGroups">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { searchDefaultGroup, addDefaultGroup, delDefaultGroup } from '@/api/register'
import { searchGroups } from '@/api/group'

const loading = ref(false)
const tableData = ref([])
const searchForm = reactive({ groupID: '' })
const pagination = reactive({ page: 1, size: 10, total: 0 })
const addDialogVisible = ref(false)

// 对话框中的群组搜索
const dialogSearch = ref('')
const groupList = ref([])
const groupListLoading = ref(false)
const selectedGroups = ref([])
const dialogPagination = reactive({ page: 1, size: 10, total: 0 })

onMounted(() => loadData())

async function loadData() {
  loading.value = true
  try {
    const res = await searchDefaultGroup({
      keyword: searchForm.groupID,
      pagination: { pageNumber: pagination.page, showNumber: pagination.size }
    })
    const data = res.data || res
    tableData.value = data.groups || []
    pagination.total = data.total || 0
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

function resetSearch() {
  searchForm.groupID = ''
  pagination.page = 1
  loadData()
}

function showAddDialog() {
  dialogSearch.value = ''
  groupList.value = []
  selectedGroups.value = []
  dialogPagination.page = 1
  dialogPagination.total = 0
  addDialogVisible.value = true
}

function onDialogOpen() {
  searchGroupList()
}

async function searchGroupList() {
  groupListLoading.value = true
  dialogPagination.page = 1
  try {
    const keyword = dialogSearch.value.trim()
    const res = await searchGroups({
      groupName: keyword,
      groupID: '',
      pagination: { pageNumber: dialogPagination.page, showNumber: dialogPagination.size }
    })
    const data = res.data || res
    let groups = data.groups || []

    // 如果按群名称没搜到结果，再尝试按群ID搜索
    if (!groups.length && keyword) {
      const res2 = await searchGroups({
        groupName: '',
        groupID: keyword,
        pagination: { pageNumber: dialogPagination.page, showNumber: dialogPagination.size }
      })
      const data2 = res2.data || res2
      groups = data2.groups || []
      dialogPagination.total = data2.total || 0
    } else {
      dialogPagination.total = data.total || 0
    }

    groupList.value = groups
  } catch (err) {
    console.error(err)
  } finally {
    groupListLoading.value = false
  }
}

function handleSelectionChange(rows) {
  selectedGroups.value = rows
}

async function addGroups() {
  const ids = selectedGroups.value.map(g => g.groupInfo?.groupID).filter(Boolean)
  if (!ids.length) return
  try {
    await addDefaultGroup(ids)
    ElMessage.success('添加成功')
    addDialogVisible.value = false
    loadData()
  } catch (err) {
    console.error(err)
  }
}

async function removeGroup(groupID) {
  try {
    await delDefaultGroup([groupID])
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
