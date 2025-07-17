<template>
  <div :class="styles.loginPage">
    <h2>Login</h2>

    <label>
      Username:
      <input
        v-model="username"
        type="text"
        placeholder="Enter username"
        :class="styles.usernameInput"
      />
    </label>

    <label>
      Password:
      <div :class="styles.passwordRow">
        <input
          :type="showPassword ? 'text' : 'password'"
          v-model="password"
          placeholder="Enter password"
          :class="styles.passwordInput"
        />
        <button type="button" @click="togglePassword" :class="styles.viewPassBtn">
          <img :src="currentImage" alt="Toggle Password" :class="styles.viewPassImg" />
        </button>
      </div>
    </label>

    <div :class="styles.buttonRow">
      <button @click="loginFunc" :class="styles.loginBtn">Login</button>
    </div>

    <a href="./signin" :class="styles.signinPageLink">Dont have an account? Register Here</a>
    <p style="margin-top: 20px;">{{ responseMessage }}</p>
  </div>
</template>

  
<script setup>
  import { ref, onMounted } from 'vue'
  import MD5 from 'crypto-js/md5'
  import imageA from './assets/view.png'
  import imageB from './assets/hide.png'
  import styles from './login.module.css'
  import { useUserStore } from '/stores/user.js'

  const userStore = useUserStore()
  const currentImage = ref(imageA)
  
  const username = ref('')
  const password = ref('')
  const showPassword = ref(false)
  const responseMessage = ref('')
  
  function togglePassword() {
    showPassword.value = !showPassword.value
    currentImage.value = showPassword.value ? imageB : imageA
  }
  
  
  onMounted(() => {
    setTimeout(() => { if(userStore.isLoggedIn) setTimeout(() => { window.location.href = '/dashboard'; }, 10)},5000)
  })
  
  async function loginFunc() {
    if (!username.value || !password.value) {
      responseMessage.value = 'Please fill in all fields'
      return
    }

    const requestBody = {
      username: username.value,
      password: MD5(password.value).toString(),
    }
  
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        credentials: 'include',
      })
  
      const data = await response.json()
      if (data.success) {
        responseMessage.value = 'Login successful! Redirecting...'
        setTimeout(() => { window.location.href = '/dashboard'; }, 1000)

      } else {
        responseMessage.value = data.error || data.message || 'Login failed'
      }
    } catch (error) {
      responseMessage.value = `Failed To Fetch Response: ${error}`
    }
  }
  
  
  </script>
  