import { createApp } from 'vue';
import { router } from '../../scripts/router.js';
import QuestionApp from './QuestionWrapper.vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

createApp(QuestionApp).use(router).use(pinia).mount('#question-root');