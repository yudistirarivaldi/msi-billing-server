<template>
  <div class="invoice-view p-4 md:p-8 space-y-8 animate-fade-in">
    <!-- Header Section -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
      <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight"></h2>
      
      <!-- Period Filter -->
      <div class="glass p-1.5 rounded-2xl flex items-center gap-2 shadow-sm border border-[#D72821]/10">
        <div class="flex items-center gap-2 px-3 border-r border-slate-200 dark:border-white/10 py-1">
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-tighter mr-1">From</span>
          <select 
            :value="store.startMonth" 
            @change="e => store.setStartMonth(parseInt(e.target.value))"
            class="bg-transparent border-none text-xs font-bold outline-none cursor-pointer text-[#D72821] select-red"
          >
            <option v-for="(m, i) in ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']" :key="i" :value="i+1" class="text-slate-900">{{ m }}</option>
          </select>
          <select 
            :value="store.startYear" 
            @change="e => store.setStartYear(e.target.value)"
            class="bg-transparent border-none text-xs font-bold outline-none cursor-pointer text-[#D72821] select-red"
          >
            <option value="2026" class="text-slate-900">2026</option>
            <option value="2025" class="text-slate-900">2025</option>
          </select>
        </div>

        <div class="flex items-center gap-2 px-3 py-1">
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-tighter mr-1">To</span>
          <select 
            :value="store.endMonth" 
            @change="e => store.setEndMonth(parseInt(e.target.value))"
            class="bg-transparent border-none text-xs font-bold outline-none cursor-pointer text-[#D72821] select-red"
          >
            <option v-for="(m, i) in ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']" :key="i" :value="i+1" class="text-slate-900">{{ m }}</option>
          </select>
          <select 
            :value="store.endYear" 
            @change="e => store.setEndYear(e.target.value)"
            class="bg-transparent border-none text-xs font-bold outline-none cursor-pointer text-[#D72821] select-red"
          >
            <option value="2026" class="text-slate-900">2026</option>
            <option value="2025" class="text-slate-900">2025</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Top Banner -->
    <div class="glass-red rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-[0_20px_50px_rgba(215,40,33,0.2)] border border-white/10">
      <div class="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <p class="text-white/60 font-bold uppercase tracking-[0.2em] text-[10px] mb-2">Financial Engine</p>
          <h2 class="text-4xl font-black mb-2 tracking-tight">Invoice Management</h2>
          <p class="text-white/70 text-lg max-w-2xl font-medium">Generate professional billing statements with one click</p>
        </div>
        <div class="hidden lg:block opacity-20">
          <FileText class="w-32 h-32" />
        </div>
      </div>
    </div>

    <!-- Controls Row -->
    <div class="flex flex-wrap justify-between items-center gap-6 mb-8 px-2">
      <div class="glass p-1.5 rounded-2xl flex gap-1 shadow-sm border border-white/5">
        <button 
          v-for="type in ['user', 'dept', 'cost-center']" 
          :key="type"
          @click="currentType = type"
          :class="[
            'px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300',
            currentType === type 
              ? 'bg-[#D72821] text-white shadow-lg shadow-[#D72821]/20' 
              : 'text-slate-400 hover:text-[#D72821] dark:hover:text-white'
          ]"
        >
          {{ typeLabel(type) }}
        </button>
      </div>

      <div class="flex items-center gap-4">
        <div class="relative group">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#D72821] transition-all" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search invoice..." 
            class="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold outline-none focus:border-[#D72821]/50 focus:ring-4 focus:ring-[#D72821]/10 transition-all w-72 shadow-sm"
          >
        </div>
        <button 
          @click="exportToCSV"
          class="export-btn flex items-center gap-3 bg-[#D72821] hover:bg-[#b01e19] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-[#D72821]/30 hover:scale-105 active:scale-95"
        >
          <Download class="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>
    </div>

    <!-- Data Table Card -->
    <div class="glass rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl bg-slate-900/[0.02] dark:bg-white/[0.01] flex flex-col">
      <div class="p-8 border-b border-white/5">
        <h3 class="card-title text-xl font-black text-slate-900 dark:text-white tracking-tight">{{ currentTitle }}</h3>
      </div>

      <div class="overflow-x-auto flex-1">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 dark:bg-white/[0.02] text-[10px] text-slate-600 dark:text-slate-400 uppercase tracking-widest">
            <tr>
              <th class="p-5 pl-8 w-12">#</th>
              <th class="p-5">Identity / Name</th>
              <th class="p-5 text-center">Activities</th>
              <th class="p-5">Usage Duration</th>
              <th class="p-5 text-right pr-8">Total Cost</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-white/5">
            <tr v-for="(item, i) in paginatedInvoice" :key="i" class="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all group">
              <td class="p-5 pl-8 text-slate-500 font-mono text-[10px]">
                {{ (currentPage - 1) * itemsPerPage + i + 1 }}
              </td>
              <td class="p-5">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 shrink-0 rounded-2xl bg-[#D72821]/10 flex items-center justify-center text-xs font-black text-[#D72821] group-hover:bg-[#D72821] group-hover:text-white transition-all shadow-sm border border-[#D72821]/5">
                    {{ getName(item).substring(0, 1).toUpperCase() }}
                  </div>
                  <div class="min-w-0">
                    <div class="text-sm font-black text-[#D72821] truncate mb-0.5">{{ getName(item) }}</div>
                  </div>
                </div>
              </td>
              <td class="p-5 text-center">
                <span class="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-[#D72821]/10 text-[#D72821] uppercase border border-[#D72821]/10">
                  {{ item.total_calls }} Calls
                </span>
              </td>
              <td class="p-5">
                <span class="card-value-sub text-xs font-bold text-slate-500 tabular-nums">{{ formatDuration(item.total_duration) }}</span>
              </td>
              <td class="p-5 text-right pr-8 font-black text-[#D72821] tabular-nums text-base">
                Rp {{ parseFloat(item.total_cost).toLocaleString() }}
              </td>
            </tr>
            <tr v-if="paginatedInvoice.length === 0">
              <td colspan="5" class="p-12 text-center text-slate-500 text-xs italic">No invoice records found</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination Controls -->
      <div class="p-6 border-t border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.01]">
        <span class="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Page {{ currentPage }} of {{ totalPages }}</span>
        <div class="flex gap-2">
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="p-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-white/10 transition-all text-[#D72821] shadow-sm"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          <button 
            @click="currentPage++" 
            :disabled="currentPage >= totalPages"
            class="p-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-white/10 transition-all text-[#D72821] shadow-sm"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { Receipt, Search, Download, Calendar, FileText, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import axios from '../../utils/axios';
import { store } from '../../store/billingStore';
import './InvoiceEngine.css';

const currentType = ref('user');
const invoiceData = ref([]);

// Search & Pagination State
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;

const typeLabel = (t) => ({ 'user': 'Per User', 'dept': 'Per Department', 'cost-center': 'Per Cost Center' }[t]);
const currentTitle = computed(() => ({ 'user': 'Monthly Invoice per User', 'dept': 'Departmental Cost Allocation', 'cost-center': 'Cost Center Breakdown' }[currentType.value]));

const fetchInvoice = async () => {
  try {
    const endpoint = { 'user': '/invoice-user', 'dept': '/invoice-dept', 'cost-center': '/invoice-cost-center' }[currentType.value];
    const res = await axios.get(`/reports${endpoint}?startMonth=${store.startMonth}&startYear=${store.startYear}&endMonth=${store.endMonth}&endYear=${store.endYear}`);
    invoiceData.value = res.data.data;
  } catch (err) {
    console.error('Failed to fetch invoice data', err);
  } 
};

const getName = (item) => {
  if (currentType.value === 'user') return item.user?.name || `Ext ${item.caller_extension}`;
  return item.department || item.cost_center || 'Unassigned';
};

// Filtering Logic
const filteredInvoice = computed(() => {
  if (!searchQuery.value) return invoiceData.value;
  const q = searchQuery.value.toLowerCase();
  return invoiceData.value.filter(item => getName(item).toLowerCase().includes(q));
});

// Pagination Logic
const totalPages = computed(() => Math.ceil(filteredInvoice.value.length / itemsPerPage) || 1);
const paginatedInvoice = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredInvoice.value.slice(start, start + itemsPerPage);
});

const formatDuration = (sec) => `${Math.floor(sec / 60)}m ${sec % 60}s`;

const exportToCSV = () => {
  const headers = ['#', 'Name', 'Total Calls', 'Total Duration', 'Total Cost'];
  const periodRow = ["", `"Period: ${store.startMonth}/${store.startYear} to ${store.endMonth}/${store.endYear}"`, "", "", ""].join(",");
  
  const csvRows = [
    periodRow,
    headers.join(","),
    ...invoiceData.value.map((item, i) => [
      i + 1,
      `"${getName(item).replace(/"/g, '""')}"`, 
      item.total_calls,
      `"${formatDuration(item.total_duration)}"`,
      `"Rp ${Math.floor(parseFloat(item.total_cost)).toLocaleString('id-ID')}"`
    ].join(","))
  ];

  const csvString = csvRows.join("\n");
  const blob = new Blob(["\ufeff" + csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `invoice_${currentType.value}_${store.startMonth}-${store.startYear}_to_${store.endMonth}-${store.endYear}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

watch([currentType, searchQuery], () => {
  currentPage.value = 1;
});

watch(() => store.refreshCounter, fetchInvoice);
onMounted(fetchInvoice);
watch(() => [currentType.value, store.startMonth, store.startYear, store.endMonth, store.endYear], fetchInvoice);
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23D72821'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0px center;
  background-size: 12px;
  padding-right: 15px;
}
</style>
