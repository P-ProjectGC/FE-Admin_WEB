<!-- src/views/UsageStatusView.vue -->
<template>
  <div class="usage-page">
    <header class="usage-header">
      <div class="title-row">
        <span class="title-icon">📊</span>
        <h1>이용현황</h1>
      </div>
      <p class="title-sub">
        회원 · 여행방 · 일정 · 공지 · 신고 건수를 한눈에 확인할 수 있는 관리자 대시보드입니다.
      </p>
    </header>

    <div v-if="loading" class="state-text">대시보드 데이터를 불러오는 중입니다...</div>
    <div v-else-if="error" class="state-text error">{{ error }}</div>

    <div v-else>
      <!-- 상단 요약 카드 4개 -->
      <section class="summary-grid">
        <div class="summary-card">
          <p class="summary-label">총 회원 수</p>
          <p class="summary-value">{{ stats.totalMemberCount.toLocaleString() }}명</p>
          <p class="summary-sub">오늘 가입 {{ stats.todayNewMemberCount.toLocaleString() }}명</p>
        </div>

        <div class="summary-card">
          <p class="summary-label">총 여행방 수</p>
          <p class="summary-value">{{ stats.totalRoomCount.toLocaleString() }}개</p>
          <p class="summary-sub">오늘 생성 {{ stats.todayNewRoomCount.toLocaleString() }}개</p>
        </div>

        <div class="summary-card">
          <p class="summary-label">총 일정 수</p>
          <p class="summary-value">{{ stats.totalScheduleCount.toLocaleString() }}개</p>
          <p class="summary-sub">오늘 등록 {{ stats.todayNewScheduleCount.toLocaleString() }}개</p>
        </div>

        <div class="summary-card">
          <p class="summary-label">공지 & 신고</p>
          <p class="summary-value">
            {{ stats.totalNoticeCount.toLocaleString() }} /
            {{ stats.totalInconvenienceReportCount.toLocaleString() }}
          </p>
          <p class="summary-sub">공지사항 / 신고 누적 건수</p>
        </div>
      </section>

      <!-- 하단: 차트 영역 -->
      <section class="charts-grid">
        <!-- 로그인 방식별 이용자 분포 -->
        <div class="chart-card">
          <h2 class="chart-title">로그인 방식별 이용자 분포</h2>
          <p class="chart-sub">
            전체 이용자의 로그인 방식 비율입니다. <br />
          </p>
          <div class="chart-container">
            <LoginMethodPieChart
              :kakao-count="kakaoCount"
              :normal-count="normalCount"
            />
          </div>
          <p v-if="kakaoCount + normalCount === 0" class="chart-empty-text">
            아직 로그인 방식 통계 데이터가 없습니다.
          </p>
        </div>

        <!-- 월별 누적 여행방 수 추이 -->
        <div class="chart-card">
          <h2 class="chart-title">월별 누적 여행방 수 추이</h2>
          <p class="chart-sub">
            최근 몇 개월간 여행방 수 증가 추이를 시각화합니다. <br />
          </p>
          <div class="chart-container">
            <MonthlyRoomLineChart
              :labels="monthlyLabels"
              :counts="monthlyCounts"
            />
          </div>
          <p v-if="monthlyLabels.length === 0" class="chart-empty-text">
            아직 월별 여행방 통계 데이터가 없습니다.
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { fetchAdminDashboard } from '../api/adminApi';
import LoginMethodPieChart from '../components/LoginMethodPieChart.vue';
import MonthlyRoomLineChart from '../components/MonthlyRoomLineChart.vue';

const loading = ref(true);
const error = ref('');
const stats = ref({
  totalMemberCount: 0,
  todayNewMemberCount: 0,
  totalRoomCount: 0,
  todayNewRoomCount: 0,
  totalScheduleCount: 0,
  todayNewScheduleCount: 0,
  totalNoticeCount: 0,
  totalInconvenienceReportCount: 0,

  // 나중에 서버가 채워줄 예정인 필드들
  loginMethodStats: null, // { KAKAO: number, NORMAL: number }
  monthlyRoomStats: [],   // [{ yearMonth: "2024-04", totalRoomCount: 8200 }, ...]
});

onMounted(async () => {
  try {
    const data = await fetchAdminDashboard();
    if (data) {
      stats.value = {
        ...stats.value,
        ...data,
      };
    }
  } catch (e) {
    console.error(e);
    error.value = '대시보드 데이터를 불러오지 못했습니다.';
  } finally {
    loading.value = false;
  }
});

// 🔹 로그인 방식 통계 (없으면 0으로)
const kakaoCount = computed(
  () => stats.value.loginMethodStats?.KAKAO ?? 0,
);
const normalCount = computed(
  () => stats.value.loginMethodStats?.NORMAL ?? 0,
);

// 🔹 월별 여행방 통계 (없으면 빈 배열)
const monthlyLabels = computed(() =>
  (stats.value.monthlyRoomStats || []).map((item) => {
    if (item.label) return item.label;
    if (item.yearMonth) {
      const [, month] = item.yearMonth.split('-'); // "2024-04" → ["2024","04"]
      return `${parseInt(month, 10)}월`;
    }
    return '';
  }),
);

const monthlyCounts = computed(() =>
  (stats.value.monthlyRoomStats || []).map(
    (item) => item.totalRoomCount ?? 0,
  ),
);
</script>

<style scoped>
.usage-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.usage-header {
  margin-bottom: 4px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  font-size: 24px;
}

h1 {
  font-size: 24px;
  font-weight: 700;
}

.title-sub {
  margin-top: 4px;
  font-size: 14px;
  color: #666;
}

.state-text {
  font-size: 14px;
  color: #555;
}

.state-text.error {
  color: #d64545;
}

/* 상단 요약 카드 */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.summary-card {
  background-color: #f7fbff;
  border-radius: 16px;
  padding: 16px 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.summary-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.summary-value {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 4px;
}

.summary-sub {
  font-size: 12px;
  color: #888;
}

/* 하단 차트 영역 */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-top: 8px;
}

.chart-card {
  background-color: #f9fbff;
  border-radius: 16px;
  padding: 18px 20px 22px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.chart-sub {
  font-size: 12px;
  color: #777;
  margin-bottom: 14px;
  line-height: 1.5;
}

.chart-container {
  height: 220px;
}

.chart-empty-text {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

/* 반응형(폭 좁을 때 2열 -> 1열) */
@media (max-width: 1024px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
