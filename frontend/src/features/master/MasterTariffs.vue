<template>
  <div class="space-y-6 relative">
    <!-- Notification Toast -->
    <div v-if="notification" class="fixed top-8 right-8 z-[100] px-6 py-4 rounded-2xl shadow-2xl border border-white/20 animate-fade-in flex items-center gap-3"
         :class="notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-[#D72821] text-white'">
      <CheckCircle2 v-if="notification.type === 'success'" class="w-5 h-5" />
      <AlertCircle v-else class="w-5 h-5" />
      <p class="font-black tracking-wide text-sm">{{ notification.message }}</p>
    </div>
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-white"></h1>
      <button 
        @click="openModal()" 
        class="flex items-center gap-3 bg-[#D72821] hover:bg-[#b01e19] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-[#D72821]/30 hover:scale-105 active:scale-95"
      >
        <span>Add Tariff</span>
      </button>
    </div>

    <!-- Table -->
    <div class="glass rounded-[3rem] overflow-hidden flex flex-col border border-slate-200 dark:border-white/10">
      <div class="p-8 border-b border-slate-200 dark:border-white/5 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h4 class="text-xl font-black text-[#D72821] tracking-tight">Tariff Configurations</h4>
        </div>
        <div class="relative w-64">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-[#D72821]" />
          <input v-model="searchQuery" type="text" placeholder="Search prefix or description..." class="w-full bg-white dark:bg-white/5 border border-[#D72821]/30 dark:border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-900 dark:text-white outline-none focus:border-[#D72821] transition-all shadow-sm" />
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 dark:bg-white/[0.02] text-[10px] text-slate-600 dark:text-slate-400 uppercase tracking-widest font-bold">
            <tr>
              <th class="p-4 pl-8">Prefix</th>
              <th class="p-4 text-center">Type</th>
              <th class="p-4">Description</th>
              <th class="p-4 text-right">Rate/Sec</th>
              <th class="p-4 text-right pr-8">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-white/5">
            <tr v-for="tariff in paginatedTariffs" :key="tariff.id" class="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all group">
              <td class="p-4 pl-8 font-mono text-sm font-black text-[#D72821]">{{ tariff.prefix }}</td>
              <td class="p-4 text-center">
                <span :class="[
                  'px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase border border-[#D72821]/10',
                  tariff.call_type === 'Internal' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-500/10' : 
                  tariff.call_type === 'National' ? 'bg-[#D72821]/10 text-[#D72821]' : 
                  'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-purple-500/10'
                ]">
                  {{ tariff.call_type }}
                </span>
              </td>
              <td class="p-4 text-xs text-slate-600 dark:text-slate-400 truncate max-w-xs font-semibold">{{ tariff.description }}</td>
              <td class="p-4 text-sm text-[#D72821] font-black text-right">Rp {{ parseFloat(tariff.rate_per_second).toFixed(2) }}</td>
              <td class="p-4 pr-8 text-right flex justify-end gap-2">
                <button @click="openModal(tariff)" class="p-2 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm" title="Edit">
                  <Pencil class="w-4 h-4" />
                </button>
                <button @click="deleteTariff(tariff.id)" class="p-2 rounded-xl bg-[#D72821]/10 text-[#D72821] hover:bg-[#D72821] hover:text-white transition-all shadow-sm" title="Delete">
                  <Trash2 class="w-4 h-4" />
                </button>
              </td>
            </tr>
            <tr v-if="paginatedTariffs.length === 0">
              <td colspan="5" class="p-8 text-center text-slate-500">No tariffs found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="p-6 border-t border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.01]">
        <span class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <div class="flex items-center gap-2">
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="p-2.5 rounded-xl bg-[#D72821] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#b01e18] transition-all shadow-md shadow-[#D72821]/15 flex items-center justify-center border border-transparent"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          
          <div class="flex gap-1.5 px-2">
            <button 
              v-for="page in visiblePages" 
              :key="page"
              @click="currentPage = page"
              class="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all"
              :class="currentPage === page ? 'bg-[#D72821] text-white shadow-md shadow-[#D72821]/20' : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400'"
            >
              {{ page }}
            </button>
          </div>

          <button 
            @click="currentPage++" 
            :disabled="currentPage >= totalPages"
            class="p-2.5 rounded-xl bg-[#D72821] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#b01e18] transition-all shadow-md shadow-[#D72821]/15 flex items-center justify-center border border-transparent"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="fixed inset-0 flex items-center justify-center z-50 p-4 bg-slate-900/20 backdrop-blur-sm animate-fade-in">
      <div class="modal-bg bg-[#111111] rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl border border-white/10 transform transition-all">
        <div class="modal-header p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
          <h2 class="text-xl font-black text-[#D72821] tracking-tight">{{ form.id ? 'Edit Tariff' : 'Add Tariff' }}</h2>
          <button @click="showModal = false" class="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 transition-all">
            <X class="w-4 h-4" />
          </button>
        </div>
        <form @submit.prevent="saveTariff" class="p-6 space-y-5">
          <div>
            <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Prefix</label>
            <input v-model="form.prefix" type="text" required class="modal-input w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white outline-none focus:border-[#D72821]/50 focus:ring-4 focus:ring-[#D72821]/10 transition-all">
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Call Type</label>
            <select v-model="form.call_type" required class="modal-input w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white outline-none focus:border-[#D72821]/50 focus:ring-4 focus:ring-[#D72821]/10 transition-all">
              <option value="Internal">Internal</option>
              <option value="National">National</option>
              <option value="International">International</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Rate per Second (Rp)</label>
            <input v-model.number="form.rate_per_second" type="number" step="0.01" required class="modal-input w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white outline-none focus:border-[#D72821]/50 focus:ring-4 focus:ring-[#D72821]/10 transition-all">
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
            <textarea v-model="form.description" rows="2" class="modal-input w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white outline-none focus:border-[#D72821]/50 focus:ring-4 focus:ring-[#D72821]/10 transition-all"></textarea>
          </div>
          <div class="pt-6 flex justify-end gap-3">
            <button type="button" @click="showModal = false" class="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all">Cancel</button>
            <button type="submit" class="bg-[#D72821] hover:bg-[#b01e18] text-white px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#D72821]/20">Save Tariff</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { Search, ChevronLeft, ChevronRight, Pencil, Trash2, X, CheckCircle2, AlertCircle } from 'lucide-vue-next';
import axios from '../../utils/axios';

const apiBase = '/master/tariffs';
const tariffs = ref([]);
const showModal = ref(false);
const form = ref({ id: null, prefix: '', call_type: 'National', rate_per_second: 0, description: '' });

const notification = ref(null);
const showNotification = (message, type = 'success') => {
  notification.value = { message, type };
  setTimeout(() => { notification.value = null; }, 3000);
};

const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;

const filteredTariffs = computed(() => {
  if (!searchQuery.value) return tariffs.value;
  const q = searchQuery.value.toLowerCase();
  return tariffs.value.filter(t => 
    t.prefix.toLowerCase().includes(q) || 
    t.description.toLowerCase().includes(q)
  );
});

const totalPages = computed(() => Math.ceil(filteredTariffs.value.length / itemsPerPage) || 1);

const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages.value, start + maxVisible - 1);
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});
const paginatedTariffs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredTariffs.value.slice(start, start + itemsPerPage);
});

watch(searchQuery, () => { currentPage.value = 1; });

const fetchTariffs = async () => {
  try {
    const res = await axios.get(apiBase, { withCredentials: true });
    tariffs.value = res.data;
  } catch (error) {
    console.error('Error fetching tariffs:', error);
  }
};

const openModal = (tariff = null) => {
  if (tariff) {
    form.value = { ...tariff };
  } else {
    form.value = { id: null, prefix: '', call_type: 'National', rate_per_second: 0, description: '' };
  }
  showModal.value = true;
};

const saveTariff = async () => {
  try {
    if (!form.value.prefix || !form.value.call_type || form.value.rate_per_second < 0) {
      showNotification('Please fill in all required fields correctly.', 'error');
      return;
    }

    if (form.value.id) {
      await axios.put(`${apiBase}/${form.value.id}`, form.value, { withCredentials: true });
      showNotification('Tariff successfully updated!');
    } else {
      await axios.post(apiBase, form.value, { withCredentials: true });
      showNotification('Tariff successfully created!');
    }
    showModal.value = false;
    fetchTariffs();
  } catch (error) {
    console.error('Error saving tariff:', error);
    showNotification(error.response?.data?.message || 'Failed to save tariff.', 'error');
  }
};

const deleteTariff = async (id) => {
  if (!confirm('Are you sure you want to delete this tariff?')) return;
  try {
    await axios.delete(`${apiBase}/${id}`, { withCredentials: true });
    showNotification('Tariff successfully deleted!');
    fetchTariffs();
  } catch (error) {
    console.error('Error deleting tariff:', error);
    showNotification(error.response?.data?.message || 'Failed to delete tariff.', 'error');
  }
};

onMounted(() => {
  fetchTariffs();
});
</script>

<style>
/* Global unscoped style specifically for overriding light mode inside this component */
html:not(.dark) .modal-bg {
  background-color: white !important;
  border-color: #e2e8f0 !important;
}
html:not(.dark) .modal-header {
  background-color: #f8fafc !important;
  border-bottom-color: #e2e8f0 !important;
}
html:not(.dark) .modal-input {
  background-color: #f8fafc !important;
  color: #0f172a !important;
  border-color: #e2e8f0 !important;
}
</style>

<style scoped>
.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>
