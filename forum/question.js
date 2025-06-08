import { createApp } from 'vue';
import { router } from '../src/Apps/Question/router.js';
import QuestionApp from '../src/Apps/Question/QuestionWrapper.vue';

createApp(QuestionApp).use(router).mount('#question-root');