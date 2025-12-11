<template>
  <Pie :data="chartData" :options="chartOptions" />
</template>

<script setup>
import { computed } from 'vue';
import { Pie } from 'vue-chartjs';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps({
  kakaoCount: { type: Number, default: 0 },
  normalCount: { type: Number, default: 0 },
});

const chartData = computed(() => ({
  labels: ['카카오 로그인', '일반 로그인'],
  datasets: [
    {
      data: [props.kakaoCount, props.normalCount],
      backgroundColor: ['#6f6bf6', '#ffd84a'],
      hoverOffset: 4,
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
};
</script>
