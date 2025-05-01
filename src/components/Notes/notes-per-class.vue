<template>
  <div class="p-4">
    <!-- Class Select Dropdown -->
    <label for="class-select">Select your class:</label>
      <select
        id="class-select"
        v-model="selectedClass"
        class="border p-2 rounded"
      >
        <option disabled value="">Please select</option>
        <option v-for="className in classList" :key="className" :value="className">
          Class {{ className }}
        </option>
      </select>

    <label for="subject-select">Select Subject:</label>
    <select
      id="subject-select"
      v-model="selectedSub"
      class="border p-2 rounded"
    >
      <option disabled value="">Please select</option>
      <option v-for="subName in subList" :key="subName" :value="subName">
        Subject {{ subName }}
      </option>
    </select>


    <!-- Topic Selection based on Class -->
    <div v-if="notes.length > 0" class="mt-4">
      <h2 class="text-lg font-bold mb-2">Notes for Class {{ selectedClass }}</h2>
      <ul class="list-disc list-inside">
        <li
          v-for="topic in notes"
          :key="topic"
          @click="fetchFile(topic)"
          class="cursor-pointer text-blue-500 underline hover:text-blue-700"
        >
          {{ topic }}
        </li>
      </ul>
    </div>

    <!-- No notes available -->
    <div v-else-if="(selectedClass && selectedSub)" class="mt-4">
      <p>No notes found for Class {{ selectedClass }} and {{ selectedSub }}.</p>
    </div>
  </div>

</template>

<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'

const selectedClass = ref('')
const selectedSub = ref('')
const classList = [8, 9, 10]
const subList = ['Math', 'Science', 'English', 'test'] // Example subjects
const notes = ref([])
const responces = ref('')

// Watch both selectedClass and selectedSub
watch([selectedClass, selectedSub], async ([newClass, newSub]) => {
  if (!newClass || !newSub) return // wait until both are selected

  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/notes/${newClass}/${newSub}`)
    notes.value = response.data.topics || []
    responces.value = response.data
  } catch (error) {
    console.error('Failed to fetch notes:', error)
    notes.value = []
  }
})

</script>
