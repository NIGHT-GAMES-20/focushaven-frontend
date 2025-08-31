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

        <QuestionAsk/>

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
          <!-- Left side: Likes -->
          <div :class="Styles.likesContainer">
            <ThumbsUp style="margin-top: 1em;" />  {{ q.likes }}
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

          <!-- Delete button -->
          <button v-if="(q.author === userStore.user || userStore.isAdmin) && !searchTriggered" :class="Styles.deleteButton" @click="confirmDelete = true" >
            <Trash2 color="red" :size="18" />
          </button>

          <!-- Confirm delete -->
          <div v-if="confirmDelete" :class="Styles.confirmDeleteContainer">
            <text>Are you sure you want to delete "{{ q.title }}"?</text>
            <button :class="Styles.searchButton" @click="deleteQuestion(q.id)">Delete</button>
            <button :class="Styles.searchButton" @click="confirmDelete = false">Cancel</button>
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
  import { ref , onMounted, onBeforeUnmount  } from 'vue';
  import Styles from './Forum.module.css';
  import { useUserStore } from '/stores/user.js'
  import { secureFetch ,getValidToken } from '../../scripts/forumSecureFetch';
  import { Trash2, ThumbsUp, ArrowLeft,ChevronDown } from 'lucide-vue-next';
  import QuestionAsk from '../Question/QuestionAsk.vue';
  import ForumLogo from '../../assets/ForumLogoTitle.png'

  const userStore = useUserStore()
  const searchQuery = ref('');
  const questions = ref([]);
  const searchInitiation = ref(false);
  const searchTriggered = ref(false);
  const pages = ref([1]);
  const currentPage = ref(1);
  const confirmDelete = ref(false);
  const isUserDropdownOpen = ref(false);
  const dropdownRef = ref(null);
  const isLoading = ref(false);

  function toggleDropdown() {
    isUserDropdownOpen.value = !isUserDropdownOpen.value;
  }

  const closeDropdown = (event) => {
  // If dropdown is open and click is outside the dropdown, close it
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
        text: q.title, // using title as main text
        body: q.body,
        tags: q.tags,
        author: q.user, // from backend `user`
        date: q.CreatedAt, // from backend `CreatedAt`
        likes: q.Likes, // from backend `Likes`
        status: q.status
      }));

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
      const response = await secureFetch(`${import.meta.env.VITE_BACKEND_URL}/forum/questions?page=${page}&sortByLikes=false`, { method: 'GET' });
      const data = await response.json() || [];
      const questionsList = data.questions || [];
      
      questions.value = questionsList.map(q => ({
        id: q._id,
        title: q.title,
        body: q.body,
        author: q.user ,
        date: q.CreatedAt,
        likes: q.Likes
      }));
    } catch (error) {
      console.error('Error fetching forum data:', error);
    }finally {
      isLoading.value = false;
    }
  }
  async function fetchPages() {
      try {
          const response = await secureFetch(`${import.meta.env.VITE_BACKEND_URL}/forum/questions/pages`, { method: 'GET' });
          const data = await response.json();
          const pageCount = data.pages; // Default to 1 if no pages are returned
          pages.value = Array.from({ length: pageCount }, (_, i) => i + 1);
      } catch (error) {
          console.error('Error fetching forum pages:', error);
      }
  }


  async function deleteQuestion(questionID) {
    try {
      const response = await secureFetch(`${import.meta.env.VITE_BACKEND_URL}/forum/question/delete/${questionID}`, { method: 'POST', credentials: 'include' });
      const data = await response.json();

      if (data.success) {
        questions.value = questions.value.filter(q => q.id !== questionID);
      } else {
        console.error('Failed to delete the question:', data.message);
      }
    } catch (error) {
      console.error('Error deleting the question:', error);
    }
    confirmDelete.value = false;
    fetchQuestions(currentPage.value); // Refresh the questions list after deletion
  }


  onMounted(async () => {
    await getValidToken(); // Ensure token is valid on mount
    fetchPages();
    fetchQuestions(1);
    document.addEventListener("click", closeDropdown);
  })

  onBeforeUnmount(() => {
    document.removeEventListener("click", closeDropdown);
  });

  async function logoutFunc() {
    try {
      userStore.logout()
      console.log('Logged out successfully')
      setTimeout(() => { window.location.href = '/'; }, 10)
    } catch (error) {
      console.error(`Logout Failed: ${error}`)
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