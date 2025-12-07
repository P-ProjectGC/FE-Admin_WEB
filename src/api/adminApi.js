// src/api/adminApi.js
import axios from 'axios';

// 🔗 기본 axios 인스턴스
const adminApi = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    // ✅ ngrok 브라우저 경고(HTML) 우회용 헤더
    'ngrok-skip-browser-warning': 'true',
  },
});

// ✅ 모든 요청에 Authorization 헤더 자동 첨부
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminAccessToken'); // 로그인 시 저장한 키 이름이랑 맞춰주세요
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 🔐 관리자 로그인
export async function adminLogin({ loginId, password }) {
  const response = await adminApi.post('/admin/auth/login', {
    loginId,
    password,
  });
  return response.data; // { code, message, data: { accessToken, ... } }
}

// 👥 회원 목록 조회
export async function fetchAdminMembers(keyword) {
  const params = {};
  if (keyword && keyword.trim()) {
    params.keyword = keyword.trim();
  }


  

  const response = await adminApi.get('/admin/members', { params });

  // 디버그 로그
  console.log('raw /admin/members response:', response.data);

  // 백엔드 스펙: { code, message, data: [...] }
  return response.data.data || [];
}

// 👤 회원 상세 조회
export async function fetchAdminMemberDetail(memberId) {
  const response = await adminApi.get(`/admin/members/${memberId}`);
  // 응답: { code, message, data: { ...회원정보... } }
  return response.data.data;
}

// ✏️ 회원 정보 수정 (email / nickname)
export async function updateAdminMember(memberId, { email, nickname }) {
  const body = {};

  // null/공백이면 보내지 않도록 필터링
  if (email && email.trim()) {
    body.email = email.trim();
  }
  if (nickname && nickname.trim()) {
    body.nickname = nickname.trim();
  }

  const response = await adminApi.patch(`/admin/members/${memberId}`, body);
  // 응답: { code, message, data: null }
  return response.data;
}

// 🚨 신고 목록 조회
export async function fetchAdminReports() {
  const response = await adminApi.get('/admin/reports');
  // 응답: { code, message, data: [ ... ] }
  return response.data.data || [];
}

// 🚨 신고 상세 조회
export async function fetchAdminReportDetail(reportId) {
  const response = await adminApi.get(`/admin/reports/${reportId}`);
  return response.data.data; // 상세 데이터 객체
}

// 🚨 신고 상태 변경
export async function updateAdminReportStatus(reportId, { status, adminMemo }) {
  const body = {
    status,
    adminMemo: adminMemo || '',
  };

  const response = await adminApi.patch(`/admin/reports/${reportId}/status`, body);
  return response.data;
}

// 🧷 공지사항 목록 조회
export async function fetchAdminNotices() {
  const res = await adminApi.get('/admin/notices');
  // 백엔드 응답: { id, title, type, createdAt }
  return res.data.data || [];
}

// 🧷 공지사항 상세 조회
export async function fetchAdminNoticeDetail(noticeId) {
  const res = await adminApi.get(`/admin/notices/${noticeId}`);
  // 응답: { id, title, content, type, ... }
  return res.data.data;
}

// 🧷 공지사항 생성
export async function createAdminNotice({ title, content, type }) {
  const res = await adminApi.post('/admin/notices', {
    title,
    content,
    type, // "ERROR" | "UPDATE" | "EMERGENCY"
  });
  return res.data.data;
}

// 🧷 공지사항 수정
export async function updateAdminNotice(noticeId, { title, content, type }) {
  const res = await adminApi.patch(`/admin/notices/${noticeId}`, {
    title,
    content,
    type,
  });
  return res.data;
}

// 🧷 공지사항 삭제
export async function deleteAdminNotice(noticeId) {
  const res = await adminApi.delete(`/admin/notices/${noticeId}`);
  return res.data;
}





export default adminApi;
