import { createApp } from 'vue';
import App from './App.vue';
import router from './router';   // src/router/index.js
import './style.css';            // 프로젝트에 따라 ./assets/main.css 일 수도 있음

const app = createApp(App);

app.use(router);                 // 라우터 연결
app.mount('#app');
