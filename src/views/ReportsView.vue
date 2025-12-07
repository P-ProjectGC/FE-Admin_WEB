<template>
  <div class="reports-page">
    <!-- 제목 영역 -->
    <div class="reports-header">
      <h1 class="title-text">신고사항</h1>
      <p class="subtitle-text">앱에서 접수된 불편 신고 목록입니다.</p>
    </div>

    <!-- 상태 표시 -->
    <div class="status-row">
      <span v-if="loading" class="loading-text">불러오는 중...</span>
      <span v-else-if="errorMessage" class="error-text">{{ errorMessage }}</span>
    </div>

    <!-- 테이블 -->
    <div class="table-wrapper">
      <table class="reports-table">
        <thead>
          <tr>
            <th style="width: 80px">No.</th>
            <th style="width: 180px">DateTime</th>
            <th>신고자</th>
            <th style="width: 120px">Status</th>
            <th style="width: 90px"></th>
          </tr>
        </thead>

        <tbody>
          <template v-for="(report, index) in reports" :key="report.reportId">
            <!-- 기본 행 -->
            <tr class="row-main">
              <td>{{ index + 1 }}</td>
              <td>{{ formatDate(report.createdAt) }}</td>
              <td>{{ report.memberNickname }}</td>
              <td class="status-cell">
                <span class="status-text">
                  {{ statusLabel(report.status) }}
                </span>
              </td>
              <td class="toggle-cell">
                <button
                  class="toggle-chip"
                  @click="toggleDetail(report.reportId)"
                  type="button"
                >
                  {{ openedDetailId === report.reportId ? '∧' : '∨' }}
                </button>
              </td>
            </tr>

            <!-- 상세 패널 -->
            <tr v-if="openedDetailId === report.reportId">
              <td colspan="5">
                <div class="detail-panel">
                  <div class="detail-header">
                    <div class="detail-status-left">
                      <span
                        class="detail-status-pill"
                        :class="statusClass(reportDetail?.status)"
                      >
                        {{ statusLabel(reportDetail?.status) }}
                      </span>
                      <span class="detail-dot" v-if="reportDetail?.status === 'PROCESSING'">
                        ●
                      </span>
                    </div>

                    <button
                      class="detail-close"
                      type="button"
                      @click="toggleDetail(report.reportId)"
                    >
                      ✕
                    </button>
                  </div>

                  <div v-if="detailLoading" class="detail-loading">
                    상세 내용을 불러오는 중입니다...
                  </div>

                  <template v-else>
                    <!-- 신고 내용 -->
                    <p class="detail-content">
                      {{ reportDetail?.content || '신고 내용이 없습니다.' }}
                    </p>

                    <!-- 상태 버튼들 -->
                    <div class="detail-status-buttons">
                      <button
                        type="button"
                        class="state-btn state-waiting"
                        @click="changeStatus(report.reportId, 'WAITING')"
                      >
                        대기
                      </button>
                      <button
                        type="button"
                        class="state-btn state-processing"
                        @click="changeStatus(report.reportId, 'PROCESSING')"
                      >
                        처리중
                      </button>
                      <button
                        type="button"
                        class="state-btn state-completed"
                        @click="changeStatus(report.reportId, 'COMPLETED')"
                      >
                        처리완료
                      </button>
                    </div>

                    <!-- 관리자 메모 -->
                    <textarea
                      v-model="adminMemo"
                      class="memo-input"
                      placeholder="관리자 메모를 입력하세요."
                    ></textarea>

                    <div class="detail-footer">
                      <button
                        type="button"
                        class="memo-save-btn"
                        @click="saveMemo(report.reportId)"
                      >
                        메모 저장
                      </button>
                    </div>
                  </template>
                </div>
              </td>
            </tr>
          </template>

          <!-- 비어있을 때 -->
          <tr v-if="!loading && reports.length === 0">
            <td colspan="5" class="empty-row">등록된 신고가 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
  fetchAdminReports,
  fetchAdminReportDetail,
  updateAdminReportStatus,
} from '@/api/adminApi';

const reports = ref([]);
const reportDetail = ref(null);

const openedDetailId = ref(null);
const adminMemo = ref('');

const loading = ref(false);
const detailLoading = ref(false);
const errorMessage = ref('');

function formatDate(iso) {
  if (!iso) return '-';
  return iso.slice(0, 10);
}

function statusLabel(status) {
  if (status === 'WAITING') return '대기';
  if (status === 'PROCESSING') return '처리 중';
  if (status === 'COMPLETED') return '처리 완료';
  return status || '-';
}

function statusClass(status) {
  if (status === 'WAITING') return 'status-pill-waiting';
  if (status === 'PROCESSING') return 'status-pill-processing';
  if (status === 'COMPLETED') return 'status-pill-completed';
  return '';
}

async function loadReports() {
  loading.value = true;
  errorMessage.value = '';
  try {
    const data = await fetchAdminReports();
    reports.value = data || [];
  } catch (e) {
    console.error(e);
    errorMessage.value = '신고 목록을 불러오는 중 오류가 발생했습니다.';
  } finally {
    loading.value = false;
  }
}

async function toggleDetail(reportId) {
  // 이미 열려있으면 닫기
  if (openedDetailId.value === reportId) {
    openedDetailId.value = null;
    reportDetail.value = null;
    return;
  }

  openedDetailId.value = reportId;
  detailLoading.value = true;
  try {
    const data = await fetchAdminReportDetail(reportId);
    reportDetail.value = data;
    adminMemo.value = data?.adminMemo || '';
  } catch (err) {
    console.error('신고 상세 조회 오류:', err);
  } finally {
    detailLoading.value = false;
  }
}

async function changeStatus(reportId, newStatus) {
  try {
    await updateAdminReportStatus(reportId, {
      status: newStatus,
      adminMemo: adminMemo.value,
    });

    // 목록 상태 반영
    const target = reports.value.find((r) => r.reportId === reportId);
    if (target) {
      target.status = newStatus;
    }
    if (reportDetail.value) {
      reportDetail.value.status = newStatus;
    }

    alert('상태가 변경되었습니다.');
  } catch (err) {
    console.error(err);
    alert('상태 변경 중 오류가 발생했습니다.');
  }
}

async function saveMemo(reportId) {
  try {
    await updateAdminReportStatus(reportId, {
      status: reportDetail.value?.status ?? 'WAITING',
      adminMemo: adminMemo.value,
    });
    alert('메모가 저장되었습니다.');
  } catch (err) {
    console.error(err);
    alert('메모 저장 중 오류가 발생했습니다.');
  }
}

onMounted(loadReports);
</script>

<style scoped>
.reports-page {
  display: flex;
  flex-direction: column;
}

/* 제목 영역 */
.reports-header {
  margin-bottom: 12px;
}

.title-text {
  font-size: 28px;
  font-weight: 700;
}

.subtitle-text {
  margin-top: 6px;
  font-size: 13px;
  color: #777;
}

/* 상태 문구 */
.status-row {
  min-height: 20px;
  margin-bottom: 6px;
}

.loading-text {
  font-size: 13px;
  color: #888;
}

.error-text {
  font-size: 13px;
  color: #e64545;
}

/* 테이블 */
.table-wrapper {
  margin-top: 8px;
}

.reports-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.reports-table thead tr {
  border-bottom: 2px solid #000;
}

.reports-table th,
.reports-table td {
  padding: 10px 8px;
  text-align: left;
}

.row-main td {
  border-bottom: 1px solid #e4e8f0;
}

.empty-row {
  text-align: center;
  color: #999;
}

/* Status 셀 */
.status-cell {
  font-weight: 500;
}

.status-text {
  letter-spacing: 0.02em;
}

/* 우측 토글칩 */
.toggle-cell {
  text-align: right;
}

.toggle-chip {
  appearance: none;
  border: none;
  outline: none;
  border-radius: 18px;
  padding: 4px 18px;
  min-width: 48px;
  background: #ffe1ec;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
}

/* 상세 패널 */
.detail-panel {
  margin-top: 4px;
  border-radius: 20px;
  background: #f3f7fb;
  padding: 18px 22px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-status-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 70px;
  height: 28px;
  padding: 0 14px;
  border-radius: 14px;
  font-size: 13px;
}

.status-pill-waiting {
  background: #e4f0ff;
  color: #214d8f;
}

.status-pill-processing {
  background: #ffe9dd;
  color: #a14a19;
}

.status-pill-completed {
  background: #daf7e3;
  color: #1b7c4b;
}

.detail-dot {
  font-size: 12px;
  color: #ff3b3b;
}

.detail-close {
  appearance: none;
  border: none;
  background: #ffd6dc;
  color: #cc2240;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 14px;
  cursor: pointer;
}

/* 상세 내용 텍스트 */
.detail-content {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}

/* 상태 버튼 모음 (대기/처리중/처리완료) */
.detail-status-buttons {
  display: flex;
  gap: 10px;
}

.state-btn {
  min-width: 80px;
  height: 30px;
  border-radius: 15px;
  border: none;
  font-size: 13px;
  cursor: pointer;
}

.state-waiting {
  background: #ddeeff;
  color: #274b9b;
}

.state-processing {
  background: #ffe2d0;
  color: #9a4716;
}

.state-completed {
  background: #d5f4dd;
  color: #1c7b45;
}

/* 메모 입력 */
.memo-input {
  margin-top: 10px;
  width: 100%;
  min-height: 70px;
  border-radius: 12px;
  border: 1px solid #ccd3e0;
  padding: 8px 10px;
  font-size: 13px;
  resize: vertical;
}

/* 메모 저장 버튼 */
.detail-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.memo-save-btn {
  min-width: 100px;
  height: 30px;
  border-radius: 15px;
  border: none;
  background: #88cfff;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
}
</style>
