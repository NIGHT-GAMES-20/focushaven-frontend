<template>
    <div :class="Styles.forumContainer">
        <div :class="Styles.header">
            <h4 :class="Styles.titleText">Forum</h4>
            <input v-model="searchQuery" type="text" placeholder="Search..." :class="Styles.searchInput" />
            <button :class="Styles.searchButton" @click="fetchSearchQuesions">Search</button>
        </div>
        <div v-if="searchTriggered" :class="Styles.forumQuestionsContainer">
            <ul class="list-disc list-inside">
                <li v-for="(question,index) in searchQuestions" :key="index" :class="Styles.questionItem">
                    <h5 :class="Styles.question">{{ question.question }}</h5>
                </li>
                <li v-if="searchQuestions.length === 0" :class="Styles.noQuestions">No questions found.</li>
            </ul>
        </div>
        <div v-else :class="Styles.forumQuestionsContainer">
            <ul class="list-disc list-inside">
                <li v-for="(question,index) in questions" :key="index" :class="Styles.questionItem">
                    <h5 :class="Styles.question">{{ question.question }}</h5>
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
const questions = ref([]);
const searchTriggered = ref(false);
const pages = ref([1]);
const currentPage = ref(1);

async function fetchSearchQuesions() {
    try{
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/forum/search/questions?search=${encodeURIComponent(searchQuery.value)}`, {
            method: 'GET',
            credentials: 'include',
        })
        searchQuestions.value = await response.json().questions || [];
        searchTriggered.value = true;
    }catch (error) {
        console.error('Error fetching forum data:', error);
    }
}

async function fetchQuestions(page) {
    try {
        currentPage.value = page;
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/forum/questions?page=${page}`, {
            method: 'GET',
            credentials: 'include',
        });
        const data = await response.json() || [];
        questions.value = data.questions || [];
        searchTriggered.value = false;
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