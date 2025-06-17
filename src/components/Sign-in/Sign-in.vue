<template>
  <div :class="styles.loginPage">
    <h2>Sign In</h2>

    <label>
      Name:
      <input v-model="name" type="text" placeholder="Enter Name" :class="styles.usernameInput" />
      <span :class="styles.errMsg">{{ nameErrMsg }}</span>
    </label>

    <label>
      Username:
      <input v-model="username" type="text" placeholder="Enter username" :class="styles.usernameInput" />
      <span :class="styles.errMsg">{{ usernameErrMsg }}</span>
    </label>

    <label>
      <span>
        Email (Optional) 
        <span :class="styles.tooltipContainer">
          ⓘ:
          <span :class="styles.tooltipText">Account Rcovery Will Not Be Available If Email is not Added</span>
        </span>
      </span>
      <div :class="styles.passwordRow">
        <input v-model="email" type="email" placeholder="Enter Email" :class="styles.passwordInput" :disabled="emailVerificationStatus" />
        <button type="button" @click="VerifyEmail" :class="[styles.emailVerifyBtn, emailVerificationStatus ? styles.verifiedEmail : '' ]" :disabled="emailVerificationStatus" >{{ emailVerificationBtn }}</button>
      </div> 
      <span :class="styles.errMsg">{{ emailErrMsg }}</span>
    </label>

    <label>
      Password:
      <div :class="styles.passwordRow">
        <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="Enter password" :class="styles.passwordInput"/>
        <button type="button" @click="togglePassword" :class="styles.viewPassBtn">
          <img :src="currentImage" alt="Toggle Password" :class="styles.viewPassImg" />
        </button>
      </div>
      <span :class="styles.errMsg">{{ passwordErrMsg }}</span>
    </label>

    <label>
      Confirm Password:
      <div :class="styles.passwordRow">
        <input :type="showPassword ? 'text' : 'password'" v-model="CNFpassword" placeholder="Enter password" :class="styles.passwordInput"/>
      </div>
      <span :class="styles.errMsg">{{ CNFpasswordErrMsg }}</span>
    </label>

    <div :class="styles.buttonRow">
      <button @click="loginFunc" :class="styles.loginBtn">Login</button>
    </div>

    <p style="margin-top: 20px;">{{ responseMessage }}</p>
  </div>
</template>

  
<script setup>
  import { ref, onMounted, watch } from 'vue'
  import MD5 from 'crypto-js/md5'
  import imageA from './assets/view.png'
  import imageB from './assets/hide.png'
  import styles from './Sign-in.module.css'
  import axios from 'axios'

  const currentImage = ref(imageA)
  
  const name = ref('')
  const email = ref('')
  const CNFpassword = ref('')
  const username = ref('')
  const password = ref('')
  const showPassword = ref(false)
  const responseMessage = ref('')
  const isAuthenticated = ref(false)
  const usernameErrMsg = ref('')
  const nameErrMsg = ref('')
  const emailErrMsg = ref('')
  const passwordErrMsg = ref('')
  const CNFpasswordErrMsg = ref('')
  const emailVerificationStatus = ref(false)
  const emailVerificationBtn = ref('Verify')


  watch(username, async () => {
    const val = username.value
    usernameErrMsg.value = ''

    // Character check
    const isValidString = validateUsernameString(val)
    if (!isValidString) {
      usernameErrMsg.value = 'Username must contain only alphanumeric characters and underscores'
      return
    }


    // Length checks
    if (val.length < 3) {
      usernameErrMsg.value = 'Username must be at least 3 characters long'
      return
    }

    if (val.length > 20) {
      usernameErrMsg.value = 'Username must be less than 20 characters long'
      return
    }

    // Availability check
    const isAvailable = await validateUsername(val)
    if (!isAvailable) {
      usernameErrMsg.value = 'Username already in use'
      return
    }

    // All good
    usernameErrMsg.value = ''
  })

  //Name validation
  watch(name, async () => {
    const val = name.value
    nameErrMsg.value = ''

    // Character check
    const isValidString = validateNameString(val)
    if (!isValidString) {
      nameErrMsg.value = 'Name must contain only alphanumeric characters'
      return
    }

    // Length checks
    if (val.length < 3) {
      nameErrMsg.value = 'Name must be at least 3 characters long'
      return
    }

    // All good
    nameErrMsg.value = ''
  })

  // Email validation
  watch(email, async () => {
    const val = email.value
    emailErrMsg.value = ''

    // Character check
    const isValidString = validateEmailString(val)
    if (!isValidString) {
      emailErrMsg.value = 'Enter A Valid Email Address'
      return
    }

    // Length checks
    if (val.length < 3) {
      emailErrMsg.value = 'Email must be at least 3 characters long'
      return
    }

    // All good
    emailErrMsg.value = ''
  })


  function validateEmailString(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  function validateUsernameString(val) {
    return /^[a-zA-Z0-9_]+$/.test(val)
  }

  function validateNameString(val) {
    return /^[a-zA-Z ]+$/.test(val)
  }

  async function validateUsername(username) {
    try{
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/signin/usernameValidation`, {
        params: { username },
      })
      const data = await response.json()
      if (data.success) {
        return data.isAvailable
      }
    } catch (error) {
      console.error('Error validating username:', error)
      return false
    }  
  }

  async function VerifyEmail() {
    if (!email.value) {
      emailErrMsg.value = 'Please enter an email address'
      return
    }

    emailVerificationStatus.value = true
    emailVerificationBtn.value = 'Verified'
  }
  
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