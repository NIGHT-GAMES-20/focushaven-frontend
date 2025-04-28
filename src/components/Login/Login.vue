<template>
  <div :class="styles.loginPage">
    <h2>Login Page</h2>

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

    <p style="margin-top: 20px;">{{ responseMessage }}</p>
  </div>
</template>

  
<script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import MD5 from 'crypto-js/md5'
  import imageA from './assets/view.png'
  import imageB from './assets/hide.png'
  import styles from './login.module.css'

  const currentImage = ref(imageA)
  
  const username = ref('')
  const password = ref('')
  const showPassword = ref(false)
  const responseMessage = ref('Testing...')
  const isAuthenticated = ref(false)
  const router = useRouter()
  
  function togglePassword() {
    showPassword.value = !showPassword.value
    currentImage.value = showPassword.value ? imageB : imageA
  }
  
  async function checkAuth() {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/login/protected`, {
        method: 'GET',
        credentials: 'include',
      })
      const data = await response.json()
      if (data.success) {
        isAuthenticated.value = true
        responseMessage.value = data.user.username
      } else {
        isAuthenticated.value = false
      }
    } catch {
      isAuthenticated.value = false
    }
  }
  
  onMounted(() => {
    checkAuth()
  })
  
  async function loginFunc() {
    if (!username.value || !password.value) {
      responseMessage.value = 'Please fill in all fields'
      return
    }
  
    responseMessage.value = 'Trying...'
  
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
        isAuthenticated.value = true
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
  