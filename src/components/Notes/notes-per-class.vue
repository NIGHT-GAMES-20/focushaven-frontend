<template>
  <div class="p-4">
    <!-- Class Select Dropdown -->
    <label for="class-select">Select your class:</label>
    <select
      id="class-select"
      v-model="selectedClass"
      @change="fetchNotes"
      class="border p-2 rounded"
    >
      <option disabled value="">Please select</option>
      <option v-for="className in classList" :key="className" :value="className">
        Class {{ className }}
      </option>
    </select>

    <!-- Topic Selection based on Class -->
    <div v-if="notes.length > 0" class="mt-4">
      <h2 class="text-lg font-bold mb-2">Notes for Class {{ selectedClass }}</h2>
      <ul class="list-disc list-inside">
        <li
          v-for="topic in notes"
          :key="topic"
          @click="fetchFile(topic)" <!-- Placeholder function for future file handling -->
          class="cursor-pointer text-blue-500 underline hover:text-blue-700"
        >
          {{ topic }}
        </li>
      </ul>
    </div>

    <!-- No notes available -->
    <div v-else-if="selectedClass" class="mt-4">
      <p>No notes found for Class {{ selectedClass }}.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const selectedClass = ref('') // Track selected class
const classList = [8, 9, 10] // Static classes
const notes = ref([]) // List of topic names (array)

// Fetch topics based on selected class
const fetchNotes = async () => {
  if (!selectedClass.value) return

  try {
    // Fetch topics for the selected class from the backend
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/notes/${selectedClass.value}`)
    notes.value = response.data.topics || []
  } catch (error) {
    console.error('Failed to fetch notes:', error)
    notes.value = []
  }
}

// Placeholder function for fetching the file (to be added later)
const fetchFile = (topic) => {
  console.log(`Fetching file for topic: ${topic}`)
  // Add file fetching logic here later
}
</script>
