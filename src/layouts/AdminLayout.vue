<!-- src/layouts/AdminLayout.vue -->
<template>
  <div class="admin-page">
    <!-- 상단 로고 바 -->
    <div class="logo-bar">
      <img src="/logo.png" alt="PlanGo Logo" class="logo-image" />
    </div>

    <!-- 본문: 사이드바 + 메인 -->
    <div class="admin-body">
      <!-- 왼쪽 사이드바 -->
      <aside class="sidebar">
        <div class="sidebar-inner">
          <!-- 회원 관리 -->
          <router-link
            to="/admin/members"
            class="sidebar-item"
            active-class="sidebar-item-active"
          >
            회원 관리
          </router-link>

          <!-- 서비스 관리: 신고 목록(/admin/reports) -->
          <router-link
            to="/admin/reports"
            class="sidebar-item"
            active-class="sidebar-item-active"
          >
            서비스 관리
          </router-link>

          <!-- 시스템 관리: 공지사항(/admin/notices) -->
          <router-link
            to="/admin/notices"
            class="sidebar-item"
            active-class="sidebar-item-active"
          >
            시스템 관리
          </router-link>
        </div>
      </aside>

      <!-- 오른쪽 영역 -->
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background-color: #f2f6fb;
}

/* 상단 로고 바 */
.logo-bar {
  width: 100%;
  height: 110px;
  background-color: #bfe6ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-image {
  height: 70px;
  object-fit: contain;
}

/* 본문 레이아웃 */
.admin-body {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 0 40px;
}

/* 사이드바 */
.sidebar {
  width: 220px;
  padding-right: 24px;
}

.sidebar-inner {
  background-color: #dff3ff;
  border-radius: 24px;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-item {
  width: 100%;
  height: 56px;
  border-radius: 28px;
  border: none;
  background: #ffffff;
  font-size: 15px;
  cursor: pointer;
  text-align: left;
  padding-left: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  text-decoration: none;
  color: #222;
  display: flex;
  align-items: center;
}

.sidebar-item-active {
  background: #3794e7;
  color: #ffffff;
}

/* 오른쪽 콘텐츠 박스 */
.content {
  flex: 1;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 24px 40px 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
</style>
