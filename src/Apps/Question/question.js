import { createApp } from 'vue';
import { router } from '../../scripts/router.js';
import QuestionApp from './QuestionWrapper.vue';
import { createPinia } from 'pinia';

createApp(QuestionApp).use(router).use(createPinia()).mount('#question-root');