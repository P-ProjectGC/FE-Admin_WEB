<!-- src/views/MembersView.vue -->
<template>
  <div class="members-container">
    <!-- 제목 영역 -->
    <div class="members-header">
      <h1 class="title-text">회원 관리</h1>
      <p class="subtitle-text">회원 검색 (ID / E-mail / 닉네임)</p>
    </div>

    <!-- 검색 인풋 -->
    <div class="search-row">
      <input
        v-model="keyword"
        type="text"
        class="search-input"
        placeholder="회원 검색 (ID / E-mail / 닉네임)"
      />
      <button class="search-btn" @click="onSearch">
        검색
      </button>
    </div>

    <!-- 로딩/에러 메시지 -->
    <div class="status-row">
      <span v-if="loading" class="loading-text">불러오는 중...</span>
      <span v-else-if="errorMessage" class="error-text">{{ errorMessage }}</span>
    </div>

    <!-- 테이블 -->
    <div class="table-wrapper">
      <table class="members-table">
        <thead>
          <tr>
            <th style="width: 80px">ID</th>
            <th>Email</th>
            <th style="width: 160px">Details</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!loading && members.length === 0">
            <td colspan="3" class="empty-row">조회된 회원이 없습니다.</td>
          </tr>
          <tr v-for="member in members" :key="member.memberId">
            <td>{{ member.memberId }}</td>
            <td>{{ member.email }}</td>
            <td>
              <button class="detail-btn" @click="goDetail(member)">
                확인하기
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { fetchAdminMembers } from '@/api/adminApi';

const router = useRouter();

const keyword = ref('');
const members = ref([]);
const loading = ref(false);
const errorMessage = ref('');

// 🔄 공통 로딩 함수
// 🔄 공통 로딩 함수
async function loadMembers() {
  loading.value = true;
  errorMessage.value = '';

  try {
    const data = await fetchAdminMembers(keyword.value);
    members.value = data || [];
  } catch (error) {
    // ✅ 디버그 로그 강화
    console.error('loadMembers error:', error);
    console.error('status:', error?.response?.status);
    console.error('data:', error?.response?.data);

    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      alert('관리자 인증이 필요합니다. 다시 로그인 해주세요.');
      localStorage.removeItem('adminAccessToken');
      router.push('/login');
      return;
    }

    // 에러 메시지에 상태코드도 같이 보여주면 디버깅 편함
    const backendMessage =
      error?.response?.data?.message || error?.message || '';
    errorMessage.value = `회원 목록을 불러오는 중 오류가 발생했습니다. (status: ${status ?? '알 수 없음'}, message: ${backendMessage})`;
  } finally {
    loading.value = false;
  }
}


// 최초 진입 시 전체 회원 조회
onMounted(() => {
  loadMembers();
});

// 검색 버튼 클릭 시
function onSearch() {
  loadMembers();
}

function goDetail(member) {
  router.push(`/admin/members/${member.memberId}`);
  // 또는 router.push({ name: 'MemberDetail', params: { memberId: member.memberId } });
}
</script>

<style scoped>
.members-container {
  display: flex;
  flex-direction: column;
}

/* 제목 영역 */
.members-header {
  margin-bottom: 8px;
}

.title-text {
  font-size: 26px;
  font-weight: 700;
}

.subtitle-text {
  margin-top: 6px;
  font-size: 13px;
  color: #777;
}

/* 검색 영역 */
.search-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  margin-bottom: 8px;
}

.search-input {
  flex: 1;
  height: 38px;
  padding: 0 16px;
  border-radius: 19px;
  border: 1px solid #cfd5e2;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #4fa3f7;
  box-shadow: 0 0 0 1px rgba(79, 163, 247, 0.3);
}

.search-btn {
  height: 38px;
  padding: 0 20px;
  border-radius: 19px;
  border: none;
  background: #4fa3f7;
  color: white;
  font-size: 14px;
  cursor: pointer;
}

/* 상태 문구 */
.status-row {
  min-height: 20px;
  margin-bottom: 4px;
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

.members-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.members-table thead tr {
  border-bottom: 2px solid #000;
}

.members-table th,
.members-table td {
  border-bottom: 1px solid #e4e8f0;
  padding: 10px 8px;
  text-align: left;
}

.members-table th {
  font-weight: 600;
}

.empty-row {
  text-align: center;
  color: #999;
}

.detail-btn {
  width: 110px;
  height: 28px;
  border-radius: 14px;
  border: none;
  background: #88cfff;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
}
</style>
