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

        <!-- 创建时显示：群主(必填)、群成员(必填)、群管理员(选填) -->
        <template v-if="!editGroup">
          <el-form-item label="群主" prop="ownerUserID" required>
            <div class="user-select-wrap">
              <div v-if="selectedOwner" class="selected-user-tag">
                <el-tag closable @close="removeOwner">
                  {{ selectedOwner.nickname || selectedOwner.userID }}
                </el-tag>
              </div>
              <el-button type="primary" link @click="openUserPicker('owner')">
                {{ selectedOwner ? '重新选择' : '选择群主' }}
              </el-button>
            </div>
          </el-form-item>



          <el-form-item label="群管理员">
            <div class="user-select-wrap">
              <div v-if="selectedAdmins.length" class="selected-user-tags">
                <el-tag v-for="u in selectedAdmins" :key="u.userID" closable @close="removeAdmin(u.userID)" style="margin: 2px;">
                  {{ u.nickname || u.userID }}
                </el-tag>
              </div>
              <el-button type="primary" link @click="openUserPicker('admin')">
                {{ selectedAdmins.length ? '继续添加' : '选择管理员' }}
              </el-button>
              <span v-if="selectedAdmins.length" class="selected-count">已选 {{ selectedAdmins.length }} 人</span>
            </div>
          </el-form-item>

                    <el-form-item label="群成员" prop="memberUserIDs" required>
            <div class="user-select-wrap">
              <div v-if="selectedMembers.length" class="selected-user-tags">
                <el-tag v-for="u in selectedMembers" :key="u.userID" closable @close="removeMember(u.userID)" style="margin: 2px;">
                  {{ u.nickname || u.userID }}
                </el-tag>
              </div>
              <el-button type="primary" link @click="openUserPicker('member')">
                {{ selectedMembers.length ? '继续添加' : '选择群成员' }}
              </el-button>
              <span v-if="selectedMembers.length" class="selected-count">已选 {{ selectedMembers.length }} 人</span>
            </div>
          </el-form-item>
        </template>

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

    <!-- 用户选择对话框 -->
    <el-dialog v-model="userPickerVisible" :title="userPickerTitle" width="620px" @open="onUserPickerOpen">
      <el-form :inline="true" class="search-form" @submit.prevent="searchPickerUsers">
        <el-form-item>
          <el-input v-model="pickerSearch" placeholder="搜索用户昵称/手机号/ID" clearable @keyup.enter="searchPickerUsers" @clear="searchPickerUsers" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchPickerUsers">搜索</el-button>
        </el-form-item>
      </el-form>

      <el-table
        ref="pickerTableRef"
        :data="pickerUserList"
        v-loading="pickerLoading"
        border
        stripe
        max-height="360"
        @selection-change="handlePickerSelectionChange"
      >
        <el-table-column v-if="pickerMode !== 'owner'" type="selection" width="50" :selectable="checkSelectable" />
        <el-table-column label="头像" width="60" align="center">
          <template #default="{ row }">
            <el-avatar :src="row.faceURL" :size="32">{{ (row.nickname || '')[0] }}</el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="userID" label="用户ID" min-width="180" />
        <el-table-column prop="phoneNumber" label="手机号" min-width="180"/>
        <el-table-column v-if="pickerMode === 'owner'" label="操作" width="80" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="pickOwner(row)">选择</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="dialog-pagination">
        <el-pagination
          v-model:current-page="pickerPagination.page"
          v-model:page-size="pickerPagination.size"
          :total="pickerPagination.total"
          layout="total, prev, pager, next"
          :page-sizes="[10, 20]"
          small
          @change="searchPickerUsers"
        />
      </div>

      <div v-if="pickerMode !== 'owner' && pickerSelected.length" class="selected-info">
        已选择 <strong>{{ pickerSelected.length }}</strong> 个用户
      </div>

      <template #footer>
        <el-button @click="userPickerVisible = false">取消</el-button>
        <el-button v-if="pickerMode !== 'owner'" type="primary" :disabled="!pickerSelected.length" @click="confirmPickerSelection">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getGroups, createGroup, setGroupInfo, muteGroup, cancelMuteGroup, dismissGroup as dismissGroupApi } from '@/api/group'
import { searchUserFull } from '@/api/user'

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
  notification: '', introduction: '',
  ownerUserID: '', memberUserIDs: [], adminUserIDs: []
})
const formRules = {
  groupName: [{ required: true, message: '请输入群名称', trigger: 'blur' }],
  ownerUserID: [{ required: true, message: '请选择群主', trigger: 'change' }],
  memberUserIDs: [{ type: 'array', required: true, min: 1, message: '请选择群成员', trigger: 'change' }]
}

// 用户选择相关
const selectedOwner = ref(null)
const selectedMembers = ref([])
const selectedAdmins = ref([])

// 用户选择器对话框
const userPickerVisible = ref(false)
const pickerMode = ref('owner') // 'owner' | 'member' | 'admin'
const pickerSearch = ref('')
const pickerUserList = ref([])
const pickerLoading = ref(false)
const pickerSelected = ref([])
const pickerTableRef = ref(null)
const pickerPagination = reactive({ page: 1, size: 10, total: 0 })

const userPickerTitle = computed(() => {
  const titles = { owner: '选择群主', member: '选择群成员', admin: '选择群管理员' }
  return titles[pickerMode.value] || '选择用户'
})

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
    notification: '', introduction: '',
    ownerUserID: '', memberUserIDs: [], adminUserIDs: []
  })
  selectedOwner.value = null
  selectedMembers.value = []
  selectedAdmins.value = []
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
        memberUserIDs: selectedMembers.value.map(u => u.userID),
        adminUserIDs: selectedAdmins.value.map(u => u.userID),
        ownerUserID: selectedOwner.value?.userID || '',
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

// ========== 用户选择器逻辑 ==========
function openUserPicker(mode) {
  pickerMode.value = mode
  pickerSearch.value = ''
  pickerUserList.value = []
  pickerSelected.value = []
  pickerPagination.page = 1
  pickerPagination.total = 0
  userPickerVisible.value = true
}

function onUserPickerOpen() {
  searchPickerUsers()
}

async function searchPickerUsers() {
  pickerLoading.value = true
  try {
    const res = await searchUserFull({
      keyword: pickerSearch.value,
      normal: 1,
      pagination: { pageNumber: pickerPagination.page, showNumber: pickerPagination.size }
    })
    const data = res.data || res
    pickerUserList.value = data.users || []
    pickerPagination.total = data.total || 0
  } catch (err) {
    console.error(err)
  } finally {
    pickerLoading.value = false
  }
}

function handlePickerSelectionChange(rows) {
  pickerSelected.value = rows
}

// 判断用户在选择器中是否可选（灰色不可选）
function checkSelectable(row) {
  const uid = row.userID
  if (pickerMode.value === 'member') {
    // 选成员时：群主和管理员不可选
    if (selectedOwner.value && selectedOwner.value.userID === uid) return false
    if (selectedAdmins.value.some(u => u.userID === uid)) return false
  } else if (pickerMode.value === 'admin') {
    // 选管理员时：群主不可选
    if (selectedOwner.value && selectedOwner.value.userID === uid) return false
  }
  return true
}

function pickOwner(user) {
  selectedOwner.value = user
  groupForm.ownerUserID = user.userID
  userPickerVisible.value = false
}

function removeOwner() {
  selectedOwner.value = null
  groupForm.ownerUserID = ''
}

function confirmPickerSelection() {
  if (pickerMode.value === 'member') {
    // 合并已选和新选，去重
    const existingIds = new Set(selectedMembers.value.map(u => u.userID))
    const newUsers = pickerSelected.value.filter(u => !existingIds.has(u.userID))
    selectedMembers.value = [...selectedMembers.value, ...newUsers]
    // 从成员中移除已是管理员的用户
    const adminIds = new Set(selectedAdmins.value.map(u => u.userID))
    selectedMembers.value = selectedMembers.value.filter(u => !adminIds.has(u.userID))
    groupForm.memberUserIDs = selectedMembers.value.map(u => u.userID)
  } else if (pickerMode.value === 'admin') {
    const existingIds = new Set(selectedAdmins.value.map(u => u.userID))
    const newUsers = pickerSelected.value.filter(u => !existingIds.has(u.userID))
    selectedAdmins.value = [...selectedAdmins.value, ...newUsers]
    // 从成员中移除已是管理员的用户
    const adminIds = new Set(selectedAdmins.value.map(u => u.userID))
    selectedMembers.value = selectedMembers.value.filter(u => !adminIds.has(u.userID))
    groupForm.memberUserIDs = selectedMembers.value.map(u => u.userID)
    groupForm.adminUserIDs = selectedAdmins.value.map(u => u.userID)
  }
  userPickerVisible.value = false
}

function removeMember(userID) {
  selectedMembers.value = selectedMembers.value.filter(u => u.userID !== userID)
  groupForm.memberUserIDs = selectedMembers.value.map(u => u.userID)
}

function removeAdmin(userID) {
  selectedAdmins.value = selectedAdmins.value.filter(u => u.userID !== userID)
  groupForm.adminUserIDs = selectedAdmins.value.map(u => u.userID)
}
</script>

<style scoped>
.page-container { padding: 16px; background: #fff; border-radius: 4px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.search-form { margin-bottom: 16px; }
.pagination-wrap { margin-top: 16px; display: flex; justify-content: flex-end; }
.user-select-wrap { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.selected-user-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.selected-count { font-size: 12px; color: #909399; }
.dialog-pagination { margin-top: 12px; display: flex; justify-content: flex-end; }
.selected-info { margin-top: 10px; font-size: 13px; color: #606266; }
</style>
