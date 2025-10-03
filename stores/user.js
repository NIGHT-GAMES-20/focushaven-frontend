import { defineStore } from 'pinia';
import * as jdenticon from 'jdenticon'; // ✅ Use namespace import

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    name: null,
    FHiD: null,
    profilePic: null, // Fallback avatar
    isLoggedIn: false,
    isAdmin: false,
    loading: true
  }),

  persist: {
    enabled: true,             // ✅ persist across reloads
    strategies: [
      {
        key: 'user-store',     // localStorage key
        storage: localStorage, // or sessionStorage
      }
    ]
  },

  actions: {
    async fetchUser() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/login/protected`,
          {
            method: 'GET',
            credentials: 'include'
          }
        );

        const res = await response.json();

        if (res.success) {
          this.user = res.user;
          this.name = res.name;
          this.FHiD = res.FHiD;
          this.isLoggedIn = true;
          this.isAdmin = res.admin || false;

          if (res.profilePic) {
            // If backend sends a profile picture (Base64 or URL)
            this.profilePic = res.profilePic;
          } else {
            // No picture → create identicon from username or fallback seed
            this.profilePic = this.generateIdenticon(this.user.username || 'default');
          }
        } else {
          this.resetUser();
        }
      } catch (err) {
        this.resetUser();
      } finally {
        this.loading = false;
      }
    },

    generateIdenticon(seed) {
      const size = 100;
      const svg = jdenticon.toSvg(seed, size);
      // Encode SVG safely to a data URL
      const encoded = encodeURIComponent(svg)
        .replace(/'/g, '%27')
        .replace(/"/g, '%22');
      return `data:image/svg+xml,${encoded}`;
    },

    resetUser() {
      this.user = null;
      this.name = null;
      this.FHiD = null;
      this.profilePic = null;
      this.isLoggedIn = false;
      this.isAdmin = false;
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
        this.resetUser();
      }
    }
  }
});
