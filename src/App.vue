<template>
  <div class="popup-container">
    <!-- Header -->
    <header class="header">
      <div>
        <h1 class="header-title">📥 GPT-Export <span class="header-version">v1.0.0</span></h1>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Overview Section -->
      <section class="overview-section">
        <h2 class="section-title">✨ Overview</h2>
        <p class="section-text">
          Export ChatGPT chats to TXT, HTML, PNG, PDF, or DOC in a snap!
        </p>
      </section>

      <!-- Instructions Section -->
      <section v-if="isChatGPTPage" class="instructions-section">
        <h3 class="section-subtitle">📋 How to Export</h3>
        <ol class="instructions-list">
          <li>Find the chat you want to export.</li>
          <li>Hover to the particular conversation.</li>
          <li>Click the button and pick a format.</li>
          <li>Download starts automatically! ✅</li>
        </ol>
        <p class="tip-text">
          💡 Tip: If the button doesn’t appear, click on outside the chat and hover again to ensure it loads.
        </p>
        <img src="/how-to-use.png" alt="How to use GPT-Export: Screenshot showing the export button and format selection" class="how-to-image" />
      </section>
      <section v-else class="error-section">
        <p class="error-text">🚫 Please open a ChatGPT page to export content.</p>
      </section>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <p class="footer-links">
        <a href="https://github.com/akii09/GPT-Export" target="_blank" class="footer-link">GitHub 🌟</a>
        <span>|</span>
        <a href="https://www.linkedin.com/in/akash-pise-b34a0014a/" target="_blank" class="footer-link">LinkedIn 💼</a>
        <span>|</span>
        <a href="https://buymeacoffee.com/akii09" target="_blank" class="footer-link">Buy Me a Coffee ☕</a>
        <span>|</span>
        <a href="https://www.akashpise.tech/" target="_blank" class="footer-link">My Website 🌐</a>
      </p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const isChatGPTPage = ref(false);

onMounted(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  isChatGPTPage.value = tab.url.includes('chatgpt.com');
});
</script>

<style scoped>
.popup-container {
  min-height: 400px;
  width: 350px;
  background: linear-gradient(to bottom, #f7fafc, #edf2f7);
  color: #2d3748;
  display: flex;
  flex-direction: column;
  font-family: Arial, sans-serif;
}

.dark .popup-container {
  background: linear-gradient(to bottom, #2d3748, #1a202c);
  color: #e2e8f0;
}

/* Header */
.header {
  background: #3182ce;
  color: #ffffff;
  padding: 16px;
  border-bottom: 2px solid #2b6cb0;
}

.dark .header {
  background: #2b6cb0;
  border-bottom: 2px solid #2c5282;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}

.header-version {
  font-size: 12px;
  opacity: 0.8;
  margin: 0;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.main-content section {
  margin-bottom: 16px;
}

/* Overview Section */
.overview-section {
  border-left: 4px solid #3182ce;
  padding-left: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #3182ce;
  margin: 0 0 4px 0;
  text-align: left;
}

.dark .section-title {
  color: #63b3ed;
}

.section-text {
  font-size: 14px;
  color: #4a5568;
  margin: 0;
  text-align: left;
}

.dark .section-text {
  color: #cbd5e0;
}

/* Instructions Section */
.instructions-section {
  border-left: 4px solid #3182ce;
  padding-left: 12px;
}

.section-subtitle {
  font-size: 14px;
  font-weight: 500;
  color: #3182ce;
  margin: 0 0 8px 0;
  text-align: left;
}

.dark .section-subtitle {
  color: #63b3ed;
}

.instructions-list {
  list-style: decimal inside;
  font-size: 14px;
  color: #4a5568;
  margin: 0;
  padding: 0;
  line-height: 1.5;
  text-align: left;
}

.dark .instructions-list {
  color: #cbd5e0;
}

.instructions-list li {
  margin-bottom: 4px;
}

.tip-text {
  font-size: 12px;
  font-style: italic;
  color: #718096;
  margin: 8px 0 0 0;
}

.dark .tip-text {
  color: #a0aec0;
}

.how-to-image {
  width: 100%;
  max-width: 300px;
  margin: 8px auto;
  display: block;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.how-to-image:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Error Section */
.error-section {
  border-left: 4px solid #e53e3e;
  padding-left: 12px;
}

.error-text {
  font-size: 14px;
  color: #e53e3e;
  margin: 0;
}

/* Footer */
.footer {
  background: #edf2f7;
  padding: 8px;
  text-align: center;
  border-top: 2px solid #e2e8f0;
}

.dark .footer {
  background: #2d3748;
  border-top: 2px solid #4a5568;
}

.footer-links {
  font-size: 12px;
  color: #718096;
  margin: 0;
}

.dark .footer-links {
  color: #a0aec0;
}

.footer-links span {
  margin: 0 8px;
}

.footer-link {
  color: #718096;
  text-decoration: underline;
  transition: color 0.2s ease;
}

.dark .footer-link {
  color: #a0aec0;
}

.footer-link:hover {
  color: #3182ce;
}

.dark .footer-link:hover {
  color: #63b3ed;
}
</style>