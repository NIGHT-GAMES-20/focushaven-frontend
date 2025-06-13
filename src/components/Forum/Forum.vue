<template>
    <div :class="Styles.forumContainer">
        <div :class="Styles.header">
            <h4 :class="Styles.titleText">Forum</h4>
            <div :class="Styles.search">
                <input v-model="searchQuery" type="text" placeholder="Search..." :class="Styles.searchInput" />
                <button :class="Styles.searchButton" @click="fetchSearchQuesions">Search</button>
            </div>
            <button :class="Styles.askQuestionBtn" @click="javascript.void(0)">Ask A Question</button>
        </div>
        <div v-if="searchTriggered" :class="Styles.forumQuestionsContainer">
            <ul class="list-disc list-inside">
                <li v-for="(text ,index) in searchQuestions" :key="index" :class="Styles.questionItem">
                    <a :href="`/forum/question/${searchQuestionsIDs[index]}`" :class="Styles.question" >
                        {{ text }}
                    </a>
                </li>
                <li v-if="(searchQuestions.length === 0) && !searchInitiation " :class="Styles.noQuestions">No questions found.</li>
                <li v-else-if="(searchQuestions.length === 0) && searchInitiation " :class="Styles.loadingContainer">
                    <span :class="Styles.spinner"></span>
                    Searching, Please Wait
                </li>
            </ul>
        </div>
        <div v-else :class="Styles.forumQuestionsContainer">
            <ul class="list-disc list-inside">
                <li v-for="(text, index) in questions" :key="questionIDs[index]" :class="Styles.questionItem" >
                    <a :href="`/forum/question/${questionIDs[index]}`" :class="Styles.question" >
                        {{ text }}
                    </a>
                </li>
                <li v-if="questions.length === 0" :class="Styles.noQuestions">No questions found.</li>
            </ul>
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
import { ref,onMounted } from 'vue';
import Styles from './Forum.module.css';

const searchQuery = ref('');
const searchQuestions = ref([]);
const searchQuestionsIDs = ref([]);
const questions = ref([]);
const questionIDs = ref([]);
const searchInitiation = ref(false);
const searchTriggered = ref(false);
const pages = ref([1]);
const currentPage = ref(1);

async function fetchSearchQuesions() {
    try{
        searchTriggered.value = false;
        searchInitiation.value = false;
        await nextTick();
        searchTriggered.value = true;
        searchInitiation.value = true;
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/forum/search/questions?search=${encodeURIComponent(searchQuery.value)}`, {
            method: 'GET',
            credentials: 'include',
        })
        const data = await response.json() || [];
        const questionsList = data.results || [];
        searchQuestionsIDs.value = questionsList.map(q => q._id);
        searchQuestions.value = questionsList.map(q => q.text);
        searchInitiation.value = false;
    }catch (error) {
        console.error('Error fetching forum data:', error);
        searchInitiation.value = false;
    }
}

async function fetchQuestions(page) {
    try {
        currentPage.value = page;
        searchTriggered.value = false;
        searchInitiation.value = false;
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/forum/questions?page=${page}`, {
            method: 'GET',
            credentials: 'include',
        });
        const data = await response.json() || [];
        const questionsList = data.questions || [];
        questionIDs.value = questionsList.map(q => q._id);
        questions.value = questionsList.map(q => q.text);
    } catch (error) {
        console.error('Error fetching forum data:', error);
    }
}
async function fetchPages() {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/forum/questions/pages`, {
            method: 'GET',
            credentials: 'include',
        });
        const data = await response.json();
        const pageCount = data.pages; // Default to 1 if no pages are returned
        pages.value = Array.from({ length: pageCount }, (_, i) => i + 1);
    } catch (error) {
        console.error('Error fetching forum pages:', error);
    }
}

onMounted(() => {
    fetchPages();
    fetchQuestions(1);
})
</script>