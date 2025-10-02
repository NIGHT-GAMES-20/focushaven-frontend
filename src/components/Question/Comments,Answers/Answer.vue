<template>
  <div>
    <button :class="styles.askButton" @click="showModal = true"><Reply />Answer</button>

    <Notification ref="notifyRef" />
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
import Notification from "../../Asset-Componets/Notification.vue";

const showModal = ref(false);
const answer = ref('')
const notifyRef = ref(null);
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
      notifyRef.value.addNotification({ title: 'Success', message: 'Answer submitted successfully', type: 'success' });
      showModal.value = false;
      answer.value = '';
    } else {
      const details = data.retryAfter ? {"Retry After :":data.retryAfter} : null
      notifyRef.value.addNotification({ title: 'Error', message: data.message || 'Submission failed', details: details , type: 'info' });
      showModal.value = false;
      answer.value = '';
    }
  } catch (err) {
    console.error(err);
    notifyRef.value.addNotification({ title: 'Error', message: 'An error occurred during submission', type: 'error' });
    showModal.value = false;
    answer.value = '';
  }
}
</script>
