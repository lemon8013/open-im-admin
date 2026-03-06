<template>
  <div class="page-container">
    <div class="page-header">
      <h3>关系链 - {{ userID }}</h3>
      <el-button @click="$router.back()">返回</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column type="index" label="#" width="60" />
      <el-table-column label="头像" width="80" align="center">
        <template #default="{ row }">
          <el-avatar :src="row.friendUser?.faceURL" :size="36">
            {{ (row.friendUser?.nickname || '')[0] }}
          </el-avatar>
        </template>
      </el-table-column>
      <el-table-column label="昵称">
        <template #default="{ row }">{{ row.friendUser?.nickname || '-' }}</template>
      </el-table-column>
      <el-table-column label="用户ID" min-width="200">
        <template #default="{ row }">{{ row.friendUser?.userID || '-' }}</template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" />
      <el-table-column label="操作" width="120" align="center">
        <template #default="{ row }">
          <el-popconfirm title="确定要删除该好友关系吗？" @confirm="deleteFriend(row)">
            <template #reference>
              <el-button link type="danger">删除</el-button>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getFriendList, deleteFriend as deleteFriendApi } from '@/api/friend'

const route = useRoute()
const userID = route.query.userID || ''
const loading = ref(false)
const tableData = ref([])
const pagination = reactive({ page: 1, size: 10, total: 0 })

onMounted(() => loadData())

async function loadData() {
  loading.value = true
  try {
    const res = await getFriendList({
      userID,
      pagination: { pageNumber: pagination.page, showNumber: pagination.size }
    })
    const data = res.data || res
    tableData.value = data.friendsInfo || data.friends || []
    pagination.total = data.total || tableData.value.length
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function deleteFriend(row) {
  try {
    await deleteFriendApi({
      ownerUserID: userID,
      friendUserID: row.friendUser?.userID
    })
    ElMessage.success('删除成功')
    loadData()
  } catch (err) {
    console.error(err)
  }
}
</script>

<style scoped>
.page-container { padding: 16px; background: #fff; border-radius: 4px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.pagination-wrap { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
