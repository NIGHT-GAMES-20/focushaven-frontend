<script setup>
    import headerImage from '../../assets/LogoTitle.png'
    import styles from './header.module.css'
    import { ref, onMounted } from 'vue'
    import { useUserStore } from '/stores/user.js'

    const menuOpen = ref(false)
    const userStore = useUserStore()

    onMounted(() => {
        userStore.fetchUser()
    })

    async function logoutFunc() {
    try {
      userStore.logout()
      console.log('Logged out successfully')
      setTimeout(() => { window.location.href = '/'; }, 10)
    } catch (error) {
      console.error(`Logout Failed: ${error}`)
    }
  }

</script>


<template>
  <header>
    <div :class="styles.headerDiv">
      <div :class="styles.logo">
        <img alt="Logo" :src="headerImage" :class="styles.logo" />
      </div>

      <!-- Hamburger button -->
      <button @click="menuOpen = !menuOpen" :class="styles.menuToggle">
        ☰
      </button>

      <!-- Nav menu -->
      <nav :class="[styles.navBar, { [styles.open]: menuOpen }]">
        <ul :class="styles.navElem">
          <li><a href="/" :class="styles.links">Home</a></li>
          <li><a href="/notes" :class="styles.links">Notes</a></li>
          <li><a href="https://focushaven-testportal.netlify.app/" :class="styles.links">Test Portal</a></li>
          <li><a href="/forum" :class="styles.links">Forum</a></li>
          <div v-if="userStore.isLoggedIn" @click="toggleDropdown" :class="styles.userIdenticonContainer" ref="dropdownRef">
            <img  alt="user Identicon" :src="userStore.profilePic" :class="styles.userIdenticon" ref="dropdownRef" /><ChevronDown :class="[styles.chevronIconDropown, { [styles.rotated]: isUserDropdownOpen }]" />
          </div>
          <li v-else><a href="/login" :class="styles.links" >Login/Register</a></li>
          <transition name="fade">
            <div v-if="isUserDropdownOpen" :class="styles.userDropdown"  @click.stop >
              <a href="/dashboard" :class="styles.dropdownElem">Dashboard</a>
              <a @click="logoutFunc()" :class="styles.dropdownElem">Logout</a>
            </div>
          </transition>
          
        </ul>
      </nav>
    </div>
  </header>
</template>

<style>
  /* Fade in / out transition classes */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.25s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>