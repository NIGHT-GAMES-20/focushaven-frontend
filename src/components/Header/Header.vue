<script setup>
    import headerImage from '../../assets/LogoTitle.png'
    import styles from './header.module.css'
    import { ref, onMounted } from 'vue'
    import { useUserStore } from '/stores/user.js'

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
      <nav :class="styles.navBar">
        <ul :class="styles.navElem" >
          <li>
            <a href="/" >Home</a>
          </li>
          <li>
            <a href="/notes" >Notes</a>
          </li>
          <li>
            <a href="https://focushaven-testportal.netlify.app/">Test Portal</a>
          </li>
          <li v-if="userStore.isLoggedIn" >
            <a href="/dashboard" >Dashboard</a>
          </li>
          <li v-else>
            <a href="/login" >Login/Register</a>
          </li>
          <li v-if="userStore.isLoggedIn" >
            <a @click="logoutFunc" href="javascript:void(0)" style="margin-right: 10px;" >Logout</a>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>
