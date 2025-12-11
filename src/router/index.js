// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import AdminLayout from '../layouts/AdminLayout.vue';
import MembersView from '../views/MembersView.vue';
import MemberDetailView from '../views/MemberDetailView.vue';
import ReportsView from '../views/ReportsView.vue';
import NoticesView from '../views/NoticesView.vue';
import UsageStatusView from '../views/UsageStatusView.vue'; // 📊 이용현황 뷰

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
      { path: 'reports', name: 'Reports', component: ReportsView },       // 신고 관리
      { path: 'usage', name: 'UsageStatus', component: UsageStatusView }, // 이용현황 대시보드
      { path: 'notices', name: 'Notices', component: NoticesView },       // 공지사항 관리
    ],
  },

  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
