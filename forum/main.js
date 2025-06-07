import { createApp } from 'vue';
import { router } from './router';
import QuestionApp from './QuestionView.vue';

createApp(QuestionApp).use(router).mount('#question-root');