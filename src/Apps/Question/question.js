import { createApp } from 'vue';
import { router } from './router.js';
import QuestionApp from '../../components/Question/QuestionView.vue';

createApp(QuestionApp).use(router).mount('#question-root');