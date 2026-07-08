<template>
  <div class="p-4 md:p-8 space-y-8 animate-fade-in">
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
          <p class="text-white/60 font-bold uppercase tracking-[0.2em] text-[10px] mb-2">Analytical Intelligence</p>
          <h2 class="text-4xl font-black mb-2 tracking-tight">Cost Analytics</h2>
          <p class="text-white/70 text-lg max-w-2xl font-medium">Deep dive into communication expenses and usage patterns.</p>
        </div>
        <div class="hidden lg:block opacity-20">
          <TrendingUp class="w-32 h-32" />
        </div>
      </div>
    </div>

    <!-- Main KPIs -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div v-for="kpi in kpiData" :key="kpi.label" class="stat-card glass p-6 rounded-[2rem] border-l-4 border-l-[#D72821] transition-all hover:translate-y-[-4px]">
        <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{{ kpi.label }}</p>
        <h3 class="text-2xl font-black mt-2 text-[#D72821] tabular-nums">{{ kpi.value }}</h3>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Breakdown Section -->
      <div class="lg:col-span-2 glass rounded-[3rem] p-8 overflow-hidden flex flex-col border border-white/5 shadow-2xl">
        <div class="flex items-center gap-4 mb-10">
          <h3 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">Cost Breakdown</h3>
        </div>

        <div class="space-y-10 flex-1 px-2">
          <div v-for="item in summary" :key="item.call_type" class="group">
            <div class="flex justify-between items-end mb-3">
              <div>
                <p class="text-[13px] font-black text-[#D72821] uppercase tracking-wider mb-1">{{ item.call_type }}</p>
                <p class="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{{ item.total_calls }} calls • {{ formatDuration(item.total_duration) }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-black text-[#D72821] tabular-nums">Rp {{ parseFloat(item.total_cost).toLocaleString() }}</p>
                <p class="text-[10px] font-bold text-slate-400 italic">{{ getPercent(item.total_cost) }}% of period</p>
              </div>
            </div>
            
            <!-- PREMIUM PROGRESS BAR -->
            <div class="relative h-3 bg-slate-100 dark:bg-white/[0.03] rounded-full overflow-hidden shadow-inner border border-white/5">
              <div 
                class="absolute inset-y-0 left-0 bg-gradient-to-r from-[#D72821] to-[#ff4d4d] rounded-full transition-all duration-1000 ease-out flex items-center justify-end"
                :style="{ width: getPercent(item.total_cost) + '%' }"
              >
                <!-- Animated Shine -->
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent shine-animation"></div>
                <!-- End Pointer Glow -->
                <div class="w-1.5 h-1.5 bg-white rounded-full mr-1 shadow-[0_0_10px_#fff]"></div>
              </div>
            </div>
          </div>

          <div v-if="summary.length === 0" class="h-full flex flex-col items-center justify-center text-slate-500 py-20">
            <p class="text-xs italic">No breakdown data available for this period</p>
          </div>
        </div>
      </div>

      <!-- Top Spenders Section -->
      <div class="glass rounded-[3rem] p-8 border border-white/5 shadow-2xl">
        <div class="flex items-center gap-4 mb-10">
          <div>
            <h4 class="text-xl font-black text-[#D72821] tracking-tight">Top Spenders</h4>
            <p class="text-[10px] text-[#D72821] font-black uppercase tracking-widest mt-0.5">Highest usage individuals</p>
          </div>
        </div>

        <div class="space-y-4">
          <!-- Setiap baris top spender dapat diklik untuk memunculkan modal rincian panggilan dengan range tanggal terfilter -->
          <div v-for="(user, i) in topCallers" :key="i" 
            @click="openSpenderModal(user)"
            class="flex items-center justify-between p-4 bg-white/5 rounded-[2rem] border border-white/5 hover:border-[#D72821] hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all group"
          >
            <div class="flex items-center gap-4 min-w-0">
              <div class="w-10 h-10 shrink-0 rounded-2xl bg-[#D72821]/10 flex items-center justify-center text-xs font-black text-[#D72821] group-hover:bg-[#D72821] group-hover:text-white transition-all shadow-inner">
                {{ (user.user?.name || 'U').substring(0, 1).toUpperCase() }}
              </div>
              <div class="min-w-0">
                <p class="text-xs font-black text-[#D72821] truncate">{{ user.user?.name || 'Unknown User' }}</p>
                <p class="text-[9px] text-slate-500 font-black uppercase tracking-tighter">{{ user.user?.department || 'STAFF' }} • {{ user.total_calls }} calls</p>
              </div>
            </div>
            <div class="text-right shrink-0">
              <p class="text-xs font-black text-[#D72821] tabular-nums">Rp {{ parseFloat(user.total_cost).toLocaleString() }}</p>
              <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{{ Math.floor(user.total_duration / 60) }} min</p>
            </div>
          </div>
          
          <div v-if="topCallers.length === 0" class="py-20 text-center space-y-4">
            <p class="text-slate-500 text-xs italic">No top caller records found</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Detail Calls for Top Spender (Desain Premium & Glassmorphic Backdrop) -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <!-- Container Modal Box Utama (Menggunakan class .glass untuk menjamin integrasi tema Light/Dark yang presisi) -->
      <div class="glass rounded-[3rem] w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden transform scale-100 transition-all duration-300">
        
        <!-- Header Modal: Profil Singkat Spender & Kolom Pencarian Lokal -->
        <div class="p-8 border-b border-slate-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50/50 dark:bg-white/[0.01] gap-4">
          <div class="flex items-center gap-4">
            <!-- Avatar Inisial User dengan Gradasi Merah Premium -->
            <div class="w-16 h-16 rounded-[1.5rem] bg-gradient-to-tr from-[#D72821] to-[#9e1b16] flex items-center justify-center text-2xl font-black text-white shadow-lg">
              {{ (selectedSpender.user?.name || 'Unknown').substring(0, 1).toUpperCase() }}
            </div>
            <!-- Informasi Kontak & Departemen -->
            <div>
              <h3 class="text-2xl font-black text-[#D72821] leading-tight">
                {{ selectedSpender.user?.name || 'Unknown User' }}
              </h3>
              <p class="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                {{ selectedSpender.user?.department || 'NO DEPARTMENT' }}
              </p>
              <div class="flex gap-2 mt-2">
                <span class="px-2.5 py-0.5 bg-[#D72821]/10 text-[#D72821] rounded-md text-[9px] font-bold tracking-wider uppercase">
                  EXT: {{ selectedSpender.user?.extension || 'N/A' }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- Bagian Kanan Header: Input Pencarian & Tombol Close -->
          <div class="flex items-center gap-4 w-full sm:w-auto">
            <!-- Input Pencarian calls di dalam Modal -->
            <div class="relative w-full sm:w-64">
              <SearchIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D72821] pointer-events-none" />
              <input 
                v-model="modalSearchQuery" 
                type="text" 
                placeholder="Search by destination or type..." 
                class="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-xs font-bold outline-none focus:border-[#D72821]/50 focus:ring-4 focus:ring-[#D72821]/10 transition-all shadow-sm text-slate-900 dark:text-white" 
              />
            </div>
            <!-- Tombol Close (Silang) -->
            <button @click="closeSpenderModal" class="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-all">
              <XIcon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Body Modal: Tabel Detail Riwayat Panggilan Terfilter & Terpaginasi -->
        <div class="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          
          <!-- Section Tabel Rincian Panggilan -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-xs font-black text-[#D72821] uppercase tracking-widest flex items-center gap-2">
                <span>Call Details Breakdown</span>
                <span class="px-2.5 py-0.5 bg-[#D72821]/15 text-[#D72821] rounded-full text-[10px] font-mono font-black border border-[#D72821]/10">
                  {{ filteredModalCalls.length }}
                </span>
              </h4>
            </div>

            <!-- Animasi Loading Spinner Saat Mengambil Data -->
            <div v-if="isLoadingCalls" class="py-16 flex flex-col items-center justify-center gap-3 text-slate-500">
              <div class="w-8 h-8 border-4 border-[#D72821] border-t-transparent rounded-full animate-spin"></div>
              <p class="text-xs font-bold uppercase tracking-widest text-slate-400">Fetching calls data...</p>
            </div>

            <!-- Tampilan Jika Data Kosong -->
            <div v-else-if="filteredModalCalls.length === 0" class="py-16 text-center text-slate-500 italic text-xs border border-dashed border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-white/[0.01]">
              No calls matched your search criteria.
            </div>

            <!-- Tabel Rincian Riwayat Panggilan Secara Detail -->
            <div v-else class="border border-slate-100 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 dark:bg-white/[0.02] text-[10px] text-slate-600 dark:text-slate-400 uppercase tracking-widest font-bold border-b border-slate-100 dark:border-white/5">
                  <tr>
                    <th class="p-4 pl-6 w-16">#</th>
                    <th class="p-4">Time (Start / End)</th>
                    <th class="p-4">Destination</th>
                    <th class="p-4 text-center">Type</th>
                    <th class="p-4 text-center">Duration</th>
                    <th class="p-4 text-right pr-6">Cost</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-white/5">
                  <!-- Melakukan perulangan untuk setiap panggilan terpaginasi dari hasil filter -->
                  <tr v-for="(call, index) in paginatedModalCalls" :key="call.id" class="hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-all">
                    <!-- Kolom nomor urut baris (1-indexed berdasarkan posisi halaman) -->
                    <td class="p-4 pl-6 text-slate-400 font-mono font-bold">
                      {{ (modalCurrentPage - 1) * modalItemsPerPage + index + 1 }}
                    </td>
                    <!-- Kolom rincian waktu mulai (Start Call) dan waktu berakhir (End Call) hasil konversi epoch Cisco -->
                    <td class="p-4">
                      <!-- Waktu Mulai Panggilan (Start Call) dari dial_time atau fallback normalized_time dengan warna merah Crimson Red -->
                      <div class="flex items-center gap-1.5 mb-1" title="Start Call (Dialing Time)">
                        <span class="w-1.5 h-1.5 rounded-full bg-[#D72821] shrink-0"></span>
                        <div class="text-[11px] font-bold text-[#D72821]">
                          {{ call.timeline?.dial_time ? formatTime(call.timeline.dial_time) : formatTime(call.normalized_time) }}
                        </div>
                        <div class="text-[8px] text-slate-400 uppercase font-mono font-black tracking-tighter">
                          Start
                        </div>
                      </div>
                      
                      <!-- Waktu Selesai Panggilan (End Call) dari disconnect_time atau fallback normalized_time dengan warna merah Crimson Red -->
                      <div class="flex items-center gap-1.5" title="End Call (Disconnect Time)">
                        <span class="w-1.5 h-1.5 rounded-full bg-[#D72821] shrink-0"></span>
                        <div class="text-[11px] font-bold text-[#D72821]">
                          {{ call.timeline?.disconnect_time ? formatTime(call.timeline.disconnect_time) : formatTime(call.normalized_time) }}
                        </div>
                        <div class="text-[8px] text-slate-400 uppercase font-mono font-black tracking-tighter">
                          End
                        </div>
                      </div>
                      
                      <!-- Tanggal singkat dilakukannya panggilan -->
                      <div class="text-[8px] text-slate-500 font-black uppercase tracking-widest mt-1.5 pl-3">
                        {{ formatDateShort(call.normalized_time) }}
                      </div>
                    </td>
                    <!-- Kolom tujuan panggilan dengan nama berwarna merah Crimson Red (#D72821) -->
                    <td class="p-4">
                      <!-- Menampilkan nama tujuan dengan warna merah Crimson Red yang kontras -->
                      <div v-if="call.destination_name" class="font-bold text-[#D72821] mb-0.5">
                        {{ call.destination_name }}
                      </div>
                      <!-- Menampilkan nomor ekstensi/telepon tujuan di bawahnya -->
                      <div class="font-mono text-[10px]" :class="call.destination_name ? 'text-slate-500 dark:text-slate-400 font-semibold' : 'font-bold text-slate-800 dark:text-slate-200'">
                        {{ call.destination_number }}
                      </div>
                    </td>
                    <!-- Kolom kategori / tipe panggilan -->
                    <td class="p-4 text-center">
                      <span class="px-2 py-0.5 rounded-lg text-[9px] font-black bg-[#D72821]/10 text-[#D72821] uppercase border border-[#D72821]/10">
                        {{ call.call_type }}
                      </span>
                    </td>
                    <!-- Kolom durasi panggilan dengan teks yang lebih kontras (semi-bold) agar tidak samar -->
                    <td class="p-4 text-center text-slate-800 dark:text-slate-400 font-semibold">
                      {{ Math.floor(call.duration / 60) }}m {{ call.duration % 60 }}s
                    </td>
                    <!-- Kolom biaya panggilan terformat rupiah -->
                    <td class="p-4 text-right pr-6 font-black text-[#D72821]">
                      Rp {{ parseFloat(call.cost).toLocaleString() }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <!-- Footer Modal: Kontrol Paginasi & Tombol Penutup -->
        <div class="p-6 border-t border-slate-100 dark:border-white/5 flex flex-row justify-between items-center bg-slate-50/50 dark:bg-white/[0.01]">
          <!-- Teks Keterangan Halaman Paginasi -->
          <span class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">
            Page {{ modalCurrentPage }} of {{ modalTotalPages }}
          </span>
          
          <div class="flex items-center gap-4">
            <!-- Navigasi Paginasi Halaman (Sebelumnya / Selanjutnya) dengan Warna Crimson Red Premium -->
            <div class="flex gap-2">
              <button 
                @click="modalCurrentPage--" 
                :disabled="modalCurrentPage === 1"
                class="p-2.5 rounded-xl bg-[#D72821] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#b01e18] transition-all shadow-md shadow-[#D72821]/15 flex items-center justify-center border border-transparent"
              >
                <ChevronLeftIcon class="w-4 h-4" />
              </button>
              <button 
                @click="modalCurrentPage++" 
                :disabled="modalCurrentPage >= modalTotalPages"
                class="p-2.5 rounded-xl bg-[#D72821] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#b01e18] transition-all shadow-md shadow-[#D72821]/15 flex items-center justify-center border border-transparent"
              >
                <ChevronRightIcon class="w-4 h-4" />
              </button>
            </div>
            
            <div class="h-6 w-px bg-slate-200 dark:bg-white/10"></div>
            
            <!-- Tombol Close Utama -->
            <button @click="closeSpenderModal" class="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-350 text-xs font-black uppercase tracking-wider transition-all">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { 
  PieChart, Trophy, DollarSign, TrendingDown, Zap, Calendar, TrendingUp, Phone, Clock, ArrowUpRight,
  Search as SearchIcon, X as XIcon, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon
} from 'lucide-vue-next';
import axios from '../../utils/axios';
import { store } from '../../store/billingStore';

const summary = ref([]);
const topCallers = ref([]);

// Spender modal reactive states
const isModalOpen = ref(false);
const selectedSpender = ref({});
const spenderCalls = ref([]);
const isLoadingCalls = ref(false);

// Reactive state untuk input pencarian lokal di dalam modal
const modalSearchQuery = ref('');
// Reactive state untuk mencatat halaman paginasi aktif di dalam modal
const modalCurrentPage = ref(1);
// Konstanta untuk membatasi jumlah item panggilan yang tampil per halaman di modal
const modalItemsPerPage = ref(5);

/**
 * Properti terhitung (computed property) untuk memfilter daftar panggilan spender berdasarkan pencarian nomor tujuan atau tipe panggilan.
 * 
 * @returns {Array} Daftar panggilan spender yang telah terfilter
 */
const filteredModalCalls = computed(() => {
  if (!modalSearchQuery.value) return spenderCalls.value;
  const q = modalSearchQuery.value.toLowerCase();
  return spenderCalls.value.filter(call => 
    (call.destination_number || '').toLowerCase().includes(q) ||
    (call.call_type || '').toLowerCase().includes(q)
  );
});

/**
 * Properti terhitung (computed property) untuk menghitung total halaman paginasi di modal berdasarkan jumlah data yang terfilter.
 * 
 * @returns {number} Jumlah total halaman paginasi
 */
const modalTotalPages = computed(() => {
  return Math.ceil(filteredModalCalls.value.length / modalItemsPerPage.value) || 1;
});

/**
 * Properti terhitung (computed property) untuk memotong data panggilan dan mengembalikan hanya baris yang aktif di halaman terpilih.
 * 
 * @returns {Array} Potongan data panggilan untuk halaman aktif
 */
const paginatedModalCalls = computed(() => {
  const start = (modalCurrentPage.value - 1) * modalItemsPerPage.value;
  return filteredModalCalls.value.slice(start, start + modalItemsPerPage.value);
});

/**
 * Membuka modal rincian panggilan untuk spender terpilih dengan parameter filter range dari store.
 * Melakukan pemanggilan API ke backend untuk mengambil data riwayat panggilan secara detail.
 * 
 * @param {Object} spender - Objek data top spender yang dipilih dari UI
 * @returns {Promise<void>}
 */
const openSpenderModal = async (spender) => {
  selectedSpender.value = spender;
  isModalOpen.value = true;
  isLoadingCalls.value = true;
  modalSearchQuery.value = '';
  modalCurrentPage.value = 1;
  try {
    // Memanggil API backend dengan filter range tanggal terpilih
    const response = await axios.get(`/reports/user-calls/${spender.user_id}?startMonth=${store.startMonth}&startYear=${store.startYear}&endMonth=${store.endMonth}&endYear=${store.endYear}`);
    spenderCalls.value = response.data.data;
  } catch (err) {
    console.error('Failed to fetch spender call details', err);
    spenderCalls.value = [];
  } finally {
    isLoadingCalls.value = false;
  }
};

/**
 * Menutup modal rincian panggilan spender dan mengosongkan state detail panggilan.
 */
const closeSpenderModal = () => {
  isModalOpen.value = false;
  selectedSpender.value = {};
  spenderCalls.value = [];
};

/**
 * Helper untuk format waktu dari ISO String ke format hh:mm
 */
const formatTime = (isoString) => {
  if (!isoString) return '--:--';
  return new Date(isoString).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Helper untuk format tanggal pendek dari ISO String ke format dd mmm
 */
const formatDateShort = (isoString) => {
  if (!isoString) return '--';
  return new Date(isoString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

const fetchAnalytics = async () => {
  try {
    const [s, t] = await Promise.all([
      axios.get(`/reports/summary?startMonth=${store.startMonth}&startYear=${store.startYear}&endMonth=${store.endMonth}&endYear=${store.endYear}`),
      axios.get(`/reports/top-callers?limit=5&startMonth=${store.startMonth}&startYear=${store.startYear}&endMonth=${store.endMonth}&endYear=${store.endYear}`)
    ]);
    summary.value = s.data.data;
    topCallers.value = t.data.data;
  } catch (err) {
    console.error('Failed to fetch analytics data', err);
  }
};

const totalMonthlyCost = computed(() => summary.value.reduce((acc, curr) => acc + parseFloat(curr.total_cost), 0));
const totalCalls = computed(() => summary.value.reduce((acc, curr) => acc + parseInt(curr.total_calls), 0));
const avgCostPerCall = computed(() => totalCalls.value === 0 ? 0 : Math.round(totalMonthlyCost.value / totalCalls.value));
const peakCallType = computed(() => {
  if (summary.value.length === 0) return '-';
  const peak = [...summary.value].sort((a, b) => parseFloat(b.total_cost) - parseFloat(a.total_cost))[0];
  return peak.call_type;
});

const kpiData = computed(() => [
  { label: 'Total Period Cost', value: `Rp ${totalMonthlyCost.value.toLocaleString()}` },
  { label: 'Total Success Calls', value: totalCalls.value.toLocaleString() },
  { label: 'Avg Cost / Call', value: `Rp ${avgCostPerCall.value.toLocaleString()}` },
  { label: 'Peak Call Type', value: peakCallType.value }
]);

const getPercent = (cost) => {
  const total = totalMonthlyCost.value || 1;
  return (parseFloat(cost) / total * 100).toFixed(0);
};

const formatDuration = (sec) => `${Math.floor(sec / 60)}m ${sec % 60}s`;

onMounted(fetchAnalytics);
watch([() => store.startMonth, () => store.startYear, () => store.endMonth, () => store.endYear], fetchAnalytics, { deep: true });
watch(modalSearchQuery, () => {
  modalCurrentPage.value = 1;
});
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

.stat-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.shine-animation {
  animation: shine 3s infinite linear;
  width: 200%;
}

@keyframes shine {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}

.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(215, 40, 33, 0.2);
  border-radius: 10px;
}
</style>
