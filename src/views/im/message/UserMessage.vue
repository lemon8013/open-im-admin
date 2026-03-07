<template>
  <div class="page-container">
    <div class="page-header">
      <h3>单聊记录</h3>
    </div>

    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="发送者ID">
        <el-input v-model="searchForm.sendID" placeholder="请输入发送者ID" clearable />
      </el-form-item>
      <el-form-item label="接收者ID">
        <el-input v-model="searchForm.recvID" placeholder="请输入接收者ID" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="loadData">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="sendID" label="发送者ID" min-width="200" />
      <el-table-column prop="senderNickname" label="发送者昵称" />
      <el-table-column prop="recvID" label="接收者ID" min-width="200" />
      <el-table-column label="消息类型" width="100" align="center">
        <template #default="{ row }">{{ getMessageType(row.contentType) }}</template>
      </el-table-column>
      <el-table-column label="内容" min-width="200">
        <template #default="{ row }">
          <span class="msg-content">{{ getContent(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="发送时间" width="170">
        <template #default="{ row }">{{ formatTime(row.sendTime) }}</template>
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
import { getChatLogs } from '@/api/message'

const loading = ref(false)
const tableData = ref([])
const searchForm = reactive({ sendID: '', recvID: '' })
const pagination = reactive({ page: 1, size: 20, total: 0 })

const msgTypes = { 101: '文本', 102: '图片', 103: '语音', 104: '视频', 105: '文件', 106: '@消息', 114: '引用', 115: '合并', 109: '位置' }

function getMessageType(type) {
  return msgTypes[type] || '其他'
}

function getContent(row) {
  if (row.contentType === 101) return row.textElem?.content || row.content || ''
  return `[${getMessageType(row.contentType)}]`
}

function formatTime(ts) {
  if (!ts) return '-'
  return new Date(ts).toLocaleString()
}

async function loadData() {
  if (!searchForm.sendID && !searchForm.recvID) return
  loading.value = true
  try {
    const res = await getChatLogs({
      sendID: searchForm.sendID,
      recvID: searchForm.recvID,
      pagination: { pageNumber: pagination.page, showNumber: pagination.size }
    })
    const data = res.data || res
    tableData.value = data.chatLogs || []
    pagination.total = data.chatLogsNum || 0
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

function resetSearch() {
  searchForm.sendID = ''
  searchForm.recvID = ''
  pagination.page = 1
  tableData.value = []
}
</script>

<style scoped>
.page-container { padding: 16px; background: #fff; border-radius: 4px; }
.page-header { margin-bottom: 16px; }
.search-form { margin-bottom: 16px; }
.pagination-wrap { margin-top: 16px; display: flex; justify-content: flex-end; }
.msg-content { display: inline-block; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
