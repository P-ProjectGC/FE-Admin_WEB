<!-- src/views/MemberDetailView.vue -->
<template>
  <div class="member-detail-page">
    <!-- 상단 제목 + 뒤로가기 -->
    <div class="header-row">
      <div>
        <h1 class="title-text">회원 상세</h1>
        <p class="subtitle-text">ID {{ memberId }} 번 회원의 상세 정보입니다.</p>
      </div>
      <button class="back-btn" @click="goBack">← 목록으로</button>
    </div>

    <!-- 상태 표시 -->
    <div class="status-row">
      <span v-if="loading" class="loading-text">불러오는 중...</span>
      <span v-else-if="saving" class="loading-text">저장 중...</span>
      <span v-else-if="errorMessage" class="error-text">{{ errorMessage }}</span>
      <span v-else-if="successMessage" class="success-text">{{ successMessage }}</span>
    </div>

    <!-- 내용 -->
    <div v-if="member" class="content-layout">
      <!-- 좌측 요약 카드 -->
      <section class="summary-card">
        <div class="avatar-circle">👤</div>
        <div class="summary-texts">
          <div class="summary-id">ID : {{ member.memberId }}</div>
          <div class="summary-name">{{ member.name || '이름 정보 없음' }}</div>
          <div class="summary-nickname">
            Nickname:
            <span v-if="!editMode">{{ member.nickname || '-' }}</span>
            <input
              v-else
              v-model="formNickname"
              type="text"
              class="inline-input"
              placeholder="닉네임 입력"
            />
          </div>
          <div class="summary-email">
            E-mail:
            <span v-if="!editMode">{{ member.email }}</span>
            <input
              v-else
              v-model="formEmail"
              type="email"
              class="inline-input"
              placeholder="이메일 입력"
            />
          </div>
        </div>

        <div class="login-type-badge" :class="loginTypeClass">
          {{ loginTypeLabel }}
        </div>
      </section>

      <!-- 우측 상세 정보 카드 -->
      <section class="detail-card">
        <h2 class="section-title">계정 정보</h2>
        <dl class="detail-list">
          <div class="detail-row">
            <dt>회원 ID</dt>
            <dd>{{ member.memberId }}</dd>
          </div>
          <div class="detail-row">
            <dt>로그인 아이디</dt>
            <dd>{{ member.loginId }}</dd>
          </div>
          <div class="detail-row">
            <dt>E-mail</dt>
            <dd>
              <span v-if="!editMode">{{ member.email }}</span>
              <input
                v-else
                v-model="formEmail"
                type="email"
                class="detail-input"
                placeholder="이메일 입력"
              />
            </dd>
          </div>
          <div class="detail-row">
            <dt>이름</dt>
            <dd>{{ member.name || '-' }}</dd>
          </div>
          <div class="detail-row">
            <dt>닉네임</dt>
            <dd>
              <span v-if="!editMode">{{ member.nickname || '-' }}</span>
              <input
                v-else
                v-model="formNickname"
                type="text"
                class="detail-input"
                placeholder="닉네임 입력"
              />
            </dd>
          </div>
          <div class="detail-row">
            <dt>로그인 타입</dt>
            <dd>{{ member.loginType }}</dd>
          </div>
          <div class="detail-row">
            <dt>가입일</dt>
            <dd>{{ formatDateTime(member.createdAt) }}</dd>
          </div>
          <div class="detail-row">
            <dt>최근 수정일</dt>
            <dd>{{ formatDateTime(member.updatedAt) }}</dd>
          </div>
        </dl>

        <div class="actions-row" v-if="!editMode">
          <button class="edit-btn" @click="startEdit">
            Edit
          </button>
        </div>
        <div class="actions-row" v-else>
          <button class="cancel-btn" @click="cancelEdit" :disabled="saving">
            취소
          </button>
          <button class="save-btn" @click="saveEdit" :disabled="saving">
            저장
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  fetchAdminMemberDetail,
  updateAdminMember,
} from '@/api/adminApi';

const route = useRoute();
const router = useRouter();

const memberId = Number(route.params.memberId);

const member = ref(null);
const loading = ref(false);
const saving = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// 수정 모드 관련 상태
const editMode = ref(false);
const formEmail = ref('');
const formNickname = ref('');

// 로그인 타입 뱃지용
const loginTypeLabel = computed(() => {
  if (!member.value) return '';
  if (member.value.loginType === 'KAKAO') return 'Kakao 로그인';
  if (member.value.loginType === 'NORMAL') return '일반 회원';
  return member.value.loginType || '기타';
});

const loginTypeClass = computed(() => {
  if (!member.value) return '';
  return member.value.loginType === 'KAKAO' ? 'badge-kakao' : 'badge-normal';
});

function formatDateTime(isoString) {
  if (!isoString) return '-';
  return isoString.replace('T', ' ').slice(0, 16);
}

async function loadMember() {
  loading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const data = await fetchAdminMemberDetail(memberId);
    if (!data) {
      errorMessage.value = '해당 회원 정보를 찾을 수 없습니다.';
      member.value = null;
      return;
    }
    member.value = data;

    // 수정 폼 초기값 세팅
    formEmail.value = data.email || '';
    formNickname.value = data.nickname || '';
  } catch (error) {
    console.error(error);
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      alert('관리자 인증이 필요합니다. 다시 로그인 해주세요.');
      localStorage.removeItem('adminAccessToken');
      router.push('/login');
      return;
    }

    if (status === 404) {
      errorMessage.value = '해당 회원을 찾을 수 없습니다. (MEMBER_NOT_FOUND)';
    } else {
      errorMessage.value = '회원 상세 정보를 불러오는 중 오류가 발생했습니다.';
    }
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.push('/admin/members');
}

function startEdit() {
  if (!member.value) return;
  editMode.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  formEmail.value = member.value.email || '';
  formNickname.value = member.value.nickname || '';
}

function cancelEdit() {
  editMode.value = false;
  errorMessage.value = '';
  successMessage.value = '';
  // 폼을 다시 원래 값으로
  if (member.value) {
    formEmail.value = member.value.email || '';
    formNickname.value = member.value.nickname || '';
  }
}

async function saveEdit() {
  if (!member.value) return;

  saving.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    // email / nickname 둘 다 기존 값과 동일하면 굳이 요청 안 보냄
    const payload = {};
    if (formEmail.value.trim() !== (member.value.email || '')) {
      payload.email = formEmail.value;
    }
    if (formNickname.value.trim() !== (member.value.nickname || '')) {
      payload.nickname = formNickname.value;
    }

    if (!payload.email && !payload.nickname) {
      // 변경된 값이 없으면 그냥 편집 종료
      editMode.value = false;
      successMessage.value = '변경 사항이 없습니다.';
      return;
    }

    await updateAdminMember(memberId, payload);

    // 프론트 상태 업데이트
    if (payload.email) {
      member.value.email = payload.email.trim();
    }
    if (payload.nickname) {
      member.value.nickname = payload.nickname.trim();
    }

    editMode.value = false;
    successMessage.value = '회원 정보가 성공적으로 수정되었습니다.';
  } catch (error) {
    console.error(error);
    const status = error?.response?.status;
    const backendMessage = error?.response?.data?.message;

    if (status === 401 || status === 403) {
      alert('관리자 인증이 필요합니다. 다시 로그인 해주세요.');
      localStorage.removeItem('adminAccessToken');
      router.push('/login');
      return;
    }

    if (status === 404) {
      errorMessage.value = '해당 회원을 찾을 수 없습니다. (MEMBER_NOT_FOUND)';
    } else {
      errorMessage.value =
        backendMessage ||
        '회원 정보를 수정하는 중 오류가 발생했습니다.';
    }
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  if (!memberId) {
    errorMessage.value = '잘못된 회원 ID 입니다.';
    return;
  }
  loadMember();
});
</script>

<style scoped>
.member-detail-page {
  display: flex;
  flex-direction: column;
}

/* 상단 제목 + 뒤로가기 */
.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
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

.back-btn {
  border: none;
  background: #e5f2ff;
  color: #2166c5;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
}

/* 상태 표시 */
.status-row {
  min-height: 20px;
  margin-bottom: 8px;
}

.loading-text {
  font-size: 13px;
  color: #777;
}

.error-text {
  font-size: 13px;
  color: #e64545;
}

.success-text {
  font-size: 13px;
  color: #1a7f3b;
}

/* 메인 레이아웃 */
.content-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 24px;
}

/* 요약 카드 */
.summary-card {
  background: #f7fbff;
  border-radius: 12px;
  padding: 18px 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.avatar-circle {
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background: #dbefff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
}

.summary-texts {
  font-size: 14px;
}

.summary-id {
  font-weight: 700;
  margin-bottom: 4px;
}

.summary-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 2px;
}

.summary-nickname,
.summary-email {
  margin-top: 2px;
  color: #555;
}

/* inline input */
.inline-input {
  margin-left: 4px;
  border-radius: 12px;
  border: 1px solid #cfd5e2;
  padding: 2px 8px;
  font-size: 13px;
}

/* 로그인 타입 뱃지 */
.login-type-badge {
  margin-top: 4px;
  align-self: flex-start;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
}

.badge-kakao {
  background: #ffe27a;
  color: #5b4a00;
}

.badge-normal {
  background: #d6e9ff;
  color: #20529b;
}

/* 상세 카드 */
.detail-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 18px 20px 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
}

.detail-list {
  margin: 0;
}

.detail-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  padding: 6px 0;
  border-bottom: 1px solid #edf0f5;
  font-size: 14px;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row dt {
  font-weight: 600;
  color: #555;
}

.detail-row dd {
  margin: 0;
}

/* 상세 입력 */
.detail-input {
  width: 100%;
  max-width: 260px;
  border-radius: 16px;
  border: 1px solid #cfd5e2;
  padding: 4px 10px;
  font-size: 14px;
}

/* 하단 버튼 */
.actions-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  gap: 8px;
}

.edit-btn {
  min-width: 120px;
  height: 32px;
  border-radius: 16px;
  border: none;
  background: #f4c6dc;
  color: #333;
  font-size: 14px;
  cursor: pointer;
}

.cancel-btn {
  min-width: 90px;
  height: 32px;
  border-radius: 16px;
  border: none;
  background: #e6e6e6;
  color: #333;
  font-size: 14px;
  cursor: pointer;
}

.save-btn {
  min-width: 110px;
  height: 32px;
  border-radius: 16px;
  border: none;
  background: #88cfff;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
}
</style>
