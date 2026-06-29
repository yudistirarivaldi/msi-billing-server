<template>
  <aside 
    :class="[
      'fixed left-0 top-0 h-screen transition-all duration-500 ease-in-out z-50 border-r border-rose-500/10 shadow-2xl overflow-hidden',
      store.isSidebarCollapsed ? 'w-0 opacity-0 -translate-x-full' : 'w-72 opacity-100 translate-x-0',
      store.isDark ? 'bg-[#050505]' : 'bg-white'
    ]"
  >
    <!-- Logo Area -->
    <div class="p-8 border-b border-white/5 relative group">
      <div class="flex flex-col items-center justify-center relative z-10">
        <img 
          src="../../../assets/images/MSTI-Logo.png" 
          alt="MSTI Logo" 
          class="h-16 w-auto transition-transform duration-500 group-hover:scale-105"
        >
      </div>
    </div>
    
    <nav class="flex-1 px-4 mt-8 space-y-2">
      <p class="nav-label px-4 mb-4">Main Menu</p>
      
      <router-link 
        to="/"
        class="nav-link group"
        exact-active-class="active"
      >
        <LayoutDashboard class="w-5 h-5 flex-shrink-0" /> 
        <span class="whitespace-nowrap">Dashboard</span>
      </router-link>

      <router-link 
        to="/invoice"
        class="nav-link group"
        active-class="active"
      >
        <Receipt class="w-5 h-5 flex-shrink-0" /> 
        <span class="whitespace-nowrap">Invoice Engine</span>
      </router-link>

      <router-link 
        to="/analytics"
        class="nav-link group"
        active-class="active"
      >
        <PieChart class="w-5 h-5 flex-shrink-0" /> 
        <span class="whitespace-nowrap">Cost Analytics</span>
      </router-link>
    </nav>

    <!-- Profile Area -->
    <div class="p-4 mt-auto border-t border-white/5">
      <div class="profile-card p-4 rounded-2xl flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-rose-500 flex-shrink-0 flex items-center justify-center text-sm font-bold text-white shadow-lg">
          {{ store.user?.username?.substring(0, 2).toUpperCase() || 'YR' }}
        </div>
        
        <div class="flex-1 min-w-0">
          <p class="text-xs font-bold text-white truncate">{{ store.user?.username || 'Yudistira' }}</p>
          <p class="text-[9px] text-slate-500 uppercase tracking-tighter truncate">{{ store.user?.email || 'Administrator' }}</p>
        </div>

        <button 
          @click="store.logout()" 
          class="p-2 rounded-xl hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 transition-all flex-shrink-0"
          title="Sign Out"
        >
          <LogOut class="w-5 h-5" />
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { LayoutDashboard, Receipt, PieChart, LogOut } from 'lucide-vue-next';
import { store } from '../../../store/billingStore';
import './Sidebar.css';
</script>
