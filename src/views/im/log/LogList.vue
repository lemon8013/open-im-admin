<template>
  <div class="page-container">
    <div class="page-header">
      <h3>日志列表</h3>
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
      <el-table-column type="index" label="#" width="60" />
      <el-table-column prop="userID" label="用户ID" min-width="200" />
      <el-table-column prop="nickname" label="昵称" />
      <el-table-column prop="filename" label="文件名" min-width="200" />
      <el-table-column label="创建时间" width="170">
        <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center">
        <template #default="{ row }">
          <el-button v-if="row.url" link type="primary" @click="downloadLog(row)">下载</el-button>
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
import { searchLogs } from '@/api/log'

const loading = ref(false)
const tableData = ref([])
const searchForm = reactive({ keyword: '' })
const pagination = reactive({ page: 1, size: 10, total: 0 })

onMounted(() => loadData())

function formatTime(ts) {
  if (!ts) return '-'
  return new Date(ts).toLocaleString()
}

async function loadData() {
  loading.value = true
  try {
    const res = await searchLogs({
      keyword: searchForm.keyword,
      pagination: { pageNumber: pagination.page, showNumber: pagination.size }
    })
    const data = res.data || res
    tableData.value = data.logs || data.logList || []
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

function downloadLog(row) {
  window.open(row.url, '_blank')
}
</script>

<style scoped>
.page-container { padding: 16px; background: #fff; border-radius: 4px; }
.page-header { margin-bottom: 16px; }
.search-form { margin-bottom: 16px; }
.pagination-wrap { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
