<template>
  <div v-if="isLoading" :class="styles.questionPage" style="display: flex; justify-content: space-around;">
    <div style="display: flex; flex-direction: row; margin-top: 20px;"><div :class="styles.spinner" style="margin-left:10px; margin-right: 10px;"></div>Loading, Please Wait...</div>
  </div>
  <div v-else :class="styles.questionPage">
    <!-- Question Header -->
    <div :class="styles.questionHeader">
      <div :class="styles.actions">
        <h1>{{ question.title }}</h1>
        <LikeBtn :liked="hasUserLiked" :loading="isLiking" :likesCount="question.Likes" @click="likeQuestion" style="margin-top: 5px;"/>
        <SquarePen v-if="question.user === userStore.user.username" @click="openEditModal" :size="24" :class="styles.userActions" />
        <Trash2 v-if="question.user === userStore.user.username || userStore.isAdmin" color="red" @click="showDeleteModal = true" :size="24" :class="styles.userActions" />
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

    <!-- Desktop Comments Section -->
    <div :class="[styles.commentsSection, styles.desktopOnly]">
      <div :class="styles.actions">
        <h3>Comments</h3>
        <Comment :quesID="routeId" />
      </div>
      <div :class="styles.emptyState">
        <MessageSquare />
        <span>No comments yet. Start the conversation!</span>
      </div>
    </div>

    <!-- Mobile Comments Button -->
    <div :class="[styles.mobileCommentsBtn, styles.mobileOnly]">
      <button @click="openCommentModal" :class="styles.commentButton">
        <MessageSquare :size="20" />
        View Comments
      </button>
    </div>

    <!-- Modal Overlay -->
    <div 
      v-if="isCommentModalOpen" 
      :class="styles.CommentsModalOverlay" 
      @click="closeCommentModal"
    >
      <!-- Comment Modal Window -->
      <div 
        :class="styles.commentModal" 
        @click.stop
      >
        <div :class="styles.modalHeader">
          <h3>Comments</h3>
          <button @click="closeCommentModal" :class="styles.closeBtn">
            ×
          </button>
        </div>
        <div :class="styles.modalContent">
          <Comment :quesID="routeId" />
          <div :class="styles.emptyState">
            <MessageSquare />
            <span>No comments yet. Start the conversation!</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div v-if="showDeleteModal" :class="styles.modalOverlay">
    <div :class="styles.modalBox">
      <h2 :class="styles.modalTitle">Confirm Delete</h2>
      <p :class="styles.modalMessage">Are you sure you want to delete this item? This action cannot be undone.</p>

      <div :class="styles.modalActions">
        <button :class="styles.cancelBtn" @click="showDeleteModal = false">Cancel</button>
        <button :class="styles.confirmBtn" @click="confirmDelete">Yes, Delete</button>
      </div>
    </div>
  </div>
  <!-- Edit Modal -->
  <div v-if="showEditModal" :class="styles.modalOverlay">
    <div :class="styles.modalBox">
      <h2 :class="styles.modalTitle">Edit Question</h2>

      <form @submit.prevent="saveEdit">
        <label :class="styles.formLabel">
          Title:
          <input v-model="editTitle" type="text" :class="styles.input" required />
        </label>

        <label :class="styles.formLabel">
          Body:
          <textarea v-model="editBody" :class="styles.textarea" required></textarea>
        </label>

        <label :class="styles.formLabel">
          Tags (comma separated):
          <input v-model="editTags" type="text" :class="styles.input" />
        </label>

        <div :class="styles.modalActions">
          <button type="button" :class="styles.cancelBtn" @click="showEditModal = false">Cancel</button>
          <button type="submit" :class="styles.confirmBtn">Save</button>
        </div>
      </form>
    </div>
  </div>
  <Notification ref="notifyRef" />
</template>

<script setup>
  import { onMounted, ref, computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { secureFetch, getValidToken } from '../../scripts/forumSecureFetch';
  import { MessageCircleQuestionMark, MessageSquare, Trash2, SquarePen } from 'lucide-vue-next';
  import { useUserStore } from '/stores/user.js'
  import styles from './questionView.module.css';
  import Answer from './Comments,Answers/Answer.vue';
  import Comment from './Comments,Answers/Comment.vue';
  import LikeBtn from '../Asset-Componets/LikeBtn.vue';
  import Notification from '../Asset-Componets/Notification.vue';

  const route = useRoute();
  const routeId = route.params.id;
  const userStore = useUserStore()
  const isLoading = ref(false);
  const isLiking = ref(false); 
  const isCommentModalOpen = ref(false);
  const showDeleteModal = ref(false);
  const notifyRef = ref(null);
  const editTitle = ref('');
  const editBody = ref('');
  const editTags = ref('');
  const showEditModal = ref(false);


  const  hasUserLiked = computed(() => {
    return userStore.isLoggedIn && question.value.Likers.includes(userStore.FHiD);
  });
  
  const question = ref({
    title: '',
    body: '',
    tags: [],
    user: '',
    CreatedAt: '',
    Likes: 0,
    Likers: [],
  });

  function openCommentModal() {
    isCommentModalOpen.value = true;
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }

  function closeCommentModal() {
    isCommentModalOpen.value = false;
    // Restore body scroll
    document.body.style.overflow = 'auto';
  }

  async function fetchData() {
    isLoading.value = true;
    try {
      const response = await secureFetch(
        `${import.meta.env.VITE_BACKEND_URL}/forum/question/data/${routeId}`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      );
      const data = await response.json();
      if (data.success) {
        question.value = {
          ...question.value,   // keep existing defaults
          ...data.question,    // overwrite with backend data
          Likers: data.question?.Likers || [], // ensure array
        };
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
    if (isLiking.value) return; // Prevent multiple clicks
    isLiking.value = true;
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
        question.value.Likers = data.Likers || [];
      } else {
        alert(data.error || 'Failed to like the question.');
      }

    } catch (error) {
      alert('Failed to like the question. Please try again.');
      console.error('Error liking question:', error);
    }finally {
      isLiking.value = false;
    }
  }



  async function confirmDelete() {
    try{
        const response = await secureFetch( `${import.meta.env.VITE_BACKEND_URL}/forum/question/delete/${routeId}`, { 
          method: 'POST', 
          credentials: 'include' 
        });
        const data = await response.json();
        if (data.success) {
          notifyRef.value.showNotification({title: 'Success', message: 'Question deleted successfully.', type: 'success'});
          setTimeout(() => {
            window.location.href = '/forum'; // Redirect after a short delay
          }, 1500);
        } else {
          notifyRef.value.showNotification({title: 'Error', message: data.message || 'Failed to delete question.', type: 'error'});
        }
    } catch (error) {
        console.error('Error deleting question:', error);
        notifyRef.value.showNotification({title: 'Error', message: 'An error occurred while deleting the question.', type: 'error'});
    } finally {
        showDeleteModal.value = false;
    }
  }

  // Pre-fill with existing question data
  function openEditModal() {
    editTitle.value = question.value.title;
    editBody.value = question.value.body;
    editTags.value = question.value.tags.join(', ');
    showEditModal.value = true
  }

  async function saveEdit() {
  console.log("Edited Question:", {
    title: editTitle.value,
    body: editBody.value,
    tags: editTags.value.split(',').map(tag => tag.trim())
  })

  try{
    const response = await secureFetch( `${import.meta.env.VITE_BACKEND_URL}/forum/question/edit/${routeId}`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        title: editTitle.value,
        body: editBody.value,
        tags: editTags.value.split(',').map(tag => tag.trim())
      })
    });
    const data = await response.json();
    if (data.success) {
      notifyRef.value.showNotification({title: 'Success', message: 'Question edited successfully.', type: 'success'});
      fetchData(); // Refresh question data
    } else {
      if (!data.error) {
        harmScore=(data.harmScore || 0).toFixed(2);
        notifyRef.value.showNotification({title: 'Warning', message: data.message ,details: {"Harm Score":harmScore} , type: 'warning'});
        return;
      }
      notifyRef.value.showNotification({title: 'Error', message: data.message || 'Failed to edit question.', type: 'error'});
    }
  }catch (error) {
    console.error('Error editing question:', error);
  }
  
  showEditModal.value = false
}

  onMounted(async () => {
    await getValidToken();
    fetchData();
  });

</script>

