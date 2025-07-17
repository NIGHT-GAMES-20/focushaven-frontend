<template>
  <div class="question-ask">
    <h2 :class="styles.Headding">Ask a Question</h2>
    <form :class="styles.questionForm">
      <div :class="styles.questionInputDiv">
        <div :class="styles.questionInputTitlesContainer">
          <label for="question" :class="styles.questionInputTitles">Question Title:</label>
          <label :class="styles.lengthDisplay">({{ questionTitle.length }}/100)</label>
        </div>
        <input type="text" id="question" v-model="questionTitle" :class="styles.inputTitleTextInput" maxlength="100" required />
        <span :class="styles.errMsg" v-if="(questionTitle.length < 10 && questionTitle.length != 0)">Question Title must be at least 10 characters long.</span>
      </div>
      <div :class="styles.questionInputDiv">
        <div :class="styles.questionInputTitlesContainer">
          <label for="question" :class="styles.questionInputTitles" >Question Body:</label>
          <label :class="styles.lengthDisplay">({{ questionBody.length }}/800)</label>
        </div>
          <textarea type="text" id="question" v-model="questionBody" :class="styles.inputTextArea" maxlength="800" required />
          <span :class="styles.errMsg" v-if="(questionBody.length < 10 && questionBody.length != 0)">Question body must be at least 10 characters long.</span>
      </div>
      <div :class="styles.questionInputDiv">
        <div :class="styles.questionInputTitlesContainer">
          <label for="question" :class="styles.questionInputTitles" >Question Tags*:</label>
          <label :class="styles.lengthDisplay">({{ questionTags.length }}/800)</label>
        </div>
        <textarea type="text" id="question" v-model="questionTags" :class="styles.inputTextArea" maxlength="800" required />
        <span style="font-size: 15px;margin-top: 5px;">*Tags should be separated by comma</span>
      </div>
      <button type="button" :class=" styles.submitBtn" @click="submit">Submit</button>
    </form>
  </div>
</template>

<script setup>
  import { ref, watch, onMounted } from 'vue';
  import styles from './QuestionAsk.module.css';
  import axios from 'axios';
  import { useUserStore } from '/stores/user.js'

  const questionTitle = ref('');
  const questionBody = ref('');
  const questionTags = ref('');
  const canSubmit = ref(false);
  const userStore = useUserStore();

  watch([questionTitle, questionBody, questionTags], () => {

    if(questionTitle.value.length < 10 || questionBody.value.length < 10 ) 
      canSubmit.value = false;
    else
      canSubmit.value = true;

  });

  onMounted(async () => {
    if (!userStore.isLoggedIn) {
      // Wait until fetchUser has been called at least once
      await userStore.fetchUser();
      if (!userStore.isLoggedIn) {
        alert('You must be logged in to ask a question.');
        window.location.href = '/login';
      }
    }
  });

  async function submit() {
    if( !canSubmit.value ) {
      alert('Please fill out the form correctly before submitting.');
      return;
    }else {
      try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/forum/ask`, {
          title: questionTitle.value,
          body: questionBody.value,
          tags: questionTags.value.split(',').map(tag => tag.trim())
        }, {
          withCredentials: true
        });
        const data = response.data;
        if (data.success) {
          alert('Question submitted successfully!');
          setTimeout(() => {
            window.location.href = '/forum';
          }, 3000);
        } else {
          alert('Failed to submit question: ' + data.message);
        }

      } catch (error) {
        console.error('Error submitting question:', error);
      }
    }
  }

</script>

