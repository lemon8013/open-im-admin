<template>
  <div class="page-container">
    <div class="page-header">
      <h3>群组列表</h3>
      <el-button type="primary" @click="openCreate">创建群组</el-button>
    </div>

    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="群组名称">
        <el-input v-model="searchForm.groupName" placeholder="请输入群组名称" clearable @keyup.enter="loadData" />
      </el-form-item>
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
          <el-avatar :src="row.groupInfo?.faceURL" :size="36">{{ (row.groupInfo?.groupName || '')[0] }}</el-avatar>
        </template>
      </el-table-column>
      <el-table-column label="群名称">
        <template #default="{ row }">{{ row.groupInfo?.groupName }}</template>
      </el-table-column>
      <el-table-column label="群组ID" min-width="200">
        <template #default="{ row }">{{ row.groupInfo?.groupID }}</template>
      </el-table-column>
      <el-table-column label="成员数" width="80" align="center">
        <template #default="{ row }">{{ row.groupInfo?.memberCount }}</template>
      </el-table-column>
      <el-table-column label="群主ID">
        <template #default="{ row }">{{ row.groupInfo?.ownerUserID }}</template>
      </el-table-column>
      <el-table-column label="创建时间" width="120">
        <template #default="{ row }">{{ formatDate(row.groupInfo?.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="280" align="center">
        <template #default="{ row }">
          <el-button link type="primary" @click="viewMembers(row)">成员</el-button>
          <el-button link type="primary" @click="openEdit(row)">设置</el-button>
          <el-popconfirm
            :title="row.groupInfo?.status === 3 ? '确定解除全体禁言？' : '确定全体禁言？'"
            @confirm="toggleMute(row)"
          >
            <template #reference>
              <el-button link type="warning">
                {{ row.groupInfo?.status === 3 ? '解除禁言' : '全体禁言' }}
              </el-button>
            </template>
          </el-popconfirm>
          <el-popconfirm title="确定要解散该群组吗？" @confirm="dismissGroup(row)">
            <template #reference>
              <el-button link type="danger">解散</el-button>
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

    <!-- 创建/编辑 -->
    <el-drawer v-model="drawerVisible" :title="editGroup ? '群组设置' : '创建群组'" size="500px">
      <el-form ref="formRef" :model="groupForm" :rules="formRules" label-width="100px">
        <el-form-item label="群名称" prop="groupName">
          <el-input v-model="groupForm.groupName" maxlength="15" placeholder="请输入群名称" />
        </el-form-item>
        <el-form-item v-if="editGroup" label="群组ID">
          <el-input v-model="groupForm.groupID" disabled />
        </el-form-item>
        <el-form-item label="入群验证" prop="needVerification">
          <el-select v-model="groupForm.needVerification">
            <el-option label="都需要验证" :value="1" />
            <el-option label="都不需要验证" :value="2" />
            <el-option label="申请需要,邀请不需要" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="加好友权限" prop="applyMemberFriend">
          <el-select v-model="groupForm.applyMemberFriend">
            <el-option label="允许" :value="0" />
            <el-option label="不允许" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="查看成员信息" prop="lookMemberInfo">
          <el-select v-model="groupForm.lookMemberInfo">
            <el-option label="允许" :value="0" />
            <el-option label="不允许" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="群公告">
          <el-input v-model="groupForm.notification" type="textarea" :rows="3" maxlength="250" />
        </el-form-item>
        <el-form-item label="群简介">
          <el-input v-model="groupForm.introduction" type="textarea" :rows="3" maxlength="250" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getGroups, createGroup, setGroupInfo, muteGroup, cancelMuteGroup, dismissGroup as dismissGroupApi } from '@/api/group'

const router = useRouter()
const loading = ref(false)
const tableData = ref([])
const searchForm = reactive({ groupName: '', groupID: '' })
const pagination = reactive({ page: 1, size: 10, total: 0 })
const drawerVisible = ref(false)
const editGroup = ref(null)
const formRef = ref(null)
const groupForm = reactive({
  groupName: '', groupID: '', needVerification: 1,
  applyMemberFriend: 0, lookMemberInfo: 0,
  notification: '', introduction: ''
})
const formRules = {
  groupName: [{ required: true, message: '请输入群名称', trigger: 'blur' }]
}

onMounted(() => loadData())

function formatDate(ts) {
  if (!ts) return '-'
  return new Date(ts).toLocaleDateString()
}

async function loadData() {
  loading.value = true
  try {
    const res = await getGroups({
      groupID: searchForm.groupID || '',
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
  searchForm.groupName = ''
  searchForm.groupID = ''
  pagination.page = 1
  loadData()
}

function openCreate() {
  editGroup.value = null
  Object.assign(groupForm, {
    groupName: '', groupID: '', needVerification: 1,
    applyMemberFriend: 0, lookMemberInfo: 0,
    notification: '', introduction: ''
  })
  drawerVisible.value = true
}

function openEdit(row) {
  editGroup.value = row
  const info = row.groupInfo || {}
  Object.assign(groupForm, {
    groupName: info.groupName, groupID: info.groupID,
    needVerification: info.needVerification,
    applyMemberFriend: info.applyMemberFriend,
    lookMemberInfo: info.lookMemberInfo,
    notification: info.notification, introduction: info.introduction
  })
  drawerVisible.value = true
}

async function submitForm() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  try {
    if (editGroup.value) {
      await setGroupInfo({
        groupInfoForSet: {
          groupID: groupForm.groupID,
          groupName: groupForm.groupName,
          notification: groupForm.notification,
          introduction: groupForm.introduction,
          needVerification: groupForm.needVerification,
          lookMemberInfo: groupForm.lookMemberInfo,
          applyMemberFriend: groupForm.applyMemberFriend
        }
      })
    } else {
      await createGroup({
        memberUserIDs: [],
        adminUserIDs: [],
        ownerUserID: '',
        groupInfo: {
          groupName: groupForm.groupName,
          notification: groupForm.notification,
          introduction: groupForm.introduction,
          groupType: 2,
          needVerification: groupForm.needVerification,
          lookMemberInfo: groupForm.lookMemberInfo,
          applyMemberFriend: groupForm.applyMemberFriend
        }
      })
    }
    ElMessage.success('操作成功')
    drawerVisible.value = false
    loadData()
  } catch (err) {
    console.error(err)
  }
}

function viewMembers(row) {
  router.push({ path: '/im/group/group_member', query: { groupID: row.groupInfo?.groupID } })
}

async function toggleMute(row) {
  const isMuted = row.groupInfo?.status === 3
  try {
    if (isMuted) {
      await cancelMuteGroup(row.groupInfo.groupID)
    } else {
      await muteGroup(row.groupInfo.groupID)
    }
    ElMessage.success('操作成功')
    loadData()
  } catch (err) {
    console.error(err)
  }
}

async function dismissGroup(row) {
  try {
    await dismissGroupApi(row.groupInfo.groupID)
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
