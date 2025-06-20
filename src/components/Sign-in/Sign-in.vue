<template>
  <div :class="styles.loginPage">
    <h2>Register</h2>

    <label>
      Name:
      <input v-model="name" type="text" placeholder="Enter Name" :class="styles.usernameInput" />
      <span :class="styles.errMsg">{{ nameErrMsg }}</span>
    </label>

    <label>
      Username:
      <input v-model="username" type="text" placeholder="Enter username" :class="styles.usernameInput" />
      <span :class="styles.errMsg">{{ usernameErrMsg }}</span>
      <span :class="[ isUsernameValid ? styles.otpSendMsg : styles.errMsg]">{{ usernameAlreadyUsedMsg }}</span>
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
      <div :class="styles.passwordRow">
        <input v-if="verifyingEmail" type="text" v-model="EmailOTP" placeholder="Enter OTP" :class="styles.emailOTPInput" :disabled="emailVerificationStatus" maxlength="6" />
        <button v-if="verifyingEmail" type="button" @click="VerifyEmailOTP" :class="[styles.emailOTPVerifyBtn, emailVerificationStatus ? styles.verifiedEmail : '' ]" :disabled="emailVerificationStatus">Verify OTP</button>
      </div>
      <span v-if="verifyingEmail" :class="styles.errMsg">{{ emailOTPErrMsg }}</span>
      <span v-if="verifyingEmail" :class="styles.otpSendMsg">{{ EmailOTPSent }}</span>
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
      <button @click="SignupFunc" :class="styles.loginBtn">Sign Up</button>
    </div>

    <p :class="styles.errMsg">{{ responseMessage }}</p>
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
  const isUsernameValid = ref(false)
  const usernameErrMsg = ref('')
  const usernameAlreadyUsedMsg = ref('')
  const nameErrMsg = ref('')
  const emailErrMsg = ref('')
  const passwordErrMsg = ref('')
  const CNFpasswordErrMsg = ref('')
  const verifyingEmail = ref(false)
  const emailVerificationStatus = ref(false)
  const emailVerificationBtn = ref('Verify')
  const EmailOTP = ref('')
  const EmailOTPSent = ref('')
  const emailOTPErrMsg = ref('')


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
    isUsernameValid.value = await validateUsername(val)
    if (!isUsernameValid.value) {
      usernameAlreadyUsedMsg.value = 'Username already exists'
      return
    } else {
      usernameAlreadyUsedMsg.value = 'Username is available'
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
      nameErrMsg.value = 'Name must contain only alphabets characters'
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

    const checkEmailExistance = await doesEmailExist(val)
    if (!checkEmailExistance) {
      emailErrMsg.value = 'Email already exists'
      return
    }

    // All good
    emailErrMsg.value = ''
  })

  watch(EmailOTP, async () => {
    const val = EmailOTP.value
    emailOTPErrMsg.value = ''
    
    // Character check
    const isValidString = /^[0-9]+$/.test(val)
    if (!isValidString) {
      emailOTPErrMsg.value = 'OTP must contain only numbers'
      return
    }

    // Length checks
    if (val.length !== 6) {
      emailOTPErrMsg.value = 'OTP must be exactly 6 characters long'
      return
    }


    // All good
    emailOTPErrMsg.value = ''
  })

  watch(password, async () => {
    const val = password.value
    passwordErrMsg.value = ''

    // Character check
    const isValidString = validatePasswordString(val)
    if (!isValidString) {
      passwordErrMsg.value = 'Passord must contain at least one lowercase letter, one uppercase letter, one digit, and be at least 8 characters long'
      return
    }

    // All good
    passwordErrMsg.value = ''
  })

  watch(CNFpassword, async () => {
    const val = CNFpassword.value
    CNFpasswordErrMsg.value = ''

    // Character check
    const isValidString = validatePasswordString(val)
    if (!isValidString) {
      CNFpasswordErrMsg.value = 'Passord must contain at least one lowercase letter, one uppercase letter, one digit, and be at least 8 characters long'
      return
    }

    // All good
    CNFpasswordErrMsg.value = ''
  })

  function validatePasswordString(val) {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    // This regex checks for at least one lowercase letter, one uppercase letter, one digit, and a minimum length of 8 characters.
    return re.test(val)
  }
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

  async function doesEmailExist(){

    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/signin/emailValidation`, {
        params: { email: email.value },
      })
      const data = await response.data
      return data.success

    } catch (error) {
      console.error('Error checking email existence:', error)
      return false
    }

  }

  async function validateUsername(username) {
    try{
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/signin/usernameValidation`, {
        params: { username },
      })
      const data = await response.data
      return data.success;
      
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

    if(emailErrMsg.value !== 'Please verify your email before signing up'){
      return
    }

    try{
      emailVerificationStatus.value = false
      emailVerificationBtn.value = 'Resend OTP'
      verifyingEmail.value = true
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/signin/sendEmailOTP`, { email: email.value }, { headers: { 'Content-Type': 'application/json' } })

      if (response.data.success) {
        EmailOTPSent.value = 'OTP sent to your email'
      } else {
        emailOTPErrMsg.value = response.data.message || 'Failed to send OTP'
      }
    }
    catch (error) {
      emailVerificationStatus.value = false
      emailVerificationBtn.value = 'Resend OTP'
      verifyingEmail.value = true
      emailOTPErrMsg.value = `Failed to send OTP: ${error.message}`
      return
    }

    setTimeout(() => {
      EmailOTPSent.value = ''
    }, 3000)
    verifyingEmail.value = true
  }

  async function VerifyEmailOTP(){
    if (!EmailOTP.value) {
      emailOTPErrMsg.value = 'Please enter the OTP'
      return
    }

    if(emailOTPErrMsg.value){
      return
    }

    try{
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/signin/verifyEmailOTP`, { email: email.value, otp: EmailOTP.value }, { headers: { 'Content-Type': 'application/json' } })

      if (response.data.success) {
        emailOTPErrMsg.value = ''
        emailVerificationStatus.value = true
        emailVerificationBtn.value = 'Verified'
        verifyingEmail.value = false
      } else {
        emailOTPErrMsg.value = response.data.message || 'Failed to verify OTP'
        return
      }
    } catch (error) {
      emailOTPErrMsg.value = `Failed to verify OTP: ${error.message}`
      return
    }
    
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
        window.location.href = '/dashboard'
      } 
    } catch(error) {
      console.error('Error checking authentication:', error)
    }
  }
  
  onMounted(() => {
    checkAuth()
  })
  
  async function SignupFunc() {

    if( !name.value || !username.value || !password.value || !CNFpassword.value) {
      responseMessage.value = 'Please fill all the required fields'
      return
    }
    
    if( nameErrMsg.value || usernameErrMsg.value || emailErrMsg.value || passwordErrMsg.value || CNFpasswordErrMsg.value || emailOTPErrMsg.value) {
      responseMessage.value = 'Please fix the errors before signing up'
      return
    }

    if (password.value !== CNFpassword.value) {
      CNFpasswordErrMsg.value = 'Passwords do not match'
      return
    }

    if(email.value && !emailVerificationStatus.value) {
      emailErrMsg.value = 'Please verify your email before signing up'
      return
    }

    const requestBody = {
      name: name.value,
      username: username.value,
      password: MD5(password.value).toString(),
      email: email.value,
    }

    try{
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/signin`, requestBody, { headers: { 'Content-Type': 'application/json' }, withCredentials: true })
      const data = response.data
      if (data.success) {
        isAuthenticated.value = true
        responseMessage.value = `Sign Up successful FHiD: ${data.FHiD}! Redirecting...`
        setTimeout(() => { window.location.href = '/dashboard'; }, 1000)
      } else {
        responseMessage.value = data.error || data.message || 'Sign Up failed'
      }
    } catch (error) {
      console.error('Error during sign up:', error)
      responseMessage.value = 'Sign Up failed. Please try again later.'
    }
    
  }

   
  </script>