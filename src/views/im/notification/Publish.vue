<template>
  <div class="page-container">
    <div class="page-header">
      <h3>发布通知</h3>
    </div>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="max-width: 600px">
      <el-form-item label="通知账号" prop="senderID">
        <el-input v-model="form.senderID" placeholder="请输入通知发送者ID" />
      </el-form-item>
      <el-form-item label="接收群组ID" prop="groupID">
        <el-input v-model="form.groupID" placeholder="请输入接收群组ID" />
      </el-form-item>
      <el-form-item label="通知内容" prop="content">
        <el-input v-model="form.content" type="textarea" :rows="5" placeholder="请输入通知内容" maxlength="500" show-word-limit />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="publish">发布</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { sendNotification } from '@/api/message'

const formRef = ref(null)
const loading = ref(false)
const form = reactive({
  senderID: '',
  groupID: '',
  content: ''
})
const rules = {
  senderID: [{ required: true, message: '请输入通知发送者ID', trigger: 'blur' }],
  groupID: [{ required: true, message: '请输入接收群组ID', trigger: 'blur' }],
  content: [{ required: true, message: '请输入通知内容', trigger: 'blur' }]
}

async function publish() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    await sendNotification({
      senderID: form.senderID,
      groupID: form.groupID,
      content: form.content
    })
    ElMessage.success('发布成功')
    formRef.value.resetFields()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page-container { padding: 16px; background: #fff; border-radius: 4px; }
.page-header { margin-bottom: 16px; }
</style>
