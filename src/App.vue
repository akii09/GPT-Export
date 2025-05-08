<script>
import { ref } from 'vue';
import { onMounted } from 'vue';

const message = ref('GPT-export');

onMounted(() => {
  message.value = 'GPT-export Opened';
  alert('GPT-export Opened');
});
</script>

<template>
  <div>
     <h1>{{ message }}</h1>
     <p>Welcome to GPT-export</p>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
