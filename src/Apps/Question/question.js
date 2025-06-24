import { createApp } from 'vue';
import { router } from '../../scripts/router.js';
import QuestionApp from './QuestionWrapper.vue';

createApp(QuestionApp).use(router).mount('#question-root');