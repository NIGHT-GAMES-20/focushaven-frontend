<template>
  <div v-if="isAuthenticated && isAdmin">
    <button @click="updateDB">Update Notes DB</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isAuthenticated = ref(false)
const isAdmin = ref(false)

async function checkAuth() {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/login/protected`, {
      method: 'GET',
      credentials: 'include'
    })
    const data = await response.json()
    isAuthenticated.value = !!data.success
    isAdmin.value = data.admin || false
  } catch {
    isAuthenticated.value = false
  }
}

onMounted(() => {
  checkAuth()
  if (!isAuthenticated){
    setTimeout(() => { window.location.href = '/login'; }, 1000)
  }
})

async function updateDB() {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/notes/update`, {
      method: 'POST',
      credentials: 'include'
    })
    const data = await response.json()
    console.log('Update Notes:', data)
  } catch (error) {
    console.error('Failed to update notes:', error)
  }
}
</script>