import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', noAuth: true },
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/im/user/user_list',
    children: [
      // ===== IM 模块 =====
      {
        path: 'im/user/user_list',
        name: 'IMUserList',
        component: () => import('@/views/im/user/UserList.vue'),
        meta: { title: 'IM 用户' },
      },
      {
        path: 'im/user/relation_list',
        name: 'RelationList',
        component: () => import('@/views/im/user/RelationList.vue'),
        meta: { title: '好友关系' },
      },
      {
        path: 'im/group/group_list',
        name: 'GroupList',
        component: () => import('@/views/im/group/GroupList.vue'),
        meta: { title: '群组列表' },
      },
      {
        path: 'im/group/group_member',
        name: 'GroupMember',
        component: () => import('@/views/im/group/GroupMember.vue'),
        meta: { title: '群成员' },
      },
      {
        path: 'im/message/user_message',
        name: 'UserMessage',
        component: () => import('@/views/im/message/UserMessage.vue'),
        meta: { title: '单聊记录' },
      },
      {
        path: 'im/message/group_message',
        name: 'GroupMessage',
        component: () => import('@/views/im/message/GroupMessage.vue'),
        meta: { title: '群聊记录' },
      },
      {
        path: 'im/log/log_list',
        name: 'LogList',
        component: () => import('@/views/im/log/LogList.vue'),
        meta: { title: '日志管理' },
      },
      {
        path: 'im/notification/account_list',
        name: 'AccountList',
        component: () => import('@/views/im/notification/AccountList.vue'),
        meta: { title: '通知账号' },
      },
      {
        path: 'im/notification/publish',
        name: 'Publish',
        component: () => import('@/views/im/notification/Publish.vue'),
        meta: { title: '发布通知' },
      },

      // ===== 数据概览 =====
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '数据概览' },
      },

      // ===== 个人设置 =====
      {
        path: 'profile/info',
        name: 'ProfileInfo',
        component: () => import('@/views/profile/Info.vue'),
        meta: { title: '个人信息' },
      },
      {
        path: 'profile/modify',
        name: 'ProfileModify',
        component: () => import('@/views/profile/Modify.vue'),
        meta: { title: '修改密码' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: '404',
    component: () => import('@/views/404.vue'),
    meta: { title: '404', noAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - OpenIM Admin` : 'OpenIM Admin'
  const token = localStorage.getItem('IMAccountToken')
  if (!to.meta.noAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
