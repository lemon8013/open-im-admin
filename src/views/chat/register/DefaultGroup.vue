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
      <el-table-column prop="groupID" label="群组ID" min-width="200" />
      <el-table-column label="群名称">
        <template #default="{ row }">{{ row.group?.groupName || '-' }}</template>
      </el-table-column>
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

    <el-dialog v-model="addDialogVisible" title="添加默认群组" width="400px">
      <el-input v-model="addGroupIDs" type="textarea" :rows="4" placeholder="请输入群组ID，多个用逗号分隔" />
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addGroups">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { searchDefaultGroup, addDefaultGroup, delDefaultGroup } from '@/api/register'

const loading = ref(false)
const tableData = ref([])
const searchForm = reactive({ groupID: '' })
const pagination = reactive({ page: 1, size: 10, total: 0 })
const addDialogVisible = ref(false)
const addGroupIDs = ref('')

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
  addGroupIDs.value = ''
  addDialogVisible.value = true
}

async function addGroups() {
  const ids = addGroupIDs.value.split(',').map(s => s.trim()).filter(Boolean)
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
</style>
