<template>
  <div :class="Styles.forumContainer">
      <div :class="Styles.header">
          <h4 :class="Styles.titleText">Forum</h4>
          <div :class="Styles.search">
              <input v-model="searchQuery" type="text" placeholder="Search..." :class="Styles.searchInput" @keydown.enter="fetchSearchQuesions" />
              <button :class="Styles.searchButton" @click="fetchSearchQuesions">Search</button>
          </div>
          <QuestionAsk/>
      </div>
      <div v-if="searchTriggered" :class="Styles.forumQuestionsContainer">
          <ol class="list-disc list-inside">
              <li v-for="q in questions" :key="q.id" :class="Styles.questionItem">
                  <a :href="`/forum/question/${q.id}`" :class="Styles.question" >
                      {{ q.text }}
                  </a>
              </li>
              <li v-if="searchInitiation" :class="Styles.loadingContainer">
                  <span :class="Styles.spinner"></span>
                  Searching, Please Wait
              </li>
              <li v-else-if="(questions.length === 0)" :class="Styles.noQuestions">No questions found.</li>
          </ol>
      </div>
      <div v-else :class="Styles.forumQuestionsContainer">
        <ol class="list-disc list-inside">
            <li v-for="q in questions" :key="q.id" :class="Styles.questionItem">
              <a :href="`/forum/question/${q.id}`" :class="Styles.question">
                {{ q.text }}
              </a>
              <button  v-if="q.author === userStore.user || userStore.isAdmin" :class="Styles.searchButton" @click="confirmDelete = true" > <Trash2 color="red" :size="18"/> </button>
              <div v-if="confirmDelete" :class="Styles.confirmDeleteContainer"> 
                <text>
                  Are You Sure you want to delete {{q.text}} ?? 
                </text>
                <button :class="Styles.searchButton" @click="deleteQuestion(q.id)">Delete</button>
                <button :class="Styles.searchButton" @click="confirmDelete = false">Cancel</button>
              </div>
            </li>
            <li v-if="questions.length === 0" :class="Styles.noQuestions">No questions found.</li>
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
import { Trash2 } from 'lucide-vue-next';
import QuestionAsk from '../Question/QuestionAsk.vue';

const userStore = useUserStore()
const searchQuery = ref('');
const questions = ref([]);
const searchInitiation = ref(false);
const searchTriggered = ref(false);
const pages = ref([1]);
const currentPage = ref(1);
const confirmDelete = ref(false);

async function fetchSearchQuesions() {
  try {
    if (!searchTriggered.value) searchTriggered.value = true;
    searchInitiation.value = true;
    questions.value = [];

    const response = await secureFetch(`${import.meta.env.VITE_BACKEND_URL}/forum/search/questions?search=${encodeURIComponent(searchQuery.value)}`, { method: 'GET' });
    const data = await response.json() || [];
    const questionsList = data.results || [];

    questions.value = questionsList.map(q => ({
      id: q._id,
      text: q.text,
      author: q.author,
      date: q.date,
      likes: q.likes
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
      text: q.title,
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
    fetchPages();
    fetchQuestions(1);
})

function QuestionAskFunc() {
    window.location.href = '/forum/ask';
}

</script>