<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="layout-aside">
      <div class="logo" @click="$router.push('/')">
        <span v-if="!isCollapse">OpenIM Admin</span>
        <span v-else>IM</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :router="true"
        background-color="#001529"
        text-color="rgba(255,255,255,0.65)"
        active-text-color="#1890ff"
        class="layout-menu"
      >
        <!-- Chat 用户管理 -->
        <el-sub-menu index="chat-user">
          <template #title>
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item index="/chat/user/user_list">用户列表</el-menu-item>
          <el-menu-item index="/chat/user/block_list">黑名单</el-menu-item>
        </el-sub-menu>

        <!-- 注册设置 -->
        <el-sub-menu index="chat-register">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>注册设置</span>
          </template>
          <el-menu-item index="/chat/register/default_friends">默认好友</el-menu-item>
          <el-menu-item index="/chat/register/default_group">默认群组</el-menu-item>
        </el-sub-menu>

        <!-- IM 用户 -->
        <el-sub-menu index="im-user">
          <template #title>
            <el-icon><UserFilled /></el-icon>
            <span>IM 用户</span>
          </template>
          <el-menu-item index="/im/user/user_list">用户列表</el-menu-item>
        </el-sub-menu>

        <!-- 群组管理 -->
        <el-sub-menu index="im-group">
          <template #title>
            <el-icon><Postcard /></el-icon>
            <span>群组管理</span>
          </template>
          <el-menu-item index="/im/group/group_list">群组列表</el-menu-item>
        </el-sub-menu>

        <!-- 消息管理 -->
        <el-sub-menu index="im-message">
          <template #title>
            <el-icon><ChatDotRound /></el-icon>
            <span>消息管理</span>
          </template>
          <el-menu-item index="/im/message/user_message">单聊记录</el-menu-item>
          <el-menu-item index="/im/message/group_message">群聊记录</el-menu-item>
        </el-sub-menu>

        <!-- 通知管理 -->
        <el-sub-menu index="im-notification">
          <template #title>
            <el-icon><Bell /></el-icon>
            <span>通知管理</span>
          </template>
          <el-menu-item index="/im/notification/account_list">通知账号</el-menu-item>
          <el-menu-item index="/im/notification/publish">发布通知</el-menu-item>
        </el-sub-menu>

        <!-- 日志管理 -->
        <el-menu-item index="/im/log/log_list">
          <el-icon><Document /></el-icon>
          <span>日志管理</span>
        </el-menu-item>

        <!-- 数据概览 -->
        <el-menu-item index="/dashboard">
          <el-icon><DataLine /></el-icon>
          <span>数据概览</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容 -->
    <el-container>
      <el-header class="layout-header">
        <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
          <Fold v-if="!isCollapse" />
          <Expand v-else />
        </el-icon>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              {{ authStore.account || 'Admin' }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="info">个人信息</el-dropdown-item>
                <el-dropdown-item command="modify">修改密码</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const isCollapse = ref(false)

const activeMenu = computed(() => route.path)

function handleCommand(command) {
  if (command === 'logout') {
    authStore.logout()
    router.push('/login')
  } else if (command === 'info') {
    router.push('/profile/info')
  } else if (command === 'modify') {
    router.push('/profile/modify')
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.layout-aside {
  background-color: #001529;
  overflow-y: auto;
  transition: width 0.3s;
}

.logo {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.layout-menu {
  border-right: none;
}

.layout-header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  z-index: 10;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 4px;
}

.layout-main {
  background: #f0f2f5;
  overflow-y: auto;
}
</style>
