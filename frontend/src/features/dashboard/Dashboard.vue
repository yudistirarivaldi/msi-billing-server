<template>
  <div class="dashboard-view space-y-8 p-8 animate-fade-in">
    <!-- Top Welcome Banner -->
    <div class="glass-red rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-[0_20px_50px_rgba(215,40,33,0.2)] border border-white/10">
      <div class="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <p class="text-white/60 font-bold uppercase tracking-[0.2em] text-[10px] mb-2">Operational Summary</p>
          <h2 class="text-4xl font-black mb-2">Billing Dashboard</h2>
          <p class="text-white/70 text-lg max-w-3xl">Real-time operational summary, call utilization trends, and abnormal activity alerts for {{ new Date().getFullYear() }}.</p>
        </div>
        <div class="hidden lg:block opacity-20">
          <Activity class="w-32 h-32" />
        </div>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div v-for="kpi in kpiCards" :key="kpi.label" class="stat-card glass p-6 rounded-[2rem] border-l-4 border-l-[#D72821] transition-all hover:translate-y-[-4px]">
        <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{{ kpi.label }}</p>
        <h3 class="text-3xl font-black mt-2 text-[#D72821]">{{ kpi.value }}</h3>
      </div>
    </div>

    <!-- Middle Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Utilization Chart -->
      <div class="lg:col-span-2 glass p-8 rounded-[3rem] flex flex-col h-[500px]">
        <div class="mb-10">
          <h4 class="text-xl font-black text-[#D72821] tracking-tight">Call volume trends for the last 7 days</h4>
        </div>
        <div class="flex-1 flex items-end justify-between gap-4 px-4 mb-4">
          <div v-for="(d, i) in utilization" :key="i" class="flex-1 group h-full flex flex-col justify-end">
            <div class="relative w-full flex flex-col justify-end animate-fade-in" :style="{ height: `${(d.total_calls / maxCalls) * 100}%` }">
              <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#D72821] text-white text-[10px] px-2.5 py-1 rounded-lg font-black tracking-tight shadow-lg whitespace-nowrap border border-white/10 transition-all duration-300 group-hover:scale-110 z-10">
                {{ d.total_calls }} Calls
              </div>
              <div class="bg-[#D72821]/20 group-hover:bg-[#D72821] transition-all duration-300 rounded-t-xl w-full h-full min-h-[6px]"></div>
            </div>
            <p class="text-[9px] text-slate-500 mt-4 text-center font-bold uppercase tracking-tighter">{{ formatDateShort(d.date) }}</p>
          </div>
        </div>
      </div>

      <!-- Long Duration Calls (Animated & Fading Style) -->
      <div class="glass p-8 rounded-[3rem] flex flex-col h-[500px] relative overflow-hidden group">
        <div class="mb-8">
          <h4 class="text-xl font-black text-[#D72821] tracking-tight">Long call durations</h4>
        </div>
        
        <!-- Scroll Container with Fading Bottom -->
        <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 pb-20 scroll-mask relative">
          <div v-if="longCalls.length === 0" class="h-full flex flex-col items-center justify-center text-slate-500 italic">
            <ShieldCheck class="w-12 h-12 mb-4 opacity-10" />
            <p class="text-xs">No long calls detected</p>
          </div>
          
          <div v-for="(alert, idx) in longCalls" :key="alert.id" 
            class="p-6 rounded-[2rem] bg-white dark:bg-white/[0.02] border-2 border-[#D72821]/20 hover:border-[#D72821] transition-all animate-slide-up"
            :style="{ animationDelay: `${idx * 150}ms` }"
          >
            <div class="flex items-center gap-4 mb-5">
              <div class="w-12 h-12 rounded-2xl bg-[#D72821] flex items-center justify-center text-white shadow-lg shadow-[#D72821]/20">
                <Clock class="w-6 h-6" />
              </div>
              <div class="min-w-0">
                <p class="text-base font-black text-[#D72821] leading-tight truncate">
                  {{ alert.user?.name || 'Unknown User' }}
                </p>
                <p class="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">EXT: {{ alert.caller_extension }}</p>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-6 py-4 border-t border-[#D72821]/10 mb-3">
              <div class="min-w-0">
                <p class="text-[9px] font-black text-slate-400 uppercase mb-1">Destination</p>
                <p v-if="alert.destination_name" class="text-xs font-black text-[#D72821] truncate mb-0.5">
                  {{ alert.destination_name }}
                </p>
                <p class="truncate" :class="alert.destination_name ? 'text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400' : 'text-sm font-black text-[#D72821]'">
                  {{ alert.destination_number }}
                </p>
              </div>
              <div class="text-right shrink-0">
                <p class="text-[9px] font-black text-slate-400 uppercase mb-1">Duration</p>
                <p class="text-sm font-black text-[#D72821]">{{ alert.duration_formatted }}</p>
              </div>
            </div>

            <div class="flex items-center justify-between text-[10px] bg-slate-50 dark:bg-white/[0.02] p-3 rounded-2xl border border-[#D72821]/10">              
              <div class="flex items-center gap-1.5" title="Start Call (Dialing Time)">
                <span class="w-1.5 h-1.5 rounded-full bg-[#D72821] shrink-0"></span>
                <span class="text-slate-400 font-bold uppercase tracking-tight">Start:</span>
                <span class="font-black text-[#D72821]">{{ alert.timeline?.dial_time ? formatTime(alert.timeline.dial_time) : formatTime(alert.normalized_time) }}</span>
              </div>
              
              <div class="text-slate-300 font-bold">→</div>
              
              <div class="flex items-center gap-1.5" title="End Call (Disconnect Time)">
                <span class="w-1.5 h-1.5 rounded-full bg-[#D72821] shrink-0"></span>
                <span class="text-slate-400 font-bold uppercase tracking-tight">End:</span>
                <span class="font-black text-[#D72821]">{{ alert.timeline?.disconnect_time ? formatTime(alert.timeline.disconnect_time) : formatTime(alert.normalized_time) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Live Stream -->
      <div class="lg:col-span-2 glass rounded-[3rem] overflow-hidden flex flex-col">
        <div class="p-8 border-b border-white/5 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h4 class="text-xl font-black text-[#D72821] tracking-tight">Monitoring latest 20 activities</h4>
          </div>
          <div class="relative w-64">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-[#D72821]" />
            <input v-model="searchQuery" type="text" placeholder="Filter activity..." class="w-full bg-white dark:bg-white/5 border border-[#D72821]/30 dark:border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-900 dark:text-white outline-none focus:border-[#D72821] transition-all shadow-sm" />
          </div>
        </div>
        <div class="overflow-x-auto flex-1">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 dark:bg-white/[0.02] text-[10px] text-slate-600 dark:text-slate-400 uppercase tracking-widest">
              <tr>
                <th class="p-4 pl-8 w-12">#</th>
                <th class="p-4">Time (Start / End)</th>
                <th class="p-4">User / Extension</th>
                <th class="p-4 text-center">Type</th>
                <th class="p-4 text-center">Duration</th>
                <th class="p-4 text-right pr-8">Cost</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-white/5">
              
              <tr v-for="(call, index) in paginatedCalls" :key="call.id" class="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all group">
                
                <td class="p-4 pl-8 text-slate-500 font-mono text-[10px]">
                  {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                </td>
                
                <td class="p-4">
                  
                  <div class="flex items-center gap-1.5 mb-1" title="Start Call (Dialing Time)">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#D72821] shrink-0"></span>
                    <div class="text-[11px] font-bold text-[#D72821]">
                      {{ call.timeline?.dial_time ? formatTime(call.timeline.dial_time) : formatTime(call.normalized_time) }}
                    </div>
                    <div class="text-[8px] text-slate-400 uppercase font-mono font-black tracking-tighter">
                      Start
                    </div>
                  </div>
                  
                  
                  <div class="flex items-center gap-1.5" title="End Call (Disconnect Time)">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#D72821] shrink-0"></span>
                    <div class="text-[11px] font-bold text-[#D72821]">
                      {{ call.timeline?.disconnect_time ? formatTime(call.timeline.disconnect_time) : formatTime(call.normalized_time) }}
                    </div>
                    <div class="text-[8px] text-slate-400 uppercase font-mono font-black tracking-tighter">
                      End
                    </div>
                  </div>
                  
                  
                  <div class="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1.5 pl-3">
                    {{ formatDateShort(call.normalized_time) }}
                  </div>
                </td>
                
                <td class="p-4">
                  <div class="flex items-center gap-4">
                    
                    <div class="w-10 h-10 shrink-0 rounded-2xl bg-[#D72821]/10 flex items-center justify-center text-xs font-black text-[#D72821] group-hover:bg-[#D72821] group-hover:text-white transition-all shadow-sm">
                      {{ (call.user?.name || call.caller_extension).substring(0, 1).toUpperCase() }}
                    </div>
                    <div class="min-w-0">
                      
                      <div class="text-sm font-black text-[#D72821] truncate mb-0.5">{{ call.user?.name || 'Unknown User' }}</div>
                      
                      <div class="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        <span class="text-[9px] font-black text-slate-500 dark:text-slate-400 tracking-tighter uppercase">EXT: {{ call.caller_extension }}</span>
                      </div>
                    </div>
                  </div>
                </td>
                
                <td class="p-4 text-center">
                  <span class="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-[#D72821]/10 text-[#D72821] uppercase border border-[#D72821]/10">
                    {{ call.call_type }}
                  </span>
                </td>
                
                <td class="p-4 text-center">
                  <div class="text-xs font-black text-[#D72821]">
                    {{ Math.floor(call.duration / 60) }}m {{ call.duration % 60 }}s
                  </div>
                  <div class="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">
                    {{ call.duration }} sec
                  </div>
                </td>
                
                <td class="p-4 text-right pr-8 font-black text-[#D72821]">
                  Rp {{ parseFloat(call.cost).toLocaleString() }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        
        <div class="p-6 border-t border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.01]">
          <span class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          <div class="flex gap-2">
            <button 
              @click="currentPage--" 
              :disabled="currentPage === 1"
              class="p-2.5 rounded-xl bg-[#D72821] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#b01e18] transition-all shadow-md shadow-[#D72821]/15 flex items-center justify-center border border-transparent"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>
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

      <!-- Top Callers -->
      <div class="glass p-8 rounded-[3rem]">
        <div class="mb-8">
          <h4 class="text-xl font-black text-[#D72821] tracking-tight">Highest usage this month</h4>
        </div>
        <div class="space-y-4">
          <!-- Setiap baris top spender dapat diklik untuk memunculkan modal rincian panggilan -->
          <div v-for="(caller, i) in topCallers" :key="i" 
            @click="openSpenderModal(caller)"
            class="flex items-center justify-between p-4 bg-white/5 dark:bg-white/[0.03] rounded-[2rem] border-2 border-[#D72821]/20 hover:border-[#D72821] hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-2xl bg-[#D72821]/10 flex items-center justify-center text-xs font-black text-[#D72821]">#{{ i+1 }}</div>
              <div>
                <p class="text-xs font-black text-[#D72821]">{{ caller.user?.name || 'Unknown' }}</p>
                <p class="text-[9px] text-slate-500 uppercase tracking-widest font-bold">{{ caller.user?.department || 'NO DEPT' }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-xs font-black text-[#D72821]">Rp {{ parseFloat(caller.total_cost).toLocaleString() }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Detail Calls for Top Spender (Desain Premium & Glassmorphic Backdrop) -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <!-- Container Modal Box Utama (Menggunakan class .glass untuk menjamin integrasi tema Light/Dark yang presisi) -->
      <div class="glass rounded-[3rem] w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden transform scale-100 transition-all duration-300">
        
        
        <div class="p-8 border-b border-slate-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50/50 dark:bg-white/[0.01] gap-4">
          <div class="flex items-center gap-4">
            
            <div class="w-16 h-16 rounded-[1.5rem] bg-gradient-to-tr from-[#D72821] to-[#9e1b16] flex items-center justify-center text-2xl font-black text-white shadow-lg">
              {{ (selectedSpender.user?.name || 'Unknown').substring(0, 1).toUpperCase() }}
            </div>
            
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
          
          
          <div class="flex items-center gap-4 w-full sm:w-auto">
            
            <div class="relative w-full sm:w-64">
              <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D72821] pointer-events-none" />
              <input 
                v-model="modalSearchQuery" 
                type="text" 
                placeholder="Search by destination or type..." 
                class="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-xs font-bold outline-none focus:border-[#D72821]/50 focus:ring-4 focus:ring-[#D72821]/10 transition-all shadow-sm text-slate-900 dark:text-white" 
              />
            </div>
            
            <button @click="closeSpenderModal" class="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-all">
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        
        <div class="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          
          
          <div>
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-xs font-black text-[#D72821] uppercase tracking-widest flex items-center gap-2">
                <span>Call Details Breakdown</span>
                <span class="px-2.5 py-0.5 bg-[#D72821]/15 text-[#D72821] rounded-full text-[10px] font-mono font-black border border-[#D72821]/10">
                  {{ filteredModalCalls.length }}
                </span>
              </h4>
            </div>

            
            <div v-if="isLoadingCalls" class="py-16 flex flex-col items-center justify-center gap-3 text-slate-500">
              <div class="w-8 h-8 border-4 border-[#D72821] border-t-transparent rounded-full animate-spin"></div>
              <p class="text-xs font-bold uppercase tracking-widest text-slate-400">Fetching calls data...</p>
            </div>

            
            <div v-else-if="filteredModalCalls.length === 0" class="py-16 text-center text-slate-500 italic text-xs border border-dashed border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-white/[0.01]">
              No calls matched your search criteria.
            </div>

            
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
                  
                  <tr v-for="(call, index) in paginatedModalCalls" :key="call.id" class="hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-all">
                    
                    <td class="p-4 pl-6 text-slate-400 font-mono font-bold">
                      {{ (modalCurrentPage - 1) * modalItemsPerPage + index + 1 }}
                    </td>
                    
                    <td class="p-4">
                      
                      <div class="flex items-center gap-1.5 mb-1" title="Start Call (Dialing Time)">
                        <span class="w-1.5 h-1.5 rounded-full bg-[#D72821] shrink-0"></span>
                        <div class="text-[11px] font-bold text-[#D72821]">
                          {{ call.timeline?.dial_time ? formatTime(call.timeline.dial_time) : formatTime(call.normalized_time) }}
                        </div>
                        <div class="text-[8px] text-slate-400 uppercase font-mono font-black tracking-tighter">
                          Start
                        </div>
                      </div>
                      
                      
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
                      <div class="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1.5 pl-3">
                        {{ formatDateShort(call.normalized_time) }}
                      </div>
                    </td>
                    <!-- Kolom tujuan panggilan dengan nama berwarna merah Crimson Red (#D72821) sesuai request -->
                    <td class="p-4">
                      <!-- Menampilkan nama tujuan dengan warna merah Crimson Red yang kontras -->
                      <div v-if="call.destination_name" class="font-bold text-[#D72821] mb-0.5">
                        {{ call.destination_name }}
                      </div>
                      <!-- Menampilkan nomor ekstensi/telepon tujuan di bawahnya -->
                      <div class="font-mono" :class="call.destination_name ? 'text-[10px] text-slate-500 dark:text-slate-400 font-semibold' : 'text-sm font-black text-[#D72821]'">
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
                <ChevronLeft class="w-4 h-4" />
              </button>
              <button 
                @click="modalCurrentPage++" 
                :disabled="modalCurrentPage >= modalTotalPages"
                class="p-2.5 rounded-xl bg-[#D72821] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#b01e18] transition-all shadow-md shadow-[#D72821]/15 flex items-center justify-center border border-transparent"
              >
                <ChevronRight class="w-4 h-4" />
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
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { Activity, Search, AlertTriangle, ShieldCheck, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Clock, X, PhoneCall } from 'lucide-vue-next';
import axios from '../../utils/axios';
import { store } from '../../store/billingStore';
import './Dashboard.css';

const recentCalls = ref([]);
const abnormalCalls = ref([]);
const longCalls = ref([]);
const topCallers = ref([]);
const stats = ref({ total_today: 0, success_rate: 0, abnormal_today: 0 });
const utilization = ref([]);

const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
let refreshInterval;



const isModalOpen = ref(false);
const selectedSpender = ref({});
const spenderCalls = ref([]);
const isLoadingCalls = ref(false);

// Reactive state untuk input pencarian lokal di dalam modal
const modalSearchQuery = ref('');
// Reactive state untuk mencatat halaman paginasi aktif di dalam modal
const modalCurrentPage = ref(1);
// Konstanta untuk membatasi jumlah item panggilan yang tampil per halaman di modal
const modalItemsPerPage = 5;

/**
 * Properti terhitung (computed property) untuk memfilter daftar panggilan spender berdasarkan pencarian nomor tujuan atau tipe panggilan.
 * 
 * @returns {Array} Daftar panggilan spender yang telah terfilter
 */
const filteredModalCalls = computed(() => {
  // Jika query pencarian kosong, kembalikan daftar panggilan asli seluruhnya
  if (!modalSearchQuery.value) return spenderCalls.value;
  
  // Konversi input pencarian ke huruf kecil agar case-insensitive
  const q = modalSearchQuery.value.toLowerCase();
  
  // Memfilter panggilan berdasarkan kecocokan nomor tujuan atau tipe panggilan
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
  // Melakukan pembagian jumlah baris data dengan item per halaman dan dibulatkan ke atas
  return Math.ceil(filteredModalCalls.value.length / modalItemsPerPage) || 1;
});

/**
 * Properti terhitung (computed property) untuk memotong data panggilan dan mengembalikan hanya baris yang aktif di halaman terpilih.
 * 
 * @returns {Array} Potongan data panggilan untuk halaman aktif
 */
const paginatedModalCalls = computed(() => {
  // Menentukan indeks baris awal pemotongan data
  const start = (modalCurrentPage.value - 1) * modalItemsPerPage;
  // Memotong data dari indeks start hingga batas maksimum per halaman
  return filteredModalCalls.value.slice(start, start + modalItemsPerPage);
});

/**
 * Membuka modal rincian panggilan untuk spender terpilih.
 * Melakukan pemanggilan API ke backend untuk mengambil data riwayat panggilan secara detail.
 * 
 * @param {Object} spender - Objek data top spender yang dipilih dari UI
 * @returns {Promise<void>}
 */
const openSpenderModal = async (spender) => {
  // Menyimpan data spender yang diklik untuk ditampilkan detailnya di header modal
  selectedSpender.value = spender;
  // Menampilkan modal ke layar
  isModalOpen.value = true;
  // Mengaktifkan indikator loading selama proses pengambilan data berlangsung
  isLoadingCalls.value = true;
  
  // Mereset pencarian modal ke kosong agar fresh
  modalSearchQuery.value = '';
  // Mereset halaman paginasi modal kembali ke halaman 1
  modalCurrentPage.value = 1;
  
  try {
    // Memanggil API backend untuk mendapatkan rincian panggilan user berdasarkan user_id dan rentang waktu bulan/tahun dari store
    const response = await axios.get(`/reports/user-calls/${spender.user_id}?month=${store.startMonth}&year=${store.startYear}`);
    
    // Menyimpan data riwayat panggilan yang dikembalikan oleh server
    spenderCalls.value = response.data.data;
  } catch (err) {
    // Menangkap error jika proses pemanggilan API gagal dan mereset state data panggilan
    console.error('Failed to fetch spender call details', err);
    spenderCalls.value = [];
  } finally {
    // Menonaktifkan indikator loading setelah proses selesai
    isLoadingCalls.value = false;
  }
};

/**
 * Menutup modal rincian panggilan spender dan membersihkan state.
 */
const closeSpenderModal = () => {
  // Menyembunyikan modal dari layar
  isModalOpen.value = false;
  // Mereset objek spender yang terpilih
  selectedSpender.value = {};
  // Mengosongkan data riwayat panggilan agar tidak bocor ke penayangan berikutnya
  spenderCalls.value = [];
  // Mereset pencarian modal
  modalSearchQuery.value = '';
  // Mereset halaman modal
  modalCurrentPage.value = 1;
};

// Mengawasi perubahan input pencarian di modal untuk otomatis mengembalikan paginasi ke halaman 1
watch(modalSearchQuery, () => {
  modalCurrentPage.value = 1;
});

const formatFullTime = (isoString) => {
  if (!isoString) return '--:--:--';
  return new Date(isoString).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const kpiCards = computed(() => [
  { label: 'Total Calls Today', value: stats.value.total_today },
  { label: 'Success Rate Today', value: `${stats.value.success_rate}%` },
  { label: 'Abnormal Calls Today', value: stats.value.abnormal_today },
  { label: 'Est. Cost Today', value: `Rp ${(stats.value.total_cost || 0).toLocaleString()}` }
]);

const maxCalls = computed(() => {
  if (!utilization.value.length) return 1;
  return Math.max(...utilization.value.map(d => parseInt(d.total_calls) || 0), 1);
});

const filteredCalls = computed(() => {
  if (!searchQuery.value) return recentCalls.value;
  const q = searchQuery.value.toLowerCase();
  return recentCalls.value.filter(call => 
    call.caller_extension.toLowerCase().includes(q) || 
    (call.user?.name || '').toLowerCase().includes(q)
  );
});

const totalPages = computed(() => Math.ceil(filteredCalls.value.length / itemsPerPage) || 1);
const paginatedCalls = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredCalls.value.slice(start, start + itemsPerPage);
});

const fetchDashboardData = async () => {
  try {
    // Memanggil berbagai endpoint API secara paralel menggunakan Promise.all untuk efisiensi performa maksimum
    const [s, r, u, a, tc, lc] = await Promise.all([
      // Mengambil data ringkasan KPI (Total Calls, Success Rate, Abnormal Calls, Est. Cost)
      axios.get('/reports/dashboard-stats'),
      
      // Mengambil 20 aktivitas panggilan terbaru
      axios.get('/reports/recent-calls'),
      
      // Mengambil trend volume panggilan harian (utilization) difilter berdasarkan bulan dan tahun dari store
      axios.get(`/reports/utilization?startMonth=${store.startMonth}&startYear=${store.startYear}&endMonth=${store.endMonth}&endYear=${store.endYear}`),
      
      // Mengambil data 5 panggilan abnormal/gagal terbaru
      axios.get('/reports/abnormal-calls?limit=5'),
      
      // Mengambil data top 10 pengeluaran biaya panggilan berdasarkan filter bulan dan tahun dari store
      axios.get(`/reports/top-callers?limit=10&startMonth=${store.startMonth}&startYear=${store.startYear}&endMonth=${store.endMonth}&endYear=${store.endYear}`),
      
      // Mengambil data 5 panggilan terlama (durasi lebih dari 5 menit)
      axios.get('/reports/long-calls?limit=5')
    ]);
    
    // Menyimpan data hasil query API ke dalam ref reactive masing-masing
    stats.value = s.data.data;
    recentCalls.value = r.data.data;
    // Mengambil 7 hari terakhir dari trend penggunaan untuk visualisasi grafik harian
    utilization.value = u.data.data.slice(-7);
    abnormalCalls.value = a.data.data;
    topCallers.value = tc.data.data;
    longCalls.value = lc.data.data;
  } catch (err) {
    // Log error jika salah satu pemanggilan API mengalami kegagalan
    console.error('Failed to fetch dashboard data', err);
  }
};

const formatTime = (isoString) => {
  if (!isoString) return '--:--';
  return new Date(isoString).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

const formatDateShort = (isoString) => {
  if (!isoString) return '--';
  return new Date(isoString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

onMounted(() => {
  fetchDashboardData();
  refreshInterval = setInterval(fetchDashboardData, 30000);
});

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval);
});

watch(searchQuery, () => { currentPage.value = 1; });
watch(() => store.refreshCounter, fetchDashboardData);
watch(() => [store.startMonth, store.startYear, store.endMonth, store.endYear], fetchDashboardData);
</script>

<style scoped>
select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23D72821'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0px center;
  background-size: 12px;
  padding-right: 15px;
}

.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.glass-red {
  background: linear-gradient(135deg, #D72821 0%, #9e1b16 100%);
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

.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-slide-up {
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.scroll-mask {
  mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
}
</style>
