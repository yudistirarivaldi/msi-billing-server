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
        <span>Add User</span>
      </button>
    </div>

    <!-- Table -->
    <div class="glass rounded-[3rem] overflow-hidden flex flex-col border border-slate-200 dark:border-white/10">
      <div class="p-8 border-b border-slate-200 dark:border-white/5 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h4 class="text-xl font-black text-[#D72821] tracking-tight">Users List</h4>
        </div>
        <div class="relative w-64">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-[#D72821]" />
          <input v-model="searchQuery" type="text" placeholder="Search user or extension..." class="w-full bg-white dark:bg-white/5 border border-[#D72821]/30 dark:border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-900 dark:text-white outline-none focus:border-[#D72821] transition-all shadow-sm" />
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 dark:bg-white/[0.02] text-[10px] text-slate-600 dark:text-slate-400 uppercase tracking-widest font-bold">
            <tr>
              <th class="p-4 pl-8">Extension</th>
              <th class="p-4">Name</th>
              <th class="p-4">Department & Team</th>
              <th class="p-4 text-center">Monthly Quota</th>
              <th class="p-4 text-right pr-8">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-white/5">
            <tr v-for="(user, index) in paginatedUsers" :key="user.id" class="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all group">
              <td class="p-4 pl-8">
                <div class="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <span class="text-[9px] font-black text-slate-500 dark:text-slate-400 tracking-tighter uppercase">EXT: {{ user.extension }}</span>
                </div>
              </td>
              <td class="p-4">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 shrink-0 rounded-2xl bg-[#D72821]/10 flex items-center justify-center text-xs font-black text-[#D72821] group-hover:bg-[#D72821] group-hover:text-white transition-all shadow-sm">
                    {{ user.name.substring(0, 1).toUpperCase() }}
                  </div>
                  <div class="min-w-0">
                    <div class="text-sm font-black text-[#D72821] truncate">{{ user.name }}</div>
                  </div>
                </div>
              </td>
              <td class="p-4 text-sm text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest text-[9px]">
                <div v-if="user.team" class="flex flex-col gap-0.5">
                  <span class="text-xs font-bold text-slate-700 dark:text-slate-300">{{ user.team.department ? user.team.department.name : '-' }}</span>
                  <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Team: {{ user.team.name }}</span>
                </div>
                <span v-else class="text-slate-400">-</span>
              </td>
              <td class="p-4 text-center">
                <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#D72821]/10 text-[#D72821] border border-[#D72821]/10">
                  Rp {{ parseFloat(user.monthly_quota).toLocaleString('id-ID') }}
                </span>
              </td>
              <td class="p-4 pr-8 text-right flex justify-end gap-2">
                <button @click="openModal(user)" class="p-2 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm" title="Edit">
                  <Pencil class="w-4 h-4" />
                </button>
                <button @click="deleteUser(user.id)" class="p-2 rounded-xl bg-[#D72821]/10 text-[#D72821] hover:bg-[#D72821] hover:text-white transition-all shadow-sm" title="Delete">
                  <Trash2 class="w-4 h-4" />
                </button>
              </td>
            </tr>
            <tr v-if="paginatedUsers.length === 0">
              <td colspan="5" class="p-8 text-center text-slate-500">No users found.</td>
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
      <div class="modal-bg bg-[#111111] rounded-[2rem] w-full max-w-md overflow-visible shadow-2xl border border-white/10 transform transition-all">
        <div class="modal-header rounded-t-[2rem] p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
          <h2 class="text-xl font-black text-[#D72821] tracking-tight">{{ form.id ? 'Edit User' : 'Add User' }}</h2>
          <button @click="showModal = false" class="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 transition-all">
            <X class="w-4 h-4" />
          </button>
        </div>
        <form @submit.prevent="saveUser" class="p-6 space-y-5">
          <div>
            <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Name</label>
            <input v-model="form.name" type="text" required class="modal-input w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white outline-none focus:border-[#D72821]/50 focus:ring-4 focus:ring-[#D72821]/10 transition-all">
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Extension</label>
            <input v-model="form.extension" type="text" required class="modal-input w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white outline-none focus:border-[#D72821]/50 focus:ring-4 focus:ring-[#D72821]/10 transition-all">
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Team</label>
            <div class="relative" v-click-outside="() => showTeamDropdown = false">
              <div 
                @click="showTeamDropdown = !showTeamDropdown" 
                class="modal-input w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold outline-none focus:border-[#D72821]/50 focus:ring-4 focus:ring-[#D72821]/10 transition-all cursor-pointer flex justify-between items-center"
                :class="form.team_id ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-400'"
              >
                <span class="truncate">{{ selectedTeamName || 'Select Team' }}</span>
                <ChevronRight class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-90': showTeamDropdown }" />
              </div>
              
              <div v-if="showTeamDropdown" class="dropdown-bg absolute z-50 w-full mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl max-h-60 overflow-hidden flex flex-col">
                <div class="dropdown-bg p-2 border-b border-white/5 sticky top-0 bg-[#1a1a1a] z-10">
                  <div class="relative">
                    <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
                    <input 
                      v-model="teamSearchQuery" 
                      type="text" 
                      placeholder="Search team..." 
                      class="dropdown-search w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-[#D72821] transition-all"
                      @click.stop
                    />
                  </div>
                </div>
                <div class="overflow-y-auto p-1 flex-1">
                  <div 
                    v-for="team in filteredTeamsDropdown" 
                    :key="team.id"
                    @click="selectTeam(team)"
                    class="dropdown-item px-3 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white rounded-lg cursor-pointer transition-colors flex items-center justify-between group"
                    :class="{'bg-[#D72821]/10 text-[#D72821] hover:bg-[#D72821]/20 hover:text-[#D72821] dark:hover:text-[#D72821]': form.team_id === team.id}"
                  >
                    <span class="truncate"><span class="font-mono text-[10px] text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400 mr-2">{{team.team_code}}</span>{{ team.name }}</span>
                    <CheckCircle2 v-if="form.team_id === team.id" class="w-3 h-3 text-[#D72821]" />
                  </div>
                  <div v-if="filteredTeamsDropdown.length === 0" class="p-4 text-center text-xs text-slate-500">
                    No teams found.
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Monthly Quota (Rp)</label>
            <input v-model.number="form.monthly_quota" type="number" required class="modal-input w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white outline-none focus:border-[#D72821]/50 focus:ring-4 focus:ring-[#D72821]/10 transition-all">
          </div>
          <div class="pt-6 flex justify-end gap-3">
            <button type="button" @click="showModal = false" class="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all">Cancel</button>
            <button type="submit" class="bg-[#D72821] hover:bg-[#b01e18] text-white px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#D72821]/20">Save User</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { Search, ChevronLeft, ChevronRight, Pencil, Trash2, X, CheckCircle2, AlertCircle } from 'lucide-vue-next';
import axios from 'axios';

const apiBase = 'http://localhost:3000/api/master/users';
const teamApi = 'http://localhost:3000/api/master/teams';
const users = ref([]);
const teams = ref([]);
const showModal = ref(false);
const form = ref({ id: null, name: '', extension: '', team_id: null, monthly_quota: 0 });

const showTeamDropdown = ref(false);
const teamSearchQuery = ref('');

const filteredTeamsDropdown = computed(() => {
  if (!teamSearchQuery.value) return teams.value;
  const q = teamSearchQuery.value.toLowerCase();
  return teams.value.filter(t => 
    t.team_code.toLowerCase().includes(q) || 
    t.name.toLowerCase().includes(q)
  );
});

const selectedTeamName = computed(() => {
  if (!form.value.team_id) return '';
  const team = teams.value.find(t => t.id === form.value.team_id);
  return team ? `${team.team_code} - ${team.name}` : '';
});

const selectTeam = (team) => {
  form.value.team_id = team.id;
  showTeamDropdown.value = false;
  teamSearchQuery.value = '';
};

// Simple click-outside directive simulation for Vue script setup
import { onBeforeUnmount } from 'vue';
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = function(event) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    document.body.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) {
    document.body.removeEventListener('click', el.clickOutsideEvent);
  }
};


const notification = ref(null);
const showNotification = (message, type = 'success') => {
  notification.value = { message, type };
  setTimeout(() => { notification.value = null; }, 3000);
};

const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  const q = searchQuery.value.toLowerCase();
  return users.value.filter(u => 
    String(u.extension).toLowerCase().includes(q) || 
    String(u.name).toLowerCase().includes(q)
  );
});

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage) || 1);

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
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredUsers.value.slice(start, start + itemsPerPage);
});

watch(searchQuery, () => { currentPage.value = 1; });

const fetchUsers = async () => {
  try {
    const res = await axios.get(apiBase, { withCredentials: true });
    users.value = res.data;
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};

const fetchTeams = async () => {
  try {
    const res = await axios.get(teamApi, { withCredentials: true });
    // Filter to only show teams (level 3) or show all depending on preference
    teams.value = res.data;
  } catch (error) {
    console.error('Error fetching Kode PPs:', error);
  }
};

const openModal = (user = null) => {
  if (user) {
    form.value = { ...user };
  } else {
    form.value = { id: null, extension: '', name: '', team_id: null, monthly_quota: 0 };
  }
  showModal.value = true;
};

const saveUser = async () => {
  try {
    if (!form.value.name || !form.value.extension || !form.value.team_id) {
      showNotification('Please fill in all required fields.', 'error');
      return;
    }

    const payload = { ...form.value };
    if (!payload.id) delete payload.id;

    if (payload.id) {
      await axios.put(`${apiBase}/${payload.id}`, payload, { withCredentials: true });
      showNotification('User successfully updated!');
    } else {
      await axios.post(apiBase, payload, { withCredentials: true });
      showNotification('User successfully created!');
    }
    showModal.value = false;
    fetchUsers();
  } catch (error) {
    console.error('Error saving user:', error);
    showNotification(error.response?.data?.message || 'Failed to save user.', 'error');
  }
};

const deleteUser = async (id) => {
  if (!confirm('Are you sure you want to delete this user?')) return;
  try {
    await axios.delete(`${apiBase}/${id}`, { withCredentials: true });
    showNotification('User successfully deleted!');
    fetchUsers();
  } catch (error) {
    console.error('Error deleting user:', error);
    showNotification(error.response?.data?.message || 'Failed to delete user.', 'error');
  }
};

onMounted(() => {
  fetchUsers();
  fetchTeams();
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

html:not(.dark) .dropdown-bg {
  background-color: white !important;
  border-color: #e2e8f0 !important;
}
html:not(.dark) .dropdown-bg .border-b {
  border-color: #e2e8f0 !important;
}
html:not(.dark) .dropdown-search {
  background-color: #f8fafc !important;
  color: #0f172a !important;
  border-color: #e2e8f0 !important;
}
html:not(.dark) .dropdown-item {
  color: #475569 !important;
}
html:not(.dark) .dropdown-item:hover {
  background-color: #f1f5f9 !important;
  color: #0f172a !important;
}
html:not(.dark) .dropdown-item .font-mono {
  color: #64748b !important;
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
