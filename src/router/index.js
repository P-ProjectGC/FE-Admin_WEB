// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import AdminLayout from '../layouts/AdminLayout.vue';
import MembersView from '../views/MembersView.vue';
import MemberDetailView from '../views/MemberDetailView.vue';
import ReportsView from '../views/ReportsView.vue';
import NoticesView from '../views/NoticesView.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },

  {
    path: '/admin',
    component: AdminLayout,
    children: [
      { path: '', redirect: '/admin/members' },
      { path: 'members', name: 'Members', component: MembersView },
      { path: 'members/:memberId', name: 'MemberDetail', component: MemberDetailView },
      { path: 'reports', name: 'Reports', component: ReportsView }, // 🚨 서비스 관리(신고 목록)
      // 나중에 notices, rooms 등 추가
    ],
  },

  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },

  {
  path: '/admin',
  component: AdminLayout,
  children: [
    { path: '', redirect: '/admin/members' },
    { path: 'members', name: 'Members', component: MembersView },
    { path: 'members/:memberId', name: 'MemberDetail', component: MemberDetailView },
    { path: 'reports', name: 'Reports', component: ReportsView },
    { path: 'notices', name: 'Notices', component: NoticesView }, // 🔺여기 추가
  ],
},

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
