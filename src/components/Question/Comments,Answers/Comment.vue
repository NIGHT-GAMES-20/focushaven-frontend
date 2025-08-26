<template>
  <div>
    <button :class="styles.askButton" @click="showModal = true"><Reply />Post A Comment</button>

    <div v-if="showModal" :class="styles.modalOverlay">
      <div :class="styles.modalBox">
        <div :class="styles.modalHeader">
          <h2>Ask a Question</h2>
          <button :class="styles.closeBtn" @click="showModal = false">×</button>
        </div>

        <form @submit.prevent="submitQuestion" :class="styles.form">
          <label>
            Comment:
            <input v-model="comment" required />
          </label>

          <button :class="styles.submitBtn" type="submit">Submit</button>
        </form>
      </div>
    </div>  
  </div>
</template>

<script setup>
import { ref } from 'vue';
import styles from './Common.module.css';
import { Reply } from 'lucide-vue-next';

const showModal = ref(false);
const comment = ref('')

async function submitQuestion() {

  try {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/forum/question/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({comment: comment.value})
    });
    const data = await res.json();
    if (data.success) {
      alert('Question submitted!');
      showModal.value = false;
      comment.value = '';
    } else {
      alert(data.error || 'Submission failed');
    }
  } catch (err) {
    console.error(err);
    alert('Something went wrong');
  }
}
</script>
