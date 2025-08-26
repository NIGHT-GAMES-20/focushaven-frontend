<template>
  <div :class="styles.questionPage">
    <!-- Question Header -->
    <div :class="styles.questionHeader">
      <div :class="styles.actions">
        <h1>{{ question.title }}</h1>
        <button @click="likeQuestion">
          <ThumbsUp :size="4"/> {{ question.Likes }}
        </button>
      </div>
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

    <!-- Answers Section -->
    <div :class="styles.answersSection">
      <div :class="styles.actions">
        <h2>Answers</h2>
        <button @click="startAnswering">
          <Reply /> Post Answer
        </button>
      </div>
      <div :class="styles.emptyState">
        <MessageCircleQuestionMark  /> 
        <span>No answers yet. Be the first to share your knowledge!</span>
      </div>
    </div>

    <!-- Comments Section -->
    <div :class="styles.commentsSection">
      <div :class="styles.actions">
        <h3>Comments</h3>
        <button @click="startAnswering" >
          <Reply /> Post a Comment
        </button>
      </div>
      <div :class="styles.emptyState">
        <MessageSquare />
        <span>No comments yet. Start the conversation!</span>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { secureFetch } from '../../scripts/forumSecureFetch';
  import { MessageCircleQuestionMark, MessageSquare, Reply, ThumbsUp  } from 'lucide-vue-next';
  import { useUserStore } from '../../stores/userStore';
  import styles from './questionView.module.css';

  const route = useRoute();
  const routeId = route.params.id;
  const userStore = useUserStore();

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
    if (!userStore.isLoggedIn) {
      alert('Please log in to like the question.');
      return;
    }

    try{
      const response = secureFetch( `${import.meta.env.VITE_BACKEND_URL}/forum/question/like`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ questionId: routeId })
      });

      const data = response.json();
      if (data.success) {
        question.value.Likes = data.Likes;
      } else {
        alert(data.error || 'Failed to like the question.');
      }

    } catch (error) {
      alert('Failed to like the question. Please try again.');
      console.error('Error liking question:', error);
    }

  }

  function startAnswering() {
    alert('Answer form coming soon!');
  }

  onMounted(fetchData);

</script>