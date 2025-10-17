<script setup>
import headerImage from '../../assets/LogoTitle.png'
import styles from './header.module.css'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useUserStore } from '/stores/user.js'
import { ChevronDown, Menu } from 'lucide-vue-next'

const menuOpen = ref(false) // for full nav collapse
const isMenuDropdownOpen = ref(false) // for hamburger menu dropdown
const userStore = useUserStore()
const isUserDropdownOpen = ref(false) // for user chevron dropdown
const dropdownRef = ref(null)
const menuDropdownRef = ref(null)

onMounted(() => {
  userStore.fetchUser()
  document.addEventListener("click", closeDropdown)
})

onBeforeUnmount(() => {
  document.removeEventListener("click", closeDropdown)
})

async function logoutFunc() {
  try {
    userStore.logout()
    console.log('Logged out successfully')
    setTimeout(() => { window.location.href = '/' }, 10)
  } catch (error) {
    console.error(`Logout Failed: ${error}`)
  }
}

function toggleUserDropdown() {
  isUserDropdownOpen.value = !isUserDropdownOpen.value
}

function toggleMenuDropdown() {
  isMenuDropdownOpen.value = !isMenuDropdownOpen.value
  menuOpen.value = !menuOpen.value
}

const closeDropdown = (event) => {
  // Close chevron dropdown
  if (
    isUserDropdownOpen.value &&
    dropdownRef.value &&
    !dropdownRef.value.contains(event.target)
  ) {
    isUserDropdownOpen.value = false
  }

  // Close hamburger dropdown
  if (
    isMenuDropdownOpen.value &&
    menuDropdownRef.value &&
    !menuDropdownRef.value.contains(event.target)
  ) {
    isMenuDropdownOpen.value = false
    menuOpen.value = false
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
      <button @click="toggleMenuDropdown" :class="styles.menuToggle" ref="menuDropdownRef">
        <div :class="styles.userIdenticonContainer">
          <img
            v-if="userStore.isLoggedIn"
            alt="user Identicon"
            :src="userStore.profilePic"
            :class="styles.userIdenticon"
          />
          <Menu :class="[styles.chevronIconDropown, { [styles.rotated]: isMenuDropdownOpen }]" />
        </div>
      </button>

      <!-- Nav menu -->
      <nav :class="[styles.navBar, { [styles.open]: menuOpen }]">
        <ul :class="styles.navElem">
          <li><a href="/" :class="styles.links">Home</a></li>
          <li><a href="/notes" :class="styles.links">Notes</a></li>
          <li>
            <a
              href="https://testportal.focushaven.me/"
              :class="styles.links"
              target="_blank" rel="noopener noreferrer"
              >Test Portal</a
            >
          </li>
          <li><a href="/forum" :class="styles.links">Forum</a></li>

          <div :class="styles.userLinks">
            <li v-if="userStore.isLoggedIn">
              <a href="/dashboard" :class="styles.links">Dashboard</a>
            </li>
            <li v-if="userStore.isLoggedIn">
              <a
                @click="logoutFunc"
                href="javascript:void(0)"
                style="margin-right: 10px;"
                :class="styles.links"
                >Logout</a
              >
            </li>
          </div>

          <li v-if="!userStore.isLoggedIn">
            <a href="/login" :class="styles.links">Login/Register</a>
          </li>

          <div :class="styles.userActions" style="position: relative;">
            <div
              v-if="userStore.isLoggedIn"
              @click="toggleUserDropdown"
              :class="styles.userIdenticonContainer"
              ref="dropdownRef"
            >
              <img
                alt="user Identicon"
                :src="userStore.profilePic"
                :class="styles.userIdenticon"
              />
              <ChevronDown
                :class="[styles.chevronIconDropown, { [styles.rotated]: isUserDropdownOpen }]"
              />
            </div>
            <transition name="fade">
              <div
                v-if="isUserDropdownOpen"
                :class="styles.userDropdown"
                @click.stop
              >
                <a href="/dashboard" :class="styles.dropdownElem">Dashboard</a>
                <a @click="logoutFunc()" :class="styles.dropdownElem">Logout</a>
              </div>
            </transition>
          </div>
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
