<template>
  <div class="page-container">
    <div class="page-header">
      <h3>黑名单</h3>
    </div>

    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="关键词">
        <el-input v-model="searchForm.keyword" placeholder="请输入用户ID/昵称" clearable @keyup.enter="loadData" />
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
      <el-table-column label="性别" width="80" align="center">
        <template #default="{ row }">
          {{ row.gender === 1 ? '男' : row.gender === 2 ? '女' : '保密' }}
        </template>
      </el-table-column>
      <el-table-column prop="phoneNumber" label="手机号" />
      <el-table-column label="操作" width="120" align="center">
        <template #default="{ row }">
          <el-popconfirm title="确定要解除封禁吗？" @confirm="unblock(row)">
            <template #reference>
              <el-button link type="primary">解除封禁</el-button>
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
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 20, 50]"
        @change="loadData"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { searchBlockUser, unblockUser } from '@/api/friend'

const loading = ref(false)
const tableData = ref([])
const searchForm = reactive({ keyword: '' })
const pagination = reactive({ page: 1, size: 10, total: 0 })

onMounted(() => loadData())

async function loadData() {
  loading.value = true
  try {
    const res = await searchBlockUser({
      keyword: searchForm.keyword,
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
  searchForm.keyword = ''
  pagination.page = 1
  loadData()
}

async function unblock(row) {
  try {
    await unblockUser({ userIDs: [row.userID] })
    ElMessage.success('操作成功')
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
