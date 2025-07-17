import { createApp } from 'vue';
import QuestionApp from './QuestionAskWrapper.vue';
import { createPinia } from 'pinia';

createApp(QuestionApp).use(createPinia()).mount('#questionAsk-root');