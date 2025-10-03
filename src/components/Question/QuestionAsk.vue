<template>
  <div>
    <button :class="styles.askButton" @click="showModal = true">Ask a Question</button>

    <Notification ref="notifyRef" />
    <div v-if="showModal" :class="styles.modalOverlay">
      <div :class="styles.modalBox">
        <div :class="styles.modalHeader">
          <h2>Ask a Question</h2>
          <button :class="styles.closeBtn" @click="showModal = false">×</button>
        </div>

        <form @submit.prevent="submitQuestion" :class="styles.form">
          <label>
            Title:
            <input v-model="title" required />
          </label>

          <label>
            Body:
            <textarea v-model="body" required />
          </label>

          <label>
            Tags (comma-separated):
            <input v-model="tags" />
          </label>

          <button :class="styles.submitBtn" type="submit">Submit</button>
        </form>
        <small style="font-size: 0.70rem; color: #777; margin-top:10px ; display: flex; flex-direction: row; ;justify-content: center;" >
          UI Inspired by
          <a style="margin-top: -3px ;" href="https://www.ux4g.gov.in/" > 
            <img width="35" style="margin-left: 4px;" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEiIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCA1MSAxNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzQzNzhfMjA2KSI+CjxwYXRoIGQ9Ik03LjgyNzE5IDAuNDA4MjAzSDExLjI5MlY4Ljc1NzMxQzExLjI5MiA5Ljc1MDAzIDExLjA1OTQgMTAuNjA5MSAxMC41OTQxIDExLjMzNDVDMTAuMTMyOSAxMi4wNTU4IDkuNDg4OTYgMTIuNjEzNiA4LjY2MjI3IDEzLjAwODJDNy44MzU1MiAxMy4zOTg1IDYuODc1ODQgMTMuNTkzNiA1Ljc4MzI0IDEzLjU5MzZDNC42ODIyOCAxMy41OTM2IDMuNzE4NDUgMTMuMzk4NSAyLjg5MTcyIDEzLjAwODJDMi4wNjQ5OCAxMi42MTM2IDEuNDIxMDQgMTIuMDU1OCAwLjk1OTg5OCAxMS4zMzQ1QzAuNTAyOTA5IDEwLjYwOTEgMC4yNzQ0MTQgOS43NTAwMyAwLjI3NDQxNCA4Ljc1NzMxVjAuNDA4MjAzSDMuNzM5MjJWOC40NTE4M0MzLjczOTIyIDguODU0ODcgMy44MjY0NyA5LjIxNTQ1IDQuMDAwOTUgOS41MzM2NEM0LjE3NTQ0IDkuODQ3NTggNC40MTY0IDEwLjA5MzYgNC43MjM4MyAxMC4yNzE4QzUuMDM1NDEgMTAuNDUgNS4zODg1NCAxMC41MzkxIDUuNzgzMjQgMTAuNTM5MUM2LjE4MjAyIDEwLjUzOTEgNi41MzUxOSAxMC40NSA2Ljg0MjYxIDEwLjI3MThDNy4xNTAwNCAxMC4wOTM2IDcuMzkxIDkuODQ3NTggNy41NjU1IDkuNTMzNjRDNy43Mzk5NCA5LjIxNTQ1IDcuODI3MTkgOC44NTQ4NyA3LjgyNzE5IDguNDUxODNWMC40MDgyMDNaTTE2LjY1MjggMC40MDgyMDNMMTguNzQ2NyA0LjIwMDkzSDE4Ljg0NjRMMjAuOTY1MSAwLjQwODIwM0gyNC44Mjg4TDIxLjAxNSA2LjkyNDU1TDI0Ljk3ODMgMTMuNDQwOUgyMS4wMTVMMTguODQ2NCA5LjU3MTgzSDE4Ljc0NjdMMTYuNTc4IDEzLjQ0MDlIMTIuNjM5NkwxNi41NTMxIDYuOTI0NTVMMTIuNzY0MyAwLjQwODIwM0gxNi42NTI4WiIgZmlsbD0iIzE5MzdCMiIvPgo8cGF0aCBkPSJNMjYuMjIxNyAxMS40MDM5VjguNjU0OEwzMS4zNTY2IDAuNDA3NTUySDMzLjc5OTRWNC4wNzMwMUgzMi40MDM1TDI5LjYzNjcgOC41NTI5OVY4LjY1NDhIMzcuMjE0M1YxMS40MDM5SDI2LjIyMTdaTTMyLjQyODQgMTMuNDQwM1YxMC41NjM5TDMyLjUwMzIgOS4zNjc1N1YwLjQwNzU1MkgzNS43NDM3VjEzLjQ0MDNIMzIuNDI4NFpNNDYuOTMxMSA0LjcwOTM3QzQ2Ljg3NzEgNC40ODQ1MiA0Ni43OTE5IDQuMjg3MjUgNDYuNjc1NiA0LjExNzU1QzQ2LjU1OTMgMy45NDM2MSA0Ni40MTM4IDMuNzk3MjUgNDYuMjM5MyAzLjY3ODQ2QzQ2LjA2OSAzLjU1NTQzIDQ1Ljg2OTYgMy40NjQyMiA0NS42NDExIDMuNDA0ODJDNDUuNDE2OCAzLjM0MTE5IDQ1LjE2OTYgMy4zMDkzNyA0NC44OTk1IDMuMzA5MzdDNDQuMzE3OSAzLjMwOTM3IDQzLjgyMTUgMy40NTE0OSA0My40MTAyIDMuNzM1NzNDNDMuMDAzIDQuMDE5OTggNDIuNjkxNCA0LjQyOTM3IDQyLjQ3NTQgNC45NjM5MkM0Mi4yNjM1IDUuNDk4NDYgNDIuMTU3NiA2LjE0MzMxIDQyLjE1NzYgNi44OTg0N0M0Mi4xNTc2IDcuNjYyMDkgNDIuMjU5NCA4LjMxNTQ0IDQyLjQ2MyA4Ljg1ODQ3QzQyLjY2NjUgOS40MDE1IDQyLjk2OTggOS44MTcyNSA0My4zNzI4IDEwLjEwNThDNDMuNzc1OCAxMC4zOTQyIDQ0LjI3NjQgMTAuNTM4NSA0NC44NzQ2IDEwLjUzODVDNDUuNDAyMiAxMC41Mzg1IDQ1Ljg0MDYgMTAuNDYgNDYuMTg5NSAxMC4zMDNDNDYuNTQyNyAxMC4xNDYgNDYuODA2NCA5LjkyMzMxIDQ2Ljk4MDkgOS42MzQ4QzQ3LjE1NTQgOS4zNDYzNCA0Ny4yNDI3IDkuMDA2OTMgNDcuMjQyNyA4LjYxNjY2TDQ3Ljg0MDkgOC42ODAyOEg0NC45MjQ1VjYuMTYwMjhINTAuNTgyOFY3Ljk2NzU3QzUwLjU4MjggOS4xNTU0NCA1MC4zMzU2IDEwLjE3MTUgNDkuODQxMyAxMS4wMTU4QzQ5LjM1MTEgMTEuODU1OCA0OC42NzM5IDEyLjUwMDYgNDcuODA5OCAxMi45NTAzQzQ2Ljk0OTggMTMuMzk1OCA0NS45NjMxIDEzLjYxODUgNDQuODQ5NyAxMy42MTg1QzQzLjYwNzUgMTMuNjE4NSA0Mi41MTY5IDEzLjM0OTEgNDEuNTc4MSAxMi44MTAzQzQwLjYzOTIgMTIuMjcxNSAzOS45MDU5IDExLjUwMzYgMzkuMzc4MyAxMC41MDY3QzM4Ljg1NDggOS41MDk3IDM4LjU5MzEgOC4zMjM4OSAzOC41OTMxIDYuOTQ5MzdDMzguNTkzMSA1Ljg3MTc3IDM4Ljc1MyA0LjkxNzI1IDM5LjA3MjkgNC4wODU3M0MzOS4zOTcgMy4yNTQyMiAzOS44NDU2IDIuNTUyMSA0MC40MTkgMS45NzkzN0M0MC45OTIzIDEuNDAyNCA0MS42NTQ5IDAuOTY3NTUxIDQyLjQwNjkgMC42NzQ4MjJDNDMuMTU4OCAwLjM3Nzg1NSA0My45NjQ4IDAuMjI5MzcgNDQuODI0OCAwLjIyOTM3QzQ1LjU4MDkgMC4yMjkzNyA0Ni4yODMgMC4zMzk2NzMgNDYuOTMxMSAwLjU2MDI4QzQ3LjU4MzMgMC43NzY2NDEgNDguMTU4NyAxLjA4NjM0IDQ4LjY1NzIgMS40ODkzN0M0OS4xNTk5IDEuODg4MTYgNDkuNTY1IDIuMzYxMTkgNDkuODcyNCAyLjkwODQ2QzUwLjE3OTggMy40NTU3MyA1MC4zNjY4IDQuMDU2MDMgNTAuNDMzMyA0LjcwOTM3SDQ2LjkzMTFaIiBmaWxsPSIjQTA2NkNDIi8+CjwvZz4KPGRlZnM+CjxjbGlwUGF0aCBpZD0iY2xpcDBfNDM3OF8yMDYiPgo8cmVjdCB3aWR0aD0iNTEiIGhlaWdodD0iMTQiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg==" />
          </a>
        </small>
      </div>
    </div>  
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue';
import styles from './QuestionAsk.module.css';
import Notification from "../Asset-Componets/Notification.vue";
import {formatTime} from '../../scripts/UtilityFunc.js';

const showModal = ref(false);
const title = ref('');
const body = ref('');
const tags = ref('');
const notifyRef = ref(null);
const emit = defineEmits(['question-asked']);

async function submitQuestion() {
  const payload = {
    title: title.value,
    body: body.value,
    tags: tags.value.split(',').map(tag => tag.trim()),
  };

  try {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/forum/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      notifyRef.value.addNotification({ title: 'Success', message: 'Question submitted successfully', type: 'success' });
      showModal.value = false;
      title.value = '';
      body.value = '';
      tags.value = '';
      emit('question-asked');
    } else {
      const details = data.retryAfter ? {"Retry After ":formatTime(data.retryAfter)} : null
      notifyRef.value.addNotification({ title: 'Error', message: data.message || 'Submission failed', details: details , type: 'info' });
      showModal.value = false;
      title.value = '';
      body.value = '';
      tags.value = '';
    }
  } catch (err) {
    console.error(err);
    notifyRef.value.addNotification({ title: 'Error', message: 'An error occurred during submission', type: 'error' });
    showModal.value = false;
    title.value = '';
    body.value = '';
    tags.value = '';
  }
}
</script>
