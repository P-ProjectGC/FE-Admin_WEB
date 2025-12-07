<template>
  <div class="notices-page">
    <!-- 헤더 -->
    <div class="notices-header">
      <div class="title-left">
        <span class="title-icon">📌</span>
        <h1 class="title-text">공지사항</h1>
      </div>
      <button class="add-btn" type="button" @click="openCreate">
        +추가
      </button>
    </div>
    <p class="subtitle-text">앱에 노출되는 공지사항을 관리합니다.</p>

    <!-- 생성 패널 -->
    <div v-if="isCreating" class="panel panel-create">
      <div class="panel-header">
        <span class="panel-title">새 공지사항 등록</span>
        <button class="panel-close" type="button" @click="closeCreate">✕</button>
      </div>
      <div class="panel-body">
        <div class="field-row">
          <label class="field-label">Type</label>
          <select v-model="formType" class="select-type">
            <option v-for="opt in NOTICE_TYPE_OPTIONS" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
        <input
          v-model="formTitle"
          class="input-title"
          type="text"
          placeholder="공지 제목을 입력하세요."
        />
        <textarea
          v-model="formContent"
          class="input-content"
          placeholder="공지 내용을 입력하세요."
        ></textarea>
      </div>
      <div class="panel-footer">
        <button class="btn-secondary" type="button" @click="closeCreate">
          취소
        </button>
        <button class="btn-primary" type="button" @click="submitCreate">
          저장
        </button>
      </div>
    </div>

    <!-- 상태 표시 -->
    <div class="status-row">
      <span v-if="loading" class="loading-text">불러오는 중...</span>
      <span v-else-if="errorMessage" class="error-text">{{ errorMessage }}</span>
    </div>

    <!-- 목록 테이블 -->
    <div class="table-wrapper">
      <table class="notices-table">
        <thead>
          <tr>
            <th style="width: 60px">No.</th>
            <th style="width: 120px">Type</th>
            <th>Title</th>
            <th style="width: 180px">DateTime</th>
            <th style="width: 80px"></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(notice, index) in notices" :key="notice.id">
            <!-- 메인 행 -->
            <tr class="row-main">
              <td>{{ index + 1 }}</td>
              <td>{{ typeLabel(notice.type) }}</td>
              <td>{{ notice.title }}</td>
              <td>{{ formatDate(notice.createdAt) }}</td>
              <td class="cell-toggle">
                <button
                  type="button"
                  class="toggle-chip"
                  @click="toggleDetail(notice.id)"
                >
                  {{ openedNoticeId === notice.id ? '∧' : '∨' }}
                </button>
              </td>
            </tr>

            <!-- 상세 패널 -->
            <tr v-if="openedNoticeId === notice.id">
              <td colspan="5">
                <div class="panel panel-detail">
                  <div class="panel-header">
                    <span class="panel-title">
                      {{ isEditing ? '공지사항 수정' : '공지사항 상세' }}
                    </span>
                    <button
                      class="panel-close"
                      type="button"
                      @click="closeDetail"
                    >
                      ✕
                    </button>
                  </div>

                  <div v-if="detailLoading" class="detail-loading">
                    상세 정보를 불러오는 중입니다...
                  </div>

                  <template v-else>
                    <div class="panel-body">
                      <!-- 보기 모드 -->
                      <template v-if="!isEditing">
                        <div class="field-row">
                          <span class="field-label">Type</span>
                          <span>{{ typeLabel(selectedNotice?.type) }}</span>
                        </div>
                        <h3 class="detail-title">
                          {{ selectedNotice?.title }}
                        </h3>
                        <p class="detail-content">
                          {{ selectedNotice?.content }}
                        </p>
                      </template>

                      <!-- 수정 모드 -->
                      <template v-else>
                        <div class="field-row">
                          <label class="field-label">Type</label>
                          <select v-model="formType" class="select-type">
                            <option
                              v-for="opt in NOTICE_TYPE_OPTIONS"
                              :key="opt.value"
                              :value="opt.value"
                            >
                              {{ opt.label }}
                            </option>
                          </select>
                        </div>
                        <input
                          v-model="formTitle"
                          class="input-title"
                          type="text"
                          placeholder="공지 제목을 입력하세요."
                        />
                        <textarea
                          v-model="formContent"
                          class="input-content"
                          placeholder="공지 내용을 입력하세요."
                        ></textarea>
                      </template>
                    </div>

                    <div class="panel-footer">
                      <div class="left-group">
                        <button
                          type="button"
                          class="btn-danger"
                          @click="onDelete(notice.id)"
                        >
                          삭제
                        </button>
                      </div>
                      <div class="right-group">
                        <button
                          v-if="!isEditing"
                          type="button"
                          class="btn-secondary"
                          @click="startEdit"
                        >
                          수정
                        </button>
                        <template v-else>
                          <button
                            type="button"
                            class="btn-secondary"
                            @click="cancelEdit"
                          >
                            취소
                          </button>
                          <button
                            type="button"
                            class="btn-primary"
                            @click="submitEdit(notice.id)"
                          >
                            저장
                          </button>
                        </template>
                      </div>
                    </div>
                  </template>
                </div>
              </td>
            </tr>
          </template>

          <tr v-if="!loading && notices.length === 0">
            <td colspan="5" class="empty-row">등록된 공지사항이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
  fetchAdminNotices,
  fetchAdminNoticeDetail,
  createAdminNotice,
  updateAdminNotice,
  deleteAdminNotice,
} from '@/api/adminApi';

const NOTICE_TYPE_OPTIONS = [
  { value: 'ERROR', label: '오류사항' },
  { value: 'UPDATE', label: '업데이트' },
  { value: 'EMERGENCY', label: '긴급' },
];

const notices = ref([]);

const loading = ref(false);
const errorMessage = ref('');

const openedNoticeId = ref(null);
const detailLoading = ref(false);
const selectedNotice = ref(null);

const isEditing = ref(false);
const isCreating = ref(false);

const formTitle = ref('');
const formContent = ref('');
const formType = ref('ERROR');

function formatDate(iso) {
  if (!iso) return '-';
  return iso.slice(0, 10);
}

function typeLabel(type) {
  const found = NOTICE_TYPE_OPTIONS.find((o) => o.value === type);
  return found ? found.label : (type || '일반');
}

async function loadNotices() {
  loading.value = true;
  errorMessage.value = '';
  try {
    const data = await fetchAdminNotices();
    notices.value = data || [];
  } catch (e) {
    console.error(e);
    errorMessage.value = '공지사항 목록을 불러오는 중 오류가 발생했습니다.';
  } finally {
    loading.value = false;
  }
}

async function toggleDetail(noticeId) {
  if (openedNoticeId.value === noticeId) {
    closeDetail();
    return;
  }

  openedNoticeId.value = noticeId;
  isEditing.value = false;
  detailLoading.value = true;

  try {
    const data = await fetchAdminNoticeDetail(noticeId);
    selectedNotice.value = data;
    formTitle.value = data?.title || '';
    formContent.value = data?.content || '';
    formType.value = data?.type || 'ERROR';
  } catch (err) {
    console.error(err);
    alert('공지 상세 조회 중 오류가 발생했습니다.');
  } finally {
    detailLoading.value = false;
  }
}

function closeDetail() {
  openedNoticeId.value = null;
  selectedNotice.value = null;
  isEditing.value = false;
}

function startEdit() {
  if (!selectedNotice.value) return;
  isEditing.value = true;
  formTitle.value = selectedNotice.value.title;
  formContent.value = selectedNotice.value.content;
  formType.value = selectedNotice.value.type || 'ERROR';
}

function cancelEdit() {
  isEditing.value = false;
  if (selectedNotice.value) {
    formTitle.value = selectedNotice.value.title;
    formContent.value = selectedNotice.value.content;
    formType.value = selectedNotice.value.type || 'ERROR';
  }
}

async function submitEdit(noticeId) {
  if (!formTitle.value.trim() || !formContent.value.trim()) {
    alert('제목과 내용을 모두 입력해주세요.');
    return;
  }

  try {
    await updateAdminNotice(noticeId, {
      title: formTitle.value.trim(),
      content: formContent.value.trim(),
      type: formType.value,
    });

    const target = notices.value.find((n) => n.id === noticeId);
    if (target) {
      target.title = formTitle.value.trim();
      target.type = formType.value;
    }

    if (selectedNotice.value) {
      selectedNotice.value.title = formTitle.value.trim();
      selectedNotice.value.content = formContent.value.trim();
      selectedNotice.value.type = formType.value;
    }

    isEditing.value = false;
    alert('공지사항이 수정되었습니다.');
  } catch (err) {
    console.error(err);
    alert('공지사항 수정에 실패했습니다.');
  }
}

async function onDelete(noticeId) {
  if (!confirm('이 공지사항을 삭제하시겠습니까?')) return;
  try {
    await deleteAdminNotice(noticeId);
    notices.value = notices.value.filter((n) => n.id !== noticeId);
    closeDetail();
    alert('공지사항이 삭제되었습니다.');
  } catch (err) {
    console.error(err);
    alert('공지사항 삭제에 실패했습니다.');
  }
}

function openCreate() {
  isCreating.value = true;
  formTitle.value = '';
  formContent.value = '';
  formType.value = 'ERROR';
}

function closeCreate() {
  isCreating.value = false;
  formTitle.value = '';
  formContent.value = '';
  formType.value = 'ERROR';
}

async function submitCreate() {
  if (!formTitle.value.trim() || !formContent.value.trim()) {
    alert('제목과 내용을 모두 입력해주세요.');
    return;
  }

  try {
    const created = await createAdminNotice({
      title: formTitle.value.trim(),
      content: formContent.value.trim(),
      type: formType.value,
    });

    notices.value.unshift({
      id: created.id,
      title: created.title,
      type: created.type,
      createdAt: created.createdAt,
    });

    isCreating.value = false;
    alert('공지사항이 생성되었습니다.');
  } catch (err) {
    console.error(err);
    alert('공지사항 생성에 실패했습니다.');
  }
}

onMounted(loadNotices);
</script>

<style scoped>
/* 기존 스타일 + 타입/라벨용 몇 줄만 추가 */

.notices-page {
  display: flex;
  flex-direction: column;
}

.notices-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  font-size: 20px;
}

.title-text {
  font-size: 26px;
  font-weight: 700;
}

.subtitle-text {
  margin-top: 4px;
  font-size: 13px;
  color: #777;
}

.add-btn {
  border: none;
  background: transparent;
  font-size: 16px;
  cursor: pointer;
}

.status-row {
  min-height: 20px;
  margin-top: 8px;
}

.loading-text {
  font-size: 13px;
  color: #888;
}

.error-text {
  font-size: 13px;
  color: #e64545;
}

.table-wrapper {
  margin-top: 12px;
}

.notices-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.notices-table thead tr {
  border-bottom: 2px solid #000;
}

.notices-table th,
.notices-table td {
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

.cell-toggle {
  text-align: right;
}

.toggle-chip {
  appearance: none;
  border: none;
  outline: none;
  border-radius: 18px;
  padding: 4px 18px;
  min-width: 48px;
  background: #e9f5ff;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
}

/* 패널 공통 */
.panel {
  margin-top: 6px;
  border-radius: 18px;
  background: #f4f7fb;
  padding: 16px 18px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.panel-create {
  margin-top: 12px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-title {
  font-size: 15px;
  font-weight: 600;
}

.panel-close {
  border: none;
  background: #ffd6dc;
  color: #cc2240;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  font-size: 14px;
  cursor: pointer;
}

.panel-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.panel-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
}

.left-group,
.right-group {
  display: flex;
  gap: 8px;
}

/* 필드 행 */
.field-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  min-width: 60px;
}

.select-type {
  height: 32px;
  border-radius: 10px;
  border: 1px solid #ccd3e0;
  padding: 0 8px;
  font-size: 13px;
}

/* 입력 */
.input-title {
  width: 100%;
  height: 34px;
  border-radius: 10px;
  border: 1px solid #ccd3e0;
  padding: 0 10px;
  font-size: 14px;
}

.input-content {
  width: 100%;
  min-height: 80px;
  border-radius: 10px;
  border: 1px solid #ccd3e0;
  padding: 8px 10px;
  font-size: 13px;
  resize: vertical;
}

/* 상세 텍스트 */
.detail-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
}

.detail-content {
  font-size: 14px;
  line-height: 1.5;
}

/* 버튼 */
.btn-primary {
  min-width: 80px;
  height: 30px;
  border-radius: 15px;
  border: none;
  background: #88cfff;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
}

.btn-secondary {
  min-width: 70px;
  height: 30px;
  border-radius: 15px;
  border: none;
  background: #e2e8f3;
  color: #333;
  font-size: 13px;
  cursor: pointer;
}

.btn-danger {
  min-width: 70px;
  height: 30px;
  border-radius: 15px;
  border: none;
  background: #ffdddd;
  color: #c03434;
  font-size: 13px;
  cursor: pointer;
}
</style>
