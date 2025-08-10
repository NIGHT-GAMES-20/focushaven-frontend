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
      <div :class="Styles.userActions">
        <a href="/"><div :class="Styles.backBtn">
          <ArrowLeft/> Home
        </div></a>
        <QuestionAsk/>
        <div class="dropdown" @click="toggleDropdown">
          <img v-if="userStore.user" alt="user Identicon" :src="userStore.profilePic" :class="Styles.userIdenticon" />
          <div v-if="isUserDropdownOpen" class="dropdown-menu" @click.stop >
            <a href="/profile">Profile</a>
            <a href="/settings">Settings</a>
            <a @click.prevent="logout">Logout</a>
          </div>
        </div>
      </div>
    </div>
    <div :class="Styles.forumQuestionsContainer">
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
  import { ref , onMounted } from 'vue';
  import Styles from './Forum.module.css';
  import { useUserStore } from '/stores/user.js'
  import { Trash2, ThumbsUp, ArrowLeft  } from 'lucide-vue-next';
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

  function toggleDropdown() {
    isUserDropdownOpen.value = !isUserDropdownOpen.value;
  }

  async function fetchSearchQuesions() {
    try {
      if (!searchTriggered.value) searchTriggered.value = true;
      searchInitiation.value = true;
      questions.value = [];

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
    }
  }



  async function fetchQuestions(page) {
    try {
      currentPage.value = page;
      searchTriggered.value = false;
      searchInitiation.value = false;
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


  async function getValidToken() {
    let token = sessionStorage.getItem('formAuthToken');

    if (!token || isTokenExpired(token)) {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/forum/auth/token`, { method: 'POST',headers: { 'Origin': window.location.origin } });
      const data = await res.json();
      sessionStorage.setItem('formAuthToken', data.token);
      return data.token;
    }

    return token;
  }

  function isTokenExpired(token) {
    if (!token) return true;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  }

  async function secureFetch(url, options = {}) {
    const token = await getValidToken();
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    return fetch(url, options);
  }

  onMounted(() => {
    userStore.fetchUser()
    fetchPages();
    fetchQuestions(1);
  })

  function QuestionAskFunc() {
      window.location.href = '/forum/ask';
  }

</script>