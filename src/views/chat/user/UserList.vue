<template>
  <div class="page-container">
    <div class="page-header">
      <h3>用户列表</h3>
      <el-button type="primary" @click="openCreate">创建用户</el-button>
    </div>

    <!-- 搜索 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="关键词">
        <el-input v-model="searchForm.keyword" placeholder="请输入用户ID/昵称/手机号" clearable @keyup.enter="loadData" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="loadData">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
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
      <el-table-column label="操作" width="240" align="center">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="primary" @click="openResetPwd(row)">重置密码</el-button>
          <el-popconfirm title="确定要封禁该用户吗？" @confirm="blockUser(row)">
            <template #reference>
              <el-button link type="danger">封禁</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
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

    <!-- 创建/编辑抽屉 -->
    <el-drawer v-model="drawerVisible" :title="editUser ? '编辑用户' : '创建用户'" size="450px">
      <el-form ref="formRef" :model="userForm" :rules="formRules" label-width="80px">
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            accept="image/*"
            :show-file-list="false"
            :http-request="handleAvatarUpload"
          >
            <el-avatar :src="userForm.faceURL" :size="55" class="cursor-pointer">
              {{ (userForm.nickname || '')[0] }}
            </el-avatar>
            <div class="upload-tip">点击上传头像</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="userForm.nickname" placeholder="请输入昵称" maxlength="15" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="userForm.gender" placeholder="请选择性别">
            <el-option label="男" :value="1" />
            <el-option label="女" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="生日" prop="birth">
          <el-date-picker v-model="userForm.birth" type="date" placeholder="请选择生日" />
        </el-form-item>
        <template v-if="!editUser">
          <el-form-item label="手机号" prop="phoneNumber">
            <el-input v-model="userForm.phoneNumber" placeholder="请输入手机号">
              <template #prepend>
                <el-select v-model="userForm.areaCode" style="width: 80px">
                  <el-option label="+86" value="+86" />
                </el-select>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="userForm.password" type="password" show-password placeholder="请输入密码" />
          </el-form-item>
        </template>
        <el-form-item>
          <el-button type="primary" @click="submitForm">{{ editUser ? '保存' : '创建' }}</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>

    <!-- 重置密码对话框 -->
    <el-dialog v-model="resetPwdVisible" title="重置密码" width="400px">
      <el-input v-model="newPassword" type="password" show-password placeholder="请输入新密码" />
      <template #footer>
        <el-button @click="resetPwdVisible = false">取消</el-button>
        <el-button type="primary" :loading="resetLoading" @click="confirmResetPwd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import md5 from 'md5'
import { searchUserFull, updateUserInfo, importUsers, resetUserPassword, blockUser as blockUserApi } from '@/api/user'
import { splitUpload } from '@/api/upload'

const loading = ref(false)
const tableData = ref([])
const searchForm = reactive({ keyword: '' })
const pagination = reactive({ page: 1, size: 10, total: 0 })

// 抽屉
const drawerVisible = ref(false)
const editUser = ref(null)
const formRef = ref(null)
const userForm = reactive({
  nickname: '', gender: undefined, birth: null,
  faceURL: '', phoneNumber: '', areaCode: '+86', password: ''
})
const formRules = {
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  phoneNumber: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

// 重置密码
const resetPwdVisible = ref(false)
const resetPwdUser = ref(null)
const newPassword = ref('')
const resetLoading = ref(false)

onMounted(() => loadData())

async function loadData() {
  loading.value = true
  try {
    const res = await searchUserFull({
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

function openCreate() {
  editUser.value = null
  Object.assign(userForm, { nickname: '', gender: undefined, birth: null, faceURL: '', phoneNumber: '', areaCode: '+86', password: '',registerType:0 })
  drawerVisible.value = true
}

function openEdit(row) {
  editUser.value = row
  Object.assign(userForm, { nickname: row.nickname, gender: row.gender, birth: row.birth ? new Date(row.birth) : null, faceURL: row.faceURL })
  drawerVisible.value = true
}

async function submitForm() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  try {
    if (editUser.value) {
      await updateUserInfo({
        userID: editUser.value.userID,
        nickname: userForm.nickname,
        faceURL: userForm.faceURL,
        gender: userForm.gender,
        birth: userForm.birth ? new Date(userForm.birth).getTime() : 0
      })
    } else {
      await importUsers({
        users: [{
          nickname: userForm.nickname,
          faceURL: userForm.faceURL,
          gender: userForm.gender,
          areaCode: userForm.areaCode,
          phoneNumber: userForm.phoneNumber,
          password: md5(userForm.password),
          birth: userForm.birth ? new Date(userForm.birth).getTime() : 0
        }],
        registerType: userForm.registerType ?? 0
      })
    }
    ElMessage.success('操作成功')
    drawerVisible.value = false
    loadData()
  } catch (err) {
    console.error(err)
  }
}

function openResetPwd(row) {
  resetPwdUser.value = row
  newPassword.value = ''
  resetPwdVisible.value = true
}

async function confirmResetPwd() {
  if (!newPassword.value) return
  resetLoading.value = true
  try {
    await resetUserPassword({
      userID: resetPwdUser.value.userID,
      newPassword: md5(newPassword.value)
    })
    ElMessage.success('重置成功')
    resetPwdVisible.value = false
  } catch (err) {
    console.error(err)
  } finally {
    resetLoading.value = false
  }
}

async function handleAvatarUpload({ file }) {
  try {
    const result = await splitUpload(file)
    if (result.url) {
      userForm.faceURL = result.url
      ElMessage.success('头像上传成功')
    } else {
      ElMessage.error('头像上传失败')
    }
  } catch (err) {
    console.error(err)
    ElMessage.error('头像上传失败')
  }
}

async function blockUser(row) {
  try {
    await blockUserApi({ userID: row.userID, reason: '' })
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
.avatar-uploader { display: inline-block; cursor: pointer; }
.upload-tip { font-size: 12px; color: #1890ff; margin-top: 4px; text-align: center; }
.cursor-pointer { cursor: pointer; }
</style>
