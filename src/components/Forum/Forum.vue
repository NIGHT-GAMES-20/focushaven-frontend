<template>
  <div :class="Styles.forumContainer">
    <div :class="Styles.header">
      <div :class="Styles.logo">
        <img alt="Forum" :src="ForumLogo" :class="Styles.logo" />
      </div>
      <div :class="Styles.search">
        <input v-model="searchQuery" type="text" placeholder="Search..." :class="Styles.searchInput" @keydown.enter="fetchSearchQuesions" />
        <button :class="Styles.searchButton" @click="fetchSearchQuesions">Search</button>
      </div>
      <div :class="Styles.userActions" style="position: relative;">
        <a href="/"><div :class="Styles.backBtn">
          <ArrowLeft :class="Styles.arrowIcon"/> Home
        </div></a>

        <QuestionAsk @question-asked="DataFetcher" />

        <div v-if="userStore.isLoggedIn" @click="toggleDropdown" :class="Styles.userIdenticonContainer" ref="dropdownRef">
          <img  alt="user Identicon" :src="userStore.profilePic" :class="Styles.userIdenticon" ref="dropdownRef" /><ChevronDown :class="[Styles.chevronIconDropown, { [Styles.rotated]: isUserDropdownOpen }]" />
        </div>
        <transition name="fade">
          <div v-if="isUserDropdownOpen" :class="Styles.userDropdown"  @click.stop >
            <a href="/dashboard" :class="Styles.dropdownElem">Dashboard</a>
            <a @click="logoutFunc()" :class="Styles.dropdownElem">Logout</a>
          </div>
        </transition>
      </div>
    </div>
    <div v-if="isLoading" style="display: flex; justify-content: space-around;">
      <div style="display: flex; flex-direction: row; margin-top: 20px;"><div :class="Styles.spinner" style="margin-left:10px; margin-right: 10px;"></div>Loading, Please Wait...</div>
    </div>
    <div :class="Styles.forumQuestionsContainer" v-else>
      <ol class="list-disc list-inside">
        <li v-for="q in questions" :key="q.id" :class="Styles.questionItem">
          <!-- Left side: Animated Like Button -->
          <div :class="Styles.likesContainer">
            <LikeBtn 
              :liked="hasUserLikedQuestion(q.id)"
              :loading="likingQuestions.has(q.id)"
              :likesCount="q.likes"
              @click="() => likeQuestion(q.id)"
            />
          </div>

          <!-- Middle: Question content -->
          <div :class="Styles.questionContent">
            <a :href="`/forum/question/${q.id}`" :class="Styles.questionTitle">
              {{ q.title }}
            </a>
            <p :class="Styles.questionBody">
              {{ q.body.length > 120 ? q.body.slice(0, 120) + '...' : q.body }}
            </p>
            <div :class="Styles.tags">
              <span v-for="tag in q.tags" :key="tag" :class="Styles.tag">{{ tag }}</span>
            </div>
          </div>

          <!-- Right side: Author & date -->
          <div :class="Styles.metaInfo">
            <span>by {{ q.author }}</span>
            <span>{{ new Date(q.date).toLocaleDateString() }}</span>
          </div>
        </li>
      </ol>
    </div>
    <div :class="Styles.pageNumberContainer">
      <ul :class="Styles.pageList">
        <li v-for="page in pages" :key="page" :class="[Styles.pageNumber, { [Styles.selectedPage]: page === currentPage }]"  @click="fetchQuestions(page)">
          {{ page }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onBeforeUnmount, reactive, computed } from 'vue';
  import Styles from './Forum.module.css';
  import { useUserStore } from '/stores/user.js'
  import { secureFetch, getValidToken } from '../../scripts/forumSecureFetch';
  import { Trash2, ArrowLeft, ChevronDown } from 'lucide-vue-next';
  import QuestionAsk from '../Question/QuestionAsk.vue';
  import LikeBtn from '../Asset-Componets/LikeBtn.vue';
  import ForumLogo from '../../assets/ForumLogoTitle.png'

  const userStore = useUserStore()
  const searchQuery = ref('');
  const questions = ref([]);
  const searchInitiation = ref(false);
  const searchTriggered = ref(false);
  const pages = ref([1]);
  const currentPage = ref(1);
  const isUserDropdownOpen = ref(false);
  const dropdownRef = ref(null);
  const isLoading = ref(false);

  // Like functionality
  const likingQuestions = reactive(new Set());
  const userLikedQuestions = ref(new Set());

  // Check if user has liked a specific question
  const hasUserLikedQuestion = (questionId) => {
    return userStore.isLoggedIn && userLikedQuestions.value.has(questionId);
  };

  // Like/unlike a question
  const likeQuestion = async (questionId) => {
    if (!userStore.isLoggedIn) {
      alert('Please log in to like questions.');
      return;
    }
    
    if (likingQuestions.has(questionId)) return; // Prevent multiple clicks

    const wasLiked = hasUserLikedQuestion(questionId);
    const question = questions.value.find(q => q.id === questionId);
    if (!question) return;

    likingQuestions.add(questionId);

    try {
      const response = await secureFetch(
        `${import.meta.env.VITE_BACKEND_URL}/forum/question/like`, 
        { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ questionID: questionId })
        }
      );

      const data = await response.json();
      if (data.success) {
        // Update the likes count
        question.likes = data.Likes;
        
        // Update the user liked questions set
        if (wasLiked) {
          userLikedQuestions.value.delete(questionId);
        } else {
          userLikedQuestions.value.add(questionId);
        }
        
        console.log(`Question ${questionId} ${!wasLiked ? 'liked' : 'unliked'}`);
        
      } else {
        alert(data.error || 'Failed to like the question.');
      }

    } catch (error) {
      alert('Failed to like the question. Please try again.');
      console.error('Error liking question:', error);
    } finally {
      likingQuestions.delete(questionId);
    }
  };

  function toggleDropdown() {
    isUserDropdownOpen.value = !isUserDropdownOpen.value;
  }

  const closeDropdown = (event) => {
    if (
      isUserDropdownOpen.value &&
      dropdownRef.value &&
      !dropdownRef.value.contains(event.target)
    ) {
      isUserDropdownOpen.value = false;
    }
  };

  async function fetchSearchQuesions() {
    try {
      if (!searchTriggered.value) searchTriggered.value = true;
      searchInitiation.value = true;
      questions.value = [];
      isLoading.value = true;

      const response = await secureFetch(
        `${import.meta.env.VITE_BACKEND_URL}/forum/search/questions?search=${encodeURIComponent(searchQuery.value)}`, 
        { method: 'GET' }
      );

      const data = await response.json();
      const questionsList = data.results;

      questions.value = questionsList.map(q => ({
        id: q._id,
        title: q.title,
        body: q.body,
        tags: q.tags,
        author: q.user,
        date: q.CreatedAt,
        likes: q.Likes,
        likers: q.Likers || [], // Include likers array if available
        status: q.status
      }));

      // Update userLikedQuestions set based on likers data
      if (userStore.isLoggedIn) {
        userLikedQuestions.value.clear();
        questions.value.forEach(q => {
          if (q.likers && q.likers.includes(userStore.FHiD)) {
            userLikedQuestions.value.add(q.id);
          }
        });
      }

    } catch (error) {
      console.error('Error fetching forum data:', error);
    } finally {
      searchInitiation.value = false;
      isLoading.value = false;
    }
  }

  async function fetchQuestions(page) {
    try {
      currentPage.value = page;
      searchTriggered.value = false;
      searchInitiation.value = false;
      isLoading.value = true;
      
      const response = await secureFetch(
        `${import.meta.env.VITE_BACKEND_URL}/forum/questions?page=${page}&sortByLikes=false`, 
        { method: 'GET' }
      );
      
      const data = await response.json() || [];
      const questionsList = data.questions || [];
      
      questions.value = questionsList.map(q => ({
        id: q._id,
        title: q.title,
        body: q.body,
        author: q.user,
        date: q.CreatedAt,
        likes: q.Likes,
        likers: q.Likers || [] // Include likers array if available
      }));

      // Update userLikedQuestions set based on likers data
      if (userStore.isLoggedIn) {
        userLikedQuestions.value.clear();
        questions.value.forEach(q => {
          if (q.likers && q.likers.includes(userStore.FHiD)) {
            userLikedQuestions.value.add(q.id);
          }
        });
      }

    } catch (error) {
      console.error('Error fetching forum data:', error);
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchPages() {
    try {
      const response = await secureFetch(`${import.meta.env.VITE_BACKEND_URL}/forum/questions/pages`, { method: 'GET' });
      const data = await response.json();
      const pageCount = data.pages;
      pages.value = Array.from({ length: pageCount }, (_, i) => i + 1);
    } catch (error) {
      console.error('Error fetching forum pages:', error);
    }
  }

  async function DataFetcher(){
    isLoading.value = true;
    await userStore.fetchUser();
    await getValidToken();
    fetchPages();
    fetchQuestions(1);
    document.addEventListener("click", closeDropdown);
    isLoading.value = false;
  }


  onMounted(DataFetcher);

  onBeforeUnmount(() => {
    document.removeEventListener("click", closeDropdown);
  });

  async function logoutFunc() {
    try {
      userStore.logout();
      console.log('Logged out successfully');
      setTimeout(() => { window.location.href = '/'; }, 10);
    } catch (error) {
      console.error(`Logout Failed: ${error}`);
    }
  }
</script>

<style>
  /* Fade in / out transition classes */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.25s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>