<template>
  <div v-if="!store.isAuthenticated">
    <router-view />
  </div>
  <div v-else class="app-layout flex min-h-screen">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <main 
      :class="[
        'flex-1 p-8 flex flex-col min-h-screen transition-all duration-500',
        store.isSidebarCollapsed ? 'pl-8' : 'pl-[20rem]'
      ]"
    >
      <!-- Top Header -->
      <Header />

      <!-- Page Content -->
      <div class="flex-1">
        <transition name="fade" mode="out-in">
          <router-view />
        </transition>
      </div>

      <!-- Footer Component -->
      <Footer />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import Sidebar from './components/layout/Sidebar/Sidebar.vue';
import Header from './components/layout/Header/Header.vue';
import Footer from './components/layout/Footer/Footer.vue';
import { store } from './store/billingStore';

onMounted(() => {
  store.updateTheme();
});
</script>

<style>
@import './assets/css/main.css';

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.app-layout {
  background-color: #010409;
  color: #e2e8f0;
}

html:not(.dark) .app-layout {
  background-color: #f8fafc;
  color: #1e293b;
}

html:not(.dark) footer {
  border-color: #e2e8f0;
}
</style>
