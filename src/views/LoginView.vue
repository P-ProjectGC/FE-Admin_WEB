<template>
  <div class="login-wrapper">
    <div class="login-card">
      <h1 class="login-title">LOGIN</h1>

      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="input-group">
          <span class="input-icon">👤</span>
          <input
            v-model="loginId"
            type="text"
            placeholder="아이디"
            autocomplete="username"
          />
        </div>

        <div class="input-group">
          <span class="input-icon">🔒</span>
          <input
            v-model="password"
            type="password"
            placeholder="비밀번호"
            autocomplete="current-password"
          />
        </div>

        <p v-if="errorMessage" class="error-text">
          {{ errorMessage }}
        </p>

        <button
          class="login-button"
          type="submit"
          :disabled="loading"
        >
          {{ loading ? '로그인 중...' : '로그인 하기' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { adminLogin } from '../api/adminApi';

export default {
  name: 'LoginView',
  data() {
    return {
      loginId: '',
      password: '',
      loading: false,
      errorMessage: '',
    };
  },
  methods: {
    async handleSubmit() {
      if (this.loading) return;

      this.errorMessage = '';

      if (!this.loginId || !this.password) {
        this.errorMessage = '아이디와 비밀번호를 모두 입력하세요.';
        return;
      }

      this.loading = true;
      try {
        const res = await adminLogin({
          loginId: this.loginId,
          password: this.password,
        });

        if (res?.code === 0 && res?.data?.accessToken) {
          const { adminId, name, accessToken } = res.data;

          // 일단 로컬스토리지에 저장 (나중에 별도 관리 객체로 빼도 됨)
          localStorage.setItem('adminAccessToken', accessToken);
          localStorage.setItem('adminId', String(adminId));
          localStorage.setItem('adminName', name);

          // 로그인 성공 시 기본 페이지로 이동
          this.$router.push('/admin/members');
        } else {
          this.errorMessage = res?.message || '로그인에 실패했습니다.';
        }
            } catch (error) {
        // 🔍 디버깅용 로그 (나중에 지워도 됨)
        console.log('LOGIN ERROR ===>', error);
        console.log('ERROR RESPONSE ===>', error?.response);

        const code = error?.response?.data?.code;
        const backendMessage = error?.response?.data?.message;

        if (code === 'ADMIN_NOT_FOUND') {
          this.errorMessage = '존재하지 않는 관리자 계정입니다.';
        } else if (code === 'INVALID_ADMIN_PASSWORD') {
          this.errorMessage = '비밀번호가 올바르지 않습니다.';
        } else if (code === 405) {
          // 만약 405가 실제로 떨어진다면
          this.errorMessage =
            backendMessage || '로그인 API 요청 메서드가 올바르지 않습니다.';
        } else {
          this.errorMessage =
            backendMessage || '서버 통신 중 오류가 발생했습니다.';
        }
      } finally {

        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f7fbff; /* 연한 파란 배경 */
}

.login-card {
  width: 480px;        /* 기존 380에서 조금 넓힘 */
  max-width: 90vw;     /* 화면이 좁을 때는 자동으로 줄어들게 */
  text-align: center;
}


.login-title {
  font-size: 28px;
  letter-spacing: 4px;
  color: #5aaee6;
  margin-bottom: 32px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group {
  display: flex;
  align-items: center;
  background: #e9f6ff;
  border-radius: 999px;
  padding: 10px 16px;
}

.input-icon {
  font-size: 16px;
  margin-right: 8px;
  color: #6b7a8c;
}

.input-group input {
  border: none;
  outline: none;
  flex: 1;
  background: transparent;
  font-size: 14px;
}

.login-button {
  margin-top: 8px;
  width: 100%;
  border: none;
  border-radius: 999px;
  padding: 12px 0;
  background: #5ec0ff;
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.1s ease;
}

.login-button:hover:not(:disabled) {
  opacity: 0.95;
  transform: translateY(-1px);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: default;
}

.error-text {
  font-size: 12px;
  color: #ff4d4f;
  margin-top: -4px;
}
</style>
