<template>
  <header class="header-container flex justify-between items-end mb-10">
    <div class="flex items-center gap-4">
      <!-- Sidebar Toggle -->
      <button 
        @click="store.toggleSidebar()" 
        class="glass-btn p-3 rounded-2xl hover:scale-110 transition-all active:scale-95 group hover:bg-[#D72821]"
      >
        <Menu class="w-6 h-6 text-[#D72821] group-hover:text-white transition-colors" />
      </button>

      <div>
        <h2 class="text-3xl font-bold text-white title-text">{{ title }}</h2>
        <p class="text-slate-500 text-sm mt-1">Data Call Monitoring & Cost Analysis</p>
      </div>
    </div>
    
    <div class="flex items-center gap-4">
      <!-- Refresh Button -->
      <button 
        @click="store.triggerRefresh()" 
        class="glass-btn p-3 rounded-2xl hover:scale-110 transition-all active:scale-95"
        title="Refresh Data"
      >
        <RefreshCw class="w-5 h-5 text-[#D72821] group-hover:text-white transition-colors" />
      </button>

      <!-- Dark Mode Toggle -->
      <button @click="store.toggleTheme()" class="glass-btn p-3 rounded-2xl hover:scale-110 transition-all active:scale-95">
        <Moon v-if="!store.isDark" class="w-5 h-5 text-[#D72821]" />
        <Sun v-else class="w-5 h-5 text-amber-500" />
      </button>

      <!-- Logout Button -->
      <button 
        @click="store.logout()" 
        class="glass-btn p-3 rounded-2xl hover:bg-rose-500/10 hover:border-rose-500/30 transition-all group ml-2"
        title="Sign Out"
      >
        <LogOut class="w-5 h-5 text-slate-500 group-hover:text-rose-500 transition-colors" />
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { Moon, Sun, Calendar, LogOut, Menu, RefreshCw } from 'lucide-vue-next';
import { store } from '../../../store/billingStore';
import './Header.css';

const route = useRoute();
const title = computed(() => {
  return {
    Dashboard: 'Billing Dashboard',
    Invoice: 'Invoice Engine',
    Analytics: 'Cost Analytics'
  }[route.name] || 'Billing System';
});
</script>
