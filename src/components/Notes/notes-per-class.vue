<template>
  <div :class="styles.mainSelectDiv">
    <!-- Class Select Dropdown -->
    <div :class="styles.selectDiv">
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
    </div>

    <div :class="styles.selectDiv">
      <label for="subject-select">Select Subject:</label>
      <select
        id="subject-select"
        v-model="selectedSub"
        class="border p-2 rounded"
      >
        <option disabled value="">Please select</option>
        <option v-for="subName in subList" :key="subName.name" :value="subName.code">
          Subject {{ subName.name }}
        </option>
      </select>
    </div>
  </div>
    
  <div>
    <!-- Topic Selection based on Class -->
    <div v-if="notes.length > 0" :class="styles.notesListDiv">
      <div :class="styles.notesHeading" >Notes for Class {{ selectedClass }}</div>
      <ul class="list-disc list-inside">
        <li
          v-for="topic in notes"
          :key="topic"
          :class="styles.noteItem"
          @click="fetchFile(topic)"
          class="cursor-pointer text-blue-500 underline hover:text-blue-700"
        >
          {{ topic }}
        </li>
      </ul>
    </div>

    <!-- No notes available -->
    <div v-else-if="(selectedClass && selectedSub)" :class="styles.emptyState">
      <p>No notes found for Class {{ selectedClass }} and {{ selectedSub }}.</p>
    </div>
  </div>

</template>

<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'
import styles from './notes-per-class.module.css'

const selectedClass = ref('')
const selectedSub = ref('')
const classList = [8, 9, 10]
const subList = [
  { name: 'English', code: 'eng' },
  { name: 'Physics', code: 'phy' },
  { name: 'Chemistry', code: 'chem' },
  { name: 'Biology', code: 'bio' },
  { name: 'Computer Science', code: 'cs' },
  { name: 'History', code: 'hist' },
  { name: 'Geography', code: 'geo' },
  { name: 'Mathematics', code: 'math' },
 
];

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
