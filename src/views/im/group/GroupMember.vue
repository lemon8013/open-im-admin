<template>
  <div class="page-container">
    <div class="page-header">
      <h3>群成员 - {{ groupName }}</h3>
      <el-button @click="$router.back()">返回</el-button>
    </div>

    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="关键词">
        <el-input v-model="searchForm.keyword" placeholder="请输入昵称/用户ID" clearable @keyup.enter="loadData" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="loadData">搜索</el-button>
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
      <el-table-column label="角色" width="100" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.roleLevel === 100" type="danger" size="small">群主</el-tag>
          <el-tag v-else-if="row.roleLevel === 60" type="warning" size="small">管理员</el-tag>
          <el-tag v-else size="small">成员</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="加入时间" width="120">
        <template #default="{ row }">{{ formatDate(row.joinTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center">
        <template #default="{ row }">
          <el-popconfirm v-if="row.roleLevel !== 100" title="确定要踢出该成员吗？" @confirm="kickMember(row)">
            <template #reference>
              <el-button link type="danger">踢出</el-button>
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
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getGroupMembers, kickGroupMember } from '@/api/group'

const route = useRoute()
const groupID = route.query.groupID || ''
const groupName = route.query.groupName || ''
const loading = ref(false)
const tableData = ref([])
const searchForm = reactive({ keyword: '' })
const pagination = reactive({ page: 1, size: 10, total: 0 })

onMounted(() => loadData())

function formatDate(ts) {
  if (!ts) return '-'
  return new Date(ts).toLocaleDateString()
}

async function loadData() {
  loading.value = true
  try {
    const res = await getGroupMembers({
      groupID,
      keyword: searchForm.keyword,
      pagination: { pageNumber: pagination.page, showNumber: pagination.size }
    })
    const data = res.data || res
    tableData.value = data.members || []
    pagination.total = data.total || 0
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function kickMember(row) {
  try {
    await kickGroupMember({
      groupID,
      kickedUserIDs: [row.userID],
      reason: ''
    })
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
