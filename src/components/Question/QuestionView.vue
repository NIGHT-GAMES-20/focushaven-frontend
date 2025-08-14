<template>
  <div :class="styles.questionPage">
    <!-- Question Header -->
    <div :class="styles.questionHeader">
      <h1>{{ question.title }}</h1>
      <div :class="styles.meta">
        <span>Asked by <strong>{{ question.user }}</strong></span>
        <span>• {{ formatDate(question.CreatedAt) }}</span>
      </div>
      <div :class="styles.tags">
        <span v-for="tag in question.tags" :key="tag" :class="styles.tag">{{ tag }}</span>
      </div>
    </div>

    <!-- Question Body -->
    <div :class="styles.questionBody">
      <p>{{ question.body }}</p>
    </div>

    <!-- Actions -->
    <div :class="styles.actions">
      <button @click="likeQuestion"><ThumbsUp/> Like ({{ question.Likes }})</button>
      <button @click="startAnswering">✏ Answer</button>
    </div>

    <!-- Answers Section -->
    <div :class="styles.answersSection">
      <h2>Answers</h2>
      <p>No answers yet. Be the first to answer!</p>
    </div>

    <!-- Comments Section -->
    <div :class="styles.commentsSection">
      <h3>Comments</h3>
      <p>No comments yet.</p>
    </div>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { secureFetch } from '../../scripts/forumSecureFetch';
  import styles from './questionView.module.css';
  import { ThumbsUp } from 'lucide-vue-next';

  const route = useRoute();
  const routeId = route.params.id;
  const question = ref({
    title: '',
    body: '',
    tags: [],
    user: '',
    CreatedAt: '',
    Likes: 0
  });

  async function fetchData() {
    try {
      const response = await secureFetch(
        `${import.meta.env.VITE_BACKEND_URL}/forum/question/data/${routeId}`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      );
      const data = await response.json();
      if (data.success) {
        question.value = data.question;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleString();
  }

  function likeQuestion() {
    // Placeholder logic
    question.value.Likes++;
  }

  function startAnswering() {
    alert('Answer form coming soon!');
  }

  onMounted(fetchData);

</script>