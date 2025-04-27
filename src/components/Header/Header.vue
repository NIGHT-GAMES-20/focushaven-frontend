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
                        <li v-if="isAuthenticated" style="margin-right: 30px;">
                            <a href="./dashboard" >Dashboard</a>
                        </li>
                        <li v-else>
                            <a href="./login" >Login</a>
                        </li>
                        <li>
                            <a href="./about" >About</a>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
</template>