import { reactive, watch } from 'vue';

export const store = reactive({
  // Mengambil bulan dan tahun saat ini secara otomatis (dinamis)
  // getMonth() mengembalikan indeks 0-11, sehingga perlu ditambah 1
  startMonth: new Date().getMonth() + 1,
  startYear: new Date().getFullYear().toString(),
  endMonth: new Date().getMonth() + 1,
  endYear: new Date().getFullYear().toString(),
  isDark: localStorage.getItem('darkMode') === 'true', 
  currentTab: 'dashboard',
  isAuthenticated: !!localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isSidebarCollapsed: false,
  refreshCounter: 0,
  
  setStartMonth(m) { this.startMonth = m; },
  setStartYear(y) { this.startYear = y; },
  setEndMonth(m) { this.endMonth = m; },
  setEndYear(y) { this.endYear = y; },
  setTab(t) { this.currentTab = t; },
  toggleSidebar() { this.isSidebarCollapsed = !this.isSidebarCollapsed; },
  triggerRefresh() { this.refreshCounter++; },
  
  login(userData, token) {
    this.isAuthenticated = true;
    this.user = userData;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  },

  async logout() {
    try {
      const axios = (await import('../utils/axios')).default;
      await axios.post('/auth/logout');
    } catch (error) {
      console.error('Backend logout failed:', error);
    }
    
    this.isAuthenticated = false;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Use window.location for a full refresh/clean state if needed, 
    // or use router if it's already loaded.
    const router = (await import('../router')).default;
    router.push('/login');
  },

  toggleTheme() {
    this.isDark = !this.isDark;
    localStorage.setItem('darkMode', this.isDark);
    this.updateTheme();
  },
  
  async checkAuth() {
    if (!this.isAuthenticated) return;
    
    try {
      // Use the raw axios or the new instance here? 
      // Since we want to avoid circular dependencies if possible, 
      // but billingStore is imported by axios.js.
      // Let's import axios directly here or use a dynamic import.
      const axios = (await import('../utils/axios')).default;
      const response = await axios.get('/auth/me');
      if (response.data.success) {
        this.user = response.data.user;
        this.isAuthenticated = true;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      this.logout();
    }
  },
  
  updateTheme() {
    if (this.isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
});

// Initialize theme on load
store.updateTheme();
