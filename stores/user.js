import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    name: null,
    FHiD: null,
    isLoggedIn: false,
    isAdmin: false,
    loading: true
  }),
  actions: {
    async fetchUser() {
      try {
        const responce = await fetch(`${import.meta.env.VITE_BACKEND_URL}/login/protected`, {
          method: 'GET',
          credentials: 'include'
        });
        const res = await responce.json();
        if (res.success) {
          this.user = res.user;
          this.name = res.name;
          this.FHiD = res.FHiD;
          this.isLoggedIn = true;
          this.isAdmin = res.admin || false;
        } else {
          this.user = null;
          this.name = null;
          this.FHiD = null;
          this.isLoggedIn = false;
          this.isAdmin = false;
        }
      } catch (err) {
        this.user = null;
        this.name = null;
        this.FHiD = null;
        this.isLoggedIn = false;
        this.isAdmin = false;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      try {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/login/logout`, {
          method: 'POST',
          credentials: 'include'
        });
      } catch (err) {
        console.error('Logout failed:', err);
      } finally {
        this.user = null;
        this.isLoggedIn = false;
        this.isAdmin = false;
      }
    }
  }
});
