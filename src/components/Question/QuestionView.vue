<template>
  <div v-if="isLoading" :class="styles.questionPage" style="display: flex; justify-content: space-around;">
    <div style="display: flex; flex-direction: row; margin-top: 20px;"><div :class="styles.spinner" style="margin-left:10px; margin-right: 10px;"></div>Loading, Please Wait...</div>
  </div>
  <div v-else :class="styles.questionPage">
    <!-- Question Header -->
    <div :class="styles.questionHeader">
      <div :class="styles.actions">
        <h1>{{ question.title }}</h1>
        <button @click="likeQuestion">
          <ThumbsUp :size="20"/> {{ question.Likes }}
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
        <Answer :quesID="routeId" />
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
        <Comment :quesID="routeId" />
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
  import { secureFetch, getValidToken } from '../../scripts/forumSecureFetch';
  import { MessageCircleQuestionMark, MessageSquare, ThumbsUp  } from 'lucide-vue-next';
  import { useUserStore } from '/stores/user.js'
  import styles from './questionView.module.css';
  import Answer from './Comments,Answers/Answer.vue';
  import Comment from './Comments,Answers/Comment.vue';

  const route = useRoute();
  const routeId = route.params.id;
  const userStore = useUserStore()
  const isLoading = ref(false);

  const question = ref({
    title: '',
    body: '',
    tags: [],
    user: '',
    CreatedAt: '',
    Likes: 0
  });

  async function fetchData() {
    isLoading.value = true;
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
    }finally {
      isLoading.value = false;
    }
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleString();
  }

  async function likeQuestion() {
    if (!userStore.isLoggedIn) {
      alert('Please log in to like the question.');
      return;
    }

    try{
      const response = await secureFetch( `${import.meta.env.VITE_BACKEND_URL}/forum/question/like`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ questionID: routeId })
      });

      const data = await response.json();
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

  onMounted(async () => {
    await getValidToken();
    fetchData();
  });

</script>