<template>
  <div>
    <button :class="styles.askButton" @click="showModal = true"><Reply />Answer</button>

    <div v-if="showModal" :class="styles.modalOverlay">
      <div :class="styles.modalBox">
        <div :class="styles.modalHeader">
          <h2>Post A Answer</h2>
          <button :class="styles.closeBtn" @click="showModal = false">×</button>
        </div>

        <form @submit.prevent="submitQuestion" :class="styles.form">
          <label>
            Answer:
            <input v-model="answer" required />
          </label>

          <button :class="styles.submitBtn" type="submit">Submit</button>
        </form>
      </div>
    </div>  
  </div>
</template>

<script setup>
import { ref,defineProps } from 'vue';
import styles from './Common.module.css';
import { Reply } from 'lucide-vue-next';
import { secureFetch } from '../../../scripts/forumSecureFetch';

const showModal = ref(false);
const answer = ref('')
const props = defineProps({
  quesID: {
    type: String,
    required: true
  }
});

async function submitQuestion() {

  try {
    const res = await secureFetch(`${import.meta.env.VITE_BACKEND_URL}/forum/question/answer/post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({questionID: props.quesID, answer: answer.value})
    });
    const data = await res.json();
    if (data.success) {
      alert('Question submitted!');
      showModal.value = false;
      answer.value = '';
    } else {
      alert(data.error || 'Submission failed');
    }
  } catch (err) {
    console.error(err);
    alert('Something went wrong');
  }
}
</script>
