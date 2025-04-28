<script setup>
    import headerImage from '../../assets/LogoTitle.png'
    import styles from './header.module.css'
    import { ref, onMounted } from 'vue'

    const isAuthenticated = ref(false)

    async function checkAuth() {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/login/protected`, {
            method: 'GET',
            credentials: 'include'
            });
            const data = await response.json()
            isAuthenticated.value = !!data.success
        } catch {
            isAuthenticated.value = false
        }
    }

    onMounted(() => {
        checkAuth()
    })
    async function logoutFunc() {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/login/logout`, {
        method: 'POST',
        credentials: 'include',
      })
      isAuthenticated.value = false
      responseMessage.value = 'Logged out successfully'
      setTimeout(() => window.location.reload(), 1000)
    } catch (error) {
      responseMessage.value = `Logout Failed: ${error}`
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
                            <a href="./notes" >Notes</a>
                        </li>
                        <li v-if="isAuthenticated" style="margin-right: 30px;">
                            <a href="./dashboard" >Dashboard</a>
                        </li>
                        <li v-else>
                            <a href="./login" >Login</a>
                        </li>
                        <li v-if="isAuthenticated" style="margin-right: 30px;">
                            <span @click="logoutFunc" style="cursor: pointer;" >Logout</span>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
</template>
