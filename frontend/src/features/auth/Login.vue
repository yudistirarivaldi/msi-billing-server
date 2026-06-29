<template>
  <div class="login-container min-h-screen flex items-center justify-center p-6 bg-slate-50">
    <div class="login-card bg-white p-12 rounded-[2.5rem] w-full max-w-lg relative z-10 border border-slate-200 shadow-[0_30px_60px_rgba(0,0,0,0.08)]">
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center mb-12">
          <img 
            src="../../../src/assets/images/MSTI-Logo.png" 
            alt="MSTI Logo" 
            class="h-24 w-auto grayscale-[0.2] hover:grayscale-0 transition-all duration-500"
          >
        </div>
        <p class="text-slate-500 text-base">Secure access to MSTI Billing System</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
          <div class="relative group">
            <UserIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#D72821] transition-colors" />
            <input 
              v-model="username"
              type="text" 
              required
              placeholder="Enter your username"
              class="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 outline-none focus:border-[#D72821] focus:bg-white transition-all"
            >
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between items-center ml-1">
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
            <a href="#" class="text-[10px] font-bold text-[#D72821] uppercase tracking-widest hover:text-[#b91d18] transition-colors">Forgot?</a>
          </div>
          <div class="relative group">
            <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#D72821] transition-colors" />
            <input 
              v-model="password"
              type="password" 
              required
              placeholder="••••••••"
              class="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 outline-none focus:border-[#D72821] focus:bg-white transition-all"
            >
          </div>
        </div>

        <div v-if="error" class="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 animate-shake">
          <AlertCircle class="w-5 h-5 text-[#D72821]" />
          <p class="text-xs text-[#D72821] font-medium">{{ error }}</p>
        </div>

        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full bg-[#D72821] hover:bg-[#b91d18] disabled:bg-red-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#D72821]/30 transition-all flex items-center justify-center gap-2 group"
        >
          <span v-if="isLoading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          <span v-else class="flex items-center gap-2">
            Sign In
            <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </button>
      </form>

      <div class="mt-10 text-center">
        <p class="text-xs text-slate-400">
          Managed by <span class="text-slate-900 font-semibold">MSI IT Infrastructure</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { User as UserIcon, Lock, ArrowRight, AlertCircle } from 'lucide-vue-next';
import axios from '../../utils/axios';
import { store } from '../../store/billingStore';

const router = useRouter();

const username = ref('');
const password = ref('');
const error = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
  isLoading.value = true;
  error.value = '';
  
  try {
    const response = await axios.post('/auth/login', {
      username: username.value,
      password: password.value
    });
    
    if (response.data.success) {
      store.login(response.data.user, response.data.token || 'true');
      router.push('/');
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Connection to server failed';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.animate-shake {
  animation: shake 0.2s ease-in-out 0s 2;
}
</style>
