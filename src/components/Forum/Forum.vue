<template>
    <div :class="Styles.forumContainer">
        <div :class="Styles.header">
            <h4 :class="Styles.titleText">Forum</h4>
            <div :class="Styles.search">
                <input v-model="searchQuery" type="text" placeholder="Search..." :class="Styles.searchInput" @keydown.enter="fetchSearchQuesions" />
                <button :class="Styles.searchButton" @click="fetchSearchQuesions">Search</button>
            </div>
            <button :class="Styles.askQuestionBtn" @click="QuestionAskFunc">Ask A Question</button>
        </div>
        <div v-if="searchTriggered" :class="Styles.forumQuestionsContainer">
            <ol class="list-disc list-inside">
                <li v-for="(text ,index) in questions" :key="index" :class="Styles.questionItem">
                    <a :href="`/forum/question/${questionIDs[index]}`" :class="Styles.question" >
                        {{ text }}
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
                <li v-for="(text, index) in questions" :key="questionIDs[index]" :class="Styles.questionItem" >
                    <a :href="`/forum/question/${questionIDs[index]}`" :class="Styles.question" >
                        {{ text }}
                    </a>
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

const searchQuery = ref('');
const questions = ref([]);
const questionIDs = ref([]);
const questionAuthor = ref([]);
const questionDate = ref([]);
const questionLikes = ref([]);
const searchInitiation = ref(false);
const searchTriggered = ref(false);
const pages = ref([1]);
const currentPage = ref(1);

async function fetchSearchQuesions() {
    try{
        if (!searchTriggered.value) searchTriggered.value = true;
        searchInitiation.value = true;

        questions.value = [];
        questionIDs.value = [];

        const response = await secureFetch(`${import.meta.env.VITE_BACKEND_URL}/forum/search/questions?search=${encodeURIComponent(searchQuery.value)}`, { method: 'GET' })
        const data = await response.json() || [];
        const questionsList = data.results || [];
        questionIDs.value = questionsList.map(q => q._id);
        questions.value = questionsList.map(q => q.text);
        questionAuthor.value = questionsList.map(q => q.author);
        questionDate.value = questionsList.map(q => q.date);
        questionLikes.value = questionsList.map(q => q.likes);
    }catch (error) {
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
        questionIDs.value = questionsList.map(q => q._id);
        questions.value = questionsList.map(q => q.text);
        questionAuthor.value = questionsList.map(q => q.author);
        questionDate.value = questionsList.map(q => q.date);
        questionLikes.value = questionsList.map(q => q.likes);
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