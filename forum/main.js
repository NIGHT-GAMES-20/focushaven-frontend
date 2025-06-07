import { createApp } from 'vue';
import { router } from './router.js';
import QuestionApp from './QuestionView.vue';

createApp(QuestionApp).mount('#question-root');