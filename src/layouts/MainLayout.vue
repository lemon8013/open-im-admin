<template>
  <el-container class="layout-container">
    <!-- 移动端遮罩 -->
    <div v-if="isMobile && !isCollapse" class="mobile-mask" @click="isCollapse = true"></div>

    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="layout-aside" :class="{ 'mobile-aside': isMobile, 'mobile-hide': isMobile && isCollapse }">
      <div class="logo" @click="$router.push('/')">
        <img v-if="!isCollapse" src="" alt="" class="logo-img" onerror="this.style.display='none'" />
        <span v-if="!isCollapse" class="logo-text">OpenIM Admin</span>
        <span v-else class="logo-text-mini">IM</span>
      </div>
      <el-scrollbar class="menu-scrollbar">
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          :router="true"
          background-color="#001529"
          text-color="rgba(255,255,255,0.65)"
          active-text-color="#1890ff"
          class="layout-menu"
          @select="onMenuSelect"
        >
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
      </el-scrollbar>
    </el-aside>

    <!-- 主内容 -->
    <el-container class="main-container">
      <el-header class="layout-header">
        <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
          <Fold v-if="!isCollapse" />
          <Expand v-else />
        </el-icon>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="28" style="background: #1890ff; margin-right: 8px;">
                {{ (authStore.account || 'A')[0].toUpperCase() }}
              </el-avatar>
              <span class="user-name">{{ authStore.account || 'Admin' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="info">
                  <el-icon><User /></el-icon> 个人信息
                </el-dropdown-item>
                <el-dropdown-item command="modify">
                  <el-icon><Lock /></el-icon> 修改密码
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon> 退出登录
                </el-dropdown-item>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const isCollapse = ref(false)
const isMobile = ref(false)

const activeMenu = computed(() => route.path)

// 响应式检测
function checkMobile() {
  isMobile.value = window.innerWidth <= 768
  if (isMobile.value) {
    isCollapse.value = true
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile)
})

// 移动端点击菜单后自动收起侧边栏
function onMenuSelect() {
  if (isMobile.value) {
    isCollapse.value = true
  }
}

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
  overflow: hidden;
}

.layout-aside {
  background-color: #001529;
  overflow: hidden;
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
  gap: 8px;
  padding: 0 16px;
}

.logo-text {
  font-size: 17px;
  font-weight: 700;
  white-space: nowrap;
  letter-spacing: 0.5px;
}

.logo-text-mini {
  font-size: 20px;
  font-weight: 700;
}

.logo-img {
  width: 28px;
  height: 28px;
}

.menu-scrollbar {
  flex: 1;
  overflow: hidden;
}

.layout-menu {
  border-right: none;
}

.main-container {
  overflow: hidden;
}

.layout-header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 56px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  z-index: 10;
  flex-shrink: 0;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
  transition: color 0.2s;
}

.collapse-btn:hover {
  color: #1890ff;
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
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.user-info:hover {
  background: #f5f5f5;
}

.user-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  color: #303133;
}

.layout-main {
  background: #f0f2f5;
  overflow-y: auto;
  padding: 20px;
}

/* ========== 移动端侧边栏 ========== */
.mobile-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 998;
}

.mobile-aside {
  position: fixed !important;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 999;
  width: 220px !important;
  transition: transform 0.3s ease;
}

.mobile-hide {
  transform: translateX(-100%);
}

/* ========== 响应式 ========== */
@media screen and (max-width: 768px) {
  .layout-header {
    padding: 0 12px;
  }

  .layout-main {
    padding: 12px;
  }

  .user-name {
    display: none;
  }
}
</style>
